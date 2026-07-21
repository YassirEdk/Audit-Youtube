/**
 * Runs after `vite build`: renders the landing page and injects it into
 * dist/index.html so crawlers get real HTML.
 *
 * The markup goes inside #root. React replaces it on mount — the content is
 * identical, so a visitor sees the same page either way, just sooner. That
 * "sooner" is the other half of the win: the copy paints before the bundle
 * has finished downloading.
 */

import { build } from 'vite'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const outDir = resolve(root, '.prerender-tmp')

// Browser globals touched during render. depth.js already guards localStorage
// with try/catch, but a missing `window` would throw before it gets there.
globalThis.window = globalThis
globalThis.localStorage = { getItem: () => null, setItem: () => {} }
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })

try {
  await build({
    root,
    logLevel: 'error',
    build: {
      ssr: resolve(root, 'prerender.jsx'),
      outDir,
      emptyOutDir: true,
      // Keep node_modules external; only our own code needs bundling.
      rollupOptions: { output: { entryFileNames: 'prerender.mjs' } },
    },
  })

  const { render } = await import(`file://${resolve(outDir, 'prerender.mjs')}`)
  const html = render()

  const indexPath = resolve(root, 'dist/index.html')
  const index = readFileSync(indexPath, 'utf8')

  if (!index.includes('<div id="root"></div>')) {
    throw new Error('dist/index.html has no empty #root to fill — did the template change?')
  }

  let out = index.replace('<div id="root"></div>', `<div id="root">${html}</div>`)

  // SITE_URL is the canonical origin, e.g. https://ytaudit.com — set it in the
  // Vercel project settings. Everything below needs an absolute URL: a
  // canonical tag or a sitemap with a relative path is worse than none.
  const site = (process.env.SITE_URL || '').replace(/\/$/, '')

  if (site) {
    // Tells Google which URL is the real one. Without it, the same page
    // reachable as /, /Home and a *.vercel.app alias competes with itself and
    // the ranking is split across the duplicates.
    out = out.replace('</head>', `  <link rel="canonical" href="${site}/Home" />\n  </head>`)
    writeFileSync(
      resolve(root, 'dist/sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}/Home</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
    )
  }

  writeFileSync(
    resolve(root, 'dist/robots.txt'),
    // Results pages are per-channel and infinite — every handle anyone types
    // is a new URL. Letting a crawler wander them wastes the crawl budget that
    // should go to the page you actually want ranked.
    `User-agent: *
Allow: /$
Allow: /Home
Disallow: /api/
${site ? `\nSitemap: ${site}/sitemap.xml\n` : ''}`,
  )

  writeFileSync(indexPath, out)
  console.log(`prerender: injected ${html.length.toLocaleString()} chars of static HTML`)
  console.log(
    site
      ? `prerender: canonical + sitemap for ${site}`
      : 'prerender: SITE_URL not set — no canonical tag or sitemap written',
  )
} finally {
  rmSync(outDir, { recursive: true, force: true })
}
