import { useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth.js'

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

export function AuthModal({ mode: initialMode, onClose }) {
  const { signIn, signUp, signInWithGoogle, isConfigured } = useAuth()

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
      <div className="auth-panel" role="dialog" aria-modal="true" aria-label={
        isSignUp ? 'Create an account' : 'Log in'
      }>
        <button type="button" className="auth-close plain" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="m12.7 12 5.6-5.6-.7-.7-5.6 5.6-5.6-5.6-.7.7 5.6 5.6-5.6 5.6.7.7 5.6-5.6 5.6 5.6.7-.7-5.6-5.6Z" />
          </svg>
        </button>

        {checkEmail ? (
          <>
            <h2>Check your email</h2>
            <p className="auth-sub">
              We sent a confirmation link to <strong>{email}</strong>. Open it to finish
              creating your account.
            </p>
            <button type="button" className="auth-submit" onClick={onClose}>
              Got it
            </button>
          </>
        ) : (
          <>
            <h2>{isSignUp ? 'Create an account' : 'Welcome back'}</h2>
            <p className="auth-sub">
              {isSignUp
                ? 'Save your audits and come back to them later.'
                : 'Log in to see your saved audits.'}
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
              Continue with Google
            </button>

            <div className="auth-or">
              <span>or</span>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Sign up only — logging in identifies you by email, and asking
                  for a name you've already given would just be one more field
                  between you and the account you already have. */}
              {isSignUp && (
                <label className="auth-field">
                  Name
                  <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Your name"
                  />
                </label>
              )}

              <label className="auth-field">
                Email
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
                Password
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

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-submit" disabled={busy || !isConfigured}>
                {busy ? 'Working…' : isSignUp ? 'Sign up' : 'Log in'}
              </button>
            </form>

            <p className="auth-switch">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                className="plain"
                onClick={() => {
                  setMode(isSignUp ? 'login' : 'signup')
                  setError(null)
                }}
              >
                {isSignUp ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
