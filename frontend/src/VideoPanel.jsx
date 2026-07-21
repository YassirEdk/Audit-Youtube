import { useRef, useState } from 'react'
import { apiPost } from './api.js'
import { TitleFixer } from './TitleFixer.jsx'
import { useAuth, useLocked } from './useAuth.js'

/**
 * Everything about one video, opened from its row in the chart.
 *
 * The chart answers "which videos underperformed"; this answers "and what
 * happened with this one". The facts are free — they were already in the audit
 * response, so putting them behind a login would be gating data the browser
 * has already downloaded. The written analysis costs a model call, so that is
 * the part an account buys.
 */

/** PT1H2M30S -> 1:02:30. YouTube returns ISO 8601 durations. */
function duration(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || '')
  if (!m) return '—'
  const [h, min, s] = [Number(m[1] || 0), Number(m[2] || 0), Number(m[3] || 0)]
  const pad = (n) => String(n).padStart(2, '0')
  return h ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`
}

function num(n) {
  return (n ?? 0).toLocaleString()
}

export function VideoPanel({ channel, videos, video, onClose }) {
  const locked = useLocked()
  const { requestAuth } = useAuth()

  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [rewriting, setRewriting] = useState(false)
  const abortRef = useRef(null)

  const error = text.match(/^ERROR: ([\s\S]*)/m)?.[1]?.trim()
  const body = error ? '' : text

  // Like rate is the one engagement number that survives being compared across
  // videos of different sizes, so it's shown as a rate rather than a count.
  const likeRate = video.views ? (100 * video.likes) / video.views : 0

  const facts = [
    { label: 'Views', value: num(video.views) },
    { label: 'vs. typical', value: `${video.multiple}×` },
    { label: 'Likes', value: video.likes ? `${likeRate.toFixed(1)}%` : 'hidden' },
    { label: 'Comments', value: num(video.comments) },
    { label: 'Length', value: duration(video.duration) },
    { label: 'Age', value: `${video.days_old}d` },
    { label: 'Tags', value: video.tags?.length ?? 0 },
    { label: 'Description', value: `${num(video.description_len)} ch` },
  ]

  async function analyse() {
    if (busy) return
    if (locked) {
      requestAuth('signup')
      return
    }
    setBusy(true)
    setText('')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await apiPost(
        '/api/analyse/video',
        { channel, videos, video_id: video.id },
        controller.signal,
      )
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

  return (
    <div className="video-panel">
      <div className="video-panel-head">
        {/* Derived from the id rather than carried in the audit payload: every
            video has an mqdefault, it costs no quota and no extra field on the
            response. mqdefault over maxresdefault because the latter only
            exists for videos uploaded above 720p and 404s otherwise.
            alt="" — the title sits immediately beside it, so announcing the
            thumbnail as well would just repeat it. */}
        <img
          className="video-thumb"
          src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
          alt=""
          loading="lazy"
          width="120"
          height="68"
        />
        <div className="video-panel-title">
          <h4>{video.title}</h4>
          <p>
            Published {video.published || '—'}
            {video.is_recent && (
              <span className="video-flag"> · still counting views</span>
            )}
          </p>
        </div>
        <button type="button" className="plain video-panel-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <dl className="video-facts">
        {facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>

      {video.tags?.length > 0 && (
        <ul className="video-tags">
          {video.tags.slice(0, 10).map((t) => (
            <li key={t}>{t}</li>
          ))}
          {video.tags.length > 10 && <li className="more">+{video.tags.length - 10}</li>}
        </ul>
      )}

      <div className="video-panel-actions">
        <a
          className="ghost small video-watch"
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          // noopener: without it the opened tab can reach back through
          // window.opener and navigate this one.
          rel="noopener noreferrer"
        >
          Watch on YouTube ↗
        </a>

        {!body && !busy && (
          <button type="button" className="ghost small" onClick={analyse}>
            ✦ {locked ? 'Sign up to analyse' : 'Analyse this video'}
          </button>
        )}

        {busy && (
          <button type="button" className="ghost small" onClick={() => abortRef.current?.abort()}>
            Stop
          </button>
        )}

        {!rewriting && (
          <button
            type="button"
            className="ghost small"
            onClick={() => (locked ? requestAuth('signup') : setRewriting(true))}
          >
            {/* Says what it wants before you click it, exactly like the
                analyse button. Both cost a model call and both need an
                account, so both should look gated rather than one of them
                only revealing it once you've pressed it. */}
            ✦ {locked ? 'Sign up to rewrite title' : 'Rewrite title'}
          </button>
        )}
      </div>

      {busy && !body && (
        <span className="fixer-busy">
          <span className="spinner" /> Reading the numbers…
        </span>
      )}

      {error && <p className="fixer-error">{error}</p>}

      {body && <div className="video-analysis">{body}</div>}

      {rewriting && (
        <TitleFixer
          channel={channel}
          videos={videos}
          video={video}
          onClose={() => setRewriting(false)}
        />
      )}
    </div>
  )
}
