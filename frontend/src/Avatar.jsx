import { useState } from 'react'

/**
 * A channel avatar that degrades to an initial instead of a broken icon.
 *
 * YouTube serves these from yt3.ggpht.com, which refuses some requests —
 * URLs in an older audit can expire, and the host is picky about referrers.
 * Either way the browser draws its broken-image glyph, which reads as a bug in
 * the page rather than as a picture that didn't load.
 *
 * Two defences, because they cover different failures: no-referrer prevents
 * the most common refusal outright, and onError catches whatever still fails.
 */
export function Avatar({ src, name, size = 24, className = '' }) {
  const [failed, setFailed] = useState(false)

  // Handles are stored with the leading @, which would make every fallback the
  // same letter.
  const initial = (name || '').replace(/^@/, '').trim()[0]?.toUpperCase() || '?'

  if (!src || failed) {
    return (
      <span
        className={`${className} is-fallback`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {initial}
      </span>
    )
  }

  return (
    <img
      className={className}
      src={src}
      alt=""
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      // Keyed on src so a changed URL gets a fresh attempt rather than
      // inheriting the previous channel's failure.
      key={src}
      onError={() => setFailed(true)}
    />
  )
}
