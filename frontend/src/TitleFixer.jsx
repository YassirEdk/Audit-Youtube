import { useRef, useState } from 'react'
import { apiPost } from './api.js'

/**
 * Inline fix for one underperforming video.
 *
 * The chart already says which videos fell below the channel's median; this is
 * the part that does something about it. Same rationing as the other fixers —
 * it costs an LLM request, so it only fires on an explicit click, one video at
 * a time.
 */
export function TitleFixer({ channel, videos, video, onClose }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(null)
  const abortRef = useRef(null)

  const error = text.match(/^ERROR: ([\s\S]*)/m)?.[1]?.trim()

  // The model is asked for one title per line, but a stray blank line or a
  // preamble it wasn't supposed to write shouldn't collapse the whole panel.
  const titles = error
    ? []
    : text
        .split('\n')
        .map((line) => line.replace(/^\s*[-*\d.)\s]+/, '').trim())
        .filter(Boolean)

  async function generate() {
    if (busy) return
    setBusy(true)
    setText('')
    setCopied(null)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await apiPost('/api/suggest/title', { channel, videos, video_id: video.id }, controller.signal)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        setText((prev) => prev + decoder.decode(value, { stream: true }))
      }
    } catch (err) {
      if (err.name !== 'AbortError') setText(`ERROR: ${err.message}`)
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  async function copy(title, i) {
    await navigator.clipboard.writeText(title)
    setCopied(i)
    setTimeout(() => setCopied(null), 1800)
  }

  return (
    <div className="title-fixer">
      <div className="title-fixer-head">
        <div>
          <span className="title-fixer-label">Current title</span>
          <p className="title-fixer-current">{video.title}</p>
        </div>
        <button type="button" className="plain title-fixer-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {!text && !busy && (
        <button type="button" className="ghost small" onClick={generate}>
          ✦ Rewrite this title
        </button>
      )}

      {busy && !titles.length && (
        <span className="fixer-busy">
          <span className="spinner" /> Thinking…
        </span>
      )}

      {error && <p className="fixer-error">{error}</p>}

      {titles.length > 0 && (
        <ol className="title-options">
          {titles.map((t, i) => (
            <li key={t}>
              <span className="title-option-text">{t}</span>
              {/* The 60-character line is the same one the audit grades titles
                  against, so the counter doubles as the check it has to pass. */}
              <span className={`title-option-count ${t.length <= 60 ? 'ok' : 'short'}`}>
                {t.length}
              </span>
              <button type="button" className="ghost small" onClick={() => copy(t, i)}>
                {copied === i ? 'Copied' : 'Copy'}
              </button>
            </li>
          ))}
        </ol>
      )}

      {titles.length > 0 && !busy && (
        <button type="button" className="ghost small" onClick={generate}>
          Try again
        </button>
      )}
    </div>
  )
}
