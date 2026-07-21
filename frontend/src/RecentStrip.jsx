import { Avatar } from './Avatar.jsx'
import { useAuditHistory } from './useAuditHistory.js'
import { useLocked } from './useAuth.js'

/**
 * "Pick up where you left off" — the audit history, on the landing page.
 *
 * The sidebar covers this once you're inside a report, but the landing page is
 * where a returning visitor actually arrives, and it's the one place the list
 * was missing. A horizontal strip rather than the rail: the hero is centred
 * and a left column would fight it.
 *
 * Renders nothing when there's no history, and nothing when signed out — the
 * sidebar's "log in to save your history" prompt makes sense beside a report,
 * but on the landing page it would compete with the hero's own call to action.
 */
export function RecentStrip({ onSelect }) {
  const locked = useLocked()
  const { items, remove } = useAuditHistory()

  if (locked || !items.length) return null

  return (
    <section className="recent-strip" aria-label="Recent audits">
      <h2 className="recent-strip-title">Pick up where you left off</h2>
      <ul>
         {items.slice(0, 5).map((it) => {
          const name = it.title || it.handle
          return (
            <li key={it.id || it.handle} className="recent-chip">
              <button type="button" className="plain" onClick={() => onSelect(it.handle)}>
                <Avatar className="recent-avatar" src={it.thumbnail} name={name} size={28} />
                <span className="recent-name">{name}</span>
                {it.grade && <span className="recent-grade">{it.grade}</span>}
              </button>
              <button
                type="button"
                className="plain recent-remove"
                onClick={() => remove(it)}
                aria-label={`Remove ${name} from history`}
                title="Remove from history"
              >
                ✕
              </button>
            </li>
          )
        })}
        {items.length > 5 && (
          <li className="recent-chip recent-more">
            <span className="recent-more-text">+{items.length - 5} more</span>
          </li>
        )}
      </ul>
    </section>
  )
}
