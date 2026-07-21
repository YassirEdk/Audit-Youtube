import { useEffect, useRef, useState } from 'react'

/**
 * Channel-name suggestions for the search boxes.
 *
 * Every miss on the server costs 100 YouTube quota units — 1% of the day, and
 * 25x what a whole audit costs — so this hook's real job is not fetching but
 * *not* fetching. Four rules, in the order they reject:
 *
 *   1. under MIN_CHARS, never ask
 *   2. an @handle, URL or UC... id resolves for 1 unit on submit, so there is
 *      nothing a 100-unit search could add — don't offer suggestions at all
 *   3. wait for a real pause in typing, not a keystroke
 *   4. remember what this session already asked, so backspacing back to a
 *      previous query is free even of the round trip
 *
 * The server enforces 1 and 2 again and caches across sessions. Both halves
 * are needed: this one stops the request, that one stops the quota spend when
 * a different visitor types the same thing.
 */

// Long enough that the pause is deliberate. Tuned against the cost: at 100
// units a call, a trigger-happy delay is measured in lost audits, not in
// milliseconds.
const DEBOUNCE_MS = 500

// Fewer characters match too many channels for the list to be useful, which
// makes it a pure quota loss.
const MIN_CHARS = 3

/** True when the input already names a channel exactly — the 1-unit path. */
function isExactReference(q) {
  return q.startsWith('@') || q.includes('youtube.com') || /^UC[\w-]{22}$/.test(q)
}

export function useChannelSearch(query) {
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)

  // Session-local memo of what has already been asked. Separate from the
  // server's cache: this one saves the round trip, that one saves the quota.
  const seen = useRef(new Map())

  useEffect(() => {
    const q = query.trim()

    if (q.length < MIN_CHARS || isExactReference(q)) {
      setResults([])
      setBusy(false)
      return
    }

    const key = q.toLowerCase()
    if (seen.current.has(key)) {
      setResults(seen.current.get(key))
      setBusy(false)
      return
    }

    // Shown as soon as the query is one we intend to run, not when the request
    // leaves — otherwise the box sits blank through the whole debounce and
    // reads as broken.
    setBusy(true)

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/channels/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(String(res.status))
        const { channels } = await res.json()
        seen.current.set(key, channels ?? [])
        setResults(channels ?? [])
      } catch (err) {
        // Aborted means a newer keystroke owns the field now; anything else is
        // offline or a bad key. Suggestions are an accelerant, not the way in
        // — the typed text still submits — so a failure shows nothing rather
        // than an error the reader can't act on.
        if (err.name !== 'AbortError') setResults([])
      } finally {
        if (!controller.signal.aborted) setBusy(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return { results, busy }
}
