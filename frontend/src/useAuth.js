import { createContext, useContext } from 'react'

/**
 * The session context and the hook that reads it.
 *
 * Kept apart from the provider because a module that exports both a component
 * and a plain value can't be hot-reloaded — every edit here would remount the
 * tree and drop whatever the page was showing.
 */

export const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/**
 * True when the visitor isn't signed in and the signed-out gate should apply.
 *
 * Two cases deliberately read as unlocked:
 *  - while the session is still restoring, since locking and then unlocking a
 *    frame later makes the page flicker for people who are entitled to it;
 *  - when Supabase isn't configured at all, since there would be no way to
 *    sign in and the gate would lock the app permanently.
 */
export function useLocked() {
  const { user, loading, isConfigured } = useAuth()
  if (loading || !isConfigured) return false
  return !user
}
