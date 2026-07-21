import { supabase } from './supabase.js'

/**
 * Every call to our own API, with the Supabase session attached.
 *
 * The server decides what a caller may have — audit depth, the written report,
 * the fixers — and it can only do that if it knows who is asking. Anything
 * bypassing this helper arrives anonymous and gets the free tier, which is the
 * safe default but not what a signed-in user paid for with their signup.
 *
 * getSession rather than a cached token: supabase-js refreshes in the
 * background, and a token read once at mount is stale by the time a long
 * report finishes streaming.
 */
export async function apiPost(path, body, signal) {
  const headers = { 'Content-Type': 'application/json' }

  try {
    const { data } = await supabase.auth.getSession()
    if (data.session?.access_token) {
      headers.Authorization = `Bearer ${data.session.access_token}`
    }
  } catch {
    // Unconfigured or unreachable Supabase. The call still goes out, just
    // anonymously — a broken session shouldn't block a free audit.
  }

  const res = await fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    // FastAPI puts the human-readable message in `detail`.
    const detail = await res.json().catch(() => null)
    throw new Error(detail?.detail || `Server returned ${res.status}`)
  }

  return res
}
