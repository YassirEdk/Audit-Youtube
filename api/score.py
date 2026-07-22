"""Deterministic channel health checks.

Everything here is a rule, not a judgement — no model involved. The LLM writes
the prose in llm.py; this module produces the score and the checklist, so the
same channel always grades the same way.

Design notes:

* Weights sum to 100, so the score *is* the weighted percentage — there's no
  scaling step to get wrong, and a check's weight is legible as "how many
  points this is worth".
* A check can pass, warn (half credit), fail (none), or skip. Skipped checks
  leave the denominator, so a channel isn't punished for something we couldn't
  observe — hidden like counts being the common case.
* Every check states what was found *and* what to do about it. A checklist item
  the reader can't act on is just a complaint.
"""

from statistics import median

PASS, WARN, FAIL, SKIP = "pass", "warn", "fail", "skip"

# Grade bands. Deliberately generous below 70: the point is to direct attention,
# not to make someone feel bad about a channel that's merely unoptimized.
GRADES = [(90, "A"), (80, "B"), (70, "C"), (60, "D"), (0, "F")]


def _share(items, predicate) -> float:
    """Fraction of items satisfying predicate, 0.0 when there's nothing to judge."""
    if not items:
        return 0.0
    return sum(1 for i in items if predicate(i)) / len(items)


def _band(value, good, ok) -> str:
    """PASS at or above `good`, WARN at or above `ok`, else FAIL."""
    if value >= good:
        return PASS
    return WARN if value >= ok else FAIL


def _pct(x: float) -> int:
    return round(100 * x)


def _check(id, label, status, detail, fix, weight) -> dict:
    return {
        "id": id,
        "label": label,
        "status": status,
        "detail": detail,
        # Nothing to fix on a pass — the UI hides the line rather than printing
        # advice next to a green tick.
        "fix": fix if status in (WARN, FAIL) else "",
        "weight": weight,
    }


def _setup_checks(channel: dict) -> list[dict]:
    snippet = channel.get("snippet", {})
    branding = channel.get("brandingSettings", {})
    about = snippet.get("description", "").strip()
    keywords = branding.get("channel", {}).get("keywords", "").strip()
    banner = branding.get("image", {}).get("bannerExternalUrl", "")

    return [
        _check(
            "banner",
            "Channel banner",
            PASS if banner else FAIL,
            "Set" if banner else "No banner uploaded",
            "Add a 2560×1440 banner — it's the first thing a new visitor sees.",
            5,
        ),
        _check(
            "about",
            "About section",
            _band(len(about), 200, 50),
            f"{len(about)} characters"
            if about
            else "Empty",
            "Write 200+ characters covering what the channel is about and who "
            "it's for. This text is searchable.",
            7,
        ),
        _check(
            "keywords",
            "Channel keywords",
            PASS if keywords else FAIL,
            # Not counted: YouTube stores these as a space-separated string with
            # quoted multi-word phrases, so any naive split reports nonsense.
            "Set" if keywords else "None set",
            "Add channel keywords in YouTube Studio → Settings → Channel → "
            "Basic info.",
            4,
        ),
        _check(
            "handle",
            "Custom handle",
            PASS if snippet.get("customUrl") else FAIL,
            snippet.get("customUrl", "Not claimed"),
            "Claim a handle so the channel has a memorable URL.",
            4,
        ),
    ]


def _metadata_checks(videos: list[dict]) -> list[dict]:
    tagged = _share(videos, lambda v: len(v.get("tags", [])) >= 3)
    described = _share(videos, lambda v: len(v.get("description", "")) >= 250)
    # 30–70 characters: long enough to carry a keyword and a hook, short enough
    # to survive truncation in search and suggested feeds.
    titled = _share(videos, lambda v: 30 <= len(v.get("title", "")) <= 70)
    captioned = _share(videos, lambda v: v.get("captioned"))
    hd = _share(videos, lambda v: v.get("hd"))
    n = len(videos)

    return [
        _check(
            "tags",
            "Video tags",
            _band(tagged, 0.8, 0.4),
            f"{_pct(tagged)}% of {n} videos have 3+ tags",
            f"{n - round(tagged * n)} videos need tags. Tags matter most for "
            "disambiguating topics YouTube might otherwise misread.",
            10,
        ),
        _check(
            "descriptions",
            "Video descriptions",
            _band(described, 0.7, 0.35),
            f"{_pct(described)}% are 250+ characters",
            "Short descriptions give YouTube nothing to index. Aim for 250+ "
            "characters with the topic stated in the first two lines.",
            10,
        ),
        _check(
            "titles",
            "Title length",
            _band(titled, 0.7, 0.4),
            f"{_pct(titled)}% fall in the 30–70 character range",
            "Titles under 30 characters waste search real estate; over 70 get "
            "truncated before the hook lands.",
            7,
        ),
        _check(
            "captions",
            "Captions",
            _band(captioned, 0.5, 0.15),
            f"{_pct(captioned)}% have captions",
            "Captioned videos are indexable and watchable muted. Auto-captions "
            "count, but only if you don't disable them.",
            5,
        ),
        _check(
            "hd",
            "HD uploads",
            _band(hd, 0.9, 0.6),
            f"{_pct(hd)}% are HD",
            "Upload at 1080p or better.",
            4,
        ),
    ]


def _habit_checks(videos: list[dict], share_above: float, channel: dict) -> list[dict]:
    # Cadence: median gap between consecutive uploads. Median rather than mean
    # so one hiatus doesn't characterise an otherwise regular channel.
    dates = sorted((v["published"] for v in videos), reverse=True)
    gaps = [(a - b).days for a, b in zip(dates, dates[1:])]
    # int(): median of an even-length list averages the middle pair and yields
    # a float, which reads as "every 3.5 days" — spurious precision for a gap.
    gap = int(median(gaps)) if gaps else 0

    # Days since the newest upload. Deliberately separate from cadence, which
    # measures spacing and nothing else: a channel that published like
    # clockwork for two years and then stopped eight months ago still scores a
    # perfect cadence, because every gap it ever had was small. Recency is the
    # check that notices it went quiet.
    since = min((v["days_old"] for v in videos), default=None)

    # Likes are 0 when the creator hides the count — indistinguishable from
    # genuinely zero likes, so treat an all-zero channel as unobservable
    # rather than scoring it as terrible engagement.
    #
    # Comments count toward the ratio as well as likes. A comment is a much
    # higher-effort signal than a like, and a channel with the comments turned
    # off is measured on likes alone rather than marked down for it — which is
    # why the thresholds below sit only slightly above the likes-only ones
    # they replaced (4%) instead of being scaled up for the added term.
    rates = [
        (v["likes"] + v["comments"]) / v["views"] for v in videos if v["views"] > 0
    ]
    visible = any(v["likes"] or v["comments"] for v in videos)
    engagement = median(rates) if rates else 0.0

    # Views per subscriber, on the median video. The question it answers is
    # whether uploads travel past the people already subscribed — a channel
    # whose median video reaches a fifth of its subscriber count is being
    # recommended outward; one at 2% is talking to its own mailing list.
    #
    # The API omits subscriberCount entirely when the creator hides it, and
    # reports 0 for a genuinely new channel. Both are unscoreable, so both skip
    # rather than divide by zero.
    stats = channel.get("statistics", {})
    subs = int(stats.get("subscriberCount") or 0)
    typical_views = median([v["views"] for v in videos]) if videos else 0
    reach = typical_views / subs if subs else 0.0

    checks = [
        _check(
            "cadence",
            "Upload consistency",
            # A single video yields no gaps to measure — skip rather than
            # award a free pass for having nothing to judge.
            _band(-gap, -14, -30) if gaps else SKIP,  # negated: smaller gap is better
            "Multiple videos a day, typically"
            if gaps and gap == 0
            else f"A new video every {gap} day{'s' if gap != 1 else ''}, typically"
            if gaps
            else "Not enough upload history to judge",
            "Gaps beyond two weeks cost you the algorithmic momentum that "
            "makes each upload easier than the last.",
            10,
        ),
        _check(
            "recency",
            "Posting recency",
            # Negated so that fewer days is better, same trick as cadence.
            _band(-since, -21, -60) if since is not None else SKIP,
            "Published today"
            if since == 0
            else f"Last upload {since} day{'s' if since != 1 else ''} ago"
            if since is not None
            else "No uploads found",
            "Three weeks of silence and the recommendation system stops "
            "treating the channel as active. Publishing anything restarts it.",
            8,
        ),
        _check(
            "hit_rate",
            "Hit rate",
            _band(share_above, 0.4, 0.25),
            f"{_pct(share_above)}% of videos beat this channel's own median",
            "Most uploads land below your own average, which usually means the "
            "catalogue is carried by a few outliers. Study what they share.",
            10,
        ),
        _check(
            "reach",
            "Views per subscriber",
            _band(reach, 0.15, 0.05) if subs else SKIP,
            f"The median video reaches {_pct(reach)}% of the subscriber count"
            if subs
            else "Subscriber count is hidden on this channel",
            "Videos are mostly reaching people who already subscribed. Titles "
            "and thumbnails that assume no prior knowledge travel further.",
            8,
        ),
    ]

    if visible:
        checks.append(
            _check(
                "engagement",
                "Engagement",
                _band(engagement, 0.045, 0.022),
                f"{engagement * 100:.1f}% likes and comments per view, typically",
                # Wording has to cover the warn band as well as failure, or a
                # 3% channel reads advice about being "under 2%".
                "Healthy channels sit above 4.5%. Below that, the content is "
                "being found but not connecting — ask for the like on camera "
                "and end on a question worth answering.",
                8,
            )
        )
    else:
        checks.append(
            _check(
                "engagement",
                "Engagement",
                SKIP,
                "Likes and comments are hidden on this channel",
                "",
                8,
            )
        )

    return checks


def grade_channel(channel: dict, videos: list[dict], share_above: float) -> dict:
    """Score a channel 0–100 and return the checklist behind that number."""
    checks = (
        _setup_checks(channel)
        + _metadata_checks(videos)
        + _habit_checks(videos, share_above, channel)
    )

    graded = [c for c in checks if c["status"] != SKIP]
    possible = sum(c["weight"] for c in graded)
    earned = sum(
        c["weight"] if c["status"] == PASS else c["weight"] / 2 if c["status"] == WARN else 0
        for c in graded
    )
    score = round(100 * earned / possible) if possible else 0
    grade = next(letter for floor, letter in GRADES if score >= floor)

    return {
        "score": score,
        "grade": grade,
        "checks": checks,
        "failed": sum(1 for c in checks if c["status"] == FAIL),
        "warned": sum(1 for c in checks if c["status"] == WARN),
        "passed": sum(1 for c in checks if c["status"] == PASS),
    }
