import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, ListChecks, LocateFixed, MapPin, Search, ShieldCheck } from 'lucide-react'
import type { RestrictionProfile, Verdict, VerdictValue } from '../domain/types'
import { judge, overall } from '../domain/verdicts'
import { restrictionNames, SOURCE_KIND_LABELS, VERDICT_LABELS } from '../components/ui'
import { DEMO_RESTAURANTS, type DemoDish, type DemoRestaurant } from './restaurantDemo'

// Layout only: real restaurant search is a later slice. Uses demo data.
// Verdicts still come from judge() on this device (ADR 0001).

interface Props {
  profile: RestrictionProfile
  onBack: () => void
}

interface CheckedDish {
  dish: DemoDish
  verdicts: Verdict[]
  answer: VerdictValue
}

const MIN_KM = 1
const MAX_KM = 10

/** "Halal", "Halal and Vegan", "Halal, Vegan and Gluten-free". */
function joinNames(names: string[]): string {
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

function checkDishes(r: DemoRestaurant, profile: RestrictionProfile): CheckedDish[] {
  return r.dishes.map((dish) => {
    const verdicts = judge(dish.research, profile)
    return { dish, verdicts, answer: overall(verdicts) }
  })
}

export function RestaurantSearch({ profile, onBack }: Props) {
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [radiusKm, setRadiusKm] = useState(5)
  const names = restrictionNames(profile)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DEMO_RESTAURANTS.filter((r) => r.distanceKm <= radiusKm)
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q))
      .map((r) => ({ r, fits: checkDishes(r, profile).filter((d) => d.answer === 'fits').length }))
      // Most fitting dishes first. Cuisine preferences only break ties (GLOSSARY), then distance.
      .sort(
        (a, b) =>
          b.fits - a.fits ||
          Number(profile.cuisines.includes(b.r.cuisine)) - Number(profile.cuisines.includes(a.r.cuisine)) ||
          a.r.distanceKm - b.r.distanceKm,
      )
  }, [query, profile, radiusKm])

  const dishTotal = results.reduce((n, { r }) => n + r.dishes.length, 0)
  const fitTotal = results.reduce((n, { fits }) => n + fits, 0)

  const opened = DEMO_RESTAURANTS.find((r) => r.id === openId)
  if (opened) return <RestaurantDetail restaurant={opened} profile={profile} onBack={() => setOpenId(null)} />

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
          {names.length ? <>Checking every dish for <strong>{names.join(', ')}</strong></> : 'Add restrictions in Settings to check dishes.'}
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

      {names.length > 0 && results.length > 0 && (
        <p className="rs-xref">
          <ListChecks size={16} />
          <span>
            Cross-referenced <strong>{joinNames(names)}</strong> against all {dishTotal} dishes at {results.length}{' '}
            {results.length === 1 ? 'restaurant' : 'restaurants'} within {radiusKm} km. <strong>{fitTotal}</strong> {fitTotal === 1 ? 'fits' : 'fit'} you.
          </span>
        </p>
      )}

      <div className="rs-list">
        {results.map(({ r, fits }) => (
          <button key={r.id} type="button" className="rs-card" onClick={() => setOpenId(r.id)}>
            <span className="rs-initial">{r.name[0]}</span>
            <span className="rs-card-main">
              <strong>{r.name}</strong>
              <span className="rs-meta">{r.cuisine} · <MapPin size={12} /> {r.distanceKm.toFixed(1)} km</span>
            </span>
            {names.length > 0 && (
              <span className={`rs-count${fits ? '' : ' rs-count-none'}`}>
                <b>{fits}/{r.dishes.length}</b> fit
              </span>
            )}
            <ChevronRight size={18} className="rs-chev" />
          </button>
        ))}
        {!results.length && (
          <p className="rs-empty">
            {query.trim() ? <>No restaurants match “{query}” within {radiusKm} km.</> : <>No restaurants within {radiusKm} km. Try a wider range.</>}
          </p>
        )}
      </div>
    </main>
  )
}

const GROUPS: { value: VerdictValue; title: string }[] = [
  { value: 'fits', title: 'Fits you' },
  { value: 'not_enough_info', title: 'Not enough info' },
  { value: 'doesnt_fit', title: "Doesn't fit" },
]

function RestaurantDetail({ restaurant, profile, onBack }: { restaurant: DemoRestaurant; profile: RestrictionProfile; onBack: () => void }) {
  const dishes = checkDishes(restaurant, profile)
  const names = restrictionNames(profile)
  const checking = names.length > 0
  const fitCount = dishes.filter((d) => d.answer === 'fits').length

  return (
    <main className="page rs">
      <header className="rs-top">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back to restaurants"><ArrowLeft size={18} /></button>
        <span className="rs-demo">Demo data</span>
      </header>

      <div className="rs-intro">
        <h1 className="cr-title">{restaurant.name}</h1>
        <p className="rs-meta rs-meta-lg">
          {restaurant.cuisine} · <MapPin size={13} /> {restaurant.distanceKm.toFixed(1)} km · Menu: {SOURCE_KIND_LABELS[restaurant.verification].toLowerCase()}
        </p>
      </div>

      {checking && (
        <p className="rs-xref">
          <ListChecks size={16} />
          <span>
            Cross-referenced <strong>{joinNames(names)}</strong> against all {dishes.length} items on the menu.{' '}
            {fitCount
              ? <>Every dish that's {joinNames(names)} is listed below: <strong>{fitCount} of {dishes.length}</strong>.</>
              : <>No dish is confirmed {joinNames(names)} yet.</>}
          </span>
        </p>
      )}

      {!checking && (
        <div className="rs-group">
          {dishes.map((d) => <DishRow key={d.dish.name} item={d} showVerdict={false} />)}
        </div>
      )}

      {checking &&
        GROUPS.map((g) => {
          const items = dishes.filter((d) => d.answer === g.value)
          if (!items.length) return null
          return (
            <section key={g.value} className="rs-group">
              <h2 className={`rs-group-title rs-${g.value}`}>
                <span className="rs-dot" /> {g.value === 'fits' ? `Everything that's ${joinNames(names)}` : g.title} <span>{items.length}</span>
              </h2>
              {items.map((d) => <DishRow key={d.dish.name} item={d} showVerdict />)}
            </section>
          )
        })}
    </main>
  )
}

function DishRow({ item, showVerdict }: { item: CheckedDish; showVerdict: boolean }) {
  // The reason to show: the first restriction that decided the answer.
  const why = item.verdicts.find((v) => v.value === item.answer && item.answer !== 'fits')
  return (
    <article className="rs-dish">
      <div className="rs-dish-head">
        <strong>{item.dish.name}</strong>
        <span className="rs-price">{item.dish.price}</span>
      </div>
      <p>{item.dish.description}</p>
      {showVerdict && why && (
        <p className={`rs-why rs-${item.answer}`}>
          {VERDICT_LABELS[item.answer]} for {why.label}: {why.reason}
        </p>
      )}
    </article>
  )
}
