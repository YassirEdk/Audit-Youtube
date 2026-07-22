import { useEffect, useRef, useState } from 'react'

/**
 * A livecounts.io-style ticker: the subscriber count climbs continuously
 * instead of sitting still until the API's rounded figure changes.
 *
 * Above roughly 1,000 subscribers YouTube only reports subscriberCount to
 * three significant figures, so a poll returns 508,000,000 — never
 * 508,135,001. Below that it reports the exact number, which is why a small
 * channel gets neither the seeding nor the "rough estimate" caption: there is
 * no rounding band to sit inside, and `step` comes back as 1. The digits shown
 * here are filled in by us: the first reading and every reported change get
 * seeded to a random point inside that rounding band (`step` wide) rather
 * than the suspiciously flat number the API actually sent, then the tile
 * climbs from there at the channel's lifetime average subscribers/day
 * (`per_day`), occasionally bursting forward by a handful at once — the way
 * subscribes actually arrive in clusters rather than one at a time — and
 * wobbling by a smaller amount most other ticks, in either direction, since
 * a real live count also dips as people unsubscribe. The burst and wobble
 * carry a minimum size of one: without it the steady climb alone leaves the
 * rendered integer unchanged for minutes on any channel growing at a normal
 * pace, which reads as a broken counter rather than an honest one. A poll that reports the
 * *same* rounded figure never snaps the display back down to it, and the
 * tick keeps running in a backgrounded tab rather than freezing on alt-tab.
 * `estimated` and `step` exist so the UI can say plainly that this is a
 * guess, not a fact — and, on a channel small enough to be reported exactly,
 * so it can refrain from saying it.
 */

// The published value changes far more slowly than this, but polling has to
// feel responsive to justify the word "live". One unit per call against a
// 10,000/day quota — a tab left open all day costs ~1,440, comfortably clear
// of the ceiling even alongside a few audits.
const POLL_MS = 60_000

// Faster cadence for a channel whose count is reported exactly.
//
// A banded channel gains nothing from polling harder: below ~1,000 subscribers
// of movement the published figure doesn't change at all, so the extra calls
// return the identical number. An exact count is the opposite — every single
// subscribe is visible the moment YouTube publishes it, and that is the case
// where a stale tile is actually noticeable.
//
// Quota: one unit per call against 10,000/day. A tab left open all day costs
// ~4,300 here against ~1,440 at the slow cadence — more, but still clear of the
// ceiling alongside a day's audits, and only ever paid on small channels.
const EXACT_POLL_MS = 20_000

// Floor on how soon a visibility change may force a poll. Alt-tabbing back and
// forth is free otherwise, and a rapid switcher could out-poll the schedule.
const MIN_POLL_GAP_MS = 5_000

// How often the display advances. A plain setInterval rather than
// requestAnimationFrame, deliberately: rAF is suspended entirely in a
// backgrounded tab, and the count should keep moving even while the reader
// is alt-tabbed away.
const TICK_MS = 1000

// How long the tile stays flagged as just-changed. Long enough to catch the
// eye on a glance back at the page, short enough not to linger as decoration.
const FLASH_MS = 4000

// Odds of a burst on any given tick, and how big one is. Subscribes land in
// clusters — a creator gets shared, a video pops off — not one at a time, so
// every so often the tile jumps by more than a second of the steady rate
// would produce. Sized off the channel's own *growth rate*, not its raw
// count: a channel sitting on a huge but static subscriber count (or a
// brand-new one with essentially none) has no business bursting just
// because the number itself is big.
const BURST_CHANCE = 0.12

// The unit floors below are what make the tile read as live at all. Scaling
// alone rounds to zero for any channel under a few thousand a day — which is
// nearly all of them — and with no burst and no wobble the display is left
// with only the steady climb. At 100/day that is 0.001 of a subscriber per
// tick, so the rendered integer does not change for a quarter of an hour and
// the counter looks broken. A floor of one keeps the trailing digits alive
// for a channel that is genuinely moving. It does not invent movement where
// there is none: tick() still returns early when the rate is exactly zero,
// and the leash below pins all of it to the last real reading.
const MIN_UNIT = 1

function burstSize(perDay) {
  // Magnitude sets the size, the caller's rate sets the direction — a channel
  // shedding subscribers clusters its losses the same way.
  const unit = Math.max(MIN_UNIT, Math.round(Math.abs(perDay) / 5_000))
  const size = unit * (1 + Math.floor(Math.random() * 5))
  return perDay < 0 ? -size : size
}

// Odds of a small wobble on any given tick, independent of a burst. Unlike a
// burst this can go either way — e.g. +6 one second, -3 the next — since
// unsubscribes happen too and a perfectly monotonic counter reads as fake.
// Better than even odds: this is the movement the eye actually catches, and
// at 0.35 a glance at the tile could easily land on two identical seconds.
const WOBBLE_CHANCE = 0.55

function wobbleSize(perDay) {
  const unit = Math.max(MIN_UNIT, Math.round(Math.abs(perDay) / 10_000))
  return unit * (Math.floor(Math.random() * 10) - 3) // -3*unit .. +6*unit
}

// How far the display is allowed to stray from the last real reading. Bursts
// and wobbles are decoration on top of the true number, not a substitute for
// it — without a leash they could random-walk somewhere silly over an hour.
const MAX_DRIFT_STEPS = 3

/**
 * Width of the rounding band a count sits in, mirroring server.py's `step`.
 *
 * One function rather than the expression written out at each use: it was
 * inlined in three places, and the copy in the reset effect being applied to
 * only half of what it should have was how a previous channel's band survived
 * into the next audit.
 */
function bandFor(count) {
  return count >= 1000 ? 10 ** (String(count).length - 3) : 1
}

export function useLiveSubscribers(channelId, initial, enabled = false) {
  const [value, setValue] = useState(initial)
  const [step, setStep] = useState(() => bandFor(initial))
  const [changed, setChanged] = useState(false)
  // Which way the last visible move went, so the tile can roll the digits in
  // the matching direction. Only ever set when the *rendered* integer changes
  // — the sub-integer climb between ticks has no direction worth animating.
  const [direction, setDirection] = useState(null)
  // Only "is there a rate to animate with". Whether that makes the *reading* an
  // estimate is derived at the bottom of this hook rather than stored, and the
  // difference matters: this flag is only ever reassigned inside poll(), which
  // runs once a minute, so a stored answer stays wrong for up to POLL_MS after
  // anything changes underneath it. `step` is known synchronously from
  // `initial`, so deriving keeps the caption right from the very first render.
  const [hasRate, setHasRate] = useState(false)
  // Which kind of rate the server could justify: 'measured' from this
  // channel's own recorded crossings, 'bounded' from how long the figure has
  // sat still, or 'lifetime' from the total-over-age average. The tile uses it
  // to say how much the movement is worth.
  const [basis, setBasis] = useState('lifetime')

  // The anchor the tick extrapolates from: a display value plus the moment
  // it was set as such. The value only ever jumps on a genuine reported
  // change (or a burst) — a routine re-poll of the same rounded figure just
  // refreshes the rate and the clock.
  const base = useRef({ value: initial, time: Date.now(), ratePerMs: 0 })
  // What the last real API reading was, so a poll can tell a genuine change
  // from the ticker simply having walked past it.
  const lastReal = useRef(initial)
  // Whether the display has been seeded off the rounding band yet. Without
  // this, a first poll that happens to match the audited `initial` value
  // looks like "no change" and the tile never leaves the flat number.
  const seeded = useRef(false)
  // Mirrors `step` for the tick loop, which runs outside React state.
  const stepRef = useRef(step)
  // The integer currently on screen. base.current.value carries a fraction, so
  // it can't answer "did the display actually change" on its own.
  const shown = useRef(initial)

  // A new audit swaps the channel underneath us. Reset rather than carry the
  // previous channel's figure forward.
  useEffect(() => {
    base.current = { value: initial, time: Date.now(), ratePerMs: 0 }
    lastReal.current = initial
    seeded.current = false
    // Both the ref and the state. The ref alone was the bug: the tick loop got
    // the new channel's band while everything that renders kept the previous
    // channel's, so auditing a 253-subscriber channel after a 4.9M one left the
    // tile claiming a rough estimate to the nearest 10 000. Nothing corrected it
    // until the first poll of the new channel landed, up to POLL_MS later, and
    // only if the tile had been switched to live at all.
    const band = bandFor(initial)
    stepRef.current = band
    setStep(band)
    shown.current = initial
    setValue(initial)
    setDirection(null)
    setChanged(false)
    setHasRate(false)
    setBasis('lifetime')
  }, [channelId, initial])

  useEffect(() => {
    // Nothing runs until asked. An unwatched tile has no reason to poll or
    // animate.
    if (!channelId || !enabled) return

    let cancelled = false
    let flashTimer
    let lastPollAt = 0

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const tick = () => {
      const now = Date.now()
      const { value: v, time, ratePerMs } = base.current
      // A channel that isn't moving doesn't move at all — no steady climb, and
      // no decorative jitter on top of it either. A negative rate is allowed
      // through: a channel genuinely losing subscribers should tick down.
      if (!ratePerMs) return

      // An exact count is not animated, at all.
      //
      // Everything below this line invents digits: the steady climb, the burst,
      // the wobble. That is honest above ~1,000 subscribers, where YouTube only
      // publishes three significant figures and the true number is genuinely
      // somewhere inside a band we are picking a plausible point in. Below that
      // the API reports the real figure, so there is no band and nothing to
      // fill in — a tile reading 253 that ticks to 254 is not estimating, it is
      // just wrong. The leash (step × 3) doesn't save it either: at step 1 that
      // still licenses ±3 of fabricated movement around a number we were told
      // exactly.
      //
      // The count still updates — poll() sets it whenever the API reports a
      // genuine change. It just stops moving between readings.
      if (stepRef.current === 1) return

      const perDay = ratePerMs * 86_400_000
      let next = v + ratePerMs * (now - time)
      if (Math.random() < BURST_CHANCE) next += burstSize(perDay)
      if (Math.random() < WOBBLE_CHANCE) next += wobbleSize(perDay)

      // Keep the decoration tethered to the true reading rather than letting
      // it random-walk away over time.
      const leash = stepRef.current * MAX_DRIFT_STEPS
      next = Math.min(Math.max(next, lastReal.current - leash), lastReal.current + leash)

      base.current = { value: next, time: now, ratePerMs }

      // Re-render only when the rendered integer moves. Most ticks advance the
      // count by a fraction, and repainting the tile to show the same digits
      // would cost a render and replay the roll animation on a number that
      // never changed.
      const rounded = Math.round(next)
      if (rounded !== shown.current) {
        setDirection(rounded > shown.current ? 'up' : 'down')
        shown.current = rounded
        setValue(rounded)
      }
    }

    const poll = async () => {
      lastPollAt = Date.now()
      try {
        // no-store because this is the one request in the app whose whole
        // purpose is to be newer than last time. The endpoint sends no
        // Cache-Control, which leaves the browser free to satisfy a repeat GET
        // from its own cache — a live counter served a cached reading is just
        // a slow static number.
        const res = await fetch(`/api/subs/${channelId}`, { cache: 'no-store' })
        if (!res.ok || cancelled) return
        const data = await res.json()

        setStep(data.step)
        stepRef.current = data.step
        const ratePerMs = data.per_day / 86_400_000
        setHasRate(ratePerMs !== 0)
        setBasis(data.basis ?? 'lifetime')

        const bandChanged = data.subscribers !== lastReal.current
        if (bandChanged || !seeded.current) {
          // The rounded figure genuinely moved (or this is the first
          // reading): seed a plausible-looking point inside the band
          // instead of the flat number YouTube sent.
          lastReal.current = data.subscribers
          seeded.current = true
          // A channel with no measurable movement keeps YouTube's flat
          // figure: inventing trailing digits for a number that isn't going
          // anywhere would be decoration with nothing underneath it.
          const start =
            reduced || !ratePerMs
              ? data.subscribers
              : data.subscribers + Math.floor(Math.random() * data.step)
          base.current = { value: start, time: Date.now(), ratePerMs }
          const rounded = Math.round(start)
          if (rounded !== shown.current) {
            setDirection(rounded > shown.current ? 'up' : 'down')
            shown.current = rounded
            setValue(rounded)
          }
          if (bandChanged) {
            setChanged(true)
            clearTimeout(flashTimer)
            flashTimer = setTimeout(() => setChanged(false), FLASH_MS)
          }
        } else {
          // Same rounded figure as last time — keep whatever the display is
          // currently showing and just refresh the rate/clock, so the
          // number keeps climbing forward instead of snapping back to it.
          base.current = { value: base.current.value, time: Date.now(), ratePerMs }
        }
      } catch {
        // Offline or rate-limited. Keep showing the last estimate rather
        // than blanking the tile — a stale figure beats no number.
      }
    }

    // A self-rescheduling timeout rather than setInterval: the cadence depends
    // on the band, which isn't known until the first response has landed, and
    // an interval's period is fixed at the moment it's created.
    let pollTimer
    const schedule = () => {
      if (cancelled) return
      pollTimer = setTimeout(async () => {
        await poll()
        schedule()
      }, stepRef.current === 1 ? EXACT_POLL_MS : POLL_MS)
    }
    poll().then(schedule)

    /*
     * Poll on the way back into the tab, and reset the schedule from there.
     *
     * This note used to say visibilitychange was deliberately unhandled,
     * because the display drifted forward on its own and there was nothing to
     * catch up on. That stopped being true once an exact count was pinned to
     * real readings: it now changes *only* when a poll lands, and the thing a
     * reader does between subscribing and looking at this tile is switch tabs.
     * So the moment they come back is exactly the moment the number is most
     * likely to be stale and most likely to be looked at.
     *
     * It also recovers the time a hidden tab loses. Browsers clamp timers in a
     * background tab to roughly once a minute, so a tab left in the background
     * has been polling at the slow rate regardless of what was scheduled.
     *
     * Cheaper than a faster interval, too: this costs one call per return to
     * the tab rather than three times the calls forever.
     */
    const refresh = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastPollAt < MIN_POLL_GAP_MS) return
      clearTimeout(pollTimer)
      poll().then(schedule)
    }

    // Both events, because neither covers the case on its own.
    // visibilitychange fires when the tab is switched away from, but a page in
    // a *background window* — the other half of a split screen, or another
    // browser window entirely — stays visibilityState "visible" and never
    // fires it. That is the exact shape of "subscribe in the other window,
    // look back at this one", so focus has to be listened for as well.
    // MIN_POLL_GAP_MS keeps the pair from double-polling when both fire.
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)

    const tickTimer = reduced ? null : setInterval(tick, TICK_MS)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
      clearTimeout(pollTimer)
      clearTimeout(flashTimer)
      if (tickTimer) clearInterval(tickTimer)
    }
  }, [channelId, enabled])

  // Derived, not stored — see hasRate above.
  //
  // `step > 1` is the test for "the anchor itself is rounded", not a proxy for
  // channel size: the server sends step 1 for anything under ~1,000, where
  // YouTube reports the exact figure rather than three significant figures.
  // There is no rounding band to sit inside at that size, nothing is seeded
  // into one, and calling the reading a rough estimate would claim an
  // uncertainty the number doesn't have. Keying off the band rather than a
  // literal 1000 keeps that threshold defined in one place (server.py).
  const estimated = hasRate && step > 1

  return { value, step, changed, estimated, basis, direction }
}
