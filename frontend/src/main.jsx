import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './AuthProvider.jsx'
import { I18nProvider } from './i18n/index.jsx'
import { useRoute } from './useRoute.js'

/**
 * Owns the route, so the providers below it can be nested in the right order.
 *
 * That order is the whole point of this component, and it is not arbitrary:
 *
 *   I18nProvider → AuthProvider → App
 *
 * AuthProvider renders the login dialog itself, as a sibling of `children`
 * rather than inside the page. So anything the dialog needs has to be provided
 * *above* AuthProvider. When the locale lived inside App instead, the dialog
 * sat outside the translation context, useT() threw, and React unmounted the
 * entire tree — a blank page on the first click of "Log in".
 *
 * The route is read here rather than in App for the same reason: I18nProvider
 * needs the locale before either provider mounts, and useRoute is the only
 * thing that knows how to get it out of the URL.
 */
function Root() {
  const route = useRoute()

  return (
    <I18nProvider locale={route.locale}>
      <AuthProvider>
        <App route={route} />
      </AuthProvider>
    </I18nProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
