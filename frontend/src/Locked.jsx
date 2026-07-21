import { useAuth } from './useAuth.js'

/**
 * The signed-out gate.
 *
 * What's free is the diagnosis: the score, the checklist, the top few videos.
 * What costs an account is anything that does work for you — the written
 * breakdown, the About draft — plus the long tail of the video list.
 *
 * IMPORTANT: this is presentation, not enforcement. /api/report and
 * /api/suggest/about are still open, and the full video list is already in the
 * /api/audit response, so anyone who opens devtools can reach all of it.
 * Turning this into a real paywall means sending the Supabase JWT with each
 * request and verifying it in api/server.py — until then, treat the gate as a
 * prompt to sign up rather than a control.
 */

/**
 * The card shown in place of a gated feature.
 *
 * Deliberately says what's behind the gate rather than just "sign in" — the
 * ask lands better when the reader already knows what they'd get.
 */
export function LockedCard({ title, children, cta = 'Sign up free' }) {
  const { requestAuth } = useAuth()

  return (
    <div className="locked-card reveal">
      <div className="locked-copy">
        <h3>
          <LockIcon />
          {title}
        </h3>
        <p>{children}</p>
      </div>
      <div className="locked-actions">
        <button type="button" onClick={() => requestAuth('signup')}>
          <span className="btn-label">{cta}</span>
        </button>
        <button type="button" className="plain locked-login" onClick={() => requestAuth('login')}>
          <span className="btn-label">or log in</span>
        </button>
      </div>
    </div>
  )
}

/**
 * Wraps the content a signed-out visitor doesn't get: blurred, inert, with the
 * prompt laid over it.
 *
 * The blurred content keeps its full height rather than collapsing — how far
 * the blur runs is itself the argument for signing up. It's aria-hidden and
 * pointer-events: none, so a screen reader hears the prompt instead of a wall
 * of unreadable rows, and tooltips can't leak through.
 */
export function Gated({ label, cta = 'Sign up free to see them all', children }) {
  const { requestAuth } = useAuth()

  return (
    <div className="gated">
      <div className="gated-rows" aria-hidden="true">
        {children}
      </div>
      <div className="gate-lock">
        <p>
          <LockIcon />
          {label}
        </p>
        <button type="button" onClick={() => requestAuth('signup')}>
          <span className="btn-label">{cta}</span>
        </button>
      </div>
    </div>
  )
}

export function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="lock-icon">
      <path d="M12 3a4 4 0 0 0-4 4v2H6.5v12h11V9H16V7a4 4 0 0 0-4-4Zm0 1.4A2.6 2.6 0 0 1 14.6 7v2H9.4V7A2.6 2.6 0 0 1 12 4.4ZM7.9 10.4h8.2v9.2H7.9v-9.2Zm4.1 2.3a1.5 1.5 0 0 0-.7 2.8v1.6h1.4v-1.6a1.5 1.5 0 0 0-.7-2.8Z" />
    </svg>
  )
}
