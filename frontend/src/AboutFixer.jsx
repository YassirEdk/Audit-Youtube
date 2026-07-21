import { useRef, useState } from 'react'
import { apiPost } from './api.js'

/**
 * Inline fix for the "About section" check.
 *
 * The checklist already tells you the About section is too short; this turns
 * that from a complaint into something you can act on without leaving the
 * page. Same rationing as the full report — it costs an LLM request, so it
 * only fires on an explicit click.
 */
export function AboutFixer({ channel, videos, enabled, disabledReason }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const abortRef = useRef(null)

  const error = text.match(/^ERROR: ([\s\S]*)/m)?.[1]?.trim()
  const draft = error ? '' : text

  async function generate() {
    if (busy) return
    setBusy(true)
    setText('')
    setCopied(false)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await apiPost('/api/suggest/about', { channel, videos }, controller.signal)
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

  async function copy() {
    await navigator.clipboard.writeText(draft.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="fixer">
      {!draft && !busy && (
        <button
          type="button"
          className="ghost small fixer-cta"
          onClick={generate}
          disabled={!enabled}
          title={enabled ? undefined : disabledReason}
        >
          <span className="btn-label">✦ Write one for me</span>
        </button>
      )}

      {busy && !draft && (
        <span className="fixer-busy">
          <span className="spinner" /> Drafting…
        </span>
      )}

      {error && <p className="fixer-error">{error}</p>}

      {draft && (
        <div className="fixer-draft">
          {/* Editable: it's a starting point, not a finished answer, and the
              character counter is the check it has to pass. */}
          <textarea
            value={draft}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            spellCheck="false"
            aria-label="Suggested About section"
          />
          <div className="fixer-actions">
            <span className={`fixer-count ${draft.length >= 200 ? 'ok' : 'short'}`}>
              {draft.length} characters
              {draft.length < 200 && ' — still under 200'}
            </span>
            <button type="button" className="ghost small fixer-cta" onClick={copy}>
              <span className="btn-label">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button type="button" className="ghost small fixer-cta" onClick={generate} disabled={busy}>
              <span className="btn-label">Try again</span>
            </button>
          </div>
          <p className="fixer-hint">
            Paste into YouTube Studio → Customization → Basic info.
          </p>
        </div>
      )}
    </div>
  )
}
