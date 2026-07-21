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

export function render() {
  return renderToString(
    <AuthContext.Provider value={anonymous}>
      <Landing onStart={() => {}} />
    </AuthContext.Provider>,
  )
}
