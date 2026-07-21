/**
 * Renders scripts/og-image.html to public/og.png — the 1200x630 social card.
 *
 * Deliberately not part of `npm run build`: the card changes when the pitch
 * changes, which is a handful of times a year, and wiring a headless browser
 * into every deploy would trade a real dependency for that. Run it by hand
 * (`npm run og`) after editing the HTML, and commit the PNG.
 *
 * Chrome's own --screenshot flag does the work, so there's no Puppeteer or
 * Playwright install behind this — just a browser the machine already has.
 */

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')

// First match wins. macOS and Linux paths are here too so this isn't a
// Windows-only script the moment someone else clones the repo.
const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]

const chrome = CANDIDATES.find((p) => p && existsSync(p))

if (!chrome) {
  console.error('og: no Chrome or Edge found. Set CHROME_PATH to the binary and re-run.')
  process.exit(1)
}

const out = resolve(root, 'public/og.png')

execFileSync(chrome, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  // Without this a HiDPI machine renders at 2x and emits a 2400x1260 image,
  // which no longer matches the og:image:width we publish.
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  `--screenshot=${out}`,
  resolve(root, 'scripts/og-image.html'),
])

console.log(`og: wrote ${out}`)
