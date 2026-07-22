"""YouTube channel audit.

Pulls a channel's recent uploads via the YouTube Data API, finds which videos
over- and under-performed relative to that channel's own median, then asks an
LLM for a written audit. See llm.py for which model — Gemini by default.

Usage:
    python audit.py https://www.youtube.com/@SomeChannel
    python audit.py UC_x5XG1OV2P6uZZ5FSM9Ttw --videos 30
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from statistics import median

from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import llm
import score as scoring

load_dotenv()

# Quota cost per run, in YouTube Data API units (default daily allowance: 10,000):
#   search.list (only when resolving a handle) = 100
#   channels.list                              = 1
#   playlistItems.list  (50 per page)          = 1 per page
#   videos.list         (50 per call)          = 1 per call
# A 50-video audit costs ~4 units, so ~2,500 audits/day. Handle lookups are the
# expensive part — pass a UC... channel ID directly to skip the 100-unit search.


def explain_http_error(e: HttpError) -> str:
    """Turn a YouTube HttpError into something the user can act on."""
    try:
        detail = json.loads(e.content.decode())["error"]
        reason = detail["errors"][0].get("reason", "")
        message = detail.get("message", "")
    except (ValueError, KeyError, IndexError):
        reason, message = "", str(e)

    if reason == "quotaExceeded":
        return "YouTube API daily quota exhausted. Resets at midnight Pacific."
    if reason == "accessNotConfigured":
        return (
            "YouTube Data API v3 is not enabled on this Google Cloud project.\n"
            "Fix: console.cloud.google.com -> APIs & Services -> Library ->\n"
            'search "YouTube Data API v3" -> Enable. Takes ~2 minutes to apply.'
        )
    if "are blocked" in message:
        # The API is enabled, but the key is scoped to a set of APIs that
        # excludes YouTube. Distinct from accessNotConfigured above.
        return (
            "This API key is restricted and YouTube Data API v3 is not in its allowed list.\n"
            "Fix: console.cloud.google.com -> APIs & Services -> Credentials ->\n"
            "click your key -> API restrictions -> either pick \"Don't restrict key\"\n"
            'or add "YouTube Data API v3" to the selected APIs -> Save.\n'
            "Changes can take a few minutes to apply.\n"
            "(Also confirm the key belongs to the same project where you enabled the API.)"
        )
    if reason in ("keyInvalid", "badRequest") and "API key" in message:
        return "YOUTUBE_API_KEY is invalid. Check for stray spaces or quotes in .env."
    if reason == "ipRefererBlocked":
        return (
            "This API key has application restrictions that block server-side use.\n"
            "Fix: in Google Cloud Console, set the key's Application restrictions to None."
        )
    return f"YouTube API error ({e.resp.status}): {message or e}"


def resolve_channel_id(youtube, target: str) -> str:
    """Turn a channel URL, @handle, or bare ID into a UC... channel ID."""
    target = target.strip()

    # Already a channel ID.
    if re.fullmatch(r"UC[\w-]{22}", target):
        return target

    # Pull the interesting part out of a URL.
    if "youtube.com" in target:
        if m := re.search(r"/channel/(UC[\w-]{22})", target):
            return m.group(1)
        if m := re.search(r"/@([\w.-]+)", target):
            target = "@" + m.group(1)
        else:
            raise SystemExit(f"Could not find a channel in URL: {target}")

    handle = target.lstrip("@")

    # forHandle is exact and costs 1 unit; try it before falling back to search.
    resp = youtube.channels().list(part="id", forHandle=handle).execute()
    if resp.get("items"):
        return resp["items"][0]["id"]

    # Fallback: search costs 100 units and picks the top match, which may be wrong.
    resp = (
        youtube.search()
        .list(part="snippet", q=handle, type="channel", maxResults=1)
        .execute()
    )
    if not resp.get("items"):
        raise SystemExit(f"No channel found for: {target}")
    return resp["items"][0]["snippet"]["channelId"]


def search_channels(youtube, query: str, limit: int = 6) -> list[dict]:
    """Channels matching a free-text name, for the search box's suggestions.

    THE EXPENSIVE CALL IN THIS FILE. search.list is 100 units against a
    10,000/day allowance — 25x what a whole 50-video audit costs — and it is
    the only YouTube call that matches free text to channels. There is no
    cheaper alternative; treat every invocation as 1% of the day gone.

    Two things keep that affordable, and both live outside this function:
    the caller must cache (see server.search_channels) and must not call it
    for input that resolve_channel_id can answer for 1 unit.

    The follow-up channels.list costs 1 unit for the whole batch and buys the
    subscriber count and @handle, neither of which search.list returns. The
    handle matters: it is what the audit form submits, so picking a suggestion
    goes down the 1-unit forHandle path rather than paying 100 again.
    """
    resp = (
        youtube.search()
        .list(part="snippet", q=query, type="channel", maxResults=limit)
        .execute()
    )
    items = resp.get("items", [])
    if not items:
        return []

    ids = [it["snippet"]["channelId"] for it in items]
    detail = (
        youtube.channels()
        .list(part="snippet,statistics", id=",".join(ids))
        .execute()
    )
    by_id = {it["id"]: it for it in detail.get("items", [])}

    out = []
    for cid in ids:
        item = by_id.get(cid)
        if not item:
            continue
        snippet = item["snippet"]
        thumbs = snippet.get("thumbnails", {})
        out.append(
            {
                "id": cid,
                "title": snippet.get("title", ""),
                # customUrl is the @handle, lowercased by YouTube. Absent on
                # channels that never claimed one, so the id is the fallback —
                # it resolves for free.
                "handle": snippet.get("customUrl") or cid,
                "description": snippet.get("description", "")[:120],
                "avatar": (thumbs.get("default") or thumbs.get("medium") or {}).get("url", ""),
                # hiddenSubscriberCount channels report nothing; None so the UI
                # can omit the line rather than claim zero subscribers.
                "subscribers": (
                    int(item["statistics"]["subscriberCount"])
                    if "subscriberCount" in item.get("statistics", {})
                    else None
                ),
            }
        )
    return out


def fetch_channel(youtube, channel_id: str) -> dict:
    # brandingSettings carries the banner and channel keywords, which the
    # checklist grades. Extra parts don't cost extra quota — the unit is the
    # call, not the part list.
    resp = (
        youtube.channels()
        .list(part="snippet,statistics,contentDetails,brandingSettings", id=channel_id)
        .execute()
    )
    if not resp.get("items"):
        raise SystemExit(f"Channel not found: {channel_id}")
    return resp["items"][0]


def fetch_subscribers(youtube, channel_id: str) -> dict:
    """The channel's subscriber count, plus the growth rate used to animate it.

    Cheaper than fetch_channel — two parts, one id, no resolve step — because
    this one is polled.

    The count is not exact: above ~1,000 subscribers YouTube rounds to three
    significant figures, so 508,000,000 means "somewhere near 508M". The rate
    exists so the client can run a live-counter style ticker between readings,
    the way livecounts.io and its imitators do. It is derived from the
    channel's own lifetime average rather than invented, but it is still an
    estimate, and the client is expected to label it as one.
    """
    resp = youtube.channels().list(part="statistics,snippet", id=channel_id).execute()
    if not resp.get("items"):
        raise SystemExit(f"Channel not found: {channel_id}")

    item = resp["items"][0]
    count = int(item["statistics"].get("subscriberCount", 0))

    started = item["snippet"].get("publishedAt", "")
    age_days = 1.0
    if started:
        delta = datetime.now(timezone.utc) - datetime.fromisoformat(started.replace("Z", "+00:00"))
        age_days = max(delta.days, 1)

    return {"subscribers": count, "per_day": count / age_days}


def fetch_live_views(youtube, video_ids: list[str]) -> dict[str, int]:
    """Current view counts for the audited videos, for the live ticker.

    Views are the one number here that is both exact and moving. Unlike
    subscriberCount — which the API rounds to three significant figures, so it
    can sit unchanged for days — viewCount is reported to the digit and climbs
    continuously on anything recent. That is what makes a live counter honest
    rather than decorative.

    Channel-level viewCount is deliberately not used: YouTube aggregates it on
    a lag, so it holds still while the per-video numbers underneath it move.
    """
    resp = (
        youtube.videos()
        .list(part="statistics", id=",".join(video_ids[:50]))
        .execute()
    )
    return {
        item["id"]: int(item["statistics"].get("viewCount", 0))
        for item in resp.get("items", [])
    }


def fetch_recent_videos(youtube, uploads_playlist: str, limit: int) -> list[dict]:
    """Get the most recent `limit` uploads with their stats."""
    video_ids: list[str] = []
    page_token = None

    while len(video_ids) < limit:
        resp = (
            youtube.playlistItems()
            .list(
                part="contentDetails",
                playlistId=uploads_playlist,
                maxResults=min(50, limit - len(video_ids)),
                pageToken=page_token,
            )
            .execute()
        )
        items = resp.get("items", [])
        video_ids += [i["contentDetails"]["videoId"] for i in items]
        page_token = resp.get("nextPageToken")
        # An empty page with a next-page token would otherwise spin forever
        # without ever growing video_ids.
        if not page_token or not items:
            break

    videos = []
    for i in range(0, len(video_ids), 50):
        resp = (
            youtube.videos()
            .list(part="snippet,statistics,contentDetails", id=",".join(video_ids[i : i + 50]))
            .execute()
        )
        for item in resp["items"]:
            stats = item["statistics"]
            snippet = item["snippet"]
            details = item["contentDetails"]
            published = datetime.fromisoformat(
                snippet["publishedAt"].replace("Z", "+00:00")
            )
            videos.append(
                {
                    "id": item["id"],
                    "title": snippet["title"],
                    "published": published,
                    "days_old": (datetime.now(timezone.utc) - published).days,
                    "duration": details["duration"],
                    # Metadata the checklist grades. Already paid for in the
                    # snippet part above — it was simply being discarded.
                    "description": snippet.get("description", ""),
                    "tags": snippet.get("tags", []),
                    "hd": details.get("definition") == "hd",
                    "captioned": details.get("caption") == "true",
                    # These keys are absent when the creator hides the counts.
                    "views": int(stats.get("viewCount", 0)),
                    "likes": int(stats.get("likeCount", 0)),
                    "comments": int(stats.get("commentCount", 0)),
                }
            )

    return videos


def add_performance(videos: list[dict]) -> list[dict]:
    """Score each video against the channel's median views.

    Median rather than mean: one viral video would drag a mean upward far
    enough to make every normal video look like an underperformer.

    Videos under 14 days old are excluded from the baseline — they haven't
    finished accumulating views, so including them would depress it.
    """
    mature = [v["views"] for v in videos if v["days_old"] >= 14]
    baseline = median(mature) if mature else median([v["views"] for v in videos] or [0])

    for v in videos:
        v["multiple"] = round(v["views"] / baseline, 2) if baseline else 0.0
        v["is_recent"] = v["days_old"] < 14

    return videos


def summarize(channel: dict, videos: list[dict]) -> dict:
    """Shape the numbers for the UI to chart. No prose."""
    stats = channel["statistics"]
    mature = [v for v in videos if not v["is_recent"]]
    scored = mature or videos
    above = [v for v in scored if v["multiple"] >= 1]

    views = [v["views"] for v in scored]
    baseline = median(views) if views else 0
    share_above = len(above) / len(scored) if scored else 0

    return {
        "channel": {
            # The channel's canonical id. A handle, a full URL, and a UC... id
            # all resolve here, so this is the only stable way for a client to
            # tell whether two audits are of the same channel.
            "id": channel["id"],
            "title": channel["snippet"]["title"],
            "subscribers": int(stats.get("subscriberCount", 0)),
            "total_views": int(stats.get("viewCount", 0)),
            "total_videos": int(stats.get("videoCount", 0)),
            "thumbnail": channel["snippet"].get("thumbnails", {}).get("high", {}).get("url", ""),
        },
        "health": scoring.grade_channel(channel, videos, share_above),
        "baseline_views": baseline,
        "analyzed": len(videos),
        "share_above": round(100 * share_above),
        "best_multiple": max((v["multiple"] for v in scored), default=0),
        "videos": [
            {
                "id": v["id"],
                "title": v["title"],
                "views": v["views"],
                "likes": v["likes"],
                "comments": v["comments"],
                "days_old": v["days_old"],
                "multiple": v["multiple"],
                "is_recent": v["is_recent"],
                # Metadata for the per-video detail panel. All of it was
                # already fetched for the checklist, so exposing it costs no
                # extra quota — only payload. The description is sent as a
                # length rather than in full: the panel reports whether it's
                # thin, and shipping 100 full descriptions would dwarf the
                # rest of the response.
                "published": v["published"].date().isoformat(),
                "duration": v["duration"],
                "description_len": len(v["description"]),
                "tags": v["tags"],
                "hd": v["hd"],
                "captioned": v["captioned"],
            }
            for v in sorted(videos, key=lambda x: x["multiple"], reverse=True)
        ],
    }


# What to tell the model when the reader is not reading English.
#
# The instruction is placed last in the prompt, after the section headings, and
# names the headings explicitly. Both details matter: a language instruction
# buried at the top gets outweighed by 400 words of English scaffolding, and a
# model that translates the prose but leaves "## The verdict" in English
# produces a report that looks broken rather than bilingual.
#
# Keyed by the frontend's locale codes (frontend/src/i18n/locales.js).
_REPORT_LANGUAGE = {
    "fr": "French",
    "es": "Latin American Spanish",
    "pt": "Brazilian Portuguese",
    "ar": "Modern Standard Arabic",
}


def build_prompt(
    channel: dict, videos: list[dict], health: dict | None = None, lang: str = "en"
) -> str:
    stats = channel["statistics"]
    ranked = sorted(videos, key=lambda v: v["multiple"], reverse=True)

    # Hand the model the same failed checks the UI is showing. Without this the
    # prose and the checklist can contradict each other in front of the reader.
    problems = ""
    if health:
        flagged = [c for c in health["checks"] if c["status"] in ("fail", "warn")]
        if flagged:
            problems = "\n\nAUTOMATED CHECKS THAT FAILED (already shown to the reader as a checklist)\n" + "\n".join(
                f"- {c['label']}: {c['detail']}" for c in flagged
            )

    def line(v):
        flag = "  [still recent, views incomplete]" if v["is_recent"] else ""
        return (
            f"- {v['multiple']}x baseline | {v['views']:,} views | "
            f"{v['likes']:,} likes | {v['comments']:,} comments | "
            f"{v['days_old']}d old | {v['title']}{flag}"
        )

    # Empty for English, so the prompt is byte-identical to what it was before
    # this existed — the default path gains no tokens and no new behaviour.
    language = _REPORT_LANGUAGE.get(lang)
    language_rule = (
        f"\n- Write the entire report in {language}, including the section "
        "headings. Keep the heading order and the markdown structure exactly as "
        "specified above. Channel names, video titles and numbers stay as they "
        "are — do not translate a video's title, quote it verbatim."
        if language
        else ""
    )

    return f"""Audit this YouTube channel and write a report for its owner.

CHANNEL
Name: {channel['snippet']['title']}
Subscribers: {int(stats.get('subscriberCount', 0)):,}
Total views: {int(stats.get('viewCount', 0)):,}
Total videos: {int(stats.get('videoCount', 0)):,}
Description: {channel['snippet'].get('description', '')[:500]}

RECENT VIDEOS, best to worst relative to this channel's own median views
({len(videos)} videos; "1.0x baseline" means typical for this channel)
{chr(10).join(line(v) for v in ranked)}{problems}

Be brief. The reader is skimming, and a chart already shows them the numbers.
Use exactly these sections and headings:

## The verdict
One or two sentences. What is actually holding this channel back?

## What works
Three bullets, one line each. Name the pattern, then cite one real title as
proof. Format: **pattern** — "actual title" (Nx)

## What doesn't
Three bullets, same format.

## Fix these titles
The 5 worst performers, as a markdown table with columns: Current | Better.
No commentary column.

## Make these next
Five title ideas, one line each. No explanation.

## Do this first
One sentence. The single highest-leverage change.

Rules:
- Every claim traces to a number above. No number, no claim.
- Total under 400 words. Cut anything that isn't decision-useful.
- No preamble, no flattery, no restating the brief.
- You cannot see thumbnails, retention, CTR, or traffic. Never guess at them.
- Videos flagged "still recent" have incomplete views — never call them failures.
- The failed checks are already on screen as a checklist. Don't list them back.
  Reference one only where it explains a content problem you're diagnosing.{language_rule}"""


def build_about_prompt(channel: dict, videos: list[dict]) -> str:
    """Prompt for rewriting a channel's About section.

    Fed the real video titles rather than just the channel name, because the
    titles are the only evidence of what the channel is actually about — the
    existing description is often the thing that's wrong.
    """
    snippet = channel["snippet"]
    stats = channel["statistics"]
    current = snippet.get("description", "").strip()
    ranked = sorted(videos, key=lambda v: v["multiple"], reverse=True)

    return f"""Write a new YouTube channel About section for this channel.

CHANNEL
Name: {snippet['title']}
Subscribers: {int(stats.get('subscriberCount', 0)):,}
Current About section: {current or '(empty)'}
Current length: {len(current)} characters

THEIR BEST-PERFORMING VIDEOS (these show what the channel is actually about)
{chr(10).join(f"- {v['title']}" for v in ranked[:12])}

Requirements:
- Between 250 and 600 characters. Under 250 is the problem you're fixing.
- First sentence states what the channel is and who it's for. This is the part
  that shows in search results, so it carries the topic keywords.
- Ground it in the actual video topics above. Do not invent a niche.
- Plain prose. No markdown, no emoji, no hashtag lists, no "welcome to my
  channel", no promises about upload schedules you cannot verify.
- Write it in the channel owner's voice, first person or brand voice to match
  whatever the current description suggests.

Output only the About text itself. No preamble, no quotes around it, no
explanation of your choices."""


def build_video_prompt(channel: dict, videos: list[dict], video_id: str) -> str:
    """Prompt for analysing one video against the rest of the channel.

    The whole point is comparison. "12,000 views" means nothing on its own —
    what makes it readable is that the channel's typical video gets 40,000, or
    that the three videos above it all lead with a question. So the prompt
    carries the channel's baseline and the ranked neighbours, not just the one
    video's numbers.

    Raises KeyError if the id isn't in the set; the caller turns that into 404.
    """
    target = next((v for v in videos if v["id"] == video_id), None)
    if target is None:
        raise KeyError(video_id)

    ranked = sorted(videos, key=lambda v: v["multiple"], reverse=True)
    position = ranked.index(target) + 1

    def line(v):
        mark = "  <-- this one" if v["id"] == video_id else ""
        return f"- {v['multiple']}x  {v['views']:,} views  {v['title']}{mark}"

    # A window around the target rather than the whole list: its immediate
    # neighbours are what make its position legible, and a 100-line table would
    # crowd out the instructions.
    lo = max(0, position - 4)
    neighbours = ranked[lo : position + 3]

    engagement = (
        f"{100 * target['likes'] / target['views']:.1f}% like rate"
        if target["views"] and target["likes"]
        else "like counts hidden"
    )

    return f"""Analyse one video's performance on this channel.

CHANNEL
Name: {channel['snippet']['title']}
Subscribers: {int(channel['statistics'].get('subscriberCount', 0)):,}

THE VIDEO
Title: {target['title']}
Published: {target['published'].date().isoformat()} ({target['days_old']} days ago)
Duration: {target['duration']}
Views: {target['views']:,}
Performance: {target['multiple']}x the channel median — rank {position} of {len(ranked)}
Likes: {target['likes']:,} ({engagement})
Comments: {target['comments']:,}
Description length: {len(target['description'])} characters
Tags: {len(target['tags'])} ({', '.join(target['tags'][:12]) or 'none'})
HD: {'yes' if target['hd'] else 'no'} | Captions: {'yes' if target['captioned'] else 'no'}
{'NOTE: under 14 days old, so its view count is still climbing and its multiple will rise.' if target['is_recent'] else ''}

WHERE IT SITS AMONG THE CHANNEL'S VIDEOS
{chr(10).join(line(v) for v in neighbours)}

Write a short analysis, in three labelled sections:

VERDICT — one or two sentences. Did this video do well or badly for this
channel, and by how much? Use the multiple, not the raw view count.

WHY — the two or three most likely explanations, drawn from the evidence
above: how the title compares to the ones that outperformed it, the metadata
that is missing, the length, the timing. Name the evidence you are using. If
the numbers do not support a confident explanation, say so rather than
inventing one.

WHAT TO DO — two or three specific actions for this video or the next one
like it. Concrete and checkable, not "improve your thumbnail".

Rules:
- Never claim to know retention, click-through rate, or traffic sources. None
  of that is in the data and guessing at it is the fastest way to be wrong.
- Plain prose under each heading. No markdown headers, no bullet symbols, no
  preamble before the first section."""


def build_title_prompt(channel: dict, videos: list[dict], video_id: str) -> str:
    """Prompt for rewriting one underperforming video's title.

    The channel's own hits are the reference, not general copywriting advice:
    what works on a woodworking channel gets a news channel ignored. Handing
    the model the titles that beat this channel's median — with the numbers
    attached — lets it imitate a pattern that's already proven on this
    audience rather than applying a template.

    Raises KeyError if the id isn't in the set, which the caller turns into a
    404. That only happens if the client posts an id from a different audit.
    """
    target = next((v for v in videos if v["id"] == video_id), None)
    if target is None:
        raise KeyError(video_id)

    winners = [v for v in sorted(videos, key=lambda v: v["multiple"], reverse=True) if v["multiple"] >= 1]

    return f"""Rewrite the title of one underperforming YouTube video.

CHANNEL
Name: {channel['snippet']['title']}

THE VIDEO TO RETITLE
Current title: {target['title']}
Views: {target['views']:,}
Performance: {target['multiple']}x this channel's median video
Age: {target['days_old']} days

TITLES THAT BEAT THIS CHANNEL'S MEDIAN (copy what works here, not generic advice)
{chr(10).join(f"- {v['title']}  [{v['multiple']}x]" for v in winners[:10]) or '- (none in this sample)'}

Write 3 alternative titles.

Requirements:
- Under 60 characters each, so nothing is cut off on mobile.
- The subject of the video must stay the same. You are changing the packaging,
  not inventing a different video.
- Match the patterns in the winning titles above — their structure, their
  specificity, their level of formality. That is the evidence of what this
  audience clicks.
- No clickbait that the video cannot pay off, no ALL CAPS, no emoji.
- Each one should take a different angle, so there is a real choice between
  them rather than three rewordings of one idea.

Output exactly 3 lines, one title per line. No numbering, no bullets, no
quotes, no explanation."""


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit a YouTube channel.")
    parser.add_argument("channel", help="Channel URL, @handle, or UC... ID")
    parser.add_argument("--videos", type=int, default=50, help="How many recent videos (default 50)")
    parser.add_argument("--out", help="Write the report to this file")
    parser.add_argument(
        "--no-report",
        action="store_true",
        help="Score and checklist only — skips the LLM call entirely",
    )
    args = parser.parse_args()

    yt_key = os.getenv("YOUTUBE_API_KEY")
    if not yt_key:
        raise SystemExit("YOUTUBE_API_KEY not set. Copy .env.example to .env and fill it in.")

    # Only the written report needs a model, so --no-report must not require
    # one to be configured.
    if not args.no_report:
        ok, detail = llm.check_config()
        if not ok:
            raise SystemExit(detail)

    youtube = build("youtube", "v3", developerKey=yt_key)

    try:
        channel_id = resolve_channel_id(youtube, args.channel)
        print(f"Channel: {channel_id}", file=sys.stderr)

        channel = fetch_channel(youtube, channel_id)
        uploads = channel["contentDetails"]["relatedPlaylists"]["uploads"]

        print(f"Fetching up to {args.videos} videos...", file=sys.stderr)
        videos = fetch_recent_videos(youtube, uploads, args.videos)
    except HttpError as e:
        raise SystemExit(explain_http_error(e))

    if not videos:
        raise SystemExit("No public videos found on that channel.")

    videos = add_performance(videos)
    health = summarize(channel, videos)["health"]

    print(f"\n{channel['snippet']['title']}: {health['score']}/100 (grade {health['grade']})\n")
    for c in health["checks"]:
        mark = {"pass": "PASS", "warn": "WARN", "fail": "FAIL", "skip": "  --"}[c["status"]]
        print(f"  [{mark}] {c['label']:<20} {c['detail']}")
        if c["fix"]:
            print(f"         {c['fix']}")

    if args.no_report:
        return

    print(f"\nAnalyzing {len(videos)} videos...\n", file=sys.stderr)

    # Keep collecting even if stdout goes away (piping to `head`, quitting
    # `less`), so --out still gets a complete report instead of nothing.
    # Windows raises OSError [Errno 22] here rather than BrokenPipeError,
    # so catch the parent class. Redirecting to devnull on failure also
    # stops the interpreter throwing again when it flushes stdout at exit.
    chunks = []
    try:
        for text in llm.stream_completion(build_prompt(channel, videos, health)):
            chunks.append(text)
            try:
                print(text, end="", flush=True)
            except OSError:
                sys.stdout = open(os.devnull, "w")
    except Exception as e:
        # Same translation the web path uses — without it the CLI answers a
        # rate limit with a 40-line traceback.
        raise SystemExit(f"\n\n{llm.explain_error(e) or f'{type(e).__name__}: {str(e)[:300]}'}")

    try:
        print()
    except OSError:
        sys.stdout = open(os.devnull, "w")

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(f"# Audit: {channel['snippet']['title']}\n\n{''.join(chunks)}\n")
        print(f"\nSaved to {args.out}", file=sys.stderr)


if __name__ == "__main__":
    main()
