import { useEffect, useRef, useState } from 'react'

/**
 * Keep the audited videos' view counts current while the results are on screen.
 *
 * Every digit shown came from the API. Nothing is interpolated, and nothing
 * needs to be: unlike subscriber counts — which YouTube rounds to three
 * significant figures, freezing them for days at a time — view counts are
 * reported exactly and climb continuously. A recent upload will visibly gain
 * views between two polls a minute apart, so the animation is showing real
 * movement rather than dressing up a static number.
 *
 * Returns a map of video id to the value to display, and a map of the last
 * real gain per video so the UI can flag which rows just moved.
 */

// Measured, not guessed. YouTube serves viewCount from a cache that flushes
// roughly every two to three minutes per video, and a flush arrives as a jump
// of several thousand views rather than a trickle. Polling faster than the
// flush just re-fetches identical numbers; polling much slower would collapse
// several jumps into one and lose the sense of movement.
const POLL_MS = 90_000

// Match the easing of useCountUp() in Score.jsx so every animated number on
// the page moves with the same physics.
const TWEEN_MS = 900

export function useLiveViews(videos, enabled = false) {
  // Seed from the audit so the rows render real numbers before the first poll
  // lands, rather than flashing zeros.
  const seed = () => Object.fromEntries(videos.map((v) => [v.id, v.views]))

  const [values, setValues] = useState(seed)
  const [gains, setGains] = useState({})

  // The last real reading per video. The tween writes to `values` many times a
  // second, so it can't double as what we compare incoming readings against.
  const actual = useRef(seed())

  // Ids as a primitive, so the polling effect re-runs when the audited set
  // genuinely changes rather than on every re-render of the parent.
  const key = videos.map((v) => v.id).join(',')

  // A new audit swaps the video set underneath us. Re-seed rather than tween
  // from the previous channel's numbers.
  useEffect(() => {
    const fresh = seed()
    actual.current = fresh
    setValues(fresh)
    setGains({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    // Nothing is fetched until the reader asks for it. The counts from the
    // audit are already on screen and correct; polling only earns its quota
    // once someone is actually watching for movement.
    if (!key || !enabled) return

    let frame
    let cancelled = false

    // Animate every changed row across one real interval. Both endpoints are
    // measured; the easing only controls how the display travels between them.
    const tweenTo = (raw) => {
      const from = actual.current

      // Only ever forwards. viewCount comes off a distributed cache whose
      // replicas run seconds apart, so consecutive polls can disagree by a
      // handful in either direction; YouTube also purges views it later judges
      // invalid. Both are real readings, but neither is the thing this column
      // reports — "views went down 7" describes cache skew, not the video. A
      // backwards reading is held at the previous high rather than shown, and
      // the next genuine climb past it lands normally. No threshold: any rule
      // for which decreases are "big enough to believe" would be invented.
      const next = Object.fromEntries(
        Object.entries(raw).filter(([id, n]) => n > (from[id] ?? -Infinity)),
      )

      const moved = Object.keys(next)
      // Clear the gain badges when a poll finds nothing moved, so a "+145"
      // from five minutes ago stops implying the video is still climbing.
      if (!moved.length) {
        setGains((prev) => (Object.keys(prev).length ? {} : prev))
        return
      }

      setGains(Object.fromEntries(moved.map((id) => [id, next[id] - (from[id] ?? next[id])])))

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        actual.current = { ...from, ...next }
        setValues((prev) => ({ ...prev, ...next }))
        return
      }

      const start = performance.now()
      const tick = (now) => {
        const t = Math.min((now - start) / TWEEN_MS, 1)
        const eased = 1 - (1 - t) ** 3
        setValues((prev) => {
          const out = { ...prev }
          for (const id of moved) {
            const a = from[id] ?? next[id]
            out[id] = Math.round(a + (next[id] - a) * eased)
          }
          return out
        })
        if (t < 1) frame = requestAnimationFrame(tick)
        else actual.current = { ...from, ...next }
      }
      frame = requestAnimationFrame(tick)
    }

    const poll = async () => {
      // A backgrounded tab still runs timers. Skip the call rather than spend
      // quota redrawing numbers nobody is looking at.
      if (document.hidden) return
      try {
        const res = await fetch(`/api/live?ids=${encodeURIComponent(key)}`)
        if (!res.ok || cancelled) return
        const { views } = await res.json()
        tweenTo(views)
      } catch {
        // Offline or rate-limited. The last known counts stay on screen — a
        // stale real number beats an error where a stat used to be.
      }
    }

    // Fetch once on enable so switching it on has an immediate effect rather
    // than two minutes of apparent nothing.
    poll()
    const timer = setInterval(poll, POLL_MS)
    // Catch up immediately when the reader comes back to the tab, so the first
    // thing they see is current rather than half a minute old.
    document.addEventListener('visibilitychange', poll)

    return () => {
      cancelled = true
      clearInterval(timer)
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', poll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  return { values, gains }
}
