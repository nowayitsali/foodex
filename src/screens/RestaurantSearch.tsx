import { useMemo, useState } from 'react'
import { ArrowLeft, Check, ListChecks, LocateFixed, MapPin, Search, ShieldCheck } from 'lucide-react'
import type { RestrictionProfile } from '../domain/types'
import { judge, overall } from '../domain/verdicts'
import { restrictionNames } from '../components/ui'
import { DEMO_RESTAURANTS, type DemoRestaurant } from './restaurantDemo'

// Layout only: real restaurant search is a later slice. Uses demo data.
// Each restaurant's menu is checked with judge() on this device (ADR 0001),
// but only restaurants are shown, not their menu items.

interface Props {
  profile: RestrictionProfile
  onBack: () => void
}

const MIN_KM = 1
const MAX_KM = 10

/** "Halal", "Halal and Vegan", "Halal, Vegan and Gluten-free". */
function joinNames(names: string[]): string {
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/** True when at least one dish on the menu fits every restriction. */
function servesFittingFood(r: DemoRestaurant, profile: RestrictionProfile): boolean {
  return r.dishes.some((dish) => overall(judge(dish.research, profile)) === 'fits')
}

export function RestaurantSearch({ profile, onBack }: Props) {
  const [query, setQuery] = useState('')
  const [radiusKm, setRadiusKm] = useState(5)
  const names = restrictionNames(profile)
  const checking = names.length > 0

  const nearby = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DEMO_RESTAURANTS.filter((r) => r.distanceKm <= radiusKm).filter(
      (r) => !q || r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q),
    )
  }, [query, radiusKm])

  const results = useMemo(
    () =>
      nearby
        .filter((r) => !checking || servesFittingFood(r, profile))
        // Preferred cuisines first (GLOSSARY), then closest.
        .sort(
          (a, b) =>
            Number(profile.cuisines.includes(b.cuisine)) - Number(profile.cuisines.includes(a.cuisine)) ||
            a.distanceKm - b.distanceKm,
        ),
    [nearby, checking, profile],
  )

  const placeWord = (n: number) => (n === 1 ? 'restaurant' : 'restaurants')

  return (
    <main className="page rs">
      <header className="rs-top">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back"><ArrowLeft size={18} /></button>
        <span className="rs-demo">Demo data</span>
      </header>

      <div className="rs-intro">
        <h1 className="cr-title">Where can <em>you eat?</em></h1>
        <p className="rs-checking">
          <ShieldCheck size={15} />
          {checking ? <span>Finding restaurants that serve <strong>{joinNames(names)}</strong> food</span> : 'Add restrictions in Settings to check restaurants.'}
        </p>
      </div>

      <label className="rs-search">
        <Search size={18} />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search restaurants or cuisines" aria-label="Search restaurants" />
      </label>

      <section className="rs-radius" aria-label="Search distance">
        <div className="rs-radius-head">
          <span><LocateFixed size={15} /><span>Within <strong>{radiusKm} km</strong> of you</span></span>
          <span className="rs-radius-count">{results.length} {results.length === 1 ? 'place' : 'places'}</span>
        </div>
        <input
          type="range"
          min={MIN_KM}
          max={MAX_KM}
          step={1}
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          aria-label="Search radius in kilometres"
          style={{ ['--fill' as string]: `${((radiusKm - MIN_KM) / (MAX_KM - MIN_KM)) * 100}%` }}
        />
        <div className="rs-radius-scale"><span>{MIN_KM} km</span><span>{MAX_KM} km</span></div>
      </section>

      {checking && nearby.length > 0 && (
        <p className="rs-xref">
          <ListChecks size={16} />
          <span>
            Cross-referenced <strong>{joinNames(names)}</strong> against the full menus of {nearby.length} {placeWord(nearby.length)} within {radiusKm} km.{' '}
            <strong>{results.length}</strong> {results.length === 1 ? 'serves' : 'serve'} food that fits you.
          </span>
        </p>
      )}

      <div className="rs-list">
        {results.map((r) => (
          <article key={r.id} className="rs-card">
            <span className="rs-initial">{r.name[0]}</span>
            <span className="rs-card-main">
              <strong>{r.name}</strong>
              <span className="rs-meta">{r.cuisine} · <MapPin size={12} /> {r.distanceKm.toFixed(1)} km</span>
              {checking && <span className="rs-serves"><Check size={13} /> Serves {joinNames(names)} food</span>}
            </span>
          </article>
        ))}
        {!results.length && (
          <p className="rs-empty">
            {query.trim()
              ? <>No restaurants match “{query}” within {radiusKm} km.</>
              : checking
                ? <>No restaurants within {radiusKm} km serve {joinNames(names)} food. Try a wider range.</>
                : <>No restaurants within {radiusKm} km. Try a wider range.</>}
          </p>
        )}
      </div>
    </main>
  )
}
