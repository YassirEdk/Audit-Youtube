/**
 * The static content pages — everything on the site that is a *document*
 * rather than the app.
 *
 * These exist for one reason: /Home is a tool, and a tool page can only rank
 * for one thing. The queries people actually type ("free youtube channel audit
 * tool", "vidiq alternative", "how do I analyse a competitor's channel") are
 * separate intents, and a search engine has to be given a separate URL for
 * each one before it can rank them separately.
 *
 * They are plain HTML with no React and no bundle. A document that never
 * changes after the build has nothing to hydrate, and shipping 200KB of app to
 * render four paragraphs would cost the load time that is itself a ranking
 * input. The trade is that these pages can't use the app's components — hence
 * the self-contained CSS below, which is deliberately a small subset of
 * App.css's look rather than an import of it.
 *
 * Prose here must NOT duplicate the FAQ answers in src/Landing.jsx. Two URLs
 * carrying the same paragraph compete with each other and Google picks one,
 * usually not the one you wanted. The FAQ entries were the starting point for
 * choosing these topics; the copy is written fresh.
 */

/**
 * Slugs are the URL. Changing one after it has been indexed throws away
 * whatever the old URL earned, so they are chosen to be the search phrase
 * itself and then left alone.
 *
 * `updated` is the sitemap's lastmod, and it is hand-written rather than
 * derived. The two automatic options both fail:
 *
 *   - the build date is what this used to be, and it made every URL claim to
 *     have changed on every deploy. Google discards lastmod site-wide when it
 *     disagrees with the page that often, which costs the one field in a
 *     sitemap it actually reads.
 *   - `git log -1 -- <file>` is accurate locally and wrong on Vercel, which
 *     builds from a shallow clone: with no history to search, every file
 *     resolves to the HEAD commit date. That is the build date again, arrived
 *     at by a route with no error message.
 *
 * So it is a fact about the copy, and only a human knows it. Move the date
 * when you meaningfully rewrite a page; leave it alone for a typo fix.
 */
export const PAGES = [
  {
    slug: 'free-youtube-channel-audit-tool',
    updated: '2026-07-22',
    title: 'Free YouTube Channel Audit Tool — No Login, No Extension',
    description:
      'A free YouTube channel audit tool for any public channel: a score out of 100, fourteen checks, and every recent video graded against its own median.',
    h1: 'A free YouTube channel audit tool, with nothing to install',
    lede:
      'Most tools that promise a free channel audit want a browser extension and your YouTube login before they show you anything. This one reads public data, so there is nothing to connect and nothing to trust it with.',
    blocks: [
      {
        h2: 'What you get without an account',
        html: `
          <p>Paste a handle and the score is computed immediately: the health
          score out of 100, the performance chart plotting each recent video
          against the channel's own median, and a sample of the fourteen-check
          breakdown. No email, no card, no extension.</p>
          <p>A free account — still free — unlocks the rest: all fourteen checks
          with the reasoning for each, scans of up to 100 videos instead of the
          preview depth, and the written report that turns the numbers into a
          list of things to change.</p>`,
      },
      {
        h2: 'Why "free" usually has a catch, and where this one is',
        html: `
          <p>The catch in most free audit tools is the extension. It sits in
          your browser, reads the pages you visit, and the audit is the reason
          you installed it. The catch here is narrower and worth stating
          plainly: this can only see what a logged-out visitor can see.</p>
          <p>Retention curves, click-through rate, impressions and traffic
          sources are behind the channel owner's login in YouTube Studio. No
          public tool can reach them, including this one. What is left —
          views, titles, descriptions, tags, captions, upload timing — is
          enough to find packaging and consistency problems, which is most of
          what a small channel is actually getting wrong.</p>`,
      },
      {
        h2: 'It works on channels you do not own',
        html: `
          <p>Because nothing is connected, there is no notion of "your"
          channel. Any public handle audits the same way, which is what makes
          a competitor audit possible at all. See
          <a href="/youtube-competitor-channel-analysis">competitor channel
          analysis</a> for what that is useful for.</p>`,
      },
    ],
    faq: [
      {
        q: 'What is the catch with a free channel audit?',
        a: 'Here it is the ceiling on what public data contains: no retention, click-through rate, impressions or traffic sources, because those need the owner’s Studio login. There is no trial timer, no card, and no extension collecting your browsing in exchange.',
      },
      {
        q: 'Do I need to install a browser extension?',
        a: 'No. The audit runs on the site itself. That is also why it can read a channel you have no relationship with — there is nothing in your browser or your account for it to depend on.',
      },
    ],
    related: ['how-the-youtube-channel-score-works', 'youtube-channel-audit-vs-vidiq-tubebuddy'],
  },

  {
    slug: 'youtube-channel-audit-vs-vidiq-tubebuddy',
    updated: '2026-07-22',
    title: 'vidIQ and TubeBuddy Alternative for a Quick Channel Audit',
    description:
      'A vidIQ and TubeBuddy alternative for YouTube channel audits: no extension, no connected account, and it works on channels you do not own.',
    h1: 'A vidIQ and TubeBuddy alternative for YouTube channel audits',
    lede:
      'vidIQ and TubeBuddy are channel-management suites. This is one feature of one of them, done without an install. Whether that is an upgrade depends entirely on what you came for.',
    blocks: [
      {
        h2: 'What they do that this does not',
        html: `
          <p>Keyword research, bulk tag and description editing, thumbnail
          A/B tests, publish scheduling, comment moderation, competitor
          tracking over time, and — the important one — the private Studio
          metrics that appear once you connect your account. If you want a
          tool you open every day to run a channel, that is what those
          products are, and this is not competing for the job.</p>`,
      },
      {
        h2: 'What this does that they make harder',
        html: `
          <p>Audit a channel in about ten seconds without installing anything
          or signing in to anything. That sounds like a small difference until
          you want to look at a channel that is not yours: a connected-account
          tool is built around <em>your</em> channel, and the competitor views
          are usually a paid tier.</p>
          <p>Here every check runs on public data, so a competitor's channel
          returns exactly the same audit as your own — same fourteen checks,
          same chart, same report.</p>`,
      },
      {
        h2: 'The honest trade',
        html: `
          <p>Those tools will show you retention and click-through rate once
          they are connected. This never will, because it never connects.
          If your question is "why did viewers leave at 0:40", you need
          Studio or a tool plugged into it. If your question is "which of
          these videos beat my typical video, and what do the ones that did
          have in common", public data answers it, and answers it for any
          channel.</p>`,
      },
    ],
    faq: [
      {
        q: 'Can this replace vidIQ or TubeBuddy?',
        a: 'Only if the audit was the part you used. Neither the keyword research, the bulk tag editing, the scheduling nor the connected-account Studio metrics have an equivalent here, and pretending otherwise would waste your time. As a second opinion you can run on any channel in ten seconds, it does a job those tools make slower.',
      },
      {
        q: 'Can I use both?',
        a: 'That is the usual case. Keep the suite pointed at your own channel for the private metrics, and use this for the channels you cannot connect — competitors, collaborators, and anything you are researching before you commit to a niche.',
      },
    ],
    related: ['free-youtube-channel-audit-tool', 'youtube-competitor-channel-analysis'],
  },

  {
    slug: 'how-the-youtube-channel-score-works',
    updated: '2026-07-22',
    title: 'How the YouTube Channel Health Score Is Calculated',
    description:
      'How the YouTube channel health score is calculated: fourteen checks totalling 100 points, scored against the channel\'s own median, not a global benchmark.',
    h1: 'How the YouTube channel health score is calculated',
    lede:
      'Every point is traceable to a named check. Nothing is weighted by a model, nothing is arbitrary, and anything the audit cannot observe is excluded rather than counted against you.',
    blocks: [
      {
        h2: 'Fourteen checks, fixed weights',
        html: `
          <p>The checks fall into five categories: channel setup (banner,
          About section, keywords, handle), video metadata (tags, title and
          description length, captions), upload consistency, hit rate, and
          engagement. Each check is worth a fixed number of points that sum to
          100. Passing earns the full amount, a partial pass earns half.</p>
          <p>Engagement carries the least weight of the five, and is skipped
          entirely when a channel hides its like counts — which is the general
          rule: an unobservable signal is removed from the denominator instead
          of scored as a failure. A channel is never punished for a setting
          that makes it unmeasurable.</p>`,
      },
      {
        h2: 'Why the comparison is your own median',
        html: `
          <p>A 10,000-view video is a triumph on one channel and a
          disappointment on another, so a global benchmark tells a small
          channel almost nothing except that it is small. Each video is
          graded against the median of the channel's own recent videos
          instead.</p>
          <p>Median rather than mean, specifically. One video that went viral
          drags a mean upward far enough that every normal video afterwards
          reads as a failure. The median ignores the outlier and keeps
          describing the typical video, which is the thing you are actually
          trying to beat.</p>`,
      },
      {
        h2: 'Hit rate, and what it is not',
        html: `
          <p>Hit rate is the share of recent videos that beat that median. It
          is a measure of consistency, not of scale: a channel where seven of
          twenty videos outperform is telling you something different from one
          where two do, regardless of subscriber count. It says nothing about
          whether the median itself is high — that is deliberate, and it is
          why the score is a health check rather than a ranking.</p>`,
      },
    ],
    faq: [
      {
        q: 'What happens to points for a check that cannot be measured?',
        a: 'The check leaves the total rather than scoring zero. A channel that hides its like counts is scored out of the remaining points, so the percentage still means "how much of what we could see was in order" instead of quietly penalising a privacy setting.',
      },
      {
        q: 'Is a score of 70 good?',
        a: 'It is a completeness figure, not a ranking, so read the checks rather than the number. Seventy with the setup and metadata checks failing is a much better position than seventy with those passing and the hit rate low — the first is an afternoon of work, the second is a content problem.',
      },
      {
        q: 'Does the score change if I do nothing?',
        a: 'Yes, slowly. Hit rate and upload consistency are measured over recent videos, so the window moves as you publish — or as you stop. The setup and metadata checks stay put until you change something.',
      },
    ],
    related: ['youtube-audit-for-small-channels', 'free-youtube-channel-audit-tool'],
  },

  {
    slug: 'youtube-competitor-channel-analysis',
    updated: '2026-07-22',
    title: 'How to Analyse a Competitor’s YouTube Channel',
    description:
      'How to analyse a competitor’s YouTube channel: which of their videos beat their own typical performance, and how their titles and tags are built.',
    h1: 'How to analyse a competitor’s YouTube channel',
    lede:
      'Every check works from public data, so a competitor audit reads exactly like your own. That symmetry is the point — you can compare two audits line by line.',
    blocks: [
      {
        h2: 'The question worth asking',
        html: `
          <p>"How many subscribers do they have" is the least useful thing you
          can learn about a competitor, and the easiest. The useful question is
          which of <em>their</em> videos beat <em>their</em> typical video —
          because those are the ones where the topic or the packaging did
          something, and the pattern across them is a hypothesis you can test
          on your own channel.</p>
          <p>The performance chart answers exactly that. The outliers above the
          median line are the list to study.</p>`,
      },
      {
        h2: 'What to look at once you have the outliers',
        html: `
          <p>Read their titles as a set. Length, whether the subject is named
          in the first three words, whether they use a number or a question,
          whether the outliers differ from the ordinary videos in any of
          those ways. Do the same for descriptions and tags — the audit
          reports all of it.</p>
          <p>Then look at their failures. A channel outperforming yours while
          skipping captions, keywords, or a filled-in About section is telling
          you those checks are not what is holding you back, and that your
          effort belongs on packaging instead.</p>`,
      },
      {
        h2: 'Comparing two audits',
        html: `
          <p>Run yours, run theirs, and compare the fourteen checks side by
          side. Where you both pass, the check is table stakes in your niche.
          Where they pass and you do not is your shortlist. Where you pass and
          they do not is either an advantage or evidence the check does not
          matter much here — the hit rates tell you which.</p>`,
      },
    ],
    faq: [
      {
        q: 'Will the competitor know I audited their channel?',
        a: 'No. It reads the same public pages any visitor to their channel sees. Nothing is sent to them, no account is involved, and there is no notification for it to trigger.',
      },
      {
        q: 'How many competitors is it worth auditing?',
        a: 'Three or four in the same niche and roughly the same size. One is an anecdote; a dozen is a spreadsheet you will not read. What you are looking for is a check that all of them pass and you do not, which shows up quickly and stops being informative after a handful.',
      },
      {
        q: 'Their score is lower than mine but they are bigger. Why?',
        a: 'Because the score measures a channel against itself, not against you. A large channel coasting on an existing audience can leave keywords, captions and descriptions undone and still outgrow you — which is useful information: it tells you those checks are not what decides outcomes in your niche.',
      },
    ],
    related: ['youtube-channel-audit-vs-vidiq-tubebuddy', 'how-the-youtube-channel-score-works'],
  },

  {
    slug: 'youtube-audit-for-small-channels',
    updated: '2026-07-22',
    title: 'A YouTube Channel Audit That Works for Small Channels',
    description:
      'A YouTube channel audit built for small channels: scored against your own median, never against creators a hundred times your size.',
    h1: 'A YouTube channel audit built for small channels',
    lede:
      'Most audit scores are a proxy for size. This one is not: subscriber count is only ever a denominator, and every performance comparison is against the channel itself.',
    blocks: [
      {
        h2: 'Why size-based scoring is useless early',
        html: `
          <p>A tool that grades your views against a global average will tell a
          400-subscriber channel it is failing, every week, forever. That is
          true and completely unactionable — it is a restatement of the
          subscriber count with extra steps.</p>
          <p>Grading against your own median asks a different question: is this
          video better than your normal video? That has a yes-or-no answer at
          any size, and the answer changes based on decisions you actually
          made.</p>`,
      },
      {
        h2: 'The checks that matter most early',
        html: `
          <p>Setup and metadata, and it is not close. A new channel usually has
          an empty About section, no channel keywords, default or missing
          captions, and descriptions of one line. Each of those is a check
          worth points, each takes minutes, and unlike "make a better video"
          each has a definite finished state.</p>
          <p>Upload consistency is the other one. It is measured as the typical
          gap between uploads rather than an average, so a single hiatus does
          not distort it — a channel that publishes fortnightly without fail
          scores better than one that published daily for a month and then
          stopped.</p>`,
      },
      {
        h2: 'What a low score means at this size',
        html: `
          <p>Usually that the free points have been left on the table, not that
          the videos are bad. Read
          <a href="/how-the-youtube-channel-score-works">how the score
          works</a> and the checklist in the results will separate the two:
          setup and metadata failures are the ones you can clear this
          afternoon.</p>`,
      },
    ],
    faq: [
      {
        q: 'My channel is new. Will the score just tell me I am small?',
        a: 'No. One check reads subscriber count — views per subscriber — and it uses the number as a denominator, so it asks whether your videos travel past your own audience, not whether that audience is big. A 400-subscriber channel whose median video reaches 80 people passes it, while a 400,000-subscriber channel averaging 9,000 views does not. Nothing else in the fourteen checks looks at size at all.',
      },
      {
        q: 'How many videos does a channel need to be audited?',
        a: 'Enough to have a median worth comparing against — a handful of published videos. The fewer the videos, the more the setup and metadata checks dominate the score, which is the right emphasis early on.',
      },
    ],
    related: ['how-the-youtube-channel-score-works', 'free-youtube-channel-audit-tool'],
  },

  {
    slug: 'youtube-channel-audit-checklist',
    updated: '2026-07-22',
    title: 'YouTube Channel Audit Checklist — 14 Checks, In Order',
    description:
      'A YouTube channel audit checklist you can work through in an afternoon: the fourteen checks, grouped by how quickly each one can actually be fixed.',
    h1: 'A YouTube channel audit checklist, ordered by what you can fix today',
    lede:
      'The audit reports all fourteen checks at once. This is the same list arranged differently — cheapest fixes first — because the order you do them in decides how much of it gets done.',
    blocks: [
      {
        h2: 'Do these first: they are finished when you say they are',
        html: `
          <p>Channel banner, About section, channel keywords, and a claimed
          handle. Every one of them has a definite end state, none of them
          depends on an audience, and all four together are usually the largest
          block of points a neglected channel is leaving unclaimed.</p>
          <p>They share a property nothing further down this list has: you can
          complete them. "Write a better title" is a judgement you will revisit
          forever; "the About section is no longer empty" is either true or it
          is not, and the audit will agree with you the moment it is.</p>`,
      },
      {
        h2: 'Then the per-video metadata',
        html: `
          <p>Tags, title length, description length, and captions. These are
          per-video rather than per-channel, so the work scales with your back
          catalogue — which is exactly why it is worth deciding how far back to
          go rather than starting at video one and stopping when bored.</p>
          <p>The honest answer is usually: fix the template going forward, then
          retrofit only the videos still bringing in views. An eighteen-month-old
          video nobody watches does not get rescued by a description, and the
          hour spent there buys more on the next upload.</p>`,
      },
      {
        h2: 'Last: the checks you cannot finish in an afternoon',
        html: `
          <p>Upload consistency, hit rate, engagement and views per subscriber.
          These are measured across recent videos, so no single edit moves them
          — they respond to a habit held for a couple of months, which is a
          different kind of work from the two sections above.</p>
          <p>Leaving them for last is not the same as ignoring them. They are
          the checks that describe whether the channel is working; the earlier
          ones only describe whether it is set up. See
          <a href="/how-the-youtube-channel-score-works">how the score is
          calculated</a> for what each is worth.</p>`,
      },
      {
        h2: 'What this checklist deliberately leaves out',
        html: `
          <p>Thumbnails. They are probably the single highest-leverage thing on
          a YouTube channel and there is no check for them here, because
          click-through rate lives in Studio and an image cannot be graded from
          the outside. A checklist that scored them would be guessing, and a
          guess dressed as a check is worse than an admitted gap.</p>`,
      },
    ],
    faq: [
      {
        q: 'How long does working through the checklist take?',
        a: 'The setup checks are an afternoon and the metadata template is another. The remaining four are not tasks at all — they are measurements of a habit, and they move over weeks or not at all.',
      },
      {
        q: 'Should I fix old videos or only new ones?',
        a: 'New ones, plus whichever old ones still earn views. The metadata on a video that stopped being recommended a year ago is not what is holding it back, and the same hour spent on your publishing template applies to every upload after it.',
      },
      {
        q: 'Do I need to re-run the audit after each fix?',
        a: 'Re-run it once you have finished a group, not after each edit. The setup and metadata checks update as soon as YouTube serves the change publicly; the consistency and hit-rate checks will not have moved yet regardless of what you did.',
      },
    ],
    related: ['how-the-youtube-channel-score-works', 'youtube-audit-for-small-channels'],
  },

  {
    slug: 'why-are-my-youtube-views-dropping',
    updated: '2026-07-22',
    title: 'Why Are My YouTube Views Dropping? What Public Data Can Tell You',
    description:
      'Why your YouTube views are dropping: how to tell a real decline from normal variance by comparing recent videos against your channel’s own median.',
    h1: 'Why your YouTube views are dropping — and how to check',
    lede:
      'The first question is not why. It is whether: most "my views are dropping" moments are a run of ordinary videos following an unusually good one, and that is a different problem with a different fix.',
    blocks: [
      {
        h2: 'Separate a decline from a return to normal',
        html: `
          <p>One video that travelled further than the rest resets your sense of
          what normal is. Every video after it reads as a failure, the graph in
          your head slopes downward, and nothing has actually changed.</p>
          <p>The performance chart is there to settle this: each recent video is
          plotted against the median of your own recent videos. If the last six
          sit around that line, you are not declining — you had one outlier and
          you are back where you were. If they sit consistently below a line
          that was itself falling, that is a decline, and it is worth reading
          the rest of this page.</p>`,
      },
      {
        h2: 'The three explanations public data can support',
        html: `
          <p><strong>Publishing gaps.</strong> The consistency check measures
          the typical interval between uploads. A gap several times longer than
          your usual one tends to show up in the videos that follow it, and it
          is the most common cause with the simplest fix.</p>
          <p><strong>Packaging drift.</strong> Compare the titles of the videos
          above your median against the ones below. If the outliers name the
          subject in the first few words and the recent ones open with a phrase
          that could belong to any video, that is a change you made without
          deciding to.</p>
          <p><strong>Topic drift.</strong> The videos that beat your median are
          a record of what your audience turned up for. A run of underperformers
          on a subject that does not appear anywhere in that list is not a
          mystery.</p>`,
      },
      {
        h2: 'What no public tool can tell you here',
        html: `
          <p>Whether the drop is impressions or click-through rate — whether
          YouTube stopped showing the videos, or kept showing them and people
          stopped clicking. Those two have opposite fixes and the number that
          separates them is in Studio, behind the channel owner's login.</p>
          <p>So treat everything above as narrowing the field rather than
          answering the question. It is worth doing first because it is free and
          takes ten seconds, and because a publishing gap explains a great many
          of these without needing the private numbers at all.</p>`,
      },
    ],
    faq: [
      {
        q: 'Is a drop in views after one viral video normal?',
        a: 'Yes, and it is the single most common version of this. A video that reaches far beyond your subscriber base brings viewers who came for that one thing, and the next upload returns to your usual audience. Compare against your median rather than against the outlier and the shape of it stops looking like a decline.',
      },
      {
        q: 'Can this tell me if I was hit by an algorithm change?',
        a: 'No, and be sceptical of anything that claims to. What it can show is whether your recent videos moved relative to your own median and whether anything in your publishing pattern changed at the same time — which is usually the more actionable of the two answers anyway.',
      },
      {
        q: 'How many recent videos should I look at?',
        a: 'Enough that one outlier cannot dominate — a couple of dozen where the channel has them. Judging a trend from the last three videos is how a normal week gets mistaken for a collapse.',
      },
    ],
    related: ['how-the-youtube-channel-score-works', 'youtube-competitor-channel-analysis'],
  },

  {
    slug: 'how-often-should-i-upload-to-youtube',
    updated: '2026-07-22',
    title: 'How Often Should I Upload to YouTube? What Consistency Measures',
    description:
      'How often to upload to YouTube: why the interval between uploads matters more than the frequency, and how the consistency check actually scores it.',
    h1: 'How often should you upload to YouTube?',
    lede:
      'There is no correct number, and any tool that gives you one is selling something. What the audit measures is narrower and more useful: whether your uploads arrive at an interval at all.',
    blocks: [
      {
        h2: 'The check measures the gap, not the rate',
        html: `
          <p>Upload consistency is scored from the typical gap between your
          uploads — the median interval, not the average. That distinction is
          the whole design: a mean is dragged around by one long hiatus, so a
          channel that published weekly for a year and then took two months off
          would score as though it had never had a rhythm.</p>
          <p>The median ignores the hiatus and keeps describing the ordinary
          week. A channel publishing every fortnight without fail scores better
          here than one that published daily for a month and then stopped, and
          that ordering is deliberate.</p>`,
      },
      {
        h2: 'Why more often is not automatically better',
        html: `
          <p>The advice to upload more assumes the extra videos are as good as
          the ones you were already making. Where that holds, it works. Where it
          does not, you have moved your own median downward — and since every
          video is graded against that median, you have also made your hit rate
          harder to read.</p>
          <p>Pick the shortest interval you can hold without the quality moving,
          then hold it. That sentence is doing all the work: the number is
          yours, the holding is the part being measured.</p>`,
      },
      {
        h2: 'What a broken rhythm looks like in the audit',
        html: `
          <p>Two things move together. The consistency check drops, and the
          videos published after a long gap tend to sit below the median on the
          performance chart. Seeing both at once is a stronger signal than
          either alone, and it is the most common pattern behind
          <a href="/why-are-my-youtube-views-dropping">a run of
          underperforming videos</a>.</p>
          <p>What the audit cannot tell you is whether the gap caused the drop
          or both followed from something else — a job, a burnout, a change of
          subject. Public data shows the correlation and stops there.</p>`,
      },
    ],
    faq: [
      {
        q: 'Is once a week the right upload schedule?',
        a: 'It is a common answer, not a correct one. The check does not reward any particular frequency — it rewards the interval being predictable. Once a fortnight held for a year scores better than once a week held for six weeks.',
      },
      {
        q: 'Will taking a break destroy my score?',
        a: 'Not immediately, because the interval is a median: one gap among many normal ones barely moves it. A gap that becomes the new normal does, which is the distinction the median exists to draw.',
      },
      {
        q: 'Does upload frequency affect the other checks?',
        a: 'Indirectly. Hit rate and the performance chart are computed over recent videos, so publishing rarely means a smaller sample and a noisier answer. The setup and metadata checks do not care how often you upload.',
      },
    ],
    related: ['youtube-channel-audit-checklist', 'youtube-audit-for-small-channels'],
  },
]

const BY_SLUG = Object.fromEntries(PAGES.map((p) => [p.slug, p]))

/**
 * Escapes text destined for an HTML attribute or a text node. The prose in
 * `blocks` is trusted markup by design; everything interpolated anywhere else
 * goes through this.
 */
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * A subset of App.css, inlined rather than linked.
 *
 * Inlined because it is under 2KB and a linked stylesheet is a second
 * round-trip before the page can paint. A subset rather than the built
 * app CSS because that file is hashed per build and scoped to component
 * class names these pages don't use — importing it would couple the
 * documents to the app's markup for no gain.
 */
const CSS = `
:root{color-scheme:dark;--bg:#0f0f0f;--surface:#212121;--text:#f1f1f1;--text-2:#aaa;--border:#303030;--blue:#3ea6ff;--font:Roboto,"Segoe UI",Arial,system-ui,sans-serif}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font);line-height:1.65;-webkit-font-smoothing:antialiased}
.wrap{max-width:720px;margin:0 auto;padding:32px 20px 80px}
nav.top{display:flex;align-items:center;gap:16px;font-size:14px;padding-bottom:28px;border-bottom:1px solid var(--border);margin-bottom:36px}
nav.top a{color:var(--text-2)}
nav.top a:hover{color:var(--text)}
a{color:var(--blue);text-decoration:none}
a:hover{text-decoration:underline}
h1{font-size:clamp(28px,5vw,40px);line-height:1.2;letter-spacing:-.02em;margin:0 0 16px}
h2{font-size:22px;letter-spacing:-.01em;margin:44px 0 12px}
h3{font-size:16px;margin:28px 0 8px}
p{margin:0 0 16px}
.lede{font-size:18px;color:var(--text-2);margin-bottom:8px}
.cta{display:inline-block;background:var(--text);color:#0f0f0f;font-weight:500;font-size:15px;padding:11px 20px;border-radius:999px;margin:24px 0}
.cta:hover{text-decoration:none;opacity:.88}
.faq{margin-top:8px}
.faq details{border-top:1px solid var(--border);padding:14px 0}
.faq summary{cursor:pointer;font-weight:500;list-style:none}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";float:right;color:var(--text-2)}
.faq details[open] summary::after{content:"\\2212"}
.faq p{margin:12px 0 0;color:var(--text-2)}
.related{margin-top:56px;padding-top:24px;border-top:1px solid var(--border);font-size:15px}
.related ul{margin:0;padding-left:18px}
.related li{margin-bottom:6px}
footer{margin-top:56px;padding-top:24px;border-top:1px solid var(--border);font-size:13px;color:var(--text-2)}
`

/**
 * Renders one page to a complete HTML document.
 *
 * `site` is the absolute origin — the same value prerender.mjs uses for the
 * app's canonical tag. Every URL emitted here is absolute for the same reason
 * it is there: a relative canonical or og:image is worse than none at all.
 */
export function renderPage(page, site) {
  const url = `${site}/${page.slug}`

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: page.h1,
      description: page.description,
      url,
      mainEntityOfPage: url,
      publisher: { '@type': 'Organization', name: 'Channel Audit', url: `${site}/Home` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Channel Audit', item: `${site}/Home` },
        { '@type': 'ListItem', position: 2, name: page.h1, item: url },
      ],
    },
    // Only when the page has its own questions — a FAQPage block with entries
    // that aren't on the page is the exact thing Google penalises.
    page.faq?.length && {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ].filter(Boolean)

  const related = (page.related || [])
    .map((slug) => BY_SLUG[slug])
    .filter(Boolean)
    .map((p) => `<li><a href="/${p.slug}">${esc(p.h1)}</a></li>`)
    .join('\n        ')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Channel Audit" />
    <meta property="og:title" content="${esc(page.title)}" />
    <meta property="og:description" content="${esc(page.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${site}/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(page.title)}" />
    <meta name="twitter:description" content="${esc(page.description)}" />
    <meta name="twitter:image" content="${site}/og.png" />
${schema.map((s) => `    <script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
    <style>${CSS}</style>
  </head>
  <body>
    <div class="wrap">
      <nav class="top">
        <a href="/Home">← Channel Audit</a>
      </nav>
      <h1>${esc(page.h1)}</h1>
      <p class="lede">${esc(page.lede)}</p>
      <a class="cta" href="/Home">Audit a channel — free</a>
${page.blocks.map((b) => `      <h2>${esc(b.h2)}</h2>\n${b.html.trim()}`).join('\n')}
${
  page.faq?.length
    ? `      <h2>Questions</h2>
      <div class="faq">
        ${page.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n        ')}
      </div>`
    : ''
}
      <a class="cta" href="/Home">Audit a channel — free</a>
${related ? `      <div class="related">\n        <p>Related</p>\n        <ul>\n        ${related}\n        </ul>\n      </div>` : ''}
      <footer>
        <a href="/Home">Channel Audit</a> — a free YouTube channel audit from public data.
      </footer>
    </div>
  </body>
</html>
`
}
