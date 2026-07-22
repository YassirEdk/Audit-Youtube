/**
 * Build-time entry that renders the landing page to static HTML.
 *
 * The app is client-rendered, which means a crawler that doesn't execute
 * JavaScript sees an empty <div id="root"> and indexes nothing. Google does
 * run JS, but it queues those pages separately and gets to them slower; most
 * other crawlers — including the ones behind link previews and AI search —
 * don't run it at all. Shipping the marketing copy as real HTML costs one
 * build step and removes the dependency entirely.
 *
 * Only the landing page is prerendered. The results view is per-channel and
 * needs live API data, so there's nothing static to emit for it.
 */

import { renderToString } from 'react-dom/server'
import { Landing } from './src/Landing.jsx'
import { I18nProvider } from './src/i18n/index.jsx'
import { DEFAULT_LOCALE } from './src/i18n/locales.js'
import { AuthContext } from './src/useAuth.js'

// Landing reads auth state through useAuth, which throws without a provider.
// A signed-out stub is the right shape here: it's what an anonymous crawler
// would see anyway, and it keeps the gated copy out of the static HTML.
const anonymous = {
  session: null,
  user: null,
  loading: false,
  isConfigured: false,
  requestAuth: () => {},
  signUp: async () => ({}),
  signIn: async () => ({}),
  signInWithGoogle: async () => ({}),
  signOut: async () => ({}),
}

/**
 * Renders the landing page for one locale.
 *
 * Defaults to English because that is what dist/index.html holds — the
 * unprefixed /Home. The parameter is what lets prerender.mjs emit a static
 * document per language: a crawler arriving at /fr/Home has to find French in
 * the HTML, not an English page that turns French once React boots.
 */
export function render(locale = DEFAULT_LOCALE) {
  return renderToString(
    <I18nProvider locale={locale}>
      <AuthContext.Provider value={anonymous}>
        <Landing onStart={() => {}} />
      </AuthContext.Provider>
    </I18nProvider>,
  )
}
