import { useState } from 'react'
import { ArrowUpRight, Check, LogOut, MapPin, ScanLine } from 'lucide-react'
import type { CustomRestriction, RestrictionId, RestrictionProfile } from '../domain/types'
import { RESTRICTIONS } from '../domain/restrictions'
import { HomeButton } from '../components/HomeButton'
import './home.css'

// The main page: one vertical checklist of restrictions, then Scan or Find restaurants.
// Cuisines from the saved profile are kept as they are (edited in Settings).

type OtherCategory = CustomRestriction['category']

const OTHER_HINT: Record<OtherCategory, string> = {
  religious: 'e.g. Jain, no beef',
  medical: 'e.g. mustard, celery',
}

/** "mustard, celery" -> two Custom restrictions. */
function splitOther(text: string, category: OtherCategory): CustomRestriction[] {
  const seen = new Set<string>()
  return text
    .split(/[,;\n]/)
    .map((t) => t.trim())
    .filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()))
    .map((t) => ({ category, text: t }))
}

const GROUPS = [
  { category: 'religious', title: 'Faith' },
  { category: 'lifestyle', title: 'Lifestyle' },
  { category: 'medical', title: 'Allergies & intolerances' },
] as const

interface Props {
  profile: RestrictionProfile
  signedIn: boolean
  onSave: (p: RestrictionProfile) => Promise<void>
  onSignOut: () => Promise<void>
  onHome: () => void
  onLogin: () => void
  onScan: () => void
  onRestaurants: (p: RestrictionProfile) => void
}

export function Home({ profile, signedIn, onSave, onSignOut, onHome, onLogin, onScan, onRestaurants }: Props) {
  const [selected, setSelected] = useState<RestrictionId[]>([...profile.restrictions])
  const [other, setOther] = useState<Record<OtherCategory, string>>(() => ({
    religious: profile.custom.filter((c) => c.category === 'religious').map((c) => c.text).join(', '),
    medical: profile.custom.filter((c) => c.category === 'medical').map((c) => c.text).join(', '),
  }))
  const custom = [...splitOther(other.religious, 'religious'), ...splitOther(other.medical, 'medical')]
  const count = selected.length + custom.length
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = (id: RestrictionId) => setSelected((old) => (old.includes(id) ? old.filter((v) => v !== id) : [...old, id]))

  async function go(destination: 'scan' | 'restaurants') {
    if (busy) return
    setBusy(true)
    setError(null)
    const next: RestrictionProfile = { ...profile, restrictions: RESTRICTIONS.filter((r) => selected.includes(r.id)).map((r) => r.id), custom }
    try {
      await onSave(next)
      if (destination === 'scan') onScan()
      else onRestaurants(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your choices. Try again.')
      setBusy(false)
    }
  }

  async function signOut() {
    setBusy(true)
    await onSignOut().catch(() => setBusy(false))
  }

  return (
    <div className="hm">
      <header className="hm-nav">
        <HomeButton onHome={onHome} />
        <button type="button" className="hm-login" disabled={busy} onClick={signedIn ? signOut : onLogin}>
          {signedIn ? <>Sign out <LogOut size={14} /></> : <>Log in <ArrowUpRight size={14} /></>}
        </button>
      </header>

      <main className="hm-main">
        <h1>What should we <em>check for?</em></h1>
        <p className="hm-sub">Tick everything that applies. Foodex checks food against all of them at once.</p>

        {GROUPS.map((g) => (
          <section key={g.category} className="hm-group" aria-labelledby={`hm-${g.category}`}>
            <h2 id={`hm-${g.category}`}>{g.title}</h2>
            <ul>
              {RESTRICTIONS.filter((r) => r.category === g.category).map((r) => {
                const on = selected.includes(r.id)
                return (
                  <li key={r.id}>
                    <button type="button" className="hm-row" role="checkbox" aria-checked={on} onClick={() => toggle(r.id)}>
                      <span>{r.label}</span>
                      <span className="hm-box" aria-hidden>{on && <Check size={15} strokeWidth={3} />}</span>
                    </button>
                  </li>
                )
              })}
              {(g.category === 'religious' || g.category === 'medical') && (
                <li>
                  <label className="hm-other">
                    <span>Other</span>
                    <input
                      type="text"
                      value={other[g.category]}
                      onChange={(e) => setOther({ ...other, [g.category]: e.target.value })}
                      placeholder={OTHER_HINT[g.category]}
                      aria-label={`Other ${g.title.toLowerCase()} restrictions, separated by commas`}
                    />
                  </label>
                </li>
              )}
            </ul>
          </section>
        ))}

        {error && <p className="hm-error" role="alert">{error}</p>}
      </main>

      <div className="hm-bar">
        <div className="hm-bar-inner">
          <button type="button" className="hm-btn hm-btn-primary" disabled={busy} onClick={() => go('scan')}>
            <ScanLine size={17} /> Scan food
          </button>
          <button type="button" className="hm-btn" disabled={busy} onClick={() => go('restaurants')}>
            <MapPin size={17} /> Find restaurants
          </button>
        </div>
        <p className="hm-count">{count ? `${count} selected` : 'Nothing selected yet'}</p>
      </div>
    </div>
  )
}
