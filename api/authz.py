"""Verifies the Supabase access token a signed-in browser sends.

This is what makes the signed-out limits real rather than cosmetic. The
frontend can be edited, the URL can be typed by hand, and the API can be
called with curl — so anything that actually has to hold gets decided here.

Verification asks Supabase rather than checking a signature locally. It costs
one HTTPS round trip, but it is authoritative: it works whether the project
signs tokens with a shared secret or an asymmetric key, and a token revoked by
a sign-out stops working immediately instead of staying valid until it expires.
The result is cached briefly so a burst of calls from one page doesn't repeat
it.
"""

import os
import time

import httpx

# Long enough to cover one page's worth of calls, short enough that a revoked
# session can't keep working for meaningfully longer than it should.
_CACHE_TTL = 60.0

# token -> (expires_at, user_id)
_cache: dict[str, tuple[float, str]] = {}

_TIMEOUT = httpx.Timeout(8.0)


def _config() -> tuple[str, str] | None:
    """The project URL and the key used as the `apikey` header, if configured."""
    url = os.getenv("SUPABASE_URL")
    # Either works for this call. The publishable key is preferred because it's
    # the lower-privilege of the two, and this endpoint needs no more than that.
    key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return None
    return url.rstrip("/"), key


def is_enforceable() -> bool:
    """Whether tokens can be checked at all."""
    return _config() is not None


def user_id_from(authorization: str | None) -> str | None:
    """The signed-in user's id, or None for anonymous.

    Never raises for a bad token — an invalid one simply means anonymous, and
    the caller applies the signed-out limits. That keeps a mangled header from
    turning into a 500 on what should be a working free-tier request.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        return None

    token = authorization[7:].strip()
    if not token:
        return None

    now = time.monotonic()
    hit = _cache.get(token)
    if hit and hit[0] > now:
        return hit[1]

    conf = _config()
    if conf is None:
        return None
    url, key = conf

    try:
        resp = httpx.get(
            f"{url}/auth/v1/user",
            headers={"apikey": key, "Authorization": f"Bearer {token}"},
            timeout=_TIMEOUT,
        )
    except httpx.HTTPError:
        # Supabase unreachable. Treated as anonymous rather than as an error:
        # the free tier keeps working, which is the safer failure.
        return None

    if resp.status_code != 200:
        return None

    uid = resp.json().get("id")
    if not uid:
        return None

    # Only successes are cached. Caching failures would let one bad request
    # keep a legitimate user locked out for the rest of the window.
    _cache[token] = (now + _CACHE_TTL, uid)

    # The cache is per warm instance and unbounded otherwise; this keeps a
    # long-lived process from accumulating dead tokens.
    if len(_cache) > 512:
        for dead in [t for t, (exp, _) in _cache.items() if exp <= now]:
            _cache.pop(dead, None)

    return uid
