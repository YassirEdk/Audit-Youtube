/**
 * YouTube's application chrome: fixed masthead carrying the logo and the
 * section nav, content column offset to clear it.
 *
 * The point of copying the layout this closely is recognition — a creator
 * arrives already knowing where everything is, because it's where YouTube
 * puts it.
 */

import { useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth.js'

const NAV = [
  {
    id: null,
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4.44 19 11v8.5h-4.5v-6h-5v6H5V11l7-6.56Zm0-1.37L4 10.5v10h6.5v-6h3v6H20v-10L12 3.07Z" />
      </svg>
    ),
  },
  {
    id: 'checks',
    label: 'Checklist',
    // Ticked rows rather than the single large tick this used to be: a bare
    // tick reads as "done", which is what a results page means, not "here is
    // the list of things measured".
    //
    // Two rows, not three, and the tick is drawn at this size rather than the
    // page's big tick scaled down. .yt-nav-icon renders into a 20px box, so a
    // 24-unit path is displayed at 0.83×: anything thinner than ~1.2 units
    // here lands under a physical pixel and greys out. The strokes below are
    // 2 units, which survives it.
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 7h-9v2h9V7Zm0 8h-9v2h9v-2ZM5.54 11 2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11Zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19Z" />
      </svg>
    ),
  },
  {
    id: 'how',
    label: 'How it works',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 1.2a7.8 7.8 0 1 1 0 15.6 7.8 7.8 0 0 1 0-15.6Z" />
        <path d="M10 8.2 16 12l-6 3.8V8.2Z" />
      </svg>
    ),
  },
  {
    id: 'faq',
    label: 'FAQ',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.3 15h1.4v1.4h-1.4V15Zm.7-8c-1.7 0-3 1.3-3 3h1.4c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6c0 .6-.3.9-.9 1.4-.8.6-1.4 1.1-1.4 2.4h1.4c0-.7.3-1 .9-1.5.8-.6 1.4-1.2 1.4-2.3 0-1.7-1.3-3-3-3Zm0-4a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 1.2a7.8 7.8 0 1 1 0 15.6 7.8 7.8 0 0 1 0-15.6Z" />
      </svg>
    ),
  },
  {
    id: 'guides',
    label: 'Read more',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 6.3A9.4 9.4 0 0 0 6.5 4.6c-1.2 0-2.4.2-3.5.6v12.4c1.1-.4 2.3-.6 3.5-.6 2 0 4 .6 5.5 1.7 1.5-1.1 3.5-1.7 5.5-1.7 1.2 0 2.4.2 3.5.6V5.2c-1.1-.4-2.3-.6-3.5-.6-2 0-4 .6-5.5 1.7Zm-.6 10.9a10.6 10.6 0 0 0-4.9-1.2c-.8 0-1.5.1-2.3.3V6.1c.7-.2 1.5-.3 2.3-.3 1.7 0 3.4.4 4.9 1.2v10.2Zm1.2 0V7c1.5-.8 3.2-1.2 4.9-1.2.8 0 1.6.1 2.3.3v10.2c-.8-.2-1.5-.3-2.3-.3-1.7 0-3.4.4-4.9 1.2Z" />
      </svg>
    ),
  },
]

function YouTubeLogo() {
  return (
    <span className="yt-logo" aria-label="Channel Audit home">
      <svg viewBox="0 0 28 20" className="yt-logo-mark" aria-hidden="true">
        <path
          fill="#f00"
          d="M27.4 3.1A3.5 3.5 0 0 0 24.9.6C22.7 0 14 0 14 0S5.3 0 3.1.6A3.5 3.5 0 0 0 .6 3.1C0 5.3 0 10 0 10s0 4.7.6 6.9a3.5 3.5 0 0 0 2.5 2.5C5.3 20 14 20 14 20s8.7 0 10.9-.6a3.5 3.5 0 0 0 2.5-2.5C28 14.7 28 10 28 10s0-4.7-.6-6.9Z"
        />
        <path className="yt-logo-play" fill="#fff" d="M11.2 14.3 18.4 10l-7.2-4.3v8.6Z" />
      </svg>
      <span className="yt-logo-text">
        Audit<sup>BETA</sup>
      </span>
    </span>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21S3 14.5 3 8.9A5 5 0 0 1 12 6a5 5 0 0 1 9 2.9C21 14.5 12 21 12 21Z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.9 19.6 15.5 14a6.5 6.5 0 1 0-1 1l5.5 5.6.9-1ZM5.2 10.5a5.3 5.3 0 1 1 10.6 0 5.3 5.3 0 0 1-10.6 0Z" />
    </svg>
  )
}

/**
 * True once the page has moved at all. Only the boolean is stored, so the
 * header re-renders on the two crossings rather than on every scroll event.
 */
function useScrolled() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return scrolled
}

/**
 * The signed-in corner of the masthead: avatar, and a menu behind it.
 *
 * Google accounts carry a picture and a name; email signups carry neither, so
 * both fall back to the initial and the address.
 */
function UserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const { avatar_url: avatarUrl, full_name: fullName } = user.user_metadata ?? {}
  const label = fullName || user.email

  return (
    <div className="yt-user" ref={ref}>
      <button
        type="button"
        className="yt-avatar plain"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span>{label?.[0]?.toUpperCase()}</span>
        )}
      </button>

      {open && (
        <div className="yt-menu" role="menu">
          <div className="yt-menu-head">
            {fullName && <strong>{fullName}</strong>}
            <span>{user.email}</span>
          </div>
          <button type="button" className="plain yt-signout" role="menuitem" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export function Shell({ active, onNavigate, headerSearch, sidebar, children }) {
  const { user, loading, requestAuth } = useAuth()
  const scrolled = useScrolled()

  return (
    <>
      <header className={`yt-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="yt-header-start">
          <button type="button" className="yt-brand" onClick={() => onNavigate(null)}>
            <YouTubeLogo />
          </button>

          {/* Hidden on report pages: those sections live on the landing page,
              and the sidebar carries the navigation that's useful here. */}
          {!sidebar && (
          <nav className="yt-nav" aria-label="Sections">
            {NAV.map((item) => (
              <button
                type="button"
                key={item.label}
                className={`yt-nav-item ${active === item.id ? 'is-active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="yt-nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          )}
        </div>

        {/* The masthead search only appears once you're past the landing page,
            exactly like YouTube: the home page owns the big search, every
            other page gets the compact one up top. */}
        <div className="yt-header-mid">{headerSearch}</div>

        {/* While the session is still being restored the corner stays empty,
            so a signed-in visitor never sees Log in flash on reload. */}
        <div className="yt-header-end">
          {/* Sits left of the account corner and doesn't depend on the session,
              so it's in the same place whether you're signed in or out. An
              anchor, not a button: it leaves the app, so it should behave like
              a link and open in its own tab. */}
          <a
            className="yt-donate"
            href="https://paypal.me/GrizzlyProd1"
            target="_blank"
            rel="noopener noreferrer"
            title="Support this project"
          >
            <HeartIcon />
            <span>Donate For Me</span>
          </a>

          {loading ? null : user ? (
            <UserMenu />
          ) : (
            <>
              <button type="button" className="yt-ghost" onClick={() => requestAuth('login')}>
                Log in
              </button>
              <button type="button" className="yt-signup" onClick={() => requestAuth('signup')}>
                Sign up
              </button>
            </>
          )}
        </div>
      </header>

      <div className={`yt-body ${sidebar ? 'has-sidebar' : ''}`}>
        {sidebar}
        <main className="yt-main">{children}</main>
      </div>
    </>
  )
}

export { SearchIcon }
