import { useRef, useState } from 'react'
import { ChannelSuggest } from './ChannelSuggest.jsx'
import { RecentStrip } from './RecentStrip.jsx'
import { readDepth } from './depth.js'
import { FREE_VIDEOS } from './limits.js'
import { useAuth, useLocked } from './useAuth.js'
import { useT } from './i18n/index.jsx'
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

// Icon plus catalogue key. The prose moved to i18n/catalogues/en.js; what stays
// here is the pairing and the order, which are design decisions rather than
// text and shouldn't be duplicated into five files.
const CHECKS = [
  { icon: Icon.setup, key: 'setup' },
  { icon: Icon.metadata, key: 'metadata' },
  { icon: Icon.cadence, key: 'cadence' },
  { icon: Icon.recency, key: 'recency' },
  { icon: Icon.hitrate, key: 'hitrate' },
  { icon: Icon.reach, key: 'reach' },
]

/**
 * The fourteen checks with what each is worth and what earns the points.
 *
 * The cards above say which *categories* are graded; this says exactly what the
 * grader looks for, which is the question someone actually has before they
 * paste a handle. It is also the "every point is traceable to a named check"
 * claim made checkable instead of asserted.
 *
 * SOURCE OF TRUTH IS api/score.py. Every number here is read from there — the
 * weights are its sixth `_check()` argument, and each threshold is the `good`
 * argument of the matching `_band()` call. Change a weight there and this goes
 * stale silently, which is the one real cost of stating it this precisely.
 *
 * Each row is [catalogue key, points, threshold vars]. The thresholds stayed
 * here as numbers rather than moving into the sentences in the catalogue, and
 * that is the important part: they are score.py's values, not copy. Written
 * into a translated string they would be a dozen chances for "200+ characters"
 * to come back as "150+" from a translator with no way to know it was
 * load-bearing — and the page would then be confidently, invisibly wrong about
 * what earns the points.
 */
const SCORECARD = [
  {
    group: 'setup',
    items: [
      ['banner', 5, null],
      ['about', 7, { n: 200 }],
      ['keywords', 4, null],
      ['handle', 4, null],
    ],
  },
  {
    group: 'metadata',
    items: [
      ['tags', 10, { pct: 80 }],
      ['descriptions', 10, { pct: 70, n: 250 }],
      ['titles', 7, { pct: 70 }],
      ['captions', 5, { pct: 50 }],
      ['hd', 4, { pct: 90 }],
    ],
  },
  {
    group: 'habits',
    items: [
      ['cadence', 10, { n: 14 }],
      ['recency', 8, { n: 21 }],
    ],
  },
  {
    group: 'performance',
    items: [
      ['hitRate', 10, { pct: 40 }],
      ['vps', 8, { pct: 15 }],
      ['engagement', 8, { pct: 4.5 }],
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

// Question/answer pairs live in the catalogue; this is just how many there
// are, so the FAQ and its FAQPage schema are generated from one list.
const FAQ = [1, 2, 3, 4, 5, 6, 7, 8]

/**
 * FAQPage structured data, built from the same FAQ array the page renders.
 *
 * Generated rather than hand-written so the markup and the visible answers
 * can't drift — Google treats structured data that disagrees with the page as
 * a violation, which is the same trap as hiding text.
 */
function FaqSchema() {
  const t = useT()
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    // Emitted in whatever language the page is rendering. Schema that disagrees
    // with the visible text is treated as a violation, so an English block on a
    // French page would be worse than no block at all.
    mainEntity: FAQ.map((n) => ({
      '@type': 'Question',
      name: t(`landing.faq.q${n}`),
      acceptedAnswer: { '@type': 'Answer', text: t(`landing.faq.a${n}`) },
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
  const t = useT()
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
        placeholder={t('landing.form.placeholder')}
        ariaLabel={t('landing.form.ariaChannel')}
        autoFocus={autoFocus}
      />
      <select
        value={videos}
        onChange={(e) => chooseVideos(Number(e.target.value))}
        aria-label={t('landing.form.ariaDepth')}
      >
        {/* Generated rather than three literals: the "— sign up" suffix is part
            of the sentence in every language, and hand-writing six options was
            how the locked and unlocked labels drifted apart before. */}
        {[20, 50, 100].map((n) => (
          <option key={n} value={n}>
            {locked && n > FREE_VIDEOS
              ? t('landing.form.videosLocked', { n })
              : t('landing.form.videos', { n })}
          </option>
        ))}
      </select>
      <button
        type="submit"
        aria-label={t('landing.form.submit')}
        title={t('landing.form.submit')}
      >
        <SearchIcon />
      </button>
    </form>
  )
}

export function Landing({ onStart }) {
  const t = useT()

  return (
    <>
      <header className="hero">
        <p className="kicker">{t('landing.hero.kicker')}</p>
        {/* Three fragments rather than one string with <em> in the middle: the
            emphasised phrase lands in a different position in French and
            Arabic, and a translator can move it by leaving titleAfter empty. */}
        <h1>
          {t('landing.hero.titleBefore')} <em>{t('landing.hero.titleEm')}</em>{' '}
          {t('landing.hero.titleAfter')}
        </h1>
        <p className="sub">{t('landing.hero.sub')}</p>
      </header>

      <AuditForm onSubmit={onStart} autoFocus size="lg" />

      <p className="hero-note">{t('landing.hero.note')}</p>

      {/* Sits directly under the search, where someone who has been here
          before is already looking. Renders nothing on a first visit. */}
      <RecentStrip onSelect={(handle) => onStart(handle)} />

      <section className="section" id="checks">
        <h2>{t('landing.checks.heading')}</h2>
        <p className="section-lede">{t('landing.checks.lede')}</p>
        <div className="check-grid">
          {CHECKS.map((c, i) => (
            <div key={c.key} className="check-card reveal" style={{ '--i': i }}>
              <div className="check-card-head">
                <span className="icon-tile" aria-hidden="true">
                  {c.icon}
                </span>
                <h3>{t(`landing.checks.${c.key}.title`)}</h3>
              </div>
              <p>{t(`landing.checks.${c.key}.body`)}</p>
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
        <h2>{t('landing.how.heading')}</h2>
        <p className="section-lede">{t('landing.how.lede')}</p>

        {/* Two columns from 900px up: the steps on the left, the scorecard on
            the right. Below 900px they stack in that same source order. Both
            columns get a heading of the same weight so their tops align —
            without one the left column would start at a numbered card while
            the right started at a rule. */}
        <div className="checks-split">
          <div className="checks-split-steps">
            <h3 className="scorecard-head">{t('landing.how.stepsHeading')}</h3>
            {/* Each step's content is wrapped in a single element on purpose:
                the li is a two-column grid, and loose text alongside <b> would
                become its own anonymous grid item and land in the number
                column. */}
            <ol className="steps">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <div>
                    <b>{t(`landing.how.step${n}.lead`)}</b>{' '}
                    {t(`landing.how.step${n}.rest`)}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="checks-split-table">
            <h3 className="scorecard-head">{t('landing.scorecard.heading')}</h3>
            <div className="scorecard">
              {SCORECARD.map((g) => (
                <div key={g.group} className="scorecard-group">
                  <div className="scorecard-group-head">
                    <span>{t(`landing.scorecard.group.${g.group}`)}</span>
                    {/* Summed rather than written down: a group total that
                        disagrees with its own rows is the kind of error nobody
                        notices and everybody spots. */}
                    <b>{g.items.reduce((n, [, pts]) => n + pts, 0)}</b>
                  </div>
                  {g.items.map(([key, pts, vars]) => (
                    <div key={key} className="scorecard-row">
                      <span className="scorecard-label">
                        {t(`landing.scorecard.${key}`)}
                      </span>
                      <span className="scorecard-earns">
                        {t(`landing.scorecard.${key}.earns`, vars)}
                      </span>
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
            <p className="scorecard-note">{t('landing.scorecard.note')}</p>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <FaqSchema />
        <h2>{t('landing.faq.heading')}</h2>
        <p className="section-lede">{t('landing.faq.lede')}</p>
        <div className="faq">
          {FAQ.map((n) => (
            <details key={n}>
              <summary>{t(`landing.faq.q${n}`)}</summary>
              <p>{t(`landing.faq.a${n}`)}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section" id="guides">
        <h2>{t('landing.guides.heading')}</h2>
        <p className="section-lede">{t('landing.guides.lede')}</p>
        {/* Real anchors, not router calls: these are separate documents served
            by the host, so a click has to leave the app.
            The guide pages are English-only, and the labels stay English with
            an explicit note rather than being translated: a translated link
            title that opens an English document is a worse experience than an
            English link that says so up front. */}
        <ul className="guide-links">
          {GUIDES.map(([slug, label]) => (
            <li key={slug}>
              <a href={`/${slug}`} hrefLang="en" lang="en">
                {label}
              </a>{' '}
              <span className="guide-lang">{t('landing.guides.englishOnly')}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="cta-band">
        <h2>{t('landing.cta.heading')}</h2>
        <p>{t('landing.cta.sub')}</p>
        {/* Every line here is a feature the signed-out build actually gates —
            see Locked.jsx and FREE_VIDEOS. Promising anything else would be
            found out on the first audit, which is the one thing a tool selling
            diagnosis cannot afford. */}
        <ul className="cta-list">
          <li>{t('landing.cta.item1')}</li>
          <li>{t('landing.cta.item2', { n: FREE_VIDEOS })}</li>
          <li>{t('landing.cta.item3')}</li>
          <li>{t('landing.cta.item4')}</li>
          <li>{t('landing.cta.item5')}</li>
        </ul>
        <p className="cta-fine">{t('landing.cta.fine')}</p>
        <button type="button" onClick={scrollToSearch}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M12 4.7 5.4 11.3l.9.9 5.1-5v12.1h1.2V7.2l5.1 5 .9-.9L12 4.7Z" />
          </svg>
          {t('landing.cta.back')}
        </button>
      </section>
    </>
  )
}
