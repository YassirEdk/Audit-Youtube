import { useCallback, useEffect, useState } from 'react'

/**
 * Query-string routing in ~25 lines, instead of a router dependency.
 *
 * The whole app is two views — landing and results — and which one shows is
 * decided by a single `channel` parameter. React Router would be a lot of
 * machinery for one boolean.
 *
 * `channel` is the only thing in the query string. Analysis depth used to live
 * here too, but it isn't part of what a link points at — see depth.js.
 *
 * Putting the channel in the URL rather than in state buys three things:
 * refreshing keeps your results, the back button works, and an audit is a
 * link you can send to someone.
 */

/**
 * The canonical path for the app. Every URL it writes is this plus a query.
 *
 * Serving it depends on the host falling back to index.html for unknown paths:
 * Vite's dev server does by default, and vercel.json has the matching rewrite.
 * Without one of those, a hard refresh on /Home is a 404.
 */
export const HOME = '/Home'

export function useRoute() {
  const [search, setSearch] = useState(() => window.location.search)

  // Anything that isn't the canonical path — most often a bare "/" — is
  // rewritten to it on arrival, so home has exactly one URL rather than two
  // that happen to render the same thing.
  //
  // replaceState, not pushState: normalising the address bar shouldn't leave a
  // history entry that Back returns to, only to be normalised again.
  useEffect(() => {
    const { pathname, search: qs, hash } = window.location
    if (pathname === HOME) return
    // The hash is carried over deliberately. An OAuth redirect can land here
    // with tokens still in the fragment, and dropping them would break the
    // sign-in with no error to show for it.
    window.history.replaceState({}, '', `${HOME}${qs}${hash}`)
  }, [])

  useEffect(() => {
    // Fires on browser back/forward. Without this the URL would change while
    // the view stayed put.
    const onPop = () => setSearch(window.location.search)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // resetScroll is off when the caller is about to scroll somewhere specific —
  // otherwise the view jumps to the top and then animates back down.
  const navigate = useCallback((params, { resetScroll = true } = {}) => {
    const qs = params ? `?${new URLSearchParams(params)}` : ''
    window.history.pushState({}, '', `${HOME}${qs}`)
    setSearch(qs)
    if (resetScroll) window.scrollTo({ top: 0 })
  }, [])

  const params = new URLSearchParams(search)
  return {
    channel: params.get('channel') || '',
    navigate,
  }
}
