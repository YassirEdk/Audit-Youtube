import { useCallback, useEffect, useRef, useState } from 'react'
import { apiPost } from './api.js'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AboutFixer } from './AboutFixer.jsx'
import { PerformanceChart, StatRow } from './Chart.jsx'
import { LockIcon, LockedCard } from './Locked.jsx'
import { Checklist, ScoreCard } from './Score.jsx'
import { useAuditHistory } from './useAuditHistory.js'
import { useT } from './i18n/index.jsx'
import { useAuth, useLocked } from './useAuth.js'
import { useSavedAudits } from './useSavedAudits.js'

/**
 * Stands in for the About draft when signed out.
 *
 * Sits inline in the checklist row, so it has to stay small — the full
 * LockedCard would push the failed check itself off the screen.
 */
function LockedAbout() {
  const { requestAuth } = useAuth()
  const t = useT()

  return (
    <button type="button" className="ghost small" onClick={() => requestAuth('signup')}>
      <LockIcon /> <span className="btn-label">{t('score.aboutFixer.locked')}</span>
    </button>
  )
}

/**
 * Results for whatever `?channel=` says. The audit runs on mount and on any
 * change to the URL, which means a refresh or a shared link re-runs it rather
 * than showing an empty page.
 */
export function Results({ channel, videos, health, locale, onNewAudit }) {
  const locked = useLocked()
  const t = useT()
  const { record } = useAuditHistory()
  const { save, remove, isSaved, busy: saving } = useSavedAudits()
  const { requestAuth } = useAuth()
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [report, setReport] = useState('')
  const [writing, setWriting] = useState(false)
  const [copied, setCopied] = useState(false)

  const abortRef = useRef(null)

  const runAudit = useCallback(async () => {
    setLoading(true)
    setMeta(null)
    setReport('')
    setError('')

    try {
      const res = await apiPost('/api/audit', { channel, videos, lang: locale })
      setMeta(await res.json())
    } catch (err) {
      setError(
        err.message.toLowerCase().includes('fetch')
          ? t('results.unreachable')
          : err.message,
      )
    } finally {
      setLoading(false)
    }
  }, [channel, videos, locale, t])

  // Re-runs whenever the URL changes — including browser back into a previous
  // audit, which would otherwise show the wrong channel's numbers.
  useEffect(() => {
    runAudit()
  }, [runAudit])

  useEffect(() => {
    document.title = meta ? `${meta.channel.title} — Channel Audit` : 'Channel Audit'
  }, [meta])

  // Only a successful audit earns a place in the sidebar — recording inside
  // runAudit would pin channels that 404'd.
  useEffect(() => {
    if (!meta) return
    record({
      // The id identifies the channel; the handle is kept because it's what
      // the sidebar navigates with.
      id: meta.channel.id,
      handle: channel,
      title: meta.channel.title,
      thumbnail: meta.channel.thumbnail,
      score: meta.health.score,
      grade: meta.health.grade,
      at: Date.now(),
    })
  }, [meta, channel, record])

  const saved = !!meta && isSaved(meta.channel.id)
  const [saveError, setSaveError] = useState('')

  async function toggleSave() {
    if (locked) {
      requestAuth('signup')
      return
    }
    if (!meta) return
    setSaveError('')
    if (saved) {
      remove(meta.channel.id)
      return
    }
    const { error } = await save({
      channelId: meta.channel.id,
      handle: channel,
      title: meta.channel.title,
      score: meta.health.score,
      grade: meta.health.grade,
      analyzed: meta.analyzed,
      // The whole response, so a saved audit can be re-read later without
      // spending YouTube quota fetching it again.
      result: meta,
    })
    if (error) setSaveError(error.message)
  }

  const streamError = report.match(/^ERROR: ([\s\S]*)/m)?.[1]?.trim()
  const body = streamError ? '' : report

  async function writeReport() {
    if (writing) return
    setWriting(true)
    setReport('')
    setCopied(false)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await apiPost('/api/report', { channel, videos, lang: locale }, controller.signal)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        setReport((prev) => prev + decoder.decode(value, { stream: true }))
      }
    } catch (err) {
      // Appended as markdown emphasis, so the marker reads as an aside in the
      // rendered report rather than as another line the model wrote.
      if (err.name === 'AbortError')
        setReport((prev) => `${prev}\n\n_${t('results.stopped')}_`)
      else setError(err.message)
    } finally {
      setWriting(false)
      abortRef.current = null
    }
  }

  async function copyReport() {
    await navigator.clipboard.writeText(body)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function download() {
    const blob = new Blob([body], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-${channel.replace(/[^\w-]/g, '_').slice(0, 40)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="results-bar">
        <button type="button" className="ghost small" onClick={onNewAudit}>
          <span className="btn-label">{t('results.newAudit')}</span>
        </button>
        <span className="results-target">{channel}</span>

        {/* Only once the audit has landed: there's nothing to save until the
            result exists, and a button that can't work yet is worse than one
            that arrives a second later. */}
        {meta && (
          <button
            type="button"
            className={`ghost small save-btn ${saved ? 'is-saved' : ''}`}
            onClick={toggleSave}
            disabled={saving}
            aria-pressed={saved}
          >
            <span className="btn-label">
              {/* aria-hidden: the word beside it already says which state this
                  is, so announcing the glyph as well would just repeat it. */}
              <span className="fav-heart" aria-hidden="true">
                {saved ? '♥' : '♡'}
              </span>{' '}
              {saved ? t('results.favorited') : t('results.favorite')}
            </span>
          </button>
        )}
      </div>

      {saveError && (
        <div className="banner error">
          <strong>{t('results.saveFailed')}</strong>
          <pre>{saveError}</pre>
        </div>
      )}

      {loading && (
        <div className="loading-card">
          <span className="spinner" />
          <div>
            <b>{t('results.auditing', { channel })}</b>
            <p>{t('results.auditingSub', { n: videos })}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="banner error">
          <strong>{t('results.auditFailed')}</strong>
          <pre>{error}</pre>
          <button type="button" className="ghost small" onClick={runAudit}>
            <span className="btn-label">{t('common.retry')}</span>
          </button>
        </div>
      )}

      {meta && (
        <>
          <ScoreCard health={meta.health} channel={meta.channel} />
          <StatRow data={meta} />
          <Checklist
            health={meta.health}
            locked={locked}
            fixers={{
              about: locked ? (
                <LockedAbout />
              ) : (
                <AboutFixer
                  channel={channel}
                  videos={videos}
                  enabled={!!health?.llm_ok}
                  disabledReason={health?.llm_detail}
                />
              ),
            }}
          />
          <PerformanceChart
            videos={meta.videos}
            locked={locked}
            channel={channel}
            count={videos}
          />

          {/* The one action that spends an LLM request. Kept explicit so a
              capped free tier limits reports, not audits. */}
          {locked && (
            <LockedCard title={t('results.report.locked.title')}>
              {t('results.report.locked.body')}
            </LockedCard>
          )}

          {!locked && !report && !writing && (
            <div className="report-cta reveal">
              <div>
                <h3>{t('results.report.heading')}</h3>
                <p>
                  {health?.llm_ok
                    ? t('results.report.body', { provider: health.provider })
                    : health?.llm_detail || t('results.report.noModel')}
                </p>
              </div>
              <button onClick={writeReport} disabled={!health?.llm_ok}>
                <span className="btn-label">{t('results.report.write')}</span>
              </button>
            </div>
          )}
        </>
      )}

      {streamError && (
        <div className="banner error">
          <pre>{streamError}</pre>
        </div>
      )}

      {(body || writing) && (
        <>
          <div className="toolbar">
            {writing ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="ghost small"
              >
                <span className="btn-label">{t('common.stop')}</span>
              </button>
            ) : (
              <>
                <button onClick={copyReport} className="ghost small">
                  <span className="btn-label">{copied ? t('common.copied') : t('common.copy')}</span>
                </button>
                <button onClick={download} className="ghost small">
                  <span className="btn-label">{t('results.download')}</span>
                </button>
              </>
            )}
            {writing && (
              <span className="writing-note">
                <span className="spinner" /> {t('results.writing')}
              </span>
            )}
          </div>

          <article className="report">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            {writing && <span className="cursor" />}
          </article>
        </>
      )}
    </>
  )
}
