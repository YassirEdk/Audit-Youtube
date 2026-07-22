/**
 * Fails the build when a translation catalogue has drifted from en.js.
 *
 * This exists because every failure mode here is silent. A missing key renders
 * the English fallback, a stray {placeholder} renders as literal braces in the
 * middle of a sentence, and a key deleted from en.js but left in fr.js is dead
 * weight nobody will ever notice. None of it throws, none of it shows up in a
 * test, and all of it is visible to the person least able to report it — a
 * reader in a language the author doesn't speak.
 *
 * Run by `npm run build` before vite, so a bad catalogue can't ship.
 */

import { en } from '../src/i18n/catalogues/en.js'
import { fr } from '../src/i18n/catalogues/fr.js'
import { es } from '../src/i18n/catalogues/es.js'
import { pt } from '../src/i18n/catalogues/pt.js'
import { ar } from '../src/i18n/catalogues/ar.js'

const CATALOGUES = { fr, es, pt, ar }

const baseKeys = Object.keys(en)

/** The set of {placeholders} in a string, order-insensitive. */
const placeholders = (s) => (String(s).match(/\{(\w+)\}/g) || []).sort().join(',')

const problems = []
const warnings = []

for (const [name, catalogue] of Object.entries(CATALOGUES)) {
  for (const key of baseKeys) {
    if (!Object.hasOwn(catalogue, key)) {
      problems.push(`${name}: missing key "${key}"`)
      continue
    }
    // A placeholder mismatch is the one that corrupts a sentence rather than
    // just leaving it in English: {n} dropped in translation means the number
    // never appears, and {m} invented means a literal "{m}" on the page.
    if (placeholders(en[key]) !== placeholders(catalogue[key])) {
      problems.push(
        `${name}: "${key}" placeholders differ — en has [${placeholders(en[key])}], ` +
          `${name} has [${placeholders(catalogue[key])}]`,
      )
    }
  }

  for (const key of Object.keys(catalogue)) {
    if (!Object.hasOwn(en, key)) {
      problems.push(`${name}: key "${key}" is not in en.js — rename or delete it`)
    }
  }

  // Not an error: some strings legitimately don't change (proper nouns, "FAQ").
  // Worth printing, because a whole block of identical values usually means a
  // section was skipped rather than deliberately left alone.
  const identical = baseKeys.filter(
    (k) => catalogue[k] === en[k] && String(en[k]).length > 12,
  )
  if (identical.length) {
    warnings.push(`${name}: ${identical.length} value(s) identical to English`)
    for (const k of identical) warnings.push(`    ${k}`)
  }
}

for (const w of warnings) console.warn(`i18n warning: ${w}`)

if (problems.length) {
  for (const p of problems) console.error(`i18n error: ${p}`)
  console.error(`\ncheck-i18n: ${problems.length} problem(s)`)
  process.exit(1)
}

console.log(
  `check-i18n: ${baseKeys.length} keys × ${Object.keys(CATALOGUES).length + 1} languages — OK`,
)
