import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, MapPin, Search, ShieldCheck } from 'lucide-react'
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

function checkDishes(r: DemoRestaurant, profile: RestrictionProfile): CheckedDish[] {
  return r.dishes.map((dish) => {
    const verdicts = judge(dish.research, profile)
    return { dish, verdicts, answer: overall(verdicts) }
  })
}

export function RestaurantSearch({ profile, onBack }: Props) {
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const names = restrictionNames(profile)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DEMO_RESTAURANTS.filter((r) => !q || r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q))
      .map((r) => ({ r, fits: checkDishes(r, profile).filter((d) => d.answer === 'fits').length }))
      // Most fitting dishes first. Cuisine preferences only break ties (GLOSSARY), then distance.
      .sort(
        (a, b) =>
          b.fits - a.fits ||
          Number(profile.cuisines.includes(b.r.cuisine)) - Number(profile.cuisines.includes(a.r.cuisine)) ||
          a.r.distanceKm - b.r.distanceKm,
      )
  }, [query, profile])

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
        {!results.length && <p className="rs-empty">No restaurants match “{query}”.</p>}
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
  const checking = restrictionNames(profile).length > 0

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
                <span className="rs-dot" /> {g.title} <span>{items.length}</span>
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
