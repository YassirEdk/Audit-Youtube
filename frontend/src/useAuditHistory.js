import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import { useAuth } from './useAuth.js'

/**
 * The channels this visitor has audited, most recent first.
 *
 * Two stores behind one list:
 *
 *  - Signed out, it's localStorage. History is most useful to someone who
 *    hasn't signed up yet, since it's what makes the second and third audit
 *    cheap to reach; requiring an account to have any would hide it from
 *    exactly the people it's meant to bring back.
 *  - Signed in, it's the audit_history table, which is what makes the
 *    sidebar's "on any device" true rather than aspirational.
 *
 * Signing in carries whatever the browser collected up to the account and then
 * clears the local copy, so the list someone sees after signing in is the one
 * they already had — not an empty page, and not a duplicate of it.
 *
 * Distinct from useSavedAudits: that's the audits a user *chose* to keep, blob
 * and all. This is just what happened, cheap enough to write on every run.
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

// ------------------------------------------------------------------ remote --

/** A table row, in the shape the sidebar already renders. */
function fromRow(row) {
  return {
    id: row.channel_id,
    handle: row.channel_handle,
    title: row.channel_title,
    thumbnail: row.thumbnail,
    score: row.score,
    grade: row.grade,
    at: Date.parse(row.audited_at),
  }
}

function toRow(userId, entry) {
  return {
    // Set explicitly because the RLS insert policy checks it against
    // auth.uid(); there's no server default filling it in.
    user_id: userId,
    channel_id: keyOf(entry),
    channel_handle: entry.handle,
    channel_title: entry.title,
    thumbnail: entry.thumbnail,
    score: entry.score,
    grade: entry.grade,
    audited_at: new Date(entry.at || Date.now()).toISOString(),
  }
}

/** This account's history, or null if it couldn't be read. */
async function pull() {
  const { data, error } = await supabase
    .from('audit_history')
    .select('channel_id, channel_handle, channel_title, thumbnail, score, grade, audited_at')
    .order('audited_at', { ascending: false })
    .limit(MAX)

  if (error) {
    // A failed read is not an empty one — null lets the caller keep showing
    // what's already on screen instead of blanking the rail.
    console.warn('Could not load audit history:', error.message)
    return null
  }
  return (data ?? []).map(fromRow)
}

/** True if the rows reached the account. */
async function push(userId, entries) {
  const rows = entries.filter((e) => keyOf(e) && e.handle).map((e) => toRow(userId, e))
  if (!rows.length) return true
  const { error } = await supabase
    .from('audit_history')
    .upsert(rows, { onConflict: 'user_id,channel_id' })
  if (error) console.warn('Could not record audit history:', error.message)
  return !error
}

// ------------------------------------------------------------------- hook ---

// Every mounted copy of the hook shares one subscriber set and one list, so
// recording an audit updates the sidebar even though the two live in different
// branches of the tree. A storage event would only cover *other* tabs, not this
// one — and once the list can come from the server, localStorage stops being
// the thing worth listening to anyway.
const listeners = new Set()
let current = read()

function broadcast(items) {
  current = items
  listeners.forEach((fn) => fn(items))
}

export function useAuditHistory() {
  const { user } = useAuth()
  const [items, setItems] = useState(current)

  useEffect(() => {
    listeners.add(setItems)
    // A copy mounting after the list has moved on would otherwise keep
    // rendering the snapshot it was initialised with.
    setItems(current)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  // Keyed on the id rather than the user object: supabase-js hands back a new
  // object on every token refresh, and this effect must not re-run for that.
  const userId = user?.id ?? null

  useEffect(() => {
    if (!userId) {
      // Signing out drops back to whatever this browser holds — which, after a
      // sign-in migrated it, is nothing. The account's copy isn't a signed-out
      // visitor's to see.
      broadcast(read())
      return
    }

    let cancelled = false
    ;(async () => {
      // Carried up before the read, so the first signed-in list already
      // includes the audits run before signing in.
      const local = read()
      // Cleared only once the account has the rows. Dropping it on a failed
      // push would lose the list to a dropped connection — the one case where
      // the local copy is the only copy.
      if (local.length && (await push(userId, local))) write([])

      const remote = await pull()
      if (!cancelled && remote) broadcast(remote)
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  const record = useCallback(
    (entry) => {
      if (!entry?.handle) return
      // Re-auditing a channel moves it to the top rather than adding a second
      // row — the list is "channels you've looked at", not a log of every run.
      const key = keyOf(entry)
      const next = [entry, ...current.filter((e) => keyOf(e) !== key)].slice(0, MAX)
      broadcast(next)

      // Shown first, stored after: the rail shouldn't wait on a round trip to
      // reflect an audit that's already on screen.
      if (userId) push(userId, [entry])
      else write(next)
    },
    [userId],
  )

  // Takes the whole entry rather than a key, so the caller doesn't have to
  // know which of id/handle identifies a given row.
  const remove = useCallback(
    (entry) => {
      const key = keyOf(entry)
      if (!key) return
      const next = current.filter((e) => keyOf(e) !== key)
      broadcast(next)

      if (userId) {
        // The RLS delete policy already scopes this to the caller; matching on
        // user_id as well keeps the intent readable in the query itself.
        supabase.from('audit_history').delete().eq('user_id', userId).eq('channel_id', key)
      } else {
        write(next)
      }
    },
    [userId],
  )

  const clear = useCallback(() => {
    broadcast([])
    if (userId) supabase.from('audit_history').delete().eq('user_id', userId)
    else write([])
  }, [userId])

  return { items, record, remove, clear }
}
