# Getting indexed

What the build already does, and the three things it can't do for you.

## Automatic (every deploy)

`frontend/scripts/prerender.mjs` runs after `vite build` and emits:

- the landing page as real HTML inside `#root`, so a crawler that doesn't run
  JavaScript still sees the copy
- `<link rel="canonical">`, `og:url`, `og:image` — absolute, pointing at
  `SITE_URL` (defaults to `https://audit-youtube.vercel.app`)
- `WebApplication` structured data in the head; `FAQPage` structured data comes
  from `Landing.jsx`, generated from the FAQ the page actually renders
- one static document per entry in `frontend/scripts/pages.mjs`, written as
  `dist/<slug>/index.html` — plain HTML, no React, each with its own title,
  canonical, OG tags and `Article`/`BreadcrumbList`/`FAQPage` schema
- `dist/sitemap.xml` (generated from that same list, so it can't list a 404 or
  omit a page) and `dist/robots.txt`

## Languages

The app ships in English, French, Spanish (es-419), Portuguese (pt-BR) and
Arabic. English is the bare `/Home`; every other language is a path prefix,
`/fr/Home` and so on. English was never moved, because it was indexed at
`/Home` and at the eight guide slugs before any of this existed.

Each locale gets a **prerendered** document at `dist/<code>/Home/index.html`
with its own `<html lang>`, `dir`, and canonical. That file has to exist: the
catch-all rewrite in `vercel.json` would otherwise serve the English
`index.html` at `/fr/Home`, a crawler would read English markup there, and
Google would drop the page from the hreflang cluster as a duplicate.

`hreflang` is emitted on all five, listing all five plus `x-default` → English.
Three rules make or break it, and the build satisfies all three by
construction: the set is identical on every page, every URL is absolute, and
each page lists itself.

**Nothing auto-redirects on `Accept-Language`.** This is deliberate and it is
the most common way a multilingual site quietly fails: Googlebot crawls from
the US with an English header, so a site that redirects on it serves English at
every URL and the translated pages are never indexed. The URL decides the
language; the switcher in the masthead is how a visitor changes it.

The eight guide pages are **English only**. They are ~5,200 words of copy whose
slugs are the keywords, and a translated slug is a keyword-research decision
rather than a translation — `/free-youtube-channel-audit-tool` ranks because it
is the phrase people type. The landing page links them with an explicit "in
English" note rather than pretending otherwise, and the sitemap lists each once.

UI strings live in `frontend/src/i18n/catalogues/`. `npm run check:i18n` (also
the first step of `npm run build`) fails on a missing key, an extra key, or a
`{placeholder}` that differs from English — every one of which is otherwise
invisible to whoever speaks the language least.

## Keywords

There is no `<meta name="keywords">` tag and there should never be one. Google
has ignored it since 2009 and has said so publicly; Bing treats it as a spam
signal. Its only remaining effect is to publish your target keyword list to any
competitor who opens view-source.

Keywords live in the copy instead. One page owns one query:

| URL | Primary query |
| --- | --- |
| `/Home` | youtube channel audit |
| `/free-youtube-channel-audit-tool` | free youtube channel audit tool |
| `/how-the-youtube-channel-score-works` | youtube channel health score |
| `/youtube-competitor-channel-analysis` | youtube competitor analysis |
| `/youtube-audit-for-small-channels` | youtube audit for small channels |
| `/youtube-channel-audit-vs-vidiq-tubebuddy` | vidiq / tubebuddy alternative |
| `/youtube-channel-audit-checklist` | youtube channel audit checklist |
| `/why-are-my-youtube-views-dropping` | why are my youtube views dropping |
| `/how-often-should-i-upload-to-youtube` | how often should i upload to youtube |

Two pages competing for one query is the failure mode to avoid — Google picks
one and it is rarely the one you wanted. That is the same rule as the "don't
reuse the FAQ answers" note below, applied to titles instead of paragraphs.

Exact-phrase matching is *not* required: "how to analyse a competitor's YouTube
channel" ranks for "youtube competitor analysis" without containing it. What
does matter is that the H1 names the subject, which is why every guide H1 says
"YouTube" even where it made the sentence slightly less elegant. Someone
arriving from a result page needs one glance to confirm they are in the right
place.

The landing H1 is the deliberate exception. "Find out what's holding your
channel back" carries no keyword and stays that way: the title tag already
holds the phrase, and the hero's job is to convert a visitor who has already
arrived.

## What the sitemap does and doesn't do

It is a discovery mechanism, not a ranking one. Listing a URL asks a crawler to
look; nothing in the file argues that it should rank.

Two fields you will see in every sitemap tutorial are absent on purpose.
Google's documentation states it ignores `<priority>` and `<changefreq>`
outright, and Bing ignores priority too. They were in this file until they
were removed — not tuned — because a priority of 1.0 made it look like the
build was expressing something a crawler would read.

`<lastmod>` is the field that is actually consumed, and only while it stays
honest: a sitemap whose dates move on every deploy gets its lastmod discarded
site-wide. So the dates are hand-written — `updated` per entry in `pages.mjs`,
`HOME_UPDATED` in `prerender.mjs` — rather than taken from the clock or from
git, which returns the deploy commit's date for every file on Vercel's shallow
clone. Move a date when you rewrite a page; leave it for a typo fix. A
malformed date fails the build.

## Adding a content page

Append to `PAGES` in `frontend/scripts/pages.mjs` (including `updated`), then
add the slug to `GUIDES` in `frontend/src/Landing.jsx`. The build fails if you
skip the second step: a page nothing links to gets crawled once and treated as
filler, and that failure is otherwise invisible for weeks.

Two rules the build can't check for you:

- **Don't reuse the FAQ answers from `Landing.jsx`.** Two URLs carrying the
  same paragraph compete, Google keeps one, and it is usually not the one you
  wanted. The FAQ is the summary; a content page is the long answer.
- **Never change a slug after it is indexed.** Whatever the old URL earned is
  thrown away. Pick the search phrase, then leave it alone.

The social card at `frontend/public/og.png` is committed, not built. Edit
`frontend/scripts/og-image.html` and run `npm run og` to regenerate it.

## Manual — nothing gets indexed until these are done

1. **Google Search Console.** Add the property at
   <https://search.google.com/search-console>, verify it (the HTML-tag method
   works: paste the meta tag into `frontend/index.html`, deploy, verify), then
   submit `sitemap.xml` under Sitemaps. Use *URL Inspection → Request indexing*
   on `/Home` and on each content page once to skip the initial wait.

   Ownership is currently proved by `public/google0dc7bb17817a1e0d.html`
   instead. That file must keep resolving at exactly that URL — it is why the
   content pages are directory indexes rather than `<slug>.html` with Vercel's
   `cleanUrls`, which would have redirected it and silently un-verified the
   property.
2. **Bing Webmaster Tools.** Same job, five minutes, and it imports directly
   from Search Console. Bing is also where ChatGPT search gets its results.
3. **A custom domain.** See below.

## On the vercel.app subdomain

`audit-youtube.vercel.app` will index, but it ranks with a handicap: it is a
subdomain of a host shared with millions of hobby deploys, it carries no links,
and it reads as disposable to both crawlers and people scanning results.

Buy the domain *before* you get indexed, not after. Migrating later means
redirects, a Search Console change-of-address, and weeks of re-crawling — all
of which is avoided entirely by doing it now. Once you have it: point it at the
Vercel project, set `SITE_URL` to it in the project's environment variables,
and redeploy.

## What can't be engineered

Google's autocomplete suggestions are a reflection of what large numbers of
people already search for. There is no tag, no schema and no setting that puts
you there — it follows an audience rather than creating one. The same is true
of ranking for a competitive term like "youtube channel audit": the technical
work above makes you *eligible*, and links and traffic decide the rest.
