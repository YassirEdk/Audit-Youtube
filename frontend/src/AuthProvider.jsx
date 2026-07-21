import { useEffect, useMemo, useState } from 'react'
import { AuthModal } from './AuthModal.jsx'
import { isConfigured, supabase } from './supabase.js'
import { AuthContext } from './useAuth.js'
import { HOME } from './useRoute.js'

/**
 * Clears the fragment the OAuth redirect leaves in the address bar.
 *
 * Google sends the user back with the tokens in the hash. supabase-js reads
 * them and blanks it out, but a bare `#` stays behind and rides along in any
 * link the user copies afterwards.
 *
 * Only auth residue is removed, never a real anchor — and replaceState rather
 * than pushState, so Back doesn't return to a URL whose tokens are spent.
 */
function stripAuthHash() {
  const { href, hash, pathname, search } = window.location
  // A bare trailing '#' reads as an EMPTY location.hash rather than '#', so the
  // hash alone cannot detect the very case this exists for — the full href is
  // what gives it away.
  const isResidue =
    href.endsWith('#') || /(access_token|provider_token|error_description)=/.test(hash)
  if (isResidue) window.history.replaceState({}, '', pathname + search)
}

/**
 * Where an OAuth or email-confirmation round-trip should land.
 *
 * The page you were on, not home: signing in from a report has to come back to
 * that report, or the audit you were reading is gone and you have to search for
 * it again — which is exactly the moment someone gives up.
 *
 * The query string carries the channel (see useRoute), so it has to survive.
 * The hash deliberately doesn't: it's where the provider puts its tokens, and
 * sending our own fragment along would collide with them.
 */
function returnTo() {
  const { origin, pathname, search } = window.location
  return `${origin}${pathname === '/' ? HOME : pathname}${search}`
}

/**
 * Session state for the whole app, in one place.
 *
 * Supabase persists the session to localStorage and refreshes the token on its
 * own, so the only job here is to mirror that into React and to expose the
 * handful of actions the UI needs.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  // Distinguishes "signed out" from "we haven't looked yet". Without it the
  // header would flash Log in / Sign up for a frame on every reload, even for
  // someone who is signed in.
  const [loading, setLoading] = useState(isConfigured)

  // The dialog lives here rather than in App so that anything gated — a locked
  // chart, a disabled report button, three levels down — can ask for it without
  // a callback being threaded through every component in between.
  const [authMode, setAuthMode] = useState(null)

  useEffect(() => {
    if (!isConfigured) return

    let active = true

    // getSession resolves only after any tokens in the URL have been consumed,
    // so cleaning up here can't race the client into losing them.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
      stripAuthHash()
    })

    // Fires on sign in, sign out, token refresh, and — importantly — when the
    // OAuth redirect lands back on the page with a session in the URL.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
      stripAuthHash()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isConfigured,

      // requestAuth('login' | 'signup') opens the dialog from anywhere.
      requestAuth: setAuthMode,

      signUp: (email, password) =>
        supabase.auth.signUp({
          email,
          password,
          // Where the confirmation email sends them back to. Must also be listed
          // under Authentication → URL Configuration in the Supabase dashboard,
          // or the link silently falls back to the project's site URL.
          options: { emailRedirectTo: returnTo() },
        }),

      signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),

      signInWithGoogle: () =>
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: returnTo() },
        }),

      signOut: async () => {
        const result = await supabase.auth.signOut()
        // A full navigation rather than a pushState, for two reasons: useRoute
        // only listens for popstate, so a pushState here would change the URL
        // without changing the view; and a real load drops every bit of
        // in-memory state, so nothing from the signed-in session lingers in a
        // component. Done even if signOut errored — the local session is
        // cleared either way, and the user asked to leave.
        window.location.assign(HOME)
        return result
      },
    }),
    [session, loading],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />}
    </AuthContext.Provider>
  )
}
