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
- `dist/sitemap.xml` and `dist/robots.txt`

The social card at `frontend/public/og.png` is committed, not built. Edit
`frontend/scripts/og-image.html` and run `npm run og` to regenerate it.

## Manual — nothing gets indexed until these are done

1. **Google Search Console.** Add the property at
   <https://search.google.com/search-console>, verify it (the HTML-tag method
   works: paste the meta tag into `frontend/index.html`, deploy, verify), then
   submit `sitemap.xml` under Sitemaps. Use *URL Inspection → Request indexing*
   on `/Home` once to skip the initial wait.
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
