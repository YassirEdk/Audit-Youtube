import { FREE_VIDEOS } from './limits.js'

/**
 * How many videos to analyse — a preference, not part of the address.
 *
 * It used to ride in the query string, which made it look like something to
 * edit: `?videos=100` was right there in the URL bar inviting a try. The depth
 * isn't what a link points at, though. A shared audit link means "look at this
 * channel", and it should mean that whoever opens it, at whatever depth their
 * own account allows.
 *
 * The server clamps this regardless (see FREE_VIDEOS in api/server.py), so
 * editing the stored value buys nothing. Keeping it out of the URL is about
 * making links clean and portable, not about hiding a control.
 */

const KEY = 'yt-audit:depth'

// The options the form offers. Anything else in storage is ignored rather than
// trusted — a hand-edited 5000 shouldn't become a request.
const ALLOWED = [20, 50, 100]

export function readDepth() {
  try {
    const n = Number(localStorage.getItem(KEY))
    return ALLOWED.includes(n) ? n : FREE_VIDEOS
  } catch {
    return FREE_VIDEOS
  }
}

export function writeDepth(n) {
  if (!ALLOWED.includes(n)) return
  try {
    localStorage.setItem(KEY, String(n))
  } catch {
    // Private mode. The choice still applies for this session via React state.
  }
}
