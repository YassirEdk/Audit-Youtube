import { useEffect, useId, useRef, useState } from 'react'
import { useChannelSearch } from './useChannelSearch.js'

/**
 * The channel input, with YouTube-style suggestions under it.
 *
 * Wraps a plain text input rather than replacing it: the typed value is still
 * what submits, so a channel the suggestions never found — a brand-new one, or
 * one whose name matches nothing — is still auditable by pasting its handle.
 * The list accelerates the common case; it is never the only way through.
 *
 * ARIA combobox rather than a menu: the input owns the value, the list only
 * proposes. That is also why arrow keys move a highlight without changing what
 * is typed — committing on arrow would fight the debounce.
 */

function compactSubs(n) {
  if (n == null) return null
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return String(n)
}

export function ChannelSuggest({
  value,
  onChange,
  onPick,
  placeholder,
  ariaLabel,
  inputRef,
  id,
  autoFocus = false,
}) {
  const { results, busy } = useChannelSearch(value)
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(-1)
  const wrapRef = useRef(null)
  const listId = useId()

  // Reopen whenever a fresh set arrives, and drop the highlight — the old
  // index pointed into a list that no longer exists.
  useEffect(() => {
    setCursor(-1)
    if (results.length) setOpen(true)
  }, [results])

  // A click outside is a dismissal. Pointerdown rather than click so the list
  // is gone before the next element handles its own press.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const visible = open && results.length > 0

  function choose(channel) {
    setOpen(false)
    setCursor(-1)
    // The handle, not the display name: it is what the audit resolves for 1
    // quota unit, where the name would cost another 100-unit search.
    onPick(channel.handle)
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!visible) return

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      // Preventing default keeps the caret from jumping to either end of the
      // input while the highlight moves.
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setCursor((c) => (c + step + results.length) % results.length)
      return
    }
    if (e.key === 'Enter' && cursor >= 0) {
      // Only swallow Enter when a suggestion is actually highlighted, so
      // typing a handle and hitting Enter still submits the form.
      e.preventDefault()
      choose(results[cursor])
    }
  }

  return (
    <div className="channel-suggest" ref={wrapRef}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => results.length && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        spellCheck="false"
        autoComplete="off"
        aria-label={ariaLabel}
        role="combobox"
        aria-expanded={visible}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={cursor >= 0 ? `${listId}-${cursor}` : undefined}
      />

      {/* Only while a request is genuinely in flight for a query that will
          produce a list. Silence during the debounce would read as nothing
          happening. */}
      {busy && !visible && <span className="suggest-busy" aria-hidden="true" />}

      {visible && (
        <ul className="suggest-list" id={listId} role="listbox">
          {results.map((c, i) => (
            <li
              key={c.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === cursor}
              className={i === cursor ? 'is-cursor' : ''}
            >
              {/* pointerdown, not click: the input's blur would otherwise tear
                  the list down before the click landed. */}
              <button type="button" className="plain suggest-row" onPointerDown={() => choose(c)}>
                {c.avatar ? (
                  <img className="suggest-avatar" src={c.avatar} alt="" loading="lazy" />
                ) : (
                  <span className="suggest-avatar is-fallback" aria-hidden="true">
                    {c.title.slice(0, 1)}
                  </span>
                )}
                <span className="suggest-text">
                  <span className="suggest-title">{c.title}</span>
                  <span className="suggest-meta">
                    {c.handle.startsWith('@') ? c.handle : ''}
                    {c.subscribers != null && (
                      <>
                        {c.handle.startsWith('@') ? ' · ' : ''}
                        {compactSubs(c.subscribers)} subscribers
                      </>
                    )}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
