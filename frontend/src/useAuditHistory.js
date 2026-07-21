import { useCallback, useEffect, useState } from 'react'

/**
 * The channels this browser has audited, most recent first.
 *
 * Deliberately localStorage rather than the saved_audits table: history is
 * most useful to someone who hasn't signed up yet, since it's what makes the
 * second and third audit cheap to reach. Tying it to an account would hide it
 * from exactly the people it's meant to bring back.
 *
 * When saved audits get a write path, this becomes the signed-out half of the
 * same list rather than something to replace.
 */

/**
 * What makes two entries the same channel.
 *
 * The channel id, not what the user typed. '@name', a full youtube.com URL and
 * a UC... id all resolve to one channel, so keying on the input string listed
 * the same channel once per spelling. Older entries were saved before the API
 * returned an id, hence the fallback.
 */
function keyOf(entry) {
  return entry?.id || entry?.handle
}

/** Collapses entries that resolve to the same channel, keeping the newest. */
function dedupe(items) {
  const seen = new Set()
  return items.filter((e) => {
    const k = keyOf(e)
    if (!k || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const KEY = 'yt-audit:recent'

// Enough to cover a session's worth of comparing channels; past that the list
// stops being a shortcut and becomes something you have to read.
const MAX = 12

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY))
    // Deduped on the way out as well as in, so lists saved before ids existed
    // collapse on first read rather than staying doubled forever.
    return Array.isArray(parsed) ? dedupe(parsed) : []
  } catch {
    // Private-mode denials and hand-edited junk both land here. History is a
    // convenience, so losing it must never take the page down with it.
    return []
  }
}

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // Quota or a blocked store. Nothing to do — the in-memory list still works
    // for this session.
  }
}

// Every mounted copy of the hook shares one subscriber set, so recording an
// audit updates the sidebar even though the two live in different branches of
// the tree. A storage event would only cover *other* tabs, not this one.
const listeners = new Set()

export function useAuditHistory() {
  const [items, setItems] = useState(read)

  useEffect(() => {
    listeners.add(setItems)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  const record = useCallback((entry) => {
    if (!entry?.handle) return
    // Re-auditing a channel moves it to the top rather than adding a second
    // row — the list is "channels you've looked at", not a log of every run.
    const key = keyOf(entry)
    const next = [entry, ...read().filter((e) => keyOf(e) !== key)].slice(0, MAX)
    write(next)
    listeners.forEach((fn) => fn(next))
  }, [])

  // Takes the whole entry rather than a key, so the caller doesn't have to
  // know which of id/handle identifies a given row.
  const remove = useCallback((entry) => {
    const key = keyOf(entry)
    if (!key) return
    const next = read().filter((e) => keyOf(e) !== key)
    write(next)
    listeners.forEach((fn) => fn(next))
  }, [])

  const clear = useCallback(() => {
    write([])
    listeners.forEach((fn) => fn([]))
  }, [])

  return { items, record, remove, clear }
}
