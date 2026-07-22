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
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { PAGES, renderPage } from './pages.mjs'

/**
 * When the landing copy last meaningfully changed — the sitemap's lastmod for
 * /Home, and the one date the PAGES entries can't supply.
 *
 * Hand-written for the reason explained at length in pages.mjs: the build date
 * makes every URL claim a change on every deploy, which is how you lose the
 * only sitemap field Google reads. Bump it when the hero, the checklist, the
 * FAQ or the steps in src/Landing.jsx change — not for a style tweak.
 */
const HOME_UPDATED = '2026-07-22'

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

  // Landing.jsx keeps its own copy of the slugs (see the GUIDES comment there).
  // This is what stops the two drifting: a content page nobody links to gets
  // crawled once and treated as filler, and that failure is invisible for
  // weeks, so it's worth failing the build over.
  const orphans = PAGES.filter((p) => !html.includes(`href="/${p.slug}"`))
  if (orphans.length) {
    throw new Error(
      `prerender: no link from the landing page to ${orphans.map((p) => p.slug).join(', ')} — ` +
        'add them to GUIDES in src/Landing.jsx',
    )
  }

  let out = index.replace('<div id="root"></div>', `<div id="root">${html}</div>`)

  // The canonical origin. Everything below needs an absolute URL: a canonical
  // tag, an og:image or a sitemap with a relative path is worse than none.
  //
  // Defaulted rather than required, because the cost of getting it wrong is
  // silent — a build with no SITE_URL used to ship no sitemap and no canonical
  // at all, and nothing in the output said the site had gone unindexed.
  // Override it in the Vercel project settings when a real domain replaces the
  // vercel.app one.
  const site = (process.env.SITE_URL || 'https://audit-youtube.vercel.app').replace(/\/$/, '')

  if (site) {
    // What a crawler and a link preview should treat as *the* URL. Without the
    // canonical, the same page reachable as /, /Home and any *.vercel.app
    // alias competes with itself and the ranking is split across duplicates.
    //
    // og:image is absolute for the same reason and one more: X, Slack and
    // WhatsApp fetch it from their own servers, where a relative path resolves
    // to nothing and the card falls back to a blank rectangle.
    const head = [
      `<link rel="canonical" href="${site}/Home" />`,
      `<meta property="og:url" content="${site}/Home" />`,
      `<meta property="og:image" content="${site}/og.png" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta name="twitter:image" content="${site}/og.png" />`,
      // Says what the thing *is* in Google's own vocabulary. The FAQPage block
      // is emitted by Landing.jsx from the FAQ it renders; this is the piece
      // that has no visible counterpart, so it belongs in the head.
      `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Channel Audit',
        url: `${site}/Home`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        description:
          'Score any YouTube channel against its own median performance. Fourteen public-data checks on titles, descriptions, tags and upload habits.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      })}</script>`,
    ]

    out = out.replace('</head>', `  ${head.join('\n  ')}\n  </head>`)

    // The content pages, each written as dist/<slug>/index.html rather than
    // dist/<slug>.html. Both are served at /<slug>, but the flat form needs
    // `cleanUrls` in vercel.json to drop the extension, and that setting is
    // global: it would also 308 /google0dc7bb17817a1e0d.html, the Search
    // Console verification file, which has to keep resolving at its exact URL
    // or the property silently un-verifies. A directory index needs no
    // setting at all.
    //
    // The catch-all rewrite to index.html in vercel.json doesn't swallow
    // these: rewrites are only consulted after the filesystem check misses.
    for (const page of PAGES) {
      const dir = resolve(root, `dist/${page.slug}`)
      mkdirSync(dir, { recursive: true })
      writeFileSync(resolve(dir, 'index.html'), renderPage(page, site))
    }

    // One entry per URL that actually resolves to distinct content. Generated
    // from the same PAGES array the documents come from, so a page can never
    // ship unlisted and the sitemap can never list a 404.
    //
    // loc and lastmod only. <changefreq> and <priority> used to be here and
    // were removed rather than tuned: Google states outright that it ignores
    // both, and Bing does the same with priority. A priority of 1.0 on the app
    // and 0.7 on the guides described an intention no crawler ever read, which
    // made this file look like it was doing more work than it was.
    const urls = [
      { loc: `${site}/Home`, lastmod: HOME_UPDATED },
      ...PAGES.map((p) => ({ loc: `${site}/${p.slug}`, lastmod: p.updated })),
    ]

    // A date the sitemap spec rejects is worse than no date: the whole file can
    // be thrown out, and Search Console reports it days later if at all. The
    // dates are hand-written, so this is the only thing standing between a
    // typo and a silently unparsed sitemap.
    for (const u of urls) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(u.lastmod || '') || Number.isNaN(Date.parse(u.lastmod))) {
        throw new Error(
          `prerender: ${u.loc} has lastmod "${u.lastmod}" — must be a real YYYY-MM-DD date. ` +
            'Set `updated` in scripts/pages.mjs.',
        )
      }
    }

    writeFileSync(
      resolve(root, 'dist/sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`,
    )
  }

  writeFileSync(
    resolve(root, 'dist/robots.txt'),
    // Results pages are per-channel and infinite — every handle anyone types
    // is a new URL. Letting a crawler wander them wastes the crawl budget that
    // should go to the pages you actually want ranked, so the query string is
    // disallowed by pattern rather than the bare path, which has to stay open.
    `User-agent: *
Disallow: /api/
Disallow: /*?channel=
${site ? `\nSitemap: ${site}/sitemap.xml\n` : ''}`,
  )

  writeFileSync(indexPath, out)
  console.log(`prerender: injected ${html.length.toLocaleString()} chars of static HTML`)
  console.log(
    site
      ? `prerender: canonical + ${PAGES.length} content pages + sitemap for ${site}`
      : 'prerender: SITE_URL not set — no canonical tag, content pages or sitemap written',
  )
} finally {
  rmSync(outDir, { recursive: true, force: true })
}
