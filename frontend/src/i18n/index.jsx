/**
 * Translation lookup, and the one place that decides what language the page is
 * in.
 *
 * The rule that everything else follows from: **the URL is authoritative**. A
 * visitor at /fr/Home sees French, a visitor at /Home sees English, and
 * nothing — not a stored preference, not Accept-Language — overrides that.
 *
 * The tempting alternative is to detect the browser language and redirect. It
 * is worth being explicit about why that is not done, because it looks like
 * the friendlier behaviour:
 *
 *   - Googlebot crawls from the US with an English Accept-Language. A site
 *     that redirects on that header serves it English at every URL, so the
 *     translated pages are never seen and never indexed. This is the single
 *     most common way a multilingual site quietly fails.
 *   - A shared link stops meaning one thing. /fr/Home sent to an English
 *     speaker would render in English, which makes the link unquotable.
 *
 * So detection is advisory only: it decides which language the switcher
 * suggests first, never what the page renders.
 */

import { createContext, useContext, useEffect, useMemo } from 'react'
import { DEFAULT_LOCALE, LOCALES } from './locales.js'
import { en } from './catalogues/en.js'
import { fr } from './catalogues/fr.js'
import { es } from './catalogues/es.js'
import { pt } from './catalogues/pt.js'
import { ar } from './catalogues/ar.js'

const CATALOGUES = { en, fr, es, pt, ar }

const I18nContext = createContext(null)

/**
 * Fills {placeholders} in a string.
 *
 * Deliberately not a template literal in the catalogue: a catalogue entry has
 * to be inert data so it can be translated, checked and eventually shipped as
 * JSON without becoming executable.
 */
function interpolate(str, vars) {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (whole, key) =>
    Object.hasOwn(vars, key) ? String(vars[key]) : whole,
  )
}

export function I18nProvider({ locale, children }) {
  // Keeps <html lang> and <html dir> in step with the rendered language.
  //
  // `lang` is what a screen reader reads to choose a voice, and what Google
  // uses to confirm the page is in the language its hreflang claims. `dir` is
  // what flips the whole layout for Arabic — see the [dir="rtl"] block in
  // App.css. Both belong on the element, not on a wrapper div: a dialog or a
  // portal rendered outside #root would otherwise inherit neither.
  useEffect(() => {
    const { htmlLang, dir } = LOCALES[locale] ?? LOCALES[DEFAULT_LOCALE]
    document.documentElement.lang = htmlLang
    document.documentElement.dir = dir
  }, [locale])

  const value = useMemo(() => {
    const catalogue = CATALOGUES[locale] ?? en
    const meta = LOCALES[locale] ?? LOCALES[DEFAULT_LOCALE]

    /**
     * Looks up a key, falling back to English and then to the key itself.
     *
     * Falling back rather than throwing is the right trade for a translation
     * miss: an untranslated string is a blemish, a blank page is an outage,
     * and the two failures are not close to equivalent. The dev-only warning
     * below is what stops the blemish from being invisible.
     */
    const t = (key, vars) => {
      let str = catalogue[key]
      if (str === undefined) {
        str = en[key]
        if (import.meta.env.DEV && locale !== DEFAULT_LOCALE) {
          console.warn(`i18n: no "${locale}" translation for "${key}"`)
        }
      }
      if (str === undefined) {
        if (import.meta.env.DEV) console.warn(`i18n: unknown key "${key}"`)
        return key
      }
      return interpolate(str, vars)
    }

    /**
     * Like `t`, but falls back to a caller-supplied string rather than to the
     * key.
     *
     * The checklist rows are built by the API, which can ship a new check
     * before the catalogues here know about it. In that window `t` would render
     * the raw key — "check.label.shorts" — while the response already carries a
     * perfectly good English label for the same row. So the server's own prose
     * is the last resort, and an unrecognised check degrades to English instead
     * of to debug output.
     *
     * No dev warning: unlike `t`, a miss here is an expected state during a
     * deploy, not a translator's oversight.
     */
    const tOr = (key, fallback, vars) => {
      const str = catalogue[key] ?? en[key]
      return str === undefined ? fallback : interpolate(str, vars)
    }

    // Numbers are localised separately from strings because they aren't
    // translated at all — 1,234 is 1 234 in French and ١٢٣٤ or 1.234 elsewhere,
    // and none of that belongs in a catalogue a translator edits.
    const formatNumber = (n, options) =>
      new Intl.NumberFormat(meta.numberLocale, options).format(n)

    return { locale, dir: meta.dir, t, tOr, formatNumber }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}

/** The common case — `const t = useT()` — so components don't destructure. */
export function useT() {
  return useI18n().t
}
