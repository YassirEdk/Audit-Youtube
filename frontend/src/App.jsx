import { useEffect, useState } from 'react'
import { ChannelSuggest } from './ChannelSuggest.jsx'
import { Landing } from './Landing.jsx'
import { Results } from './Results.jsx'
import { Sidebar } from './Sidebar.jsx'
import { SearchIcon, Shell } from './Shell.jsx'
import { readDepth, writeDepth } from './depth.js'
import { FREE_VIDEOS } from './limits.js'
import { useT } from './i18n/index.jsx'
import { useLocked } from './useAuth.js'
import { useScrollSpy } from './useScrollSpy.js'
import './App.css'

// The sections the header links to, in page order — useScrollSpy takes the
// last one whose top has passed the line, so a list out of document order
// would light the wrong item.
//
// "how" used to be excluded because nothing in the nav pointed at it, which
// made tracking it a way to leave the nav blank. It has a nav item now, and
// it's the tallest section on the page, so the opposite is true.
const SECTIONS = ['checks', 'how', 'faq', 'guides']

/**
 * The page under the masthead.
 *
 * `route` is passed in rather than read here: main.jsx owns it, because
 * I18nProvider has to sit above AuthProvider — which renders the login dialog —
 * and both therefore need the locale before this component mounts.
 */
function App({ route }) {
  const { channel, locale, navigate, changeLocale } = route
  const t = useT()
  const locked = useLocked()
  const [depth, setDepth] = useState(readDepth)
  // The server clamps this too, and that's the boundary that counts. Clamping
  // here as well keeps the page honest: without it the UI would claim a depth
  // the API isn't going to deliver.
  const videos = locked ? Math.min(depth, FREE_VIDEOS) : depth

  // The form passes a depth; the masthead search doesn't, and keeps the
  // current one.
  function startAudit(nextChannel, nextDepth) {
    if (nextDepth) {
      writeDepth(nextDepth)
      setDepth(nextDepth)
    }
    navigate({ channel: nextChannel })
  }
  // Probed once here and passed down, rather than in both views — it answers
  // "is the server up" and "is a model configured" in the same response.
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ offline: true }))
  }, [])

  const serverDown = health?.offline

  // Retitled on a language change as well as a navigation: the tab is the one
  // piece of the page that stays visible after you switch away from it.
  useEffect(() => {
    if (!channel) document.title = t('app.title')
  }, [channel, t])

  // Nav sections live on the landing page only. From a results page the link
  // has to go home first, then scroll — and the scroll can't happen until the
  // landing page has actually mounted, hence the pending id rather than an
  // immediate scrollIntoView.
  const [pendingScroll, setPendingScroll] = useState(null)

  useEffect(() => {
    if (!pendingScroll || channel) return
    document.getElementById(pendingScroll)?.scrollIntoView({ block: 'start' })
    setPendingScroll(null)
  }, [pendingScroll, channel])

  // The sections only exist on the landing page, so the spy is idle on results.
  const activeSection = useScrollSpy(SECTIONS, !channel)

  // Nav items either go home (null) or scroll to a landing section.
  function handleNavigate(id) {
    if (!id) {
      navigate(null)
      return
    }
    if (channel) navigate(null, { resetScroll: false })
    setPendingScroll(id)
  }

  return (
    <Shell
      active={channel ? undefined : activeSection}
      onNavigate={handleNavigate}
      locale={locale}
      onLocaleChange={changeLocale}
      // Only on results pages — on the landing page the section nav is still
      // the right thing, and a rail of past audits would crowd the pitch.
      sidebar={
        channel ? (
          <Sidebar
            current={channel}
            onHome={() => navigate(null)}
            onSelect={(c) => startAudit(c)}
          />
        ) : null
      }
      // On a results page the masthead carries a compact search, so a second
      // audit never means going home first — same as searching from any
      // YouTube page.
      headerSearch={
        channel ? (
          <CompactSearch initial={channel} onSubmit={(c) => startAudit(c)} />
        ) : null
      }
    >
      <div className="app">
        {serverDown && (
          <div className="banner error">
            <strong>{t('app.serverDown.lead')}</strong>{' '}
            {/* The filename is interpolated rather than written into the
                sentence, so a translator never has to retype it — a typo in
                start-server.bat is an instruction that silently doesn't work. */}
            {t('app.serverDown.rest', { file: 'start-server.bat' })}
          </div>
        )}

        {channel ? (
          <Results
            // Remounts on channel change so no state leaks between audits.
            key={`${channel}:${videos}:${locale}`}
            channel={channel}
            videos={videos}
            health={health}
            locale={locale}
            onNewAudit={() => navigate(null)}
          />
        ) : (
          <Landing onStart={startAudit} />
        )}

        <footer>
          <p>{t('app.footer')}</p>
        </footer>
      </div>
    </Shell>
  )
}

function CompactSearch({ initial, onSubmit }) {
  const t = useT()
  const [value, setValue] = useState(initial)

  return (
    <form
      className="search"
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) onSubmit(value.trim())
      }}
    >
      <ChannelSuggest
        value={value}
        onChange={setValue}
        onPick={(handle) => onSubmit(handle)}
        placeholder={t('app.search.another')}
        ariaLabel={t('app.search.ariaChannel')}
      />
      <button type="submit" aria-label={t('app.search.ariaSubmit')}>
        <SearchIcon />
      </button>
    </form>
  )
}

export default App
