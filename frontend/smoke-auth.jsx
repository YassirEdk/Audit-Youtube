/**
 * Temporary smoke entry: renders the auth dialog inside the real provider
 * stack, in every locale. Deleted after running.
 */
import { renderToString } from 'react-dom/server'
import { AuthModal } from './src/AuthModal.jsx'
import { I18nProvider } from './src/i18n/index.jsx'
import { LOCALE_CODES } from './src/i18n/locales.js'
import { AuthContext } from './src/useAuth.js'

const anonymous = {
  session: null,
  user: null,
  loading: false,
  isConfigured: true,
  requestAuth: () => {},
  signUp: async () => ({}),
  signIn: async () => ({}),
  signInWithGoogle: async () => ({}),
  signOut: async () => ({}),
}

export function render() {
  const out = {}
  for (const code of LOCALE_CODES) {
    for (const mode of ['signup', 'login']) {
      out[`${code}:${mode}`] = renderToString(
        <I18nProvider locale={code}>
          <AuthContext.Provider value={anonymous}>
            <AuthModal mode={mode} onClose={() => {}} />
          </AuthContext.Provider>
        </I18nProvider>,
      ).length
    }
  }
  return out
}
