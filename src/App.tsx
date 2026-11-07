import { useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { RestrictionId, RestrictionProfile } from './domain/types'
import { supabase } from './lib/supabase'
import { clearLocalProfile, EMPTY_PROFILE, loadProfile, saveProfile } from './lib/profile'
import { Spinner } from './components/ui'
import { Menu } from './components/Menu'
import { HomeButton } from './components/HomeButton'
import { CheckFlow, type CheckRequest } from './screens/CheckFlow'
import { Login } from './screens/Login'
import { Landing } from './screens/Landing'
import { Nearby } from './screens/Nearby'
import { Onboarding } from './screens/Onboarding'
import { Profile } from './screens/Profile'
import { RestaurantSearch } from './screens/RestaurantSearch'
import { Scanner } from './screens/Scanner'
import { SearchSheet } from './screens/SearchSheet'
import { Settings } from './screens/Settings'

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
  const [browseRestrictions, setBrowseRestrictions] = useState<RestrictionId[]>([])
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
    setUser(null)
    setEntry('landing')
    setScreen('scanner')
    setMenuOpen(false)
    setCheck(null)
  }

  function go(next: Screen) {
    setMenuOpen(false)
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

  function withHome(content: ReactNode) {
    return <><header className="foodex-home-header"><HomeButton onHome={goHome} /></header>{content}</>
  }

  if (entry === 'landing') return <Landing
    onHome={goHome}
    signedIn={signedIn}
    onRestaurants={(selected) => { setBrowseRestrictions(selected); setEntry('restaurants') }}
    onScan={() => { setScreen('scanner'); setEntry('app') }}
    onLogin={() => { setScreen('profile'); setEntry('login') }}
  />

  if (entry === 'restaurants') return withHome(<RestaurantSearch
    profile={{ ...(profile ?? EMPTY_PROFILE), restrictions: [...new Set([...(profile?.restrictions ?? []), ...browseRestrictions])] }}
    onBack={goHome}
  />)

  if (!authReady) return withHome(<div className="splash"><Spinner label="Loading Foodex" /></div>)

  if (!signedIn) {
    return withHome(
      <Login
        onDemo={() => {
          writeDemoFlag(true)
          setDemo(true)
          setEntry('app')
        }}
      />
    )
  }

  if (profile === undefined) return withHome(<div className="splash"><Spinner /></div>)

  if (profile === null) {
    return withHome(<Onboarding user={user} onSave={updateProfile} />)
  }

  const back = () => setScreen('scanner')

  return withHome(
    <div className="app">
      {screen === 'scanner' && (
        <Scanner
          active={!check && !searchOpen && !menuOpen}
          profile={profile}
          onCapture={(req) => setCheck(req)}
          onSearch={() => setSearchOpen(true)}
          onMenu={() => setMenuOpen(true)}
        />
      )}
      {screen === 'nearby' && <Nearby onBack={back} />}
      {screen === 'restaurants' && <RestaurantSearch profile={profile} onBack={back} />}
      {screen === 'profile' && <Profile user={user} profile={profile} onBack={back} onEdit={() => setScreen('settings')} />}
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
          profile={profile}
          onClose={() => setCheck(null)}
          onSearchInstead={() => {
            setCheck(null)
            setSearchOpen(true)
          }}
        />
      )}
      <Menu open={menuOpen} user={user} demo={demo} onClose={() => setMenuOpen(false)} onGo={go} />
    </div>
  )
}
