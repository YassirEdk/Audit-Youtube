import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import { useAuth } from './useAuth.js'

/**
 * Audits kept on the account, rather than in this browser.
 *
 * This is what the sign-up modal has been promising: history that survives a
 * cleared cache and follows you to another device. useAuditHistory stays as
 * the local, signed-out equivalent — the two are shown as separate sections
 * because they genuinely are different things, and collapsing them would make
 * "saved" mean nothing.
 *
 * Written straight from the browser rather than through our API. Row-level
 * security is what decides whose rows these are, and it enforces that against
 * the user's own token — routing it through the Python server would add a hop
 * without adding a check.
 */

// Every mounted copy shares one subscriber set, so saving from the results
// page updates the sidebar without either knowing about the other.
const listeners = new Set()

function broadcast(items) {
  listeners.forEach((fn) => fn(items))
}

export function useSavedAudits() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    listeners.add(setItems)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  const refresh = useCallback(async () => {
    if (!user) {
      broadcast([])
      return
    }
    const { data, error } = await supabase
      .from('saved_audits')
      // Deliberately not selecting `result`: the list only needs the labels,
      // and pulling a full audit blob per row would make opening the sidebar
      // cost more than running the audit did.
      .select('id, channel_id, channel_handle, channel_title, score, grade, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      // A failed list is an empty list. The page keeps working on local
      // history rather than breaking over a feature that's meant to be a
      // convenience.
      console.warn('Could not load saved audits:', error.message)
      return
    }
    broadcast(data ?? [])
  }, [user])

  // Re-runs on sign-in and sign-out, which is what makes the list appear and
  // clear without a reload.
  useEffect(() => {
    refresh()
  }, [refresh])

  const save = useCallback(
    async (audit) => {
      if (!user || !audit?.channelId) return { error: new Error('Not signed in') }
      setBusy(true)
      const { error } = await supabase.from('saved_audits').upsert(
        {
          // Set explicitly because the RLS insert policy checks it against
          // auth.uid(); there's no server default filling it in.
          user_id: user.id,
          channel_id: audit.channelId,
          channel_handle: audit.handle,
          channel_title: audit.title,
          score: audit.score,
          grade: audit.grade,
          videos_analyzed: audit.analyzed,
          result: audit.result,
        },
        { onConflict: 'user_id,channel_id' },
      )
      setBusy(false)
      // Logged as well as returned: a save that fails silently looks like a
      // dead button, which is worse than an error.
      if (error) console.error('Save failed:', error.message, error.details || '')
      else await refresh()
      return { error }
    },
    [user, refresh],
  )

  const remove = useCallback(
    async (channelId) => {
      if (!user || !channelId) return
      setBusy(true)
      // The RLS delete policy already scopes this to the caller; matching on
      // user_id as well keeps the intent readable in the query itself.
      await supabase.from('saved_audits').delete().eq('user_id', user.id).eq('channel_id', channelId)
      setBusy(false)
      await refresh()
    },
    [user, refresh],
  )

  const isSaved = useCallback((channelId) => items.some((i) => i.channel_id === channelId), [items])

  return { items, save, remove, isSaved, busy, refresh }
}
