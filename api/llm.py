"""Model provider layer.

Keeps the audit logic independent of which LLM writes the report. Switch
providers by setting LLM_PROVIDER in .env — no code changes needed.

    LLM_PROVIDER=ollama      free and unlimited, runs locally, no key at all
    LLM_PROVIDER=groq        free tier ~1000/day, key from console.groq.com (gsk_…)
    LLM_PROVIDER=gemini      free tier, key from aistudio.google.com (AIza…/AQ.…)
    LLM_PROVIDER=deepseek    very cheap, key from platform.deepseek.com (sk-…)
    LLM_PROVIDER=anthropic   priciest, best prose, key from console.anthropic.com (sk-ant-…)

Key formats differ, so a key pasted into the wrong slot will fail to
authenticate — check the prefix against the list above.

Ollama is the only provider with no request cap, because the model runs on
your own machine. It's also the only one that can't be deployed to a
serverless host — nothing there is listening on localhost:11434.
"""

import os
import re
from typing import Iterator

# The Gemini free tier caps flash at a low number of requests PER DAY (20 at
# time of writing) on top of the per-minute limit. One audit = one request, so
# heavy use needs either billing enabled or a different provider.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-opus-4-8")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
DEEPSEEK_BASE_URL = "https://api.deepseek.com"

# 8B is the smallest size that reliably follows the six-section format the
# prompt asks for; 3B models tend to drift into freeform prose.
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# The only free-tier provider here that also deploys: hosted, so it works from
# a serverless function, and ~1000 requests/day without a card.
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"


KNOWN = "ollama, groq, gemini, deepseek, anthropic"


class ConfigError(RuntimeError):
    """Raised when the selected provider has no usable API key."""


def active_provider() -> str:
    return os.getenv("LLM_PROVIDER", "gemini").strip().lower()


def check_config() -> tuple[bool, str]:
    """Report whether the selected provider is ready. Used by /api/health."""
    provider = active_provider()
    if provider == "ollama":
        # No key to check — what can be wrong is that Ollama isn't running or
        # the model was never pulled. Both are worth catching before the user
        # waits through a full audit to find out.
        import httpx

        try:
            tags = httpx.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=1.5).json()
        except Exception:
            return False, (
                f"Ollama isn't reachable at {OLLAMA_BASE_URL}. "
                "Install it from ollama.com, then run: ollama serve"
            )
        installed = [m["name"] for m in tags.get("models", [])]
        # Ollama reports "llama3.1:8b"; a user may have set OLLAMA_MODEL to
        # the bare "llama3.1", which is the same model with the default tag.
        if not any(m == OLLAMA_MODEL or m.startswith(f"{OLLAMA_MODEL}:") for m in installed):
            return False, (
                f"Ollama is running but {OLLAMA_MODEL!r} isn't installed. "
                f"Run: ollama pull {OLLAMA_MODEL}"
            )
        return True, f"ollama / {OLLAMA_MODEL}"
    # Every remaining provider is "is the key present": same shape, so it's a
    # table rather than four near-identical branches.
    keyed = {
        "groq": ("GROQ_API_KEY", GROQ_MODEL),
        "gemini": ("GEMINI_API_KEY", GEMINI_MODEL),
        "deepseek": ("DEEPSEEK_API_KEY", DEEPSEEK_MODEL),
        "anthropic": ("ANTHROPIC_API_KEY", ANTHROPIC_MODEL),
    }
    if provider in keyed:
        env_var, model = keyed[provider]
        if not os.getenv(env_var):
            return False, f"{env_var} is not set in .env"
        return True, f"{provider} / {model}"

    return False, f"Unknown LLM_PROVIDER: {provider!r}. Use one of: {KNOWN}"


def explain_error(e: Exception) -> str | None:
    """Turn a provider exception into user-facing advice, or None if it isn't
    a rate limit and the caller should fall back to a generic message.

    The per-day and per-minute limits need opposite advice — one is "wait a
    moment", the other is "you're done until tomorrow, switch providers" — so
    telling them apart matters more than a tidy single message.
    """
    msg = str(e)
    if not any(k in msg for k in ("RESOURCE_EXHAUSTED", "429", "rate_limit")):
        return None

    provider = active_provider()
    model = {
        "ollama": OLLAMA_MODEL,
        "groq": GROQ_MODEL,
        "gemini": GEMINI_MODEL,
        "deepseek": DEEPSEEK_MODEL,
        "anthropic": ANTHROPIC_MODEL,
    }.get(provider, "unknown model")
    per_day = "PerDay" in msg or "per day" in msg.lower()

    if per_day:
        # Only ever suggest providers the user isn't already on.
        alternatives = {
            "groq": "  LLM_PROVIDER=groq         (free, ~1000 reports/day, deploys)",
            "ollama": "  LLM_PROVIDER=ollama       (free, unlimited, local only)",
            "deepseek": "  LLM_PROVIDER=deepseek     (~$0.001 per report)",
            "anthropic": "  LLM_PROVIDER=anthropic    (best prose, ~$0.10-0.30 per report)",
            "gemini": "  LLM_PROVIDER=gemini       (free tier, ~20 reports/day)",
        }
        others = [v for k, v in alternatives.items() if k != provider]
        extra = (
            "\nor set GEMINI_MODEL to an older flash model with its own quota."
            if provider == "gemini"
            else ""
        )
        return (
            f"Daily quota exhausted for {provider} / {model}.\n"
            "This resets on the provider's clock — retrying now will fail again.\n\n"
            "To keep going today, edit .env:\n" + "\n".join(others) + extra
        )

    # Per-minute limits carry a retry delay; surface it rather than "a moment".
    delay = re.search(r"retry in ([\d.]+)s|'retryDelay': '(\d+)s'", msg)
    seconds = next((g for g in (delay.groups() if delay else ()) if g), None)
    wait = f"about {round(float(seconds))} seconds" if seconds else "a minute"
    return f"Rate limit hit on {provider}. Wait {wait} and retry."


def stream_completion(prompt: str, max_tokens: int = 8000) -> Iterator[str]:
    """Yield the model's response in chunks as it is generated."""
    provider = active_provider()

    # Ollama, Groq, and DeepSeek all speak the OpenAI wire format, so they
    # differ only in base URL, key, and model name.
    openai_compatible = {
        # Ollama needs no key; the SDK requires the argument, Ollama ignores
        # the value. The long timeout is for local CPU inference, which can
        # take minutes on the first token while the model loads into memory.
        "ollama": (f"{OLLAMA_BASE_URL}/v1", "ollama", OLLAMA_MODEL, 600),
        "groq": (GROQ_BASE_URL, os.getenv("GROQ_API_KEY"), GROQ_MODEL, 120),
        "deepseek": (DEEPSEEK_BASE_URL, os.getenv("DEEPSEEK_API_KEY"), DEEPSEEK_MODEL, 120),
    }

    if provider in openai_compatible:
        base_url, key, model, timeout = openai_compatible[provider]
        if not key:
            raise ConfigError(f"{provider.upper()}_API_KEY is not set in .env")
        yield from _stream_openai_compatible(prompt, max_tokens, base_url, key, model, timeout)
    elif provider == "gemini":
        yield from _stream_gemini(prompt, max_tokens)
    elif provider == "anthropic":
        yield from _stream_anthropic(prompt, max_tokens)
    else:
        raise ConfigError(f"Unknown LLM_PROVIDER: {provider!r}. Use one of: {KNOWN}")


def _stream_openai_compatible(
    prompt: str, max_tokens: int, base_url: str, key: str, model: str, timeout: int
) -> Iterator[str]:
    from openai import OpenAI

    client = OpenAI(api_key=key, base_url=base_url, timeout=timeout)
    try:
        stream = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            stream=True,
        )
        for chunk in stream:
            if chunk.choices and (delta := chunk.choices[0].delta.content):
                yield delta
    except Exception as e:
        # Only Ollama can fail by not being running at all; for the hosted
        # providers a connection error means something else entirely.
        if "localhost" in base_url and "connect" in str(e).lower():
            raise ConfigError(
                f"Can't reach Ollama at {OLLAMA_BASE_URL}. Start it with: ollama serve"
            ) from e
        raise


def _stream_gemini(prompt: str, max_tokens: int) -> Iterator[str]:
    from google import genai
    from google.genai import types

    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise ConfigError("GEMINI_API_KEY is not set in .env")

    client = genai.Client(api_key=key)
    stream = client.models.generate_content_stream(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(max_output_tokens=max_tokens),
    )
    for chunk in stream:
        # Chunks carrying only safety metadata or finish reasons have no text.
        if chunk.text:
            yield chunk.text


def _stream_anthropic(prompt: str, max_tokens: int) -> Iterator[str]:
    import anthropic

    if not os.getenv("ANTHROPIC_API_KEY"):
        raise ConfigError("ANTHROPIC_API_KEY is not set in .env")

    client = anthropic.Anthropic()
    with client.messages.stream(
        model=ANTHROPIC_MODEL,
        max_tokens=max_tokens,
        thinking={"type": "adaptive"},
        output_config={"effort": "high"},
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        yield from stream.text_stream
