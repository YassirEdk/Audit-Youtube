import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_LOCALE, localePrefix, splitLocalePath } from './i18n/locales.js'

/**
 * Path-and-query routing in ~60 lines, instead of a router dependency.
 *
 * Two things are encoded in the URL and nothing else is: the language, in the
 * path prefix, and which channel is being audited, in `?channel=`. React Router
 * would be a lot of machinery for that.
 *
 * Putting the channel in the URL rather than in state buys three things:
 * refreshing keeps your results, the back button works, and an audit is a link
 * you can send to someone. Putting the language there buys the same three, plus
 * the only thing that makes translated pages worth having — a distinct URL per
 * language for a crawler to index.
 */

/**
 * The canonical path for the app, per locale.
 *
 * English is the bare /Home. It was indexed there before the site had any other
 * language, and moving an indexed URL throws away whatever it earned — so the
 * prefix goes on the *new* locales instead: /fr/Home, /ar/Home.
 *
 * Serving any of these depends on the host falling back to index.html for
 * unknown paths: Vite's dev server does by default, and vercel.json has the
 * matching rewrite. Without one of those, a hard refresh on /fr/Home is a 404.
 */
export const HOME = '/Home'

export const homePath = (locale) => `${localePrefix(locale)}${HOME}`

export function useRoute() {
  const [search, setSearch] = useState(() => window.location.search)
  const [locale, setLocale] = useState(
    () => splitLocalePath(window.location.pathname).locale,
  )

  // Anything that isn't a canonical path — most often a bare "/" or "/fr" — is
  // rewritten to one on arrival, so each language's home has exactly one URL
  // rather than two that happen to render the same thing.
  //
  // The locale is read from the path and preserved, never guessed: a visitor
  // who lands on /fr/ gets /fr/Home, not /Home. Browser language is deliberately
  // not consulted here — see the note at the top of i18n/index.jsx for why
  // auto-redirecting on Accept-Language is how a multilingual site gets itself
  // de-indexed.
  //
  // replaceState, not pushState: normalising the address bar shouldn't leave a
  // history entry that Back returns to, only to be normalised again.
  useEffect(() => {
    const { pathname, search: qs, hash } = window.location
    const { locale: found, rest } = splitLocalePath(pathname)
    const canonical = homePath(found)
    if (rest === HOME && pathname === canonical) return
    // The hash is carried over deliberately. An OAuth redirect can land here
    // with tokens still in the fragment, and dropping them would break the
    // sign-in with no error to show for it.
    window.history.replaceState({}, '', `${canonical}${qs}${hash}`)
  }, [])

  useEffect(() => {
    // Fires on browser back/forward. Without this the URL would change while
    // the view stayed put — and now that the language is in the path, going
    // back out of /fr/Home has to change the language too.
    const onPop = () => {
      setSearch(window.location.search)
      setLocale(splitLocalePath(window.location.pathname).locale)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // resetScroll is off when the caller is about to scroll somewhere specific —
  // otherwise the view jumps to the top and then animates back down.
  const navigate = useCallback(
    (params, { resetScroll = true } = {}) => {
      const qs = params ? `?${new URLSearchParams(params)}` : ''
      window.history.pushState({}, '', `${homePath(locale)}${qs}`)
      setSearch(qs)
      if (resetScroll) window.scrollTo({ top: 0 })
    },
    [locale],
  )

  /**
   * Switches language, keeping the current audit.
   *
   * pushState rather than replaceState: choosing a language is a navigation the
   * visitor made, and Back should undo it. The query survives, so switching
   * language on a results page re-renders the same channel's audit in the new
   * language rather than dumping you back on the landing page.
   */
  const changeLocale = useCallback(
    (next) => {
      if (next === locale) return
      const qs = window.location.search
      window.history.pushState({}, '', `${homePath(next)}${qs}`)
      setLocale(next)
    },
    [locale],
  )

  const params = new URLSearchParams(search)
  return {
    channel: params.get('channel') || '',
    locale,
    navigate,
    changeLocale,
    isDefaultLocale: locale === DEFAULT_LOCALE,
  }
}
