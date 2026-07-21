# YouTube Channel Audit

Feed it a channel, get back a written audit: which videos over/under-performed,
what the winners have in common, title rewrites, and next-video ideas.

## Setup (one time)

**1. YouTube API key** — free, ~10 minutes:

1. Go to https://console.cloud.google.com and create a project
2. APIs & Services → Library → search "YouTube Data API v3" → Enable
3. APIs & Services → Credentials → Create Credentials → API key
4. Copy the key

**2. Gemini API key** — https://aistudio.google.com/apikey — free, no card needed.

**3. Put them in `.env`:**

```bash
cp .env.example .env
# then open .env and paste both keys in
```

**Enabling the API is a separate step from creating the key.** If you skip it
every request fails with "Requests to this API are blocked."

## Run — web UI

Two terminals, both starting from this folder (`yt-audit`).

Windows `cmd` needs **backslashes** — `.venv/Scripts/...` fails there because
cmd reads `/` as a flag. Git Bash and PowerShell accept either.

```cmd
:: Terminal 1 — API server
cd C:\Users\USER\Desktop\Personal\yt-audit
.venv\Scripts\python.exe -m uvicorn api.index:app --reload --reload-include .env --port 8000

:: Terminal 2 — frontend
cd C:\Users\USER\Desktop\Personal\yt-audit\frontend
npm run dev
```

Open http://localhost:5173

If port 8000 is already taken (`error while attempting to bind`), an old
server is still running — close it, or use `--port 8001` and update the proxy
target in `frontend/vite.config.js`.

**Changed a key and nothing happened?** `.env` is read once when the server
starts. Check what it actually loaded:

```cmd
curl http://localhost:8000/api/health
```

If `provider` isn't what you set, you're talking to a server that started
before the edit. Restart it.

## Run — command line

```cmd
.venv\Scripts\python.exe api\audit.py https://www.youtube.com/@SomeChannel
.venv\Scripts\python.exe api\audit.py @SomeChannel --videos 30
.venv\Scripts\python.exe api\audit.py UC_x5XG1OV2P6uZZ5FSM9Ttw --out report.md

:: Score and checklist only — no model needed, no quota spent
.venv\Scripts\python.exe api\audit.py @SomeChannel --no-report
```

The report streams to your terminal. `--out` also saves it as markdown.

## What it costs

**YouTube API:** free, 10,000 quota units/day. A 50-video audit costs ~4 units
if you pass a `UC...` channel ID, or ~104 if it has to search for a handle.
Either way you won't run out.

**Gemini:** free tier, currently $0 per audit. The free tier limits requests
per minute — if you run several audits back to back you may hit a 429 and need
to wait a moment.

## Switching models

`LLM_PROVIDER` in `.env` controls who writes the report:

| Value | Key variable | Key looks like | Cost | Limit | Deploys? |
|---|---|---|---|---|---|
| `groq` | `GROQ_API_KEY` | `gsk_...` | free | ~1000 reports/day | yes |
| `ollama` | none | — | free | none | **no** |
| `gemini` | `GEMINI_API_KEY` | `AIza...` / `AQ.Ab8...` | free tier | ~20 reports/day | yes |
| `deepseek` | `DEEPSEEK_API_KEY` | `sk-...` | ~$0.001/report | none | yes |
| `anthropic` | `ANTHROPIC_API_KEY` | `sk-ant-...` | ~$0.10–0.30/report | none | yes |

**Use `groq` if you're deploying.** Free, no credit card, ~1000 reports/day,
and it's a hosted API so it works from a serverless function.

**Only the written report needs a model.** The health score, the checklist,
and the performance chart are computed from the YouTube API alone — they work
with no provider configured, and they're what you see first. The report is a
separate button, so a capped free tier limits how many *reports* you write,
not how many audits you can run.

**`ollama` is free and unlimited** because the model runs on your machine.
Install it from [ollama.com](https://ollama.com), then:

```cmd
ollama pull llama3.1:8b
```

Set `LLM_PROVIDER=ollama` and you need no key at all.

### Why Ollama can't be deployed

A Vercel function is an ephemeral container with no GPU, a few hundred MB of
space, and a hard time limit. There's nowhere for a multi-gigabyte model to
live, and `localhost:11434` inside a function points at the function itself —
which has nothing listening.

Running Ollama on a server you rent and pointing `OLLAMA_BASE_URL` at it does
work, but the economics are poor: a box with enough RAM costs more per month
than DeepSeek would cost in a year of the same usage. Ollama also ships with
**no authentication**, so exposing it to the internet hands your hardware to
anyone who finds it.

Use `groq` when deployed and `ollama` locally. Same codebase, one env var.

**The prefixes matter.** A key pasted into the wrong slot fails to
authenticate — a DeepSeek `sk-...` key will not work as a Gemini key.

Only [llm.py](api/llm.py) knows about providers; the YouTube fetching and
performance scoring are identical either way. Claude writes the best prose —
worth comparing on a channel you know well before you sell anything.

Note: `gemini-pro-latest` returns 429 on the free tier. `gemini-flash-latest`
is the default and works.

## What it can and can't see

The YouTube Data API only exposes public data: views, likes, comments, titles,
durations, publish dates. It **cannot** see retention, click-through rate,
impressions, traffic sources, or audience demographics — those live in YouTube
Studio and require the channel owner's OAuth login.

So this audit reasons from view counts and titles. That's genuinely useful for
spotting topic and packaging patterns, but it can't tell you whether a video
failed because the thumbnail didn't get clicked or because people clicked and
then left. If you sell audits, either say this upfront or ask the client for a
Studio screenshot to fill the gap.

Performance is scored against the channel's own **median** views, not the mean,
so a single viral video doesn't make everything else look like a failure.
Videos under 14 days old are excluded from the baseline and flagged, since
their view counts are still climbing.
