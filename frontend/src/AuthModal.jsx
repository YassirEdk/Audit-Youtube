import { useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth.js'
import { useT } from './i18n/index.jsx'

/**
 * The log in / sign up dialog.
 *
 * One component for both modes: the fields are identical and the only real
 * differences are the button label and which Supabase call runs, so splitting
 * it in two would duplicate the form to change three strings.
 */

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285f4"
        d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5Z"
      />
      <path
        fill="#34a853"
        d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18Z"
      />
      <path fill="#fbbc05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3Z" />
      <path
        fill="#ea4335"
        d="M9 3.6c1.3 0 2.5.5 3.4 1.3L15 2.3A9 9 0 0 0 .9 5l3 2.3C4.6 5.1 6.6 3.6 9 3.6Z"
      />
    </svg>
  )
}

/**
 * Supabase's error strings, mapped to sentences a creator can act on.
 *
 * What arrives from the API is written for whoever is integrating it: "email
 * rate limit exceeded" names an internal quota, tells the reader nothing they
 * can do, and reads like the site is broken. It is also always English, which
 * on a translated page is the one line that stops being translated.
 *
 * Matched on a substring rather than a code because Supabase does not expose a
 * stable one for these — `error.code` is undefined for most auth failures, so
 * the message is the only thing to match on. That makes this list fragile by
 * nature: a reworded message upstream falls through to the default, which is
 * why the default is the raw message rather than a generic "something went
 * wrong". Falling back to something honest and unhelpful beats falling back to
 * something friendly and wrong.
 */
const ERROR_PATTERNS = [
  [/rate limit|too many requests/i, 'auth.error.rateLimit'],
  [/already registered|already been registered|user already exists/i, 'auth.error.alreadyRegistered'],
  [/invalid login credentials|invalid email or password/i, 'auth.error.invalidCredentials'],
  [/password should be at least|weak password/i, 'auth.error.weakPassword'],
]

function translateAuthError(message, t) {
  const hit = ERROR_PATTERNS.find(([pattern]) => pattern.test(message))
  return hit ? t(hit[1]) : message
}

/**
 * Renders the confirmation sentence with the address in bold.
 *
 * The alternative was to split the sentence into two catalogue keys around the
 * address, which forces every translator to keep a fragment before and a
 * fragment after in the order English happens to use. Splitting the *finished*
 * translation on the address instead means the sentence stays whole in the
 * catalogue and each language can put the address wherever it belongs.
 */
function EmailSentence({ text, email }) {
  const [before, ...after] = text.split(email)
  return (
    <>
      {before}
      <strong>{email}</strong>
      {after.join(email)}
    </>
  )
}

export function AuthModal({ mode: initialMode, onClose }) {
  const { signIn, signUp, signInWithGoogle, isConfigured } = useAuth()
  const t = useT()

  const [mode, setMode] = useState(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  // Set when a signup succeeds but no session comes back, which means Supabase
  // is waiting on an email confirmation.
  const [checkEmail, setCheckEmail] = useState(false)

  const nameRef = useRef(null)
  const emailRef = useRef(null)

  const isSignUp = mode === 'signup'

  // Whichever field is first in the current mode — signing up puts Name above
  // Email, and switching modes should leave the caret at the top of the form
  // rather than in the middle of it.
  useEffect(() => {
    const first = isSignUp ? nameRef : emailRef
    first.current?.focus()
  }, [isSignUp])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)

    const { data, error: err } = isSignUp
      ? await signUp(email, password, name.trim())
      : await signIn(email, password)

    setBusy(false)

    if (err) {
      setError(err.message)
      return
    }

    if (isSignUp && !data.session) {
      setCheckEmail(true)
      return
    }

    // On success the provider's listener updates the session; nothing to do
    // here but get out of the way.
    onClose()
  }

  async function handleGoogle() {
    setError(null)
    setBusy(true)
    const { error: err } = await signInWithGoogle()
    // On success the browser navigates away, so this only runs on failure.
    if (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div
      className="auth-backdrop"
      // Only a click that both starts and ends on the backdrop closes the
      // dialog — otherwise a text selection that drags outside the panel would.
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="auth-panel"
        role="dialog"
        aria-modal="true"
        aria-label={isSignUp ? t('auth.signup.title') : t('auth.login.title')}
      >
        <button
          type="button"
          className="auth-close plain"
          onClick={onClose}
          aria-label={t('auth.close')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="m12.7 12 5.6-5.6-.7-.7-5.6 5.6-5.6-5.6-.7.7 5.6 5.6-5.6 5.6.7.7 5.6-5.6 5.6 5.6.7-.7-5.6-5.6Z" />
          </svg>
        </button>

        {checkEmail ? (
          <>
            <h2>{t('auth.checkEmail.title')}</h2>
            <p className="auth-sub">
              <EmailSentence text={t('auth.checkEmail.body', { email })} email={email} />
            </p>
            <button type="button" className="auth-submit" onClick={onClose}>
              {t('auth.checkEmail.ok')}
            </button>
          </>
        ) : (
          <>
            <h2>{isSignUp ? t('auth.signup.title') : t('auth.login.title')}</h2>
            <p className="auth-sub">
              {isSignUp ? t('auth.signup.sub') : t('auth.login.sub')}
            </p>

            {!isConfigured && (
              <div className="banner error">
                Supabase isn't configured. Add <code>VITE_SUPABASE_URL</code> and{' '}
                <code>VITE_SUPABASE_ANON_KEY</code> to <code>frontend/.env</code>, then
                restart the dev server.
              </div>
            )}

            <button
              type="button"
              className="auth-google plain"
              onClick={handleGoogle}
              disabled={busy || !isConfigured}
            >
              <GoogleMark />
              {t('auth.google')}
            </button>

            <div className="auth-or">
              <span>{t('auth.or')}</span>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Sign up only — logging in identifies you by email, and asking
                  for a name you've already given would just be one more field
                  between you and the account you already have. */}
              {isSignUp && (
                <label className="auth-field">
                  {t('auth.name')}
                  <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder={t('auth.namePlaceholder')}
                  />
                </label>
              )}

              <label className="auth-field">
                {t('auth.email')}
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  spellCheck="false"
                  placeholder="example@example.com"
                />
              </label>

              <label className="auth-field">
                {t('auth.password')}
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  // Supabase rejects anything shorter, so catch it in the
                  // browser rather than after a round trip.
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                />
              </label>

              {error && <p className="auth-error">{translateAuthError(error, t)}</p>}

              <button type="submit" className="auth-submit" disabled={busy || !isConfigured}>
                {busy
                  ? t('auth.busy')
                  : isSignUp
                    ? t('auth.submit.signup')
                    : t('auth.submit.login')}
              </button>
            </form>

            <p className="auth-switch">
              {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
              <button
                type="button"
                className="plain"
                onClick={() => {
                  setMode(isSignUp ? 'login' : 'signup')
                  setError(null)
                }}
              >
                {isSignUp ? t('auth.switchToLogin') : t('auth.switchToSignup')}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
