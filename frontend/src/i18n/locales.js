/**
 * The languages the site ships in, and everything that varies per language
 * other than the strings themselves.
 *
 * English has no URL prefix and never will. It was indexed at /Home and at the
 * eight content slugs before this existed, and moving an indexed URL throws
 * away whatever it earned (see SEO.md). So English is the bare path and every
 * other locale is a prefix on top of it — which is also the shape Google's
 * documentation assumes when it talks about hreflang.
 *
 * `dir` is here rather than inferred from the code because it drives both the
 * <html dir> attribute and the CSS: Arabic is the only right-to-left locale
 * now, but a hard-coded `code === 'ar'` test scattered through the app would
 * be the thing that breaks when Hebrew or Farsi is added.
 */

export const DEFAULT_LOCALE = 'en'

export const LOCALES = {
  en: {
    code: 'en',
    // What goes in <html lang>. Deliberately different from `code` for the
    // regional variants: the URL prefix stays short (/pt), while crawlers and
    // screen readers get the specific tag they need to pick a voice and a
    // hyphenation dictionary.
    htmlLang: 'en',
    dir: 'ltr',
    // The language's own name for itself. Never translated — a switcher that
    // says "Arabic" to an Arabic speaker is useless to the person who needs it.
    label: 'English',
    // BCP-47 tag for Intl.NumberFormat. Number grouping differs from the
    // htmlLang default in Spanish and Portuguese, so this is stated too.
    numberLocale: 'en-US',
  },
  fr: {
    code: 'fr',
    htmlLang: 'fr',
    dir: 'ltr',
    label: 'Français',
    numberLocale: 'fr-FR',
  },
  es: {
    code: 'es',
    // es-419 is the CLDR subtag for Latin American Spanish, which is the
    // larger creator audience. It's a valid hreflang value and Google reads it.
    htmlLang: 'es-419',
    dir: 'ltr',
    label: 'Español',
    numberLocale: 'es-419',
  },
  pt: {
    code: 'pt',
    htmlLang: 'pt-BR',
    dir: 'ltr',
    label: 'Português',
    numberLocale: 'pt-BR',
  },
  ar: {
    code: 'ar',
    htmlLang: 'ar',
    dir: 'rtl',
    label: 'العربية',
    // Western digits rather than Eastern Arabic-Indic (٠١٢٣). Both are correct
    // Arabic; Western digits are what YouTube itself shows in Arabic, and a
    // subscriber count that doesn't match the one on the channel page reads as
    // a bug rather than as localisation.
    numberLocale: 'ar-EG-u-nu-latn',
  },
}

export const LOCALE_CODES = Object.keys(LOCALES)

/** Every locale except the default — i.e. the ones that carry a URL prefix. */
export const PREFIXED_CODES = LOCALE_CODES.filter((c) => c !== DEFAULT_LOCALE)

export const isLocale = (code) => Object.hasOwn(LOCALES, code)

/**
 * Splits a pathname into its locale and the path underneath it.
 *
 * `/fr/Home` → `{ locale: 'fr', rest: '/Home' }`
 * `/Home`    → `{ locale: 'en', rest: '/Home' }`
 *
 * An unknown first segment is not a locale, so `/Homer` stays whole rather
 * than being read as locale "Homer" with an empty rest.
 */
export function splitLocalePath(pathname) {
  const [, first, ...others] = pathname.split('/')
  if (!isLocale(first) || first === DEFAULT_LOCALE) {
    return { locale: DEFAULT_LOCALE, rest: pathname }
  }
  return { locale: first, rest: `/${others.join('/')}` }
}

/** The prefix to put in front of a path for a locale — '' for English. */
export const localePrefix = (locale) =>
  locale === DEFAULT_LOCALE ? '' : `/${locale}`

/**
 * Best guess at a visitor's language from the browser, used only when they
 * arrive at an unprefixed URL with no stored preference.
 *
 * Matches on the primary subtag, so pt-PT and pt-BR both land on `pt`. That is
 * a deliberate over-match: showing a Portuguese speaker the Brazilian copy is
 * a far smaller failure than showing them English.
 *
 * Never redirects — see the note in I18nProvider. This only picks a default.
 */
export function detectLocale(languages = navigator.languages || []) {
  for (const tag of languages) {
    const primary = String(tag).toLowerCase().split('-')[0]
    if (isLocale(primary)) return primary
  }
  return DEFAULT_LOCALE
}
