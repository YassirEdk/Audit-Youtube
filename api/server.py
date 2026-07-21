"""HTTP wrapper around audit.py so the React frontend can call it.

Run from the project root:
    .venv/Scripts/python.exe -m uvicorn api.index:app --reload --port 8000

Two endpoints, deliberately separate:

    POST /api/audit   numbers only — score, checklist, chart. No LLM call.
    POST /api/report  the written report. One LLM call, only when asked.

They're split because the LLM is the only rate-limited, paid, or slow part of
the system. Everything a user sees first now costs nothing but YouTube quota,
so a free-tier daily cap limits how many *reports* get written rather than how
many audits can be run.
"""

import hmac
import os
import re

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import StreamingResponse
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from pydantic import BaseModel

import audit
import authz
import growth
import llm
import tracking

load_dotenv()

app = FastAPI(title="YouTube Audit")

# No CORS middleware: the UI is served from this same origin in production, and
# the Vite dev proxy makes it same-origin in development too.


class AuditRequest(BaseModel):
    channel: str
    videos: int = 50


class TitleRequest(AuditRequest):
    """An audit request narrowed to one video in that audit's result set."""

    video_id: str


# Must match FREE_VIDEOS in frontend/src/limits.js. The frontend clamps for
# honesty in the UI; this clamps because the frontend can't be trusted.
FREE_VIDEOS = 20


def _require_user(authorization: str) -> str:
    """401 unless the caller is signed in. For the member-only endpoints."""
    uid = authz.user_id_from(authorization)
    if uid is None:
        raise HTTPException(401, "Sign in to use this.")
    return uid


def _fetch(req: AuditRequest, user_id: str | None = None) -> tuple[dict, list[dict]]:
    """Resolve the channel and pull its recent videos, scored.

    Shared by both endpoints. /api/report re-fetches rather than trusting
    numbers posted back by the client — it costs ~4 YouTube quota units out of
    a 10,000/day allowance, which is cheaper than the bugs that come from
    letting a client hand the server its own facts.
    """
    yt_key = os.getenv("YOUTUBE_API_KEY")
    if not yt_key:
        raise HTTPException(500, "YOUTUBE_API_KEY is not set in .env")

    # Two clamps for two different reasons. The upper bound stops an unbounded
    # value paging through an entire channel and burning quota. The free-tier
    # bound is the actual access boundary: the depth selector is gated in the
    # UI, but ?videos=100 in the address bar reaches this function just the
    # same, so the limit has to be decided here.
    count = max(5, min(req.videos, 200))
    if user_id is None:
        count = min(count, FREE_VIDEOS)
    youtube = build("youtube", "v3", developerKey=yt_key)

    try:
        channel_id = audit.resolve_channel_id(youtube, req.channel)
        channel = audit.fetch_channel(youtube, channel_id)
        uploads = channel["contentDetails"]["relatedPlaylists"]["uploads"]
        videos = audit.fetch_recent_videos(youtube, uploads, count)
    except HttpError as e:
        raise HTTPException(502, audit.explain_http_error(e)) from e
    except SystemExit as e:
        # audit.py raises these for bad channels / not-found cases.
        raise HTTPException(404, str(e)) from e

    if not videos:
        raise HTTPException(404, "That channel has no public videos.")

    return channel, audit.add_performance(videos)


@app.get("/api/health")
def health() -> dict:
    """Let the UI tell the user what's missing before they hit Run."""
    llm_ok, llm_detail = llm.check_config()
    return {
        "youtube_key": bool(os.getenv("YOUTUBE_API_KEY")),
        "llm_ok": llm_ok,
        "llm_detail": llm_detail,
        "provider": llm.active_provider(),
        # Whether the server can verify a signed-in caller at all. False means
        # SUPABASE_URL / SUPABASE_ANON_KEY are missing *on the server*, and
        # every request reads as anonymous no matter who is logged in — which
        # surfaces to the user as "Sign in to use this" while already signed
        # in. Worth reporting: it is otherwise invisible from the browser, and
        # it is a different pair of variables from the VITE_ ones the frontend
        # needs.
        "auth_ok": authz.is_enforceable(),
    }


@app.get("/api/subs/{channel_id}")
def subscribers(channel_id: str) -> dict:
    """Current subscriber count for one channel. Polled by the results view.

    Takes a resolved UC... id rather than a handle so that polling never pays
    for a search call — /api/audit has already done that resolution.

    `rounded` and `step` describe the precision, not the value: YouTube keeps
    three significant figures, so `step` is the width of the band the true
    count sits in. The UI uses it to avoid presenting trailing zeros as though
    they were measured.
    """
    yt_key = os.getenv("YOUTUBE_API_KEY")
    if not yt_key:
        raise HTTPException(500, "YOUTUBE_API_KEY is not set in .env")

    if not channel_id.startswith("UC") or len(channel_id) != 24:
        raise HTTPException(400, "Expected a resolved channel id.")

    youtube = build("youtube", "v3", developerKey=yt_key)
    try:
        data = audit.fetch_subscribers(youtube, channel_id)
    except HttpError as e:
        raise HTTPException(502, audit.explain_http_error(e)) from e
    except SystemExit as e:
        raise HTTPException(404, str(e)) from e

    count = data["subscribers"]
    step = 10 ** (len(str(count)) - 3) if count >= 1000 else 1

    # The rate the client animates with. fetch_subscribers only knows the
    # lifetime average; growth.observe refines it into a measured rate where
    # this channel's own recorded crossings support one, and reports which of
    # the two the client is getting so the tile can label it.
    rate = growth.observe(channel_id, count, step, data["per_day"])

    return {
        "subscribers": count,
        "rounded": count >= 1000,
        "step": step,
        "per_day": round(rate["per_day"], 2),
        "basis": rate["basis"],
    }


@app.get("/api/live")
def live_views(ids: str) -> dict:
    """Current view counts for a set of videos. Polled by the results view.

    Deliberately the cheapest endpoint here: one YouTube call, one part, no
    channel resolution and no scoring, because the client hits it on a timer.
    The ids come from an audit the client already ran, so nothing has to be
    looked up to serve this.

    Every number returned is exact. That is the whole reason this endpoint is
    about views and not subscribers — see audit.fetch_live_views.
    """
    yt_key = os.getenv("YOUTUBE_API_KEY")
    if not yt_key:
        raise HTTPException(500, "YOUTUBE_API_KEY is not set in .env")

    # Cap at the API's own per-call ceiling. A longer list would silently cost
    # a second call per poll, which is exactly what a polled endpoint must not
    # do, so it is refused rather than truncated.
    video_ids = [v for v in ids.split(",") if v]
    if not video_ids:
        raise HTTPException(400, "No video ids given.")
    if len(video_ids) > 50:
        raise HTTPException(400, "Too many ids: 50 at most.")

    youtube = build("youtube", "v3", developerKey=yt_key)
    try:
        views = audit.fetch_live_views(youtube, video_ids)
    except HttpError as e:
        raise HTTPException(502, audit.explain_http_error(e)) from e

    return {"views": views}


# Suggestion cache. search.list is 100 units a call, so the same query typed
# twice must not cost twice — and with a typeahead in front of it, repeats are
# the common case, not the exception. Process-local and unbounded-in-principle,
# which is fine because the quota ceiling caps it at ~100 entries a day long
# before memory is a consideration. No TTL: channel names and avatars do not
# change on a timescale that justifies paying 100 units to re-check.
_SEARCH_CACHE: dict[str, list[dict]] = {}

# Anything shorter matches too much to be worth 100 units. Two characters would
# return the same handful of giant channels for every user in the world.
_MIN_QUERY = 3


@app.get("/api/channels/search")
def search_channels(q: str) -> dict:
    """Channels matching a typed name, for the search box's suggestions.

    Guarded rather than open, because each miss costs 1% of the daily YouTube
    quota and an exhausted quota takes the audits down with it:

      - queries under 3 characters are refused outright
      - anything resolve_channel_id can handle for 1 unit (a UC... id, a URL,
        an @handle) skips the search entirely
      - repeats are served from _SEARCH_CACHE for free

    The client debounces on top of this. Both layers are needed: the debounce
    stops a keystroke costing a call, the cache stops a *re-typed* query
    costing one.
    """
    yt_key = os.getenv("YOUTUBE_API_KEY")
    if not yt_key:
        raise HTTPException(500, "YOUTUBE_API_KEY is not set in .env")

    query = q.strip()
    if len(query) < _MIN_QUERY:
        return {"channels": []}

    key = query.lower()
    if key in _SEARCH_CACHE:
        return {"channels": _SEARCH_CACHE[key], "cached": True}

    youtube = build("youtube", "v3", developerKey=yt_key)

    # The 1-unit path. An @handle, a URL or a bare id is already an exact
    # reference — searching for it would pay 100 units to learn what
    # forHandle answers for 1.
    exact = (
        query.startswith("@")
        or "youtube.com" in query
        or re.fullmatch(r"UC[\w-]{22}", query) is not None
    )
    try:
        if exact:
            channel_id = audit.resolve_channel_id(youtube, query)
            item = audit.fetch_channel(youtube, channel_id)
            snippet = item["snippet"]
            thumbs = snippet.get("thumbnails", {})
            channels = [
                {
                    "id": channel_id,
                    "title": snippet.get("title", ""),
                    "handle": snippet.get("customUrl") or channel_id,
                    "description": snippet.get("description", "")[:120],
                    "avatar": (thumbs.get("default") or thumbs.get("medium") or {}).get("url", ""),
                    "subscribers": (
                        int(item["statistics"]["subscriberCount"])
                        if "subscriberCount" in item.get("statistics", {})
                        else None
                    ),
                }
            ]
        else:
            channels = audit.search_channels(youtube, query)
    except SystemExit:
        # resolve_channel_id's "no such channel". An empty list is the right
        # answer for a suggestion box — it is not an error to have typed
        # something that matches nothing yet.
        channels = []
    except HttpError as e:
        raise HTTPException(502, audit.explain_http_error(e)) from e

    _SEARCH_CACHE[key] = channels
    return {"channels": channels}


@app.post("/api/audit")
def run_audit(req: AuditRequest, authorization: str = Header(default="")) -> dict:
    """Score a channel. No model involved, so this has no usage limit.

    Open to anonymous callers — the free audit is the product's front door.
    Signing in only changes how deep it goes.
    """
    channel, videos = _fetch(req, authz.user_id_from(authorization))
    return audit.summarize(channel, videos)


def _stream_llm(prompt: str) -> StreamingResponse:
    """Stream a completion as plain text, translating failures inline.

    Errors are yielded into the body rather than raised, because the response
    has already started by the time most of them happen — the status code is
    long gone. The client looks for the ERROR: prefix.
    """

    def stream():
        try:
            yield from llm.stream_completion(prompt)
        except llm.ConfigError as e:
            yield f"\n\nERROR: {e}"
        except Exception as e:
            # Rate limits get provider-specific advice; see llm.explain_error.
            yield f"\n\nERROR: {llm.explain_error(e) or f'{type(e).__name__}: {str(e)[:300]}'}"

    # text/plain + no buffering so the browser gets chunks as they arrive.
    return StreamingResponse(
        stream(),
        media_type="text/plain; charset=utf-8",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


@app.post("/api/report")
def run_report(req: AuditRequest, authorization: str = Header(default="")) -> StreamingResponse:
    """Stream the written report. This is the call that costs money or quota."""
    user_id = _require_user(authorization)

    ok, detail = llm.check_config()
    if not ok:
        raise HTTPException(503, detail)

    channel, videos = _fetch(req, user_id)
    health_data = audit.summarize(channel, videos)["health"]
    return _stream_llm(audit.build_prompt(channel, videos, health_data))


@app.post("/api/analyse/video")
def analyse_video(req: TitleRequest, authorization: str = Header(default="")) -> StreamingResponse:
    """Explain how one video performed relative to the rest of the channel."""
    user_id = _require_user(authorization)

    ok, detail = llm.check_config()
    if not ok:
        raise HTTPException(503, detail)

    channel, videos = _fetch(req, user_id)

    try:
        prompt = audit.build_video_prompt(channel, videos, req.video_id)
    except KeyError as e:
        raise HTTPException(404, "That video isn't in this channel's recent uploads.") from e

    return _stream_llm(prompt)


@app.post("/api/suggest/title")
def suggest_title(req: TitleRequest, authorization: str = Header(default="")) -> StreamingResponse:
    """Draft replacement titles for one video that underperformed.

    Re-fetches like the other endpoints rather than trusting a title posted by
    the client, so the model is always working from what YouTube currently
    says — a title edited between the audit and the click would otherwise get
    rewritten from a stale copy.
    """
    user_id = _require_user(authorization)

    ok, detail = llm.check_config()
    if not ok:
        raise HTTPException(503, detail)

    channel, videos = _fetch(req, user_id)

    try:
        prompt = audit.build_title_prompt(channel, videos, req.video_id)
    except KeyError as e:
        # The id isn't in this channel's recent set — a stale tab, or an id
        # from a different audit.
        raise HTTPException(404, "That video isn't in this channel's recent uploads.") from e

    return _stream_llm(prompt)


@app.get("/api/cron/refresh")
def cron_refresh(authorization: str = Header(default="")) -> dict:
    """Re-score every tracked channel and append today's snapshot.

    GET because that is what Vercel Cron issues. It is not a safe method here —
    it writes — so the secret below is doing real work, not decoration: this
    route can reach the database with row-level security switched off.

    One channel failing must not sink the run. A deleted channel or a single
    YouTube hiccup would otherwise cost every later channel its snapshot for
    the day, and the gap in a trend line is permanent.
    """
    secret = os.getenv("CRON_SECRET")
    if not secret:
        raise HTTPException(503, "CRON_SECRET is not set; refusing to run.")

    # compare_digest, not ==, so a wrong guess can't be narrowed down by timing.
    if not hmac.compare_digest(authorization, f"Bearer {secret}"):
        raise HTTPException(401, "Unauthorized")

    try:
        handles = tracking.tracked_channels()
    except tracking.NotConfigured as e:
        raise HTTPException(503, str(e)) from e

    saved, failed = 0, []
    for handle in handles:
        try:
            channel, videos = _fetch(AuditRequest(channel=handle, videos=50), user_id="cron")
            tracking.save_snapshot(handle, audit.summarize(channel, videos))
            saved += 1
        except Exception as e:  # noqa: BLE001 — see the docstring
            failed.append({"channel": handle, "error": f"{type(e).__name__}: {str(e)[:200]}"})

    # Returned rather than only logged, so a failing channel is visible in the
    # Vercel cron log instead of silently never charting.
    return {"tracked": len(handles), "saved": saved, "failed": failed}


@app.post("/api/suggest/about")
def suggest_about(req: AuditRequest, authorization: str = Header(default="")) -> StreamingResponse:
    """Draft a replacement About section for a channel whose own is thin."""
    user_id = _require_user(authorization)

    ok, detail = llm.check_config()
    if not ok:
        raise HTTPException(503, detail)

    channel, videos = _fetch(req, user_id)
    return _stream_llm(audit.build_about_prompt(channel, videos))
