import { createClient } from '@supabase/supabase-js'

/**
 * The browser-side Supabase client.
 *
 * The anon key is public by design — it ships in the bundle and is safe there,
 * because every table's access is decided by row-level security on the server,
 * not by possession of the key. The service_role key is the opposite: it
 * bypasses RLS entirely, so it must never appear in anything Vite builds.
 */

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Both are read at build time, so a missing one fails silently at runtime as
// "login just doesn't work". Better to say so once, loudly, than to let every
// auth call reject with an opaque error.
export const isConfigured = Boolean(url && anonKey)

if (!isConfigured) {
  console.warn(
    'Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      'in frontend/.env, then restart the dev server. Login is disabled until then.',
  )
}

// A null client would mean null-checking at every call site. Falling back to a
// placeholder keeps the calls uniform; `isConfigured` is what the UI gates on.
export const supabase = isConfigured
  ? createClient(url, anonKey)
  : createClient('http://localhost', 'unconfigured')
