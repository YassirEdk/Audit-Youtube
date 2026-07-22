import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { PAGES, renderPage } from './scripts/pages.mjs'

/**
 * Serves the static content pages in dev.
 *
 * They're written to dist/<slug>/index.html at build time, so in dev they
 * don't exist and the SPA fallback hands back index.html instead — the app
 * boots, useRoute rewrites the path to /Home, and a click on a guide link
 * looks like it did nothing. This renders them from the same PAGES array the
 * build uses, ahead of the fallback.
 */
function contentPages() {
  const bySlug = Object.fromEntries(PAGES.map((p) => [p.slug, p]))

  return {
    name: 'content-pages',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const slug = req.url.split('?')[0].replace(/^\/|\/$/g, '')
        const page = bySlug[slug]
        if (!page) return next()
        res.setHeader('Content-Type', 'text/html')
        res.end(renderPage(page, `http://localhost:${server.config.server.port ?? 5173}`))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contentPages()],
  server: {
    // Keeps dev same-origin like production, so no CORS config is needed.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
