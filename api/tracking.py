"""Reads and writes the score history in Supabase.

Talks to PostgREST over plain HTTP rather than pulling in the Supabase Python
SDK — two endpoints don't justify the dependency, and this keeps the cold start
on Vercel small.

Everything here uses the SERVICE ROLE key, which bypasses row-level security.
That is correct for a background job that has no logged-in user to act as, and
it is exactly why nothing in this module may ever be reachable from the
browser. The one endpoint that calls it is secret-gated; see server.py.
"""

import os

import httpx

# The audit is mostly waiting on YouTube, so the ceiling here is quota, not
# time. ~5 units per channel against a 10,000/day allowance leaves plenty of
# headroom for live audits, which are what users actually notice.
MAX_CHANNELS_PER_RUN = 100

TIMEOUT = httpx.Timeout(20.0)


class NotConfigured(RuntimeError):
    """Raised when the service-role credentials are missing."""


def _base() -> tuple[str, str]:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise NotConfigured(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for tracking. "
            "The service_role key is server-side only — never expose it to the frontend."
        )
    return url.rstrip("/"), key


def _headers(key: str) -> dict:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def tracked_channels() -> list[str]:
    """Every distinct channel someone has asked to keep tracking.

    Distinct matters: the whole point of keying snapshots by channel is that a
    channel ten people track still costs one audit.
    """
    url, key = _base()
    resp = httpx.get(
        f"{url}/rest/v1/saved_audits",
        params={"select": "channel_handle", "tracked": "is.true"},
        headers=_headers(key),
        timeout=TIMEOUT,
    )
    resp.raise_for_status()

    # dict.fromkeys rather than set(): stable order makes a truncated run
    # deterministic, so the same channels aren't the ones dropped every time.
    handles = dict.fromkeys(row["channel_handle"] for row in resp.json())
    return list(handles)[:MAX_CHANNELS_PER_RUN]


def save_snapshot(handle: str, summary: dict) -> None:
    """Append today's score for one channel, or overwrite today's if it exists.

    The upsert is what makes the job safe to re-run: a partial failure can be
    retried the same day without doubling up rows.
    """
    url, key = _base()
    health = summary["health"]
    channel = summary["channel"]

    row = {
        "channel_handle": handle,
        "score": health["score"],
        "grade": health["grade"],
        "subscribers": channel["subscribers"],
        "total_views": channel["total_views"],
        "total_videos": channel["total_videos"],
        "baseline_views": summary["baseline_views"],
        "share_above": summary["share_above"],
        "checks": health["checks"],
    }

    resp = httpx.post(
        f"{url}/rest/v1/channel_snapshots",
        json=row,
        headers={
            **_headers(key),
            # Targets the (channel_handle, captured_on) unique index from
            # tracking.sql. Without merge-duplicates this 409s on the second
            # run of the day.
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        params={"on_conflict": "channel_handle,captured_on"},
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
