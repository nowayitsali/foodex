import { useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { RestrictionProfile } from './domain/types'
import { supabase } from './lib/supabase'
import { clearLocalProfile, EMPTY_PROFILE, loadProfile, saveProfile } from './lib/profile'
import { Spinner } from './components/ui'
import { Menu } from './components/Menu'
import { HomeButton } from './components/HomeButton'
import { CheckFlow, type CheckRequest } from './screens/CheckFlow'
import { Login } from './screens/Login'
import { Nearby } from './screens/Nearby'
import { Onboarding } from './screens/Onboarding'
import { RestaurantSearch } from './screens/RestaurantSearch'
import { Scanner } from './screens/Scanner'
import { SearchSheet } from './screens/SearchSheet'
import { Settings } from './screens/Settings'
import './screens/cream.css'

export type Screen = 'scanner' | 'nearby' | 'restaurants' | 'profile' | 'settings'

const DEMO_KEY = 'foodex.demo'

function readDemoFlag() {
  try {
    return localStorage.getItem(DEMO_KEY) === '1'
  } catch {
    return false
  }
}

function writeDemoFlag(on: boolean) {
  try {
    if (on) localStorage.setItem(DEMO_KEY, '1')
    else localStorage.removeItem(DEMO_KEY)
  } catch {
    // Private mode: demo mode lasts for this visit only.
  }
}

export default function App() {
  const [entry, setEntry] = useState<'landing' | 'login' | 'app' | 'restaurants'>('landing')
  const [browseProfile, setBrowseProfile] = useState<RestrictionProfile | null>(null)
  const [authReady, setAuthReady] = useState(!supabase)
  const [user, setUser] = useState<User | null>(null)
  const [demo, setDemo] = useState(() => !supabase && readDemoFlag())
  // undefined = not loaded yet, null = signed in but no profile saved (first sign-in).
  const [profile, setProfile] = useState<RestrictionProfile | null | undefined>(undefined)
  const [screen, setScreen] = useState<Screen>('scanner')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [check, setCheck] = useState<CheckRequest | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const signedIn = !!user || demo

  useEffect(() => {
    setProfile(signedIn ? loadProfile(user) : undefined)
  }, [user, signedIn])

  async function updateProfile(next: RestrictionProfile) {
    await saveProfile(user, next)
    setProfile(next)
  }

  async function signOut() {
    if (supabase && user) await supabase.auth.signOut()
    if (demo) {
      writeDemoFlag(false)
      clearLocalProfile()
      setDemo(false)
    }
    setProfile(undefined)
    setBrowseProfile(null)
    setUser(null)
    setEntry('landing')
    setScreen('scanner')
    setMenuOpen(false)
    setCheck(null)
  }

  function go(next: Screen) {
    setMenuOpen(false)
    if (next === 'profile' || next === 'settings') { goHome(); return }
    setScreen(next)
  }

  function goHome() {
    setEntry('landing')
    setScreen('scanner')
    setMenuOpen(false)
    setSearchOpen(false)
    setCheck(null)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function withHome(content: ReactNode, showHeader = true) {
    return <>{showHeader && <header className="foodex-home-header"><HomeButton onHome={goHome} /></header>}{content}</>
  }

  if (!authReady) return withHome(<div className="splash"><Spinner label="Loading Foodex" /></div>)

  if (entry === 'landing' || (user && screen === 'settings' && entry !== 'restaurants')) {
    if (signedIn && profile === undefined) return withHome(<div className="splash"><Spinner /></div>)
    return <div className="cr"><Settings
      key={user?.id ?? 'guest'}
      home signedIn={!!user}
      profile={user ? loadProfile(user) ?? profile ?? EMPTY_PROFILE : profile ?? loadProfile(null) ?? EMPTY_PROFILE}
      demo={!user}
      onSave={updateProfile} onSignOut={signOut} onBack={goHome} onHome={goHome}
      onLogin={() => { setScreen('settings'); setEntry('login') }}
      onRestaurants={(next) => { setBrowseProfile(next); setScreen('restaurants'); setEntry('restaurants'); window.scrollTo({top:0}) }}
      onScan={() => { if (!user) { writeDemoFlag(true); setDemo(true) } setScreen('scanner'); setEntry('app'); window.scrollTo({top:0}) }}
    /></div>
  }

  if (entry === 'restaurants') return withHome(<RestaurantSearch
    profile={browseProfile ?? profile ?? EMPTY_PROFILE}
    onBack={goHome}
  />)

  if (!authReady) return withHome(<div className="splash"><Spinner label="Loading Foodex" /></div>)

  if (!signedIn || (entry === 'login' && !user)) {
    return (
      <Login
        onHome={goHome}
        onDemo={() => {
          writeDemoFlag(true)
          setDemo(true)
          setEntry('app')
        }}
      />
    )
  }

  if (profile === undefined) return withHome(<div className="splash"><Spinner /></div>)

  if (profile === null && screen !== 'settings') {
    return <div className="cr">{withHome(<Onboarding user={user} onSave={updateProfile} />)}</div>
  }

  const back = () => setScreen('scanner')

  const cream = screen === 'profile' || screen === 'settings'

  const page = withHome(
    <div className="app">
      {screen === 'scanner' && (
        <Scanner
          active={!check && !searchOpen && !menuOpen}
          profile={profile ?? EMPTY_PROFILE}
          onCapture={(req) => setCheck(req)}
          menu={<Menu open={menuOpen} user={user} demo={demo} onOpenChange={setMenuOpen} onGo={go} />}
          onHome={goHome}
          onEditRestrictions={goHome}
        />
      )}
      {screen === 'nearby' && <Nearby onBack={back} />}
      {screen === 'restaurants' && <RestaurantSearch profile={profile ?? EMPTY_PROFILE} onBack={back} />}
      
      {screen === 'settings' && <Settings profile={profile ?? EMPTY_PROFILE} onSave={updateProfile} onSignOut={signOut} onBack={back} demo={demo} />}

      {searchOpen && (
        <SearchSheet
          onClose={() => setSearchOpen(false)}
          onSearch={(req) => {
            setSearchOpen(false)
            setCheck(req)
          }}
        />
      )}
      {check && (
        <CheckFlow
          request={check}
          profile={profile ?? EMPTY_PROFILE}
          onClose={() => setCheck(null)}
          onSearchInstead={() => {
            setCheck(null)
            setSearchOpen(true)
          }}
        />
      )}
    </div>,
    screen !== 'scanner',
  )
  return cream ? <div className="cr">{page}</div> : page
}
