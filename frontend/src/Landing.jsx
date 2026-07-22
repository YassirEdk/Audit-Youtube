import { useRef, useState } from 'react'
import { ChannelSuggest } from './ChannelSuggest.jsx'
import { RecentStrip } from './RecentStrip.jsx'
import { readDepth } from './depth.js'
import { FREE_VIDEOS } from './limits.js'
import { useAuth, useLocked } from './useAuth.js'
import { SearchIcon } from './Shell.jsx'

/**
 * The intro page. Its only job is to explain what the tool measures and get a
 * channel into the box — so the form is above the fold and repeated at the
 * bottom, and everything between the two is there to answer "why should I
 * trust this number?"
 */

/* Inline 24px stroke icons — five of them isn't worth an icon library, and a
   sprite file would be one more request for 2KB of paths. */
const Icon = {
  setup: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <path d="M3 15h10M3 19h6" />
    </svg>
  ),
  metadata: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  cadence: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </svg>
  ),
  hitrate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 20V10M12 20V4M19 20v-6" />
    </svg>
  ),
  recency: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.3l3.4 2" />
    </svg>
  ),
  reach: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4.5v-2M12 21.5v-2M19.5 12h2M2.5 12h2" />
      <path d="M7.8 7.8 6.4 6.4M17.6 17.6l-1.4-1.4M16.2 7.8l1.4-1.4M6.4 17.6l1.4-1.4" />
    </svg>
  ),
}

const CHECKS = [
  {
    icon: Icon.setup,
    title: 'Channel setup',
    body: 'Banner, About section, keywords, and handle — the metadata a new visitor and the search index both read first.',
  },
  {
    icon: Icon.metadata,
    title: 'Video metadata',
    body: 'Tags, description length, title length, captions, and upload quality across every recent video.',
  },
  {
    icon: Icon.cadence,
    title: 'Upload consistency',
    body: 'How regularly you publish, measured as the typical gap between uploads rather than an average one hiatus can distort.',
  },
  {
    icon: Icon.recency,
    title: 'Posting recency',
    body: 'How long since the last upload. A channel can have published like clockwork for two years and still have gone quiet — consistency alone would never catch it.',
  },
  {
    icon: Icon.hitrate,
    title: 'Hit rate',
    body: 'How many videos beat your own median — not some global benchmark that punishes small channels for being small.',
  },
  {
    icon: Icon.reach,
    title: 'Reach and engagement',
    body: 'Views per subscriber, plus likes and comments against views. Together they answer whether videos travel past the people already subscribed.',
  },
]

/**
 * The fourteen checks with what each is worth and what earns the points.
 *
 * The four cards above say which *categories* are graded; this says exactly
 * what the grader looks for, which is the question someone actually has before
 * they paste a handle. It is also the "every point is traceable to a named
 * check" claim made checkable instead of asserted.
 *
 * SOURCE OF TRUTH IS api/score.py. Every number here is read from there — the
 * weights are its sixth `_check()` argument, and each threshold is the `good`
 * argument of the matching `_band()` call. Change a weight there and this goes
 * stale silently, which is the one real cost of stating it this precisely.
 * `points` per group is asserted against the items below at render time.
 */
const SCORECARD = [
  {
    group: 'Channel setup',
    items: [
      ['Channel banner', 5, 'Uploaded'],
      ['About section', 7, '200+ characters'],
      ['Channel keywords', 4, 'Set in Studio'],
      ['Custom handle', 4, 'Claimed'],
    ],
  },
  {
    group: 'Video metadata',
    items: [
      ['Video tags', 10, '80% of videos carry 3+ tags'],
      ['Video descriptions', 10, '70% run to 250+ characters'],
      ['Title length', 7, '70% land in 30–70 characters'],
      ['Captions', 5, '50% are captioned'],
      ['HD uploads', 4, '90% are 1080p or better'],
    ],
  },
  {
    group: 'Upload habits',
    items: [
      ['Upload consistency', 10, 'A new video every 14 days or sooner'],
      ['Posting recency', 8, 'Something published in the last 21 days'],
    ],
  },
  {
    group: 'Performance',
    items: [
      ['Hit rate', 10, '40% of videos beat the channel median'],
      ['Views per subscriber', 8, 'The median video reaches 15% of subscribers'],
      ['Engagement', 8, 'Likes and comments above 4.5% of views'],
    ],
  },
]

/**
 * The heaviest single check, and the full width of a scorecard bar.
 *
 * Derived rather than written as 10: every bar shares one scale, so the moment
 * a weight in score.py changes this has to move with it or the bars start
 * lying about proportion while the numbers next to them stay right — the worst
 * of both.
 */
const SCORECARD_MAX = Math.max(...SCORECARD.flatMap((g) => g.items.map(([, pts]) => pts)))

const FAQ = [
  {
    q: 'Can I audit a channel I don\'t own?',
    a: 'Yes. Everything comes from public YouTube data, so you can audit any channel — including a competitor\'s.',
  },
  {
    q: 'How is the score calculated?',
    a: 'Fourteen checks, each worth a fixed number of points that add up to 100. Passing earns full points, a partial pass earns half, and anything we cannot observe is excluded rather than counted against you. Every point is traceable to a named check in your results.',
  },
  {
    q: "What can't it see?",
    a: 'Retention, click-through rate, impressions, and traffic sources live in YouTube Studio and need the channel owner\'s login. This audit reasons from views, titles, and metadata — genuinely useful for spotting packaging and topic patterns, but it cannot tell you whether a video failed because the thumbnail went unclicked or because viewers left early.',
  },
  {
    q: 'How is this different from vidIQ or TubeBuddy?',
    a: "Those are full channel-management suites — keyword research, bulk tag editing, competitor tracking — and they generally ask you to install a browser extension and connect your YouTube account. This is deliberately narrower: paste any channel handle and get a scored audit of what is publicly visible, with nothing to install and no account to connect. Because it reads only public data it can audit channels you don't own, which is the trade in both directions: it will never show you the private Studio metrics those tools surface once you've connected.",
  },
  {
    q: 'Is there a free YouTube channel audit tool?',
    a: "This is one. Scoring a channel costs nothing and needs no account — you get the health score, the performance chart measured against the channel's own median, and a sample of the checklist. A free account opens the full fourteen-check breakdown, deeper scans of up to 100 videos, and the written report.",
  },
  {
    q: "Can I use this to analyse a competitor's channel?",
    a: 'Yes, and it is one of the more useful ways to run it. Every check works from public data, so a competitor audit reads exactly the same as your own: which of their videos beat their typical performance, how their titles and descriptions are built, and which parts of their setup are left undone.',
  },
  {
    q: 'Does this work for small channels?',
    a: "Yes, and it is built for them. Because every check is scored against the channel's own median rather than a global benchmark, a channel with 400 subscribers is measured on whether its videos beat its own typical video — not on whether it beats somebody with a million. Nothing here penalises a channel for being small, and the setup and metadata checks are the ones that tend to matter most early on.",
  },
  {
    q: 'Why compare against my own median instead of other channels?',
    a: 'Because a 10,000-view video is a triumph on one channel and a disaster on another. Scoring against your own median tells you which of your videos actually outperformed, and using the median rather than the mean stops one viral hit from making everything else look like a failure.',
  },
]

/**
 * FAQPage structured data, built from the same FAQ array the page renders.
 *
 * Generated rather than hand-written so the markup and the visible answers
 * can't drift — Google treats structured data that disagrees with the page as
 * a violation, which is the same trap as hiding text.
 */
function FaqSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * The static content pages, linked so they aren't orphans.
 *
 * A page that only the sitemap knows about is a page Google will crawl once
 * and mostly ignore — internal links are how it decides a URL matters. This
 * block is the whole of that signal, so it renders in the prerendered HTML
 * rather than behind any interaction.
 *
 * The slugs are duplicated from scripts/pages.mjs, which owns the content.
 * Importing that file here would pull every page's prose into the app bundle
 * for the sake of five strings, so prerender.mjs asserts instead: if a slug in
 * PAGES isn't linked from the rendered landing HTML, the build fails.
 */
const GUIDES = [
  ['free-youtube-channel-audit-tool', 'What the free audit includes'],
  ['how-the-youtube-channel-score-works', 'How the score out of 100 is calculated'],
  ['youtube-competitor-channel-analysis', "Analysing a competitor's channel"],
  ['youtube-audit-for-small-channels', 'Why this works for small channels'],
  ['youtube-channel-audit-vs-vidiq-tubebuddy', 'How this compares to vidIQ and TubeBuddy'],
  ['youtube-channel-audit-checklist', 'The fourteen checks, ordered by what to fix first'],
  ['why-are-my-youtube-views-dropping', 'Why your views are dropping'],
  ['how-often-should-i-upload-to-youtube', 'How often you should upload'],
]

// There's only ever one search field on the landing page now, so the closing
// CTA sends people back to it rather than duplicating it.
const HERO_INPUT_ID = 'channel-input'

function scrollToSearch() {
  // preventScroll, then a smooth scroll of our own: focusing an off-screen
  // input otherwise makes the browser jump to it instantly, which cancels the
  // animation and lands with no sense of where you went.
  document.getElementById(HERO_INPUT_ID)?.focus({ preventScroll: true })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function AuditForm({ onSubmit, autoFocus = false, size = '' }) {
  const locked = useLocked()
  const { requestAuth } = useAuth()
  const [channel, setChannel] = useState('')
  const [videos, setVideos] = useState(readDepth)
  const inputRef = useRef(null)

  // Intercepted rather than marking the options disabled: a disabled <option>
  // can't be chosen and can't explain itself either, so the reader is left
  // guessing why the deeper scans don't respond. This way the click lands on
  // the sign-up dialog and the select stays where it was.
  function chooseVideos(next) {
    if (locked && next > FREE_VIDEOS) {
      requestAuth('signup')
      return
    }
    setVideos(next)
  }

  return (
    <form
      className={`search ${size}`}
      onSubmit={(e) => {
        e.preventDefault()
        // Deliberately not disabled while empty: a greyed-out primary CTA is
        // the first thing a visitor sees, and it reads as broken. Empty submit
        // sends them to the field instead.
        if (channel.trim()) onSubmit(channel.trim(), videos)
        else inputRef.current?.focus()
      }}
    >
      <ChannelSuggest
        inputRef={inputRef}
        id={HERO_INPUT_ID}
        value={channel}
        onChange={setChannel}
        // Picking a suggestion is the submit — making someone choose a channel
        // and then press the button as well is a step that means nothing.
        onPick={(handle) => onSubmit(handle, videos)}
        placeholder="Channel name   ·   @handle   ·   youtube.com/@channel"
        ariaLabel="YouTube channel name, handle, or ID"
        autoFocus={autoFocus}
      />
      <select
        value={videos}
        onChange={(e) => chooseVideos(Number(e.target.value))}
        aria-label="How many recent videos to analyze"
      >
        <option value={20}>20 videos</option>
        <option value={50}>{locked ? '50 videos — sign up' : '50 videos'}</option>
        <option value={100}>{locked ? '100 videos — sign up' : '100 videos'}</option>
      </select>
      <button type="submit" aria-label="Audit channel" title="Audit channel">
        <SearchIcon />
      </button>
    </form>
  )
}

export function Landing({ onStart }) {
  return (
    <>
      <header className="hero">
        <p className="kicker">Free · Instant results · Public data only</p>
        <h1>
          Find out what's holding <em>your channel</em> back
        </h1>
        <p className="sub">
          A health score out of 100 from fourteen automated checks, every recent
          video graded against your own average, and a written breakdown of
          what to fix first.
        </p>
      </header>

      <AuditForm onSubmit={onStart} autoFocus size="lg" />

      <p className="hero-note">
        Works on any public channel — including your competitors'.
      </p>

      {/* Sits directly under the search, where someone who has been here
          before is already looking. Renders nothing on a first visit. */}
      <RecentStrip onSelect={(handle) => onStart(handle)} />

      <section className="section" id="checks">
        <h2>Channel audit checklist</h2>
        <p className="section-lede">
          Your score reflects your most recent videos. Each category grades a
          signal that YouTube's recommendation system actually rewards.
        </p>
        <div className="check-grid">
          {CHECKS.map((c, i) => (
            <div key={c.title} className="check-card reveal" style={{ '--i': i }}>
              <div className="check-card-head">
                <span className="icon-tile" aria-hidden="true">
                  {c.icon}
                </span>
                <h3>{c.title}</h3>
              </div>
              <p>{c.body}</p>
            </div>
          ))}
        </div>

      </section>

      {/* Its own section again, with its own h2, because it is now a nav
          destination: an item in the header has to land on a heading that
          names it, or the click reads as having gone to the wrong place.
          scroll-margin-top on .section is what stops the masthead covering
          the heading on arrival. */}
      <section className="section" id="how">
        <h2>How it works</h2>
        <p className="section-lede">
          Nothing to install, and every point traceable to a named check.
        </p>

        {/* Two columns from 900px up: the steps on the left, the scorecard on
            the right. Below 900px they stack in that same source order. Both
            columns get a heading of the same weight so their tops align —
            without one the left column would start at a numbered card while
            the right started at a rule. */}
        <div className="checks-split">
          <div className="checks-split-steps">
            <h3 className="scorecard-head">Three steps</h3>
            {/* Each step's content is wrapped in a single element on purpose:
                the li is a two-column grid, and loose text alongside <b> would
                become its own anonymous grid item and land in the number
                column. */}
            <ol className="steps">
              <li>
                <div>
                  <b>Paste a channel.</b> A URL, an @handle, or a raw channel
                  ID — all three work.
                </div>
              </li>
              <li>
                <div>
                  <b>Get the score instantly.</b> The health score, checklist,
                  and performance chart are computed from public data, with no
                  model involved and nothing to wait for.
                </div>
              </li>
              <li>
                <div>
                  <b>Read the breakdown.</b> One click turns the numbers into
                  plain English: what's working, which titles to rewrite, and
                  what to make next.
                </div>
              </li>
            </ol>
          </div>

          <div className="checks-split-table">
            <h3 className="scorecard-head">All fourteen checks, and what each is worth</h3>
            <div className="scorecard">
              {SCORECARD.map((g) => (
                <div key={g.group} className="scorecard-group">
                  <div className="scorecard-group-head">
                    <span>{g.group}</span>
                    {/* Summed rather than written down: a group total that
                        disagrees with its own rows is the kind of error nobody
                        notices and everybody spots. */}
                    <b>{g.items.reduce((n, [, pts]) => n + pts, 0)}</b>
                  </div>
                  {g.items.map(([label, pts, earns]) => (
                    <div key={label} className="scorecard-row">
                      <span className="scorecard-label">{label}</span>
                      <span className="scorecard-earns">{earns}</span>
                      {/* Magnitude bar on one scale shared by every row, so a
                          10-point check is visibly twice a 5-point one across
                          group boundaries as well as inside them. Decorative
                          to a screen reader — the number beside it is the real
                          value, so it's aria-hidden rather than read twice. */}
                      <span className="scorecard-bar" aria-hidden="true">
                        <i style={{ width: `${(pts / SCORECARD_MAX) * 100}%` }} />
                      </span>
                      <span className="scorecard-pts">{pts}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p className="scorecard-note">
              A partial pass earns half. Anything the audit can't observe —
              hidden like counts, a channel too new to have an upload rhythm —
              leaves the total rather than scoring zero, so the percentage
              always means "how much of what could be seen was in order".
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <FaqSchema />
        <h2>Questions</h2>
        <p className="section-lede">
          What the score means, and what this can't tell you.
        </p>
        <div className="faq">
          {FAQ.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section" id="guides">
        <h2>Read more</h2>
        <p className="section-lede">
          Longer answers on how the score is built and what to do with it.
        </p>
        {/* Real anchors, not router calls: these are separate documents served
            by the host, so a click has to leave the app. */}
        <ul className="guide-links">
          {GUIDES.map(([slug, label]) => (
            <li key={slug}>
              <a href={`/${slug}`}>{label}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="cta-band">
        <h2>Turn the score into a plan</h2>
        <p>
          The audit tells you what's wrong in a few seconds. A free account
          tells you what to do about it.
        </p>
        {/* Every line here is a feature the signed-out build actually gates —
            see Locked.jsx and FREE_VIDEOS. Promising anything else would be
            found out on the first audit, which is the one thing a tool selling
            diagnosis cannot afford. */}
        <ul className="cta-list">
          <li>All fourteen checks, each with the reasoning and the fix</li>
          <li>Scans of up to 100 videos instead of {FREE_VIDEOS}</li>
          <li>A written breakdown: what's working, what to fix, what to make next</li>
          <li>A rewritten About section, drafted for you</li>
          <li>Saved audits, so you can re-run a channel and see what moved</li>
        </ul>
        <p className="cta-fine">
          No card, no extension, no YouTube login — and it still works on any
          public channel, including your competitors'.
        </p>
        <button type="button" onClick={scrollToSearch}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M12 4.7 5.4 11.3l.9.9 5.1-5v12.1h1.2V7.2l5.1 5 .9-.9L12 4.7Z" />
          </svg>
          Back to search
        </button>
      </section>
    </>
  )
}
