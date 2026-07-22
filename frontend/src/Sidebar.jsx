/**
 * The report-page rail, in YouTube's subscriptions idiom.
 *
 * On a results page the landing sections ("Checklist", "FAQ") are dead
 * weight — you're past the pitch. What's actually useful there is getting back
 * to the channels you've already looked at, which is the same job YouTube's
 * subscription list does, so it borrows the same shape: avatar, name, one row
 * each, current one highlighted.
 */

import { Avatar } from './Avatar.jsx'
import { useT } from './i18n/index.jsx'
import { useAuditHistory } from './useAuditHistory.js'
import { useAuth, useLocked } from './useAuth.js'
import { useSavedAudits } from './useSavedAudits.js'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 4.44 19 11v8.5h-4.5v-6h-5v6H5V11l7-6.56Zm0-1.37L4 10.5v10h6.5v-6h3v6H20v-10L12 3.07Z" />
    </svg>
  )
}

// Bands match score.py's GRADES, same as the ring — the pill and the score it
// summarises can't disagree.
function toneFor(score) {
  if (score >= 80) return 'ok'
  if (score >= 60) return 'warn'
  return 'bad'
}

export function Sidebar({ current, onHome, onSelect }) {
  const t = useT()
  const locked = useLocked()
  const { requestAuth } = useAuth()
  // Still read (and, in Results, still recorded) while signed out — the audits
  // are being collected either way, so signing in reveals a list that's already
  // yours rather than starting an empty one.
  const { items, remove } = useAuditHistory()
  const { items: saved, remove: unsave } = useSavedAudits()

  // A channel that's saved shouldn't also appear under "Recent" — one row per
  // channel, in the section that says more about it.
  const savedIds = new Set(saved.map((s) => s.channel_id))
  const recents = items.filter((it) => !savedIds.has(it.id))

  return (
    <nav className="yt-sidebar" aria-label={t('side.aria')}>
      <button type="button" className="side-item plain" onClick={onHome}>
        <span className="side-icon">
          <HomeIcon />
        </span>
        <span className="side-label">{t('side.home')}</span>
      </button>

      {locked && (
        <>
          <hr className="side-rule" />
          <div className="side-locked">
            <p>{t('side.locked.lead')}</p>
            <span>{t('side.locked.rest')}</span>
            <button type="button" className="ghost small" onClick={() => requestAuth('login')}>
              {t('side.locked.cta')}
            </button>
          </div>
        </>
      )}

      {!locked && saved.length > 0 && (
        <>
          <hr className="side-rule" />
          <h4 className="side-heading">{t('side.favorites')}</h4>

          {saved.map((it) => {
            const name = it.channel_title || it.channel_handle
            const active = it.channel_handle === current
            return (
              <div key={it.id} className={`side-row ${active ? 'is-active' : ''}`}>
                <button
                  type="button"
                  className="side-item plain"
                  onClick={() => onSelect(it.channel_handle)}
                  aria-current={active ? 'page' : undefined}
                  title={name}
                >
                  <span className="side-star" aria-hidden="true">♥</span>
                  <span className="side-label">{name}</span>
                  {it.grade && (
                    <span className={`side-grade tone-${toneFor(it.score ?? 0)}`}>{it.grade}</span>
                  )}
                </button>
                <button
                  type="button"
                  className="side-remove plain"
                  onClick={() => unsave(it.channel_id)}
                  aria-label={t('side.removeFavorite', { name })}
                  title={t('side.removeFavoriteShort')}
                >
                  ✕
                </button>
              </div>
            )
          })}
        </>
      )}

      {!locked && recents.length > 0 && (
        <>
          <hr className="side-rule" />
          <h4 className="side-heading">{t('side.recents')}</h4>

          {recents.map((it) => {
            // The list is most-recent-first, so the top row is the last audit
            // by construction — no separate "last audit" entry needed.
            const active = it.handle === current
            const name = it.title || it.handle
            // A wrapper rather than one button: the remove control is its own
            // action, and nesting a button inside a button is invalid HTML —
            // browsers drop the inner one, so the click would never fire.
            return (
              <div key={it.id || it.handle} className={`side-row ${active ? 'is-active' : ''}`}>
                <button
                  type="button"
                  className="side-item plain"
                  onClick={() => onSelect(it.handle)}
                  aria-current={active ? 'page' : undefined}
                  title={name}
                >
                  <Avatar className="side-avatar" src={it.thumbnail} name={name} size={24} />
                  <span className="side-label">{name}</span>
                  {it.grade && (
                    <span className={`side-grade tone-${toneFor(it.score ?? 0)}`}>{it.grade}</span>
                  )}
                </button>

                {/* No confirmation: removing one row is trivially undone by
                    auditing the channel again, so a dialog would cost more
                    than the mistake does. */}
                <button
                  type="button"
                  className="side-remove plain"
                  onClick={() => remove(it)}
                  aria-label={t('side.removeHistory', { name })}
                  title={t('side.removeHistoryShort')}
                >
                  ✕
                </button>
              </div>
            )
          })}
        </>
      )}
    </nav>
  )
}
