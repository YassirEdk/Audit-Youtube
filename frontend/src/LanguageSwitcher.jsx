/**
 * Language picker for the masthead.
 *
 * A button and a popup list rather than a <select>. That was the first
 * version and it was replaced for one reason: the option list of a native
 * select is drawn by the operating system, not the page. `background` and
 * `color` on <option> are honoured on some platforms, partly on others and
 * not at all on Windows — so the dropdown rendered as a system-coloured box
 * in the middle of a dark masthead, looking like a bug.
 *
 * The cost of owning the widget is the keyboard and dismissal behaviour the
 * browser was providing for free, which is what the effect below re-adds. It
 * follows the same shape as UserMenu in Shell.jsx deliberately — two popups in
 * one masthead that behave differently is worse than either choice.
 *
 * Every language is written in its own language and never translated.
 * "Arabic" is no use to the person looking for العربية.
 */

import { useEffect, useRef, useState } from 'react'
import { LOCALES, LOCALE_CODES } from './i18n/locales.js'
import { useT } from './i18n/index.jsx'

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 1.2c1.2 0 2.6 1.9 3.2 4.8H8.8C9.4 6.1 10.8 4.2 12 4.2ZM7.6 9A13.6 13.6 0 0 1 9 4.7 7.8 7.8 0 0 0 4.6 9h3Zm-.4 1.2H4.1a7.9 7.9 0 0 0 0 3.6h3.1a20 20 0 0 1 0-3.6Zm1.2 0h7.2a18.7 18.7 0 0 1 0 3.6H8.4a18.7 18.7 0 0 1 0-3.6Zm8.4 0h3.1a7.9 7.9 0 0 1 0 3.6h-3.1a20 20 0 0 0 0-3.6ZM16.4 9h3A7.8 7.8 0 0 0 15 4.7 13.6 13.6 0 0 1 16.4 9ZM7.6 15a13.6 13.6 0 0 0 1.4 4.3A7.8 7.8 0 0 1 4.6 15h3Zm1.2 0h6.4c-.6 2.9-2 4.8-3.2 4.8S9.4 17.9 8.8 15Zm7.6 0h3a7.8 7.8 0 0 1-4.4 4.3 13.6 13.6 0 0 0 1.4-4.3Z" />
    </svg>
  )
}

export function LanguageSwitcher({ locale, onChange }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Same dismissal contract as the account menu: click anywhere outside, or
  // press Escape. Bound only while open, so a closed switcher costs nothing.
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

  return (
    <div className="yt-lang" ref={ref}>
      <button
        type="button"
        className="yt-lang-btn plain"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('nav.languageAria')}
        title={t('nav.language')}
      >
        <GlobeIcon />
        {/* The current language, in its own language — so the button says
            what you'd get, not what you have. Hidden on narrow screens by the
            stylesheet; the globe carries the meaning there. */}
        <span className="yt-lang-current">{LOCALES[locale]?.label}</span>
      </button>

      {open && (
        <div className="yt-lang-menu" role="menu">
          {LOCALE_CODES.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={code === locale}
              // lang on the item, so a screen reader pronounces each name with
              // that language's voice rather than reading العربية as English.
              lang={LOCALES[code].htmlLang}
              className={`yt-lang-item ${code === locale ? 'is-active' : ''}`}
              onClick={() => {
                onChange(code)
                setOpen(false)
              }}
            >
              {LOCALES[code].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
