/**
 * Performance chart: each video's views as a multiple of the channel's own
 * median. The reader's job is "which side of the baseline is this, and by how
 * much" — that's polarity, so it's a diverging bar centered on 1.0x, not a
 * ranked list. Blue = above baseline, red = below, gray rule = the baseline.
 */

import { useState } from 'react'
import { Gated } from './Locked.jsx'
import { RollingNumber } from './RollingNumber.jsx'
import { useLiveSubscribers } from './useLiveSubscribers.js'
import { useLiveViews } from './useLiveViews.js'
import { VideoPanel } from './VideoPanel.jsx'

function compact(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + 'K'
  return String(n)
}

export function StatRow({ data }) {
  const { channel, baseline_views, share_above, best_multiple, analyzed } = data
  // Off by default, like the chart's toggle: compact reads better at a glance,
  // and the exact figure only earns its width once someone has asked to watch
  // it. Enabling it starts the poll.
  const [live, setLive] = useState(false)
  const { value: subs, step, changed, estimated, basis, direction } = useLiveSubscribers(
    channel.id,
    channel.subscribers,
    live,
  )

  const tiles = [
    { label: 'Subscribers', value: compact(channel.subscribers), live: true },
    { label: 'Typical video', value: compact(baseline_views), unit: 'views' },
    { label: 'Beat that bar', value: `${share_above}%`, unit: `of ${analyzed}` },
    { label: 'Best video', value: `${best_multiple}×`, unit: 'baseline' },
  ]
  return (
    <div className="stat-row">
      {tiles.map((t, i) => (
        // --i staggers the four tiles into a sequence as they land.
        <div key={t.label} className="stat reveal" style={{ '--i': i }}>
          <div
            className={
              t.live && live
                ? `stat-value stat-value-live${changed ? ' just-changed' : ''}`
                : 'stat-value'
            }
          >
            {t.live && live ? (
              <RollingNumber value={subs} direction={direction ?? 'up'} />
            ) : (
              t.value
            )}
          </div>
          <div className="stat-label">
            {t.label}
            {t.unit && <span className="stat-unit"> · {t.unit}</span>}

            {/* The ticker between polls is extrapolated from the channel's
                lifetime average growth, not measured — and the last few
                digits of even a real reading are zeros YouTube rounded to,
                not zeros it counted. Both need naming so the tile doesn't
                imply precision it hasn't got. */}
            {/* "measured" earns a stronger word than the other two: the rate
                came from this channel's own observed crossings, not from an
                average or a ceiling. */}
            {t.live && live && estimated && (
              <span className="stat-est">
                {basis === 'measured' ? ' · tracked rate' : ' · rough estimate'}
              </span>
            )}
            {t.live && live && step > 1 && (
              <span className="stat-est"> · nearest {step.toLocaleString()}</span>
            )}

            {t.live && (
              <button
                type="button"
                className={live ? 'live-toggle tiny plain is-on' : 'live-toggle tiny plain'}
                onClick={() => setLive(!live)}
                aria-pressed={live}
              >
                <i className="live-dot" aria-hidden="true" />
                <span className="btn-label">{live ? 'Live' : 'See live'}</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// How many rows a signed-out visitor gets. Enough to prove the chart is real
// and worth reading; not enough to be the whole answer.
const FREE_ROWS = 5

export function PerformanceChart({ videos, locked = false, channel, count }) {
  // One open at a time: a column of expanded panels loses the chart, which is
  // the thing that told you which video to open.
  const [openId, setOpenId] = useState(null)

  // Off by default. Compact counts read better at a glance, and the exact
  // figures only matter once you are watching them move — so the full numbers
  // and the polling arrive together, when asked for.
  const [live, setLive] = useState(false)

  // Called before the early return below so the hook order stays stable.
  const { values: liveViews, gains } = useLiveViews(videos ?? [], live)

  if (!videos?.length) return null

  const gated = locked && videos.length > FREE_ROWS

  // Log scale: a 46x outlier would otherwise flatten every other bar to a
  // sliver. Symmetric around 1.0x so above/below read as equal-and-opposite.
  const span = Math.max(
    ...videos.map((v) => Math.abs(Math.log10(Math.max(v.multiple, 0.02)))),
    Math.log10(3),
  )
  const offset = (m) => (Math.log10(Math.max(m, 0.02)) / span) * 50

  // Split rather than filtered inside the map: the gated half needs to sit in
  // its own wrapper so the prompt can cover exactly those rows.
  const free = gated ? videos.slice(0, FREE_ROWS) : videos
  const rest = gated ? videos.slice(FREE_ROWS) : []

  const row = (v, i) => {
    const w = offset(v.multiple)
    const above = v.multiple >= 1
    const open = openId === v.id
    // Fall back to the audited figure until the first poll lands.
    const views = liveViews[v.id] ?? v.views
    const gain = gains[v.id] ?? 0
    return (
      <div key={v.id} className={`row ${v.is_recent ? 'is-recent' : ''} ${open ? 'is-open' : ''}`}>
        <div className="bar-track">
          <span
            className={`bar ${above ? 'above' : 'below'}`}
            style={{
              left: above ? '50%' : `${50 + w}%`,
              width: `${Math.abs(w)}%`,
              '--i': i,
            }}
          />
        </div>
        {/* The label is the control: clicking anywhere on the row opens the
            video, which is what people try first. The bar above stays inert
            so a click near the axis doesn't toggle something. */}
        <button
          type="button"
          className="row-label plain"
          onClick={() => setOpenId(open ? null : v.id)}
          aria-expanded={open}
          title={`${v.title} — ${views.toLocaleString()} views · ${v.multiple}× baseline · ${v.days_old}d old`}
        >
          <span className="mult">{v.multiple}×</span>
          <span className="title">{v.title}</span>
          {/* Compact until live, then in full: "74M" is easier to scan, but it
              would swallow the few thousand views a refresh actually brings.
              tabular-nums keeps the column from shifting as the digits climb. */}
          <span className={live ? 'views is-live' : 'views'}>
            {live ? views.toLocaleString() : compact(v.views)}
            {/* Only ever a climb — useLiveViews holds backwards readings at the
                previous high, so there is no downward badge to render. */}
            {live && gain > 0 && (
              <span className="views-gain"> ▲ +{gain.toLocaleString()}</span>
            )}
          </span>
          <span className="row-chevron" aria-hidden="true">
            {open ? '⌃' : '⌄'}
          </span>
        </button>

        {open && (
          <VideoPanel
            channel={channel}
            videos={count}
            video={v}
            onClose={() => setOpenId(null)}
          />
        )}
      </div>
    )
  }

  return (
    <figure className="chart reveal">
      <figcaption>
        <h2>Every video vs. this channel's typical video</h2>
        <p className="chart-sub">
          The line is normal for this channel. Right is better than normal, left
          is worse.
        </p>
      </figcaption>

      <div className="legend">
        <span>
          <i className="swatch above" /> Above normal
        </span>
        <span>
          <i className="swatch below" /> Below normal
        </span>
        <span>
          <i className="swatch recent" /> Too new to judge
        </span>

        {/* Opt-in, because it starts a poll that the rest of the page doesn't
            need. aria-pressed rather than a checkbox: it toggles how this view
            behaves, it doesn't submit anything. Same tiny pill as the
            subscriber toggle — one live control, one look. */}
        <button
          type="button"
          className={live ? 'live-toggle tiny plain is-on' : 'live-toggle tiny plain'}
          onClick={() => setLive(!live)}
          aria-pressed={live}
        >
          <i className="live-dot" aria-hidden="true" />
          <span className="btn-label">{live ? 'Live' : 'See live'}</span>
        </button>
      </div>

      <div className="plot">
        <div className="baseline" aria-hidden="true" />
        {free.map(row)}

        {/* The gated rows are wrapped so the prompt can overlay exactly them.
            Positioning it against the whole plot would mean guessing a row
            height, which drifts the moment the type or spacing changes. */}
        {gated ? (
          <Gated label={`${videos.length - FREE_ROWS} more videos`}>{rest.map(row)}</Gated>
        ) : (
          rest.map(row)
        )}
      </div>

      {/* Hidden entirely rather than truncated: a table of the same five rows
          adds nothing, and leaving it open would hand back what the blur just
          gated. */}
      {!gated && (
      <details className="table-view">
        <summary>Show as table</summary>
        <table>
          <thead>
            <tr>
              <th>Video</th>
              <th>Views</th>
              <th>vs. normal</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id}>
                <td>{v.title}</td>
                <td>{v.views.toLocaleString()}</td>
                <td>{v.multiple}×</td>
                <td>{v.days_old}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      )}
    </figure>
  )
}
