"""Measures how fast a channel is actually gaining subscribers.

The problem this solves: YouTube rounds subscriberCount to three significant
figures, so no single reading carries a rate. The live tile used to extrapolate
from the lifetime average — total subscribers divided by channel age — which is
wrong in both of the directions that matter. It makes a dormant channel look
like it is still growing, and it badly understates a channel that took off last
month.

What a rounded figure *does* carry is the moment it crosses into a new band.
Record the crossings with timestamps and the rate falls out of the gaps between
them. Two crossings a week apart on a channel whose band is 1,000 wide means
roughly 1,000 subscribers per week, measured rather than assumed.

Three answers are possible, and the caller is told which one it got:

  measured  — two or more crossings on record; the rate is observed.
  bounded   — one reading that has not moved in a while; the rate is unknown
              but cannot exceed one band per that interval, so the ceiling is
              returned. Honest, and always an improvement on the lifetime
              average for a channel that has gone quiet.
  lifetime  — nothing on record yet. Falls back to the lifetime average, which
              is what the tile did before this module existed.

Unlike tracking.py, this IS reachable from the browser, via /api/subs. That is
why it only ever writes two public scalars (a channel id and a subscriber count
YouTube already publishes), never reads anything user-owned, and treats every
failure as "no opinion" rather than an error — a live counter must not be able
to take the endpoint down with it.
"""

import os
from datetime import datetime, timezone

import httpx

# Short: this sits in the request path of a poll the user is watching. If
# Supabase is slow, the tile is better off falling back to the lifetime average
# than making the reader wait.
TIMEOUT = httpx.Timeout(4.0)

# How far back the rate window reaches. Long enough to span several crossings
# on a slow channel, short enough that a rate change from six months ago is not
# still being averaged into today's figure.
WINDOW_DAYS = 90

# Crossings are rare by construction (one row per change, not per poll), so
# this ceiling is generous — it exists to bound the response size, not to trim
# a real working set.
MAX_ROWS = 60

# Below this, a flat stretch says nothing useful: every channel's figure is
# unchanged over ten minutes. Only once a reading has held for hours does its
# not having moved start to constrain the rate.
MIN_FLAT_HOURS = 6


def _base() -> tuple[str, str] | None:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return None
    return url.rstrip("/"), key


def _headers(key: str) -> dict:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def _parse(ts: str) -> datetime:
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


def observe(channel_id: str, subscribers: int, step: int, lifetime_per_day: float) -> dict:
    """Record the current reading and return the best rate we can justify.

    Returns {"per_day": float, "basis": "measured"|"bounded"|"lifetime"}.

    Never raises. A live counter is decoration on top of a number that is
    already correct; if the history is unavailable the tile should quietly fall
    back to the lifetime average rather than fail.
    """
    fallback = {"per_day": lifetime_per_day, "basis": "lifetime"}

    creds = _base()
    if not creds:
        return fallback
    url, key = creds

    try:
        resp = httpx.get(
            f"{url}/rest/v1/subscriber_readings",
            params={
                "select": "id,subscribers,observed_at,last_seen_at",
                "channel_id": f"eq.{channel_id}",
                "order": "observed_at.desc",
                "limit": str(MAX_ROWS),
            },
            headers=_headers(key),
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        rows = resp.json()
    except Exception:
        return fallback

    now = datetime.now(timezone.utc)

    try:
        if not rows or rows[0]["subscribers"] != subscribers:
            # A crossing: either the first reading for this channel, or the
            # figure has moved since the last one. Either way it earns a row.
            httpx.post(
                f"{url}/rest/v1/subscriber_readings",
                json={"channel_id": channel_id, "subscribers": subscribers},
                headers={**_headers(key), "Prefer": "return=minimal"},
                timeout=TIMEOUT,
            ).raise_for_status()
            rows = [
                {
                    "id": None,
                    "subscribers": subscribers,
                    "observed_at": now.isoformat(),
                    "last_seen_at": now.isoformat(),
                },
                *rows,
            ]
        else:
            # Unchanged. Extend the current row's reach rather than adding a
            # duplicate — this is what turns "still the same" into evidence
            # about the rate instead of noise.
            httpx.patch(
                f"{url}/rest/v1/subscriber_readings",
                json={"last_seen_at": now.isoformat()},
                params={"id": f"eq.{rows[0]['id']}"},
                headers={**_headers(key), "Prefer": "return=minimal"},
                timeout=TIMEOUT,
            ).raise_for_status()
            rows[0]["last_seen_at"] = now.isoformat()
    except Exception:
        # The write failing does not invalidate the history we just read, so
        # carry on and derive a rate from it anyway.
        pass

    return _rate(rows, step, lifetime_per_day, now)


def _rate(rows: list[dict], step: int, lifetime_per_day: float, now: datetime) -> dict:
    """Derive a per-day rate from the recorded crossings, newest first."""
    fresh = []
    for r in rows:
        observed = _parse(r["observed_at"])
        if (now - observed).total_seconds() <= WINDOW_DAYS * 86_400:
            fresh.append((observed, r))

    if len(fresh) >= 2:
        newest_at, newest = fresh[0]
        oldest_at, oldest = fresh[-1]
        span_days = (newest_at - oldest_at).total_seconds() / 86_400
        delta = newest["subscribers"] - oldest["subscribers"]
        # A real span with real movement across it. This is the good case, and
        # the only one where the number is genuinely measured.
        if span_days > 0 and delta != 0:
            return {"per_day": delta / span_days, "basis": "measured"}

    if fresh:
        # One reading, or several that never moved. The figure not having
        # changed is itself information: the true count cannot have travelled a
        # full band in that time, or the rounding would have shown it.
        newest_at, newest = fresh[0]
        flat_hours = (_parse(newest["last_seen_at"]) - newest_at).total_seconds() / 3_600
        if flat_hours >= MIN_FLAT_HOURS:
            ceiling = step / (flat_hours / 24)
            return {"per_day": min(lifetime_per_day, ceiling), "basis": "bounded"}

    return {"per_day": lifetime_per_day, "basis": "lifetime"}
