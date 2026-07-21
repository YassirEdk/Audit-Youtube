import { useEffect, useState } from 'react'

/**
 * Tracks which section is currently under the masthead and returns its id, so
 * the nav can highlight where you actually are rather than only where you last
 * clicked.
 *
 * Deliberately a scroll listener rather than IntersectionObserver: the question
 * isn't "is this section visible" (several always are) but "which section owns
 * the top of the viewport", and that's a one-line answer from getBoundingClientRect.
 *
 * Returns null while you're above the first section — that's the Home item.
 */
export function useScrollSpy(ids, enabled = true) {
  const [active, setActive] = useState(null)

  // Joined so a new array literal on every render doesn't re-subscribe.
  const key = ids.join(',')

  useEffect(() => {
    if (!enabled) {
      setActive(null)
      return
    }

    const headerH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
      10,
    ) || 56
    // A section counts as current once its heading reaches just below the
    // masthead, not when it touches the very top of the viewport.
    const line = headerH + 24

    let frame = null

    function measure() {
      frame = null
      const sections = key.split(',')

      // The last section can be too short to ever reach the line, so at the
      // bottom of the page it wins outright — otherwise scrolling to the end
      // leaves the previous item lit.
      const atBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 2
      if (atBottom) {
        setActive(sections[sections.length - 1])
        return
      }

      let current = null
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
    }

    function onScroll() {
      // Coalesce to one measurement per frame; scroll fires far more often.
      if (frame === null) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [key, enabled])

  return active
}
