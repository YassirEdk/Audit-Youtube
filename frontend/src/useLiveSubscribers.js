import { useEffect, useRef, useState } from 'react'

/**
 * A livecounts.io-style ticker: the subscriber count climbs continuously
 * instead of sitting still until the API's rounded figure changes.
 *
 * YouTube only reports subscriberCount to three significant figures, so a
 * poll returns 508,000,000 — never 508,135,001. The trailing digits shown
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
 * guess, not a fact.
 */

// The published value changes far more slowly than this, but polling has to
// feel responsive to justify the word "live". One unit per call against a
// 10,000/day quota — a tab left open all day costs ~1,440, comfortably clear
// of the ceiling even alongside a few audits.
const POLL_MS = 60_000

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

export function useLiveSubscribers(channelId, initial, enabled = false) {
  const [value, setValue] = useState(initial)
  const [step, setStep] = useState(initial >= 1000 ? 10 ** (String(initial).length - 3) : 1)
  const [changed, setChanged] = useState(false)
  // Which way the last visible move went, so the tile can roll the digits in
  // the matching direction. Only ever set when the *rendered* integer changes
  // — the sub-integer climb between ticks has no direction worth animating.
  const [direction, setDirection] = useState(null)
  const [estimated, setEstimated] = useState(false)
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
    stepRef.current = initial >= 1000 ? 10 ** (String(initial).length - 3) : 1
    shown.current = initial
    setValue(initial)
    setDirection(null)
    setChanged(false)
    setEstimated(false)
    setBasis('lifetime')
  }, [channelId, initial])

  useEffect(() => {
    // Nothing runs until asked. An unwatched tile has no reason to poll or
    // animate.
    if (!channelId || !enabled) return

    let cancelled = false
    let flashTimer

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const tick = () => {
      const now = Date.now()
      const { value: v, time, ratePerMs } = base.current
      // A channel that isn't moving doesn't move at all — no steady climb, and
      // no decorative jitter on top of it either. A negative rate is allowed
      // through: a channel genuinely losing subscribers should tick down.
      if (!ratePerMs) return

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
      try {
        const res = await fetch(`/api/subs/${channelId}`)
        if (!res.ok || cancelled) return
        const data = await res.json()

        setStep(data.step)
        stepRef.current = data.step
        const ratePerMs = data.per_day / 86_400_000
        setEstimated(ratePerMs !== 0)
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

    poll()
    const pollTimer = setInterval(poll, POLL_MS)
    // Deliberately no visibilitychange handling: the tick keeps running via
    // setInterval whether or not the tab is focused, and the poll timer does
    // too (browsers throttle background intervals but don't stop them), so
    // there is nothing to catch up on when the reader comes back.
    const tickTimer = reduced ? null : setInterval(tick, TICK_MS)

    return () => {
      cancelled = true
      clearInterval(pollTimer)
      clearTimeout(flashTimer)
      if (tickTimer) clearInterval(tickTimer)
    }
  }, [channelId, enabled])

  return { value, step, changed, estimated, basis, direction }
}
