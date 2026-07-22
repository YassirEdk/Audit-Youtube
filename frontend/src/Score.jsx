/**
 * Channel health score and the checklist behind it.
 *
 * The score is the headline, but it's deliberately not the whole story: a
 * bare number invites arguing with it. Every point is traceable to a named
 * check, and every failing check carries the fix, so the ring is an index into
 * the list rather than a verdict on its own.
 */

import { useEffect, useState } from 'react'
import { Avatar } from './Avatar.jsx'
import { Gated } from './Locked.jsx'
import { useI18n, useT } from './i18n/index.jsx'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Bands match score.py's GRADES. Colour carries the same meaning as the
// checklist icons below, so the ring and the list can't disagree.
function toneFor(score) {
  if (score >= 80) return 'ok'
  if (score >= 60) return 'warn'
  return 'bad'
}

const ICON = { pass: '✓', warn: '!', fail: '✕', skip: '–' }

/**
 * Counts from 0 to `target` on the same curve as the ring that surrounds it,
 * so the number and the arc arrive together instead of racing.
 *
 * requestAnimationFrame rather than a CSS counter because the value has to be
 * real text — screen readers and Ctrl+F should both find the score.
 */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    let frame
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      // easeOutCubic — fast out of the gate, settling gently on the number.
      setValue(Math.round(target * (1 - (1 - t) ** 3)))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}

// Group headings are catalogue keys; the ids are api/score.py's check ids and
// stay in English because they are data, not text — the server sends them and
// nothing renders them.
const GROUPS = [
  { key: 'setup', ids: ['banner', 'about', 'keywords', 'handle'] },
  { key: 'metadata', ids: ['tags', 'descriptions', 'titles', 'captions', 'hd'] },
  { key: 'habits', ids: ['cadence', 'hit_rate', 'engagement'] },
]

export function ScoreCard({ health, channel }) {
  const t = useT()
  const { formatNumber } = useI18n()
  const { score, grade, passed, warned, failed } = health
  const tone = toneFor(score)
  const shown = useCountUp(score)

  return (
    <section className={`score-card tone-${tone} edge-lit reveal`}>
      <div className="score-ring">
        <svg
          viewBox="0 0 128 128"
          role="img"
          aria-label={t('score.ariaRing', { score, grade })}
        >
          <circle className="ring-track" cx="64" cy="64" r={RADIUS} />
          <circle
            className="ring-value"
            cx="64"
            cy="64"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            // Drawn from the top, clockwise. The dashoffset is what animates.
            style={{ '--arc': CIRCUMFERENCE * (1 - score / 100) }}
          />
        </svg>
        <div className="ring-face">
          {/* aria-hidden: the accessible score lives on the svg's label above,
              where it's stable — this one is mid-animation most of the time. */}
          <span className="ring-score" aria-hidden="true">
            {formatNumber(shown)}
          </span>
          <span className="ring-grade">{grade}</span>
        </div>
      </div>

      <div className="score-copy">
        <h2>
          <Avatar className="avatar" src={channel.thumbnail} name={channel.title} size={32} />
          {channel.title}
        </h2>
        <p className="score-lede">
          {t('score.lede', { n: passed + warned + failed })}
        </p>
        <div className="score-tally">
          <span className="tally ok">
            <b>{formatNumber(passed)}</b> {t('score.passed')}
          </span>
          <span className="tally warn">
            <b>{formatNumber(warned)}</b> {t('score.needWork')}
          </span>
          <span className="tally bad">
            <b>{formatNumber(failed)}</b> {t('score.failed')}
          </span>
        </div>
      </div>
    </section>
  )
}

// How many checks a signed-out visitor gets. Two is enough to show what a
// check looks like and that the failures are specific, without handing over
// the whole diagnosis.
const FREE_CHECKS = 2

/**
 * Cuts the grouped checks in two at the Nth check overall.
 *
 * Counting across groups rather than within them is what keeps the free
 * allowance honest — per-group would leak one from every section, which for
 * three groups is most of the value.
 *
 * A group straddling the cut appears in both halves; `continued` marks the
 * second piece so its heading isn't printed twice.
 */
function splitAtCheck(groups, limit) {
  const free = []
  const rest = []
  let taken = 0

  for (const group of groups) {
    const take = Math.max(0, Math.min(group.checks.length, limit - taken))
    if (take > 0) free.push({ ...group, checks: group.checks.slice(0, take) })
    if (take < group.checks.length) {
      rest.push({ ...group, checks: group.checks.slice(take), continued: take > 0 })
    }
    taken += take
  }

  return [free, rest]
}

/**
 * `fixers` maps a check id to a node rendered under that check when it isn't
 * passing — the hook for "this check failed, here's a button that fixes it".
 * Only `about` has one today; the slot is generic so the next one is a
 * one-line change rather than a refactor.
 */
export function Checklist({ health, fixers = {}, locked = false }) {
  const t = useT()
  const byId = Object.fromEntries(health.checks.map((c) => [c.id, c]))

  const groups = GROUPS.map((g) => ({
    key: g.key,
    title: t(`score.group.${g.key}`),
    checks: g.ids.map((id) => byId[id]).filter(Boolean),
  })).filter((g) => g.checks.length)

  const total = groups.reduce((n, g) => n + g.checks.length, 0)
  const gated = locked && total > FREE_CHECKS
  const [free, rest] = gated ? splitAtCheck(groups, FREE_CHECKS) : [groups, []]

  const renderGroup = (group, gi) => (
    <div key={group.key} className="check-group" style={{ '--i': gi }}>
      {!group.continued && <h3>{group.title}</h3>}
      {group.checks.map((c) => (
        <div key={c.id} className={`check is-${c.status}`}>
          <span className="check-icon" aria-hidden="true">
            {ICON[c.status]}
          </span>
          <div className="check-body">
            <div className="check-head">
              <span className="check-label">{c.label}</span>
              <span className="check-detail">{c.detail}</span>
            </div>
            {/* Only failures and warnings carry a fix — the server sends
                an empty string for anything already passing. */}
            {/* title carries the full sentence for the narrow-column case,
                where the line ellipses rather than wrapping. */}
            {c.fix && (
              <p className="check-fix" title={c.fix}>
                {c.fix}
              </p>
            )}
            {c.status !== 'pass' && c.status !== 'skip' && fixers[c.id]}
          </div>
          {/* The status word for screen readers — the icon beside it is a
              glyph they'd otherwise read as punctuation or skip entirely. */}
          <span className="sr-only">{t(`score.status.${c.status}`)}</span>
        </div>
      ))}
    </div>
  )

  return (
    <section className="checklist reveal">
      {free.map(renderGroup)}
      {gated ? (
        <Gated label={t('score.moreChecks', { n: total - FREE_CHECKS })}>
          {rest.map(renderGroup)}
        </Gated>
      ) : (
        rest.map(renderGroup)
      )}
    </section>
  )
}
