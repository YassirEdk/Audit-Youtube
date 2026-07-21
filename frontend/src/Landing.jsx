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
    icon: Icon.hitrate,
    title: 'Hit rate',
    body: 'How many videos beat your own median — not some global benchmark that punishes small channels for being small.',
  },
  // Engagement (11 of 100 points) is deliberately not listed here: it carries
  // the least weight of any category and is skipped entirely when a channel
  // hides its like counts. It still runs, and still appears in results.
]

const FAQ = [
  {
    q: 'Can I audit a channel I don\'t own?',
    a: 'Yes. Everything comes from public YouTube data, so you can audit any channel — including a competitor\'s.',
  },
  {
    q: 'How is the score calculated?',
    a: 'Twelve checks, each worth a fixed number of points that add up to 100. Passing earns full points, a partial pass earns half, and anything we cannot observe is excluded rather than counted against you. Every point is traceable to a named check in your results.',
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
    a: "This is one. Scoring a channel costs nothing and needs no account — you get the health score, the performance chart measured against the channel's own median, and a sample of the checklist. A free account opens the full twelve-check breakdown, deeper scans of up to 100 videos, and the written report.",
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
          A health score out of 100 from twelve automated checks, every recent
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

      <section className="section" id="how">
        <h2>How it works</h2>
        <p className="section-lede">
          Three steps, nothing to install.
        </p>
        {/* Each step's content is wrapped in a single element on purpose: the
            li is a two-column grid, and loose text alongside <b> would become
            its own anonymous grid item and land in the 32px number column. */}
        <ol className="steps">
          <li>
            <div>
              <b>Paste a channel.</b> A URL, an @handle, or a raw channel ID —
              all three work.
            </div>
          </li>
          <li>
            <div>
              <b>Get the score instantly.</b> The health score, checklist, and
              performance chart are computed from public data, with no model
              involved and nothing to wait for.
            </div>
          </li>
          <li>
            <div>
              <b>Read the breakdown.</b> One click turns the numbers into plain
              English: what's working, which titles to rewrite, and what to
              make next.
            </div>
          </li>
        </ol>
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

      <section className="cta-band">
        <h2>Audit a channel</h2>
        <p>Takes a few seconds. Nothing to install, results straight away.</p>
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
