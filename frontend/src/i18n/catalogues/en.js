/**
 * The source catalogue. Every other language is a translation of this file and
 * nothing else, so this is the one that defines the key set.
 *
 * Conventions that exist to keep translation possible:
 *
 *   - Keys are namespaced by where they appear (`results.`, `landing.hero.`).
 *     A translator sees them in the order the user does.
 *   - **Never concatenate.** "Fetching the last " + n + " videos" cannot be
 *     translated: the word order is different in Arabic and the noun inflects
 *     in French. Whole sentences with {placeholders} instead.
 *   - No markup in values. Where a sentence needs bold in the middle, it is
 *     split at the boundary the design requires (`.lead` / `.rest`) rather
 *     than carrying <b> that a translator could break.
 *   - Values are plain strings, never template literals, so this file stays
 *     inert data that could be exported to JSON for a translation tool.
 */

export const en = {
  // ---------- shared ----------
  'common.retry': 'Try again',
  'common.stop': 'Stop',
  'common.copy': 'Copy',
  'common.copied': 'Copied',
  'common.loading': 'Loading…',

  // ---------- masthead ----------
  'nav.home': 'Home',
  'nav.checks': 'Checklist',
  'nav.how': 'How it works',
  'nav.faq': 'FAQ',
  'nav.guides': 'Read more',
  'nav.brandAria': 'Channel Audit home',
  'nav.sectionsAria': 'Sections',
  'nav.donate': 'Donate',
  'nav.donateTitle': 'Support this project',
  'nav.login': 'Log in',
  'nav.signup': 'Sign up',
  'nav.account': 'Account',
  'nav.signOut': 'Sign out',

  // The switcher. `language` labels the control for screen readers; the
  // options themselves are never translated — see LOCALES.label.
  'nav.language': 'Language',
  'nav.languageAria': 'Choose a language',

  // ---------- app chrome ----------
  'app.title': 'YouTube Channel Audit — score any channel',
  'app.serverDown.lead': 'Server not running.',
  'app.serverDown.rest':
    'Start it by double-clicking {file}, then reload this page.',
  'app.footer':
    "Performance is scored against each channel's own median views, so one viral video doesn't make everything else look like a failure. Public data only — no retention, CTR, or traffic sources.",
  'app.search.another': 'Audit another channel',
  'app.search.ariaChannel': 'Channel to audit',
  'app.search.ariaSubmit': 'Audit channel',

  // ---------- report: stat tiles ----------
  'stats.subscribers': 'Subscribers',
  'stats.typical': 'Typical video',
  'stats.typicalUnit': 'views',
  'stats.beat': 'Beat that bar',
  'stats.beatUnit': 'of {n}',
  'stats.best': 'Best video',
  'stats.bestUnit': 'baseline',
  // The two qualifiers on the live ticker. "tracked" is the stronger word on
  // purpose: that rate came from the channel's own observed crossings, the
  // other is extrapolated from a lifetime average.
  'stats.trackedRate': 'tracked rate',
  'stats.roughEstimate': 'rough estimate',
  'stats.nearest': 'nearest {n}',
  'stats.live': 'Live',
  'stats.seeLive': 'See live',

  // ---------- report: sidebar ----------
  'side.aria': 'Audits',
  'side.home': 'Home',
  'side.favorites': 'My favorite',
  'side.recents': 'Recent audits',
  'side.locked.lead': 'Log in to save your history',
  'side.locked.rest': 'Keep every channel you audit, on any device.',
  'side.locked.cta': 'Log in',
  'side.removeFavorite': 'Remove {name} from favorites',
  'side.removeFavoriteShort': 'Remove from favorites',
  'side.removeHistory': 'Remove {name} from history',
  'side.removeHistoryShort': 'Remove from history',

  // ---------- report: performance chart ----------
  'chart.heading': "Every video vs. this channel's typical video",
  // "Right"/"left" are literal and stay literal in every language: the chart is
  // deliberately NOT mirrored in RTL (see the [dir="rtl"] block in App.css), so
  // the bars grow rightwards for an Arabic reader too and the sentence holds.
  'chart.sub': 'The line is normal for this channel. Right is better than normal, left is worse.',
  'chart.above': 'Above normal',
  'chart.below': 'Below normal',
  'chart.tooNew': 'Too new to judge',
  'chart.moreVideos': '{n} more videos',
  'chart.showTable': 'Show as table',
  'chart.colVideo': 'Video',
  'chart.colViews': 'Views',
  'chart.colVsNormal': 'vs. normal',
  'chart.colAge': 'Age',

  // ---------- report: inline fixers ----------
  'fixer.about.cta': 'Write one for me',
  'fixer.about.aria': 'Suggested About section',
  'fixer.about.hint': 'Paste into YouTube Studio → Customization → Basic info.',
  'fixer.drafting': 'Drafting…',
  'fixer.chars': '{n} characters',
  // Appended to the counter, so it opens with the dash that joins it on.
  'fixer.stillShort': '— still under 200',
  'fixer.copy': 'Copy',
  'fixer.copied': 'Copied',
  'fixer.retry': 'Try again',

  // ---------- report: checklist ----------
  // Keyed by the check id the API sends. A check added server-side without a
  // key here degrades to the English label already in the response, not to a
  // blank row — see tOr in i18n/index.jsx.
  'check.label.banner': 'Channel banner',
  'check.label.about': 'About section',
  'check.label.keywords': 'Channel keywords',
  'check.label.handle': 'Custom handle',
  'check.label.tags': 'Video tags',
  'check.label.descriptions': 'Video descriptions',
  'check.label.titles': 'Title length',
  'check.label.captions': 'Captions',
  'check.label.hd': 'HD uploads',
  'check.label.cadence': 'Upload consistency',
  'check.label.recency': 'Posting recency',
  'check.label.hit_rate': 'Hit rate',
  'check.label.reach': 'Views per subscriber',
  'check.label.engagement': 'Engagement',

  // The findings. Separate keys per outcome rather than one string with a
  // number in it: "every 1 days" is not a sentence, and "multiple a day" is a
  // different claim rather than a smaller gap.
  'check.detail.banner.set': 'Set',
  'check.detail.banner.none': 'No banner uploaded',
  'check.detail.about.chars': '{n} characters',
  'check.detail.about.empty': 'Empty',
  'check.detail.keywords.set': 'Set',
  'check.detail.keywords.none': 'None set',
  // The handle is a proper noun, rendered bare rather than in a sentence.
  'check.detail.handle.claimed': '{handle}',
  'check.detail.handle.none': 'Not claimed',
  'check.detail.tags.detail': '{pct}% of {n} videos have 3+ tags',
  'check.detail.descriptions.detail': '{pct}% are 250+ characters',
  'check.detail.titles.detail': '{pct}% fall in the 30–70 character range',
  'check.detail.captions.detail': '{pct}% have captions',
  'check.detail.hd.detail': '{pct}% are HD',
  'check.detail.cadence.daily': 'Multiple videos a day, typically',
  'check.detail.cadence.everyDay': 'A new video every day, typically',
  'check.detail.cadence.every': 'A new video every {n} days, typically',
  'check.detail.cadence.unknown': 'Not enough upload history to judge',
  'check.detail.recency.today': 'Published today',
  'check.detail.recency.day': 'Last upload 1 day ago',
  'check.detail.recency.days': 'Last upload {n} days ago',
  'check.detail.recency.none': 'No uploads found',
  'check.detail.hitRate.detail': "{pct}% of videos beat this channel's own median",
  'check.detail.reach.detail': 'The median video reaches {pct}% of the subscriber count',
  'check.detail.reach.hidden': 'Subscriber count is hidden on this channel',
  'check.detail.engagement.detail': '{pct}% likes and comments per view, typically',
  'check.detail.engagement.hidden': 'Likes and comments are hidden on this channel',

  // The advice. Shown only on a warn or a fail — a passing check has nothing
  // to fix, so the server sends an empty string and the row is hidden.
  'check.fix.banner': "Add a 2560×1440 banner — it's the first thing a new visitor sees.",
  'check.fix.about':
    "Write 200+ characters covering what the channel is about and who it's for. This text is searchable.",
  'check.fix.keywords':
    'Add channel keywords in YouTube Studio → Settings → Channel → Basic info.',
  'check.fix.handle': 'Claim a handle so the channel has a memorable URL.',
  'check.fix.tags':
    '{missing} videos need tags. Tags matter most for disambiguating topics YouTube might otherwise misread.',
  'check.fix.descriptions':
    'Short descriptions give YouTube nothing to index. Aim for 250+ characters with the topic stated in the first two lines.',
  'check.fix.titles':
    'Titles under 30 characters waste search real estate; over 70 get truncated before the hook lands.',
  'check.fix.captions':
    "Captioned videos are indexable and watchable muted. Auto-captions count, but only if you don't disable them.",
  'check.fix.hd': 'Upload at 1080p or better.',
  'check.fix.cadence':
    'Gaps beyond two weeks cost you the algorithmic momentum that makes each upload easier than the last.',
  'check.fix.recency':
    'Three weeks of silence and the recommendation system stops treating the channel as active. Publishing anything restarts it.',
  'check.fix.hit_rate':
    'Most uploads land below your own average, which usually means the catalogue is carried by a few outliers. Study what they share.',
  'check.fix.reach':
    'Videos are mostly reaching people who already subscribed. Titles and thumbnails that assume no prior knowledge travel further.',
  // Wording covers the warn band as well as failure, or a 3% channel reads
  // advice about being "under 2%".
  'check.fix.engagement':
    'Healthy channels sit above 4.5%. Below that, the content is being found but not connecting — ask for the like on camera and end on a question worth answering.',

  // ---------- landing: hero ----------
  'landing.hero.kicker': 'Free · Instant results · Public data only',
  // Split because the design italicises the middle. Two keys rather than
  // embedded <em>: this way a translator can move the emphasised phrase to
  // wherever the sentence needs it in their language.
  'landing.hero.titleBefore': "Find out what's holding",
  'landing.hero.titleEm': 'your channel',
  'landing.hero.titleAfter': 'back',
  'landing.hero.sub':
    'A health score out of 100 from fourteen automated checks, every recent video graded against your own average, and a written breakdown of what to fix first.',
  'landing.hero.note': "Works on any public channel — including your competitors'.",

  // ---------- landing: the search form ----------
  'landing.form.placeholder': 'Channel name, @handle, or URL',
  'landing.form.ariaChannel': 'YouTube channel name, handle, or ID',
  'landing.form.ariaDepth': 'How many recent videos to analyze',
  'landing.form.videos': '{n} videos',
  'landing.form.videosLocked': '{n} videos — sign up',
  'landing.form.submit': 'Audit channel',

  // ---------- landing: what gets checked ----------
  'landing.checks.heading': 'Channel audit checklist',
  'landing.checks.lede':
    "Your score reflects your most recent videos. Each category grades a signal that YouTube's recommendation system actually rewards.",
  'landing.checks.setup.title': 'Channel setup',
  'landing.checks.setup.body':
    'Banner, About section, keywords, and handle — the metadata a new visitor and the search index both read first.',
  'landing.checks.metadata.title': 'Video metadata',
  'landing.checks.metadata.body':
    'Tags, description length, title length, captions, and upload quality across every recent video.',
  'landing.checks.cadence.title': 'Upload consistency',
  'landing.checks.cadence.body':
    'How regularly you publish, measured as the typical gap between uploads rather than an average one hiatus can distort.',
  'landing.checks.recency.title': 'Posting recency',
  'landing.checks.recency.body':
    'How long since the last upload. A channel can have published like clockwork for two years and still have gone quiet — consistency alone would never catch it.',
  'landing.checks.hitrate.title': 'Hit rate',
  'landing.checks.hitrate.body':
    'How many videos beat your own median — not some global benchmark that punishes small channels for being small.',
  'landing.checks.reach.title': 'Reach and engagement',
  'landing.checks.reach.body':
    'Views per subscriber, plus likes and comments against views. Together they answer whether videos travel past the people already subscribed.',

  // ---------- landing: how it works ----------
  'landing.how.heading': 'How it works',
  'landing.how.lede': 'Nothing to install, and every point traceable to a named check.',
  'landing.how.stepsHeading': 'Three steps',
  'landing.how.step1.lead': 'Paste a channel.',
  'landing.how.step1.rest': 'A URL, an @handle, or a raw channel ID — all three work.',
  'landing.how.step2.lead': 'Get the score instantly.',
  'landing.how.step2.rest':
    'The health score, checklist, and performance chart are computed from public data, with no model involved and nothing to wait for.',
  'landing.how.step3.lead': 'Read the breakdown.',
  'landing.how.step3.rest':
    "One click turns the numbers into plain English: what's working, which titles to rewrite, and what to make next.",

  // ---------- landing: the scorecard ----------
  'landing.scorecard.heading': 'All fourteen checks, and what each is worth',
  'landing.scorecard.note':
    'A partial pass earns half. Anything the audit can\'t observe — hidden like counts, a channel too new to have an upload rhythm — leaves the total rather than scoring zero, so the percentage always means "how much of what could be seen was in order".',
  'landing.scorecard.group.setup': 'Channel setup',
  'landing.scorecard.group.metadata': 'Video metadata',
  'landing.scorecard.group.habits': 'Upload habits',
  'landing.scorecard.group.performance': 'Performance',

  // The "what earns the points" column. Percentages and character counts are
  // interpolated so a translator never edits a number — the thresholds are
  // api/score.py's and must not drift in translation.
  'landing.scorecard.banner': 'Channel banner',
  'landing.scorecard.banner.earns': 'Uploaded',
  'landing.scorecard.about': 'About section',
  'landing.scorecard.about.earns': '{n}+ characters',
  'landing.scorecard.keywords': 'Channel keywords',
  'landing.scorecard.keywords.earns': 'Set in Studio',
  'landing.scorecard.handle': 'Custom handle',
  'landing.scorecard.handle.earns': 'Claimed',
  'landing.scorecard.tags': 'Video tags',
  'landing.scorecard.tags.earns': '{pct}% of videos carry 3+ tags',
  'landing.scorecard.descriptions': 'Video descriptions',
  'landing.scorecard.descriptions.earns': '{pct}% run to {n}+ characters',
  'landing.scorecard.titles': 'Title length',
  'landing.scorecard.titles.earns': '{pct}% land in 30–70 characters',
  'landing.scorecard.captions': 'Captions',
  'landing.scorecard.captions.earns': '{pct}% are captioned',
  'landing.scorecard.hd': 'HD uploads',
  'landing.scorecard.hd.earns': '{pct}% are 1080p or better',
  'landing.scorecard.cadence': 'Upload consistency',
  'landing.scorecard.cadence.earns': 'A new video every {n} days or sooner',
  'landing.scorecard.recency': 'Posting recency',
  'landing.scorecard.recency.earns': 'Something published in the last {n} days',
  'landing.scorecard.hitRate': 'Hit rate',
  'landing.scorecard.hitRate.earns': '{pct}% of videos beat the channel median',
  'landing.scorecard.vps': 'Views per subscriber',
  'landing.scorecard.vps.earns': 'The median video reaches {pct}% of subscribers',
  'landing.scorecard.engagement': 'Engagement',
  'landing.scorecard.engagement.earns': 'Likes and comments above {pct}% of views',

  // ---------- landing: FAQ ----------
  'landing.faq.heading': 'Questions',
  'landing.faq.lede': "What the score means, and what this can't tell you.",
  'landing.faq.q1': "Can I audit a channel I don't own?",
  'landing.faq.a1':
    "Yes. Everything comes from public YouTube data, so you can audit any channel — including a competitor's.",
  'landing.faq.q2': 'How is the score calculated?',
  'landing.faq.a2':
    'Fourteen checks, each worth a fixed number of points that add up to 100. Passing earns full points, a partial pass earns half, and anything we cannot observe is excluded rather than counted against you. Every point is traceable to a named check in your results.',
  'landing.faq.q3': "What can't it see?",
  'landing.faq.a3':
    "Retention, click-through rate, impressions, and traffic sources live in YouTube Studio and need the channel owner's login. This audit reasons from views, titles, and metadata — genuinely useful for spotting packaging and topic patterns, but it cannot tell you whether a video failed because the thumbnail went unclicked or because viewers left early.",
  'landing.faq.q4': 'How is this different from vidIQ or TubeBuddy?',
  'landing.faq.a4':
    "Those are full channel-management suites — keyword research, bulk tag editing, competitor tracking — and they generally ask you to install a browser extension and connect your YouTube account. This is deliberately narrower: paste any channel handle and get a scored audit of what is publicly visible, with nothing to install and no account to connect. Because it reads only public data it can audit channels you don't own, which is the trade in both directions: it will never show you the private Studio metrics those tools surface once you've connected.",
  'landing.faq.q5': 'Is there a free YouTube channel audit tool?',
  'landing.faq.a5':
    "This is one. Scoring a channel costs nothing and needs no account — you get the health score, the performance chart measured against the channel's own median, and a sample of the checklist. A free account opens the full fourteen-check breakdown, deeper scans of up to 100 videos, and the written report.",
  'landing.faq.q6': "Can I use this to analyse a competitor's channel?",
  'landing.faq.a6':
    'Yes, and it is one of the more useful ways to run it. Every check works from public data, so a competitor audit reads exactly the same as your own: which of their videos beat their typical performance, how their titles and descriptions are built, and which parts of their setup are left undone.',
  'landing.faq.q7': 'Does this work for small channels?',
  'landing.faq.a7':
    "Yes, and it is built for them. Because every check is scored against the channel's own median rather than a global benchmark, a channel with 400 subscribers is measured on whether its videos beat its own typical video — not on whether it beats somebody with a million. Nothing here penalises a channel for being small, and the setup and metadata checks are the ones that tend to matter most early on.",
  'landing.faq.q8': 'Why compare against my own median instead of other channels?',
  'landing.faq.a8':
    'Because a 10,000-view video is a triumph on one channel and a disaster on another. Scoring against your own median tells you which of your videos actually outperformed, and using the median rather than the mean stops one viral hit from making everything else look like a failure.',

  // ---------- landing: guides ----------
  'landing.guides.heading': 'Read more',
  'landing.guides.lede': 'Longer answers on how the score is built and what to do with it.',
  // The destination pages are English. These labels are translated anyway, so
  // the list reads as part of the page it sits in — the link carries hrefLang
  // to declare where it actually leads. See the note beside GUIDES.
  'landing.guides.free': 'What the free audit includes',
  'landing.guides.score': 'How the score out of 100 is calculated',
  'landing.guides.competitor': "Analysing a competitor's channel",
  'landing.guides.small': 'Why this works for small channels',
  'landing.guides.versus': 'How this compares to vidIQ and TubeBuddy',
  'landing.guides.checklist': 'The fourteen checks, ordered by what to fix first',
  'landing.guides.views': 'Why your views are dropping',
  'landing.guides.upload': 'How often you should upload',

  // ---------- landing: closing CTA ----------
  'landing.cta.heading': 'Turn the score into a plan',
  'landing.cta.sub':
    'The audit tells you what\'s wrong in a few seconds. A free account tells you what to do about it.',
  'landing.cta.item1': 'All fourteen checks, each with the reasoning and the fix',
  'landing.cta.item2': 'Scans of up to 100 videos instead of {n}',
  'landing.cta.item3':
    'A written breakdown: what\'s working, what to fix, what to make next',
  'landing.cta.item4': 'A rewritten About section, drafted for you',
  'landing.cta.item5': 'Saved audits, so you can re-run a channel and see what moved',
  'landing.cta.fine':
    "No card, no extension, no YouTube login — and it still works on any public channel, including your competitors'.",
  'landing.cta.back': 'Back to search',

  // ---------- results ----------
  'results.newAudit': '← New audit',
  'results.favorite': 'Favorite',
  'results.favorited': 'Favorited',
  'results.saveFailed': "Couldn't save this audit.",
  'results.auditing': 'Auditing {channel}',
  'results.auditingSub': 'Fetching the last {n} videos and scoring them.',
  'results.auditFailed': "Couldn't audit that channel.",
  'results.unreachable': "Can't reach the server. Is it running on port 8000?",
  'results.stopped': '[stopped]',
  'results.download': 'Download .md',
  'results.writing': 'Writing…',
  'results.report.heading': 'Want the written breakdown?',
  'results.report.body':
    "Turns the numbers above into plain English — what's working, which titles to rewrite, and what to make next. Written by {provider}.",
  'results.report.noModel': 'No model configured.',
  'results.report.write': 'Write the report',
  'results.report.locked.title': 'The written breakdown is for members',
  'results.report.locked.body':
    "Turns the numbers above into plain English — what's working, which titles to rewrite, and what to make next. Free with an account.",

  // ---------- score card ----------
  'score.ariaRing': 'Health score {score} out of 100, grade {grade}',
  'score.lede': 'Channel health score, from {n} automated checks.',
  'score.passed': 'passed',
  'score.needWork': 'need work',
  'score.failed': 'failed',
  'score.group.setup': 'Channel setup',
  'score.group.metadata': 'Video metadata',
  'score.group.habits': 'Habits & reach',
  'score.moreChecks': '{n} more checks',
  'score.status.pass': 'pass',
  'score.status.warn': 'warning',
  'score.status.fail': 'fail',
  'score.status.skip': 'skipped',
  'score.aboutFixer.locked': 'Sign up to write one',

  // ---------- log in / sign up dialog ----------
  'auth.close': 'Close',
  'auth.signup.title': 'Create an account',
  'auth.signup.sub': 'Save your audits and come back to them later.',
  'auth.login.title': 'Welcome back',
  'auth.login.sub': 'Log in to see your saved audits.',
  'auth.google': 'Continue with Google',
  'auth.or': 'or',
  'auth.name': 'Name',
  'auth.namePlaceholder': 'Your name',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.submit.signup': 'Sign up',
  'auth.submit.login': 'Log in',
  'auth.busy': 'Working…',
  'auth.haveAccount': 'Already have an account?',
  'auth.noAccount': "Don't have an account?",
  'auth.switchToLogin': 'Log in',
  'auth.switchToSignup': 'Sign up',
  'auth.checkEmail.title': 'Check your email',
  'auth.checkEmail.body': 'We sent a confirmation link to {email}. Open it to finish creating your account.',
  'auth.checkEmail.ok': 'Got it',
  'auth.error.rateLimit': 'Too many attempts just now. Wait a few minutes and try again.',
  'auth.error.alreadyRegistered': 'That email already has an account. Log in instead.',
  'auth.error.invalidCredentials': "That email and password don't match an account.",
  'auth.error.weakPassword': 'Password must be at least 6 characters.',
}
