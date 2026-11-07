import { useMemo, useState } from 'react'
import { CUISINES } from '../domain/restrictions'
import type { RestrictionProfile } from '../domain/types'
import { judge, overall } from '../domain/verdicts'
import { ChevronIcon, PinIcon, SearchIcon } from '../components/icons'
import { PageHeader, SourceKindBadge, VerdictBadge } from '../components/ui'
import { DEMO_RESTAURANTS, type DemoDish, type DemoRestaurant } from './restaurantDemo'

// Layout only: real restaurant search is a later slice. Uses demo data.

export function RestaurantSearch({ profile, onBack }: { profile: RestrictionProfile; onBack: () => void }) {
  const [query, setQuery] = useState('')
  const [cuisine, setCuisine] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DEMO_RESTAURANTS.filter(
      (r) => (!cuisine || r.cuisine === cuisine) && (!q || r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q)),
    )
      // Cuisine preferences only change the order (GLOSSARY).
      .sort((a, b) => Number(profile.cuisines.includes(b.cuisine)) - Number(profile.cuisines.includes(a.cuisine)) || a.distanceKm - b.distanceKm)
  }, [query, cuisine, profile.cuisines])

  const opened = DEMO_RESTAURANTS.find((r) => r.id === openId)
  if (opened) return <RestaurantDetail restaurant={opened} profile={profile} onBack={() => setOpenId(null)} />

  return (
    <main className="page">
      <PageHeader title="Restaurant Search" onBack={onBack} right={<span className="demo-tag">Demo data</span>} />
      <div className="search-box">
        <SearchIcon size={20} />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Restaurant name or cuisine" />
      </div>
      <div className="chip-row chip-scroll">
        <button className="chip" aria-pressed={!cuisine} onClick={() => setCuisine(null)}>All</button>
        {CUISINES.map((c) => (
          <button key={c} className="chip" aria-pressed={cuisine === c} onClick={() => setCuisine(cuisine === c ? null : c)}>
            {c}
          </button>
        ))}
      </div>

      <p className="note note-info small">These restaurants and menus are made-up demo data for the layout.</p>

      <div className="restaurant-list">
        {results.map((r) => (
          <button key={r.id} className="card restaurant-card" onClick={() => setOpenId(r.id)}>
            <div className="restaurant-thumb">{r.name[0]}</div>
            <div className="restaurant-info">
              <h3>{r.name}</h3>
              <p className="muted small">
                {r.cuisine} · <PinIcon size={13} /> {r.distanceKm.toFixed(1)} km
              </p>
              <div className="restaurant-meta">
                <SourceKindBadge kind={r.verification} />
                <span className="muted small">{fittingCount(r, profile)} of {r.dishes.length} Dishes fit</span>
              </div>
            </div>
            <ChevronIcon size={18} />
          </button>
        ))}
        {!results.length && <p className="muted center">No demo restaurants match.</p>}
      </div>
    </main>
  )
}

function dishVerdicts(d: DemoDish, profile: RestrictionProfile) {
  const verdicts = judge(d.research, profile)
  return { verdicts, answer: overall(verdicts) }
}

function fittingCount(r: DemoRestaurant, profile: RestrictionProfile) {
  return r.dishes.filter((d) => dishVerdicts(d, profile).answer === 'fits').length
}

function RestaurantDetail({ restaurant, profile, onBack }: { restaurant: DemoRestaurant; profile: RestrictionProfile; onBack: () => void }) {
  const noRestrictions = !profile.restrictions.length && !profile.custom.length
  return (
    <main className="page">
      <PageHeader title={restaurant.name} onBack={onBack} right={<span className="demo-tag">Demo data</span>} />
      <section className="restaurant-hero card">
        <div className="restaurant-thumb restaurant-thumb-lg">{restaurant.name[0]}</div>
        <div className="restaurant-hero-info">
          <h2>{restaurant.name}</h2>
          <p className="muted small">{restaurant.cuisine} · {restaurant.distanceKm.toFixed(1)} km away</p>
          <SourceKindBadge kind={restaurant.verification} />
        </div>
      </section>

      <h2 className="section-title">Dishes</h2>
      {noRestrictions && <p className="muted small">Add restrictions in Settings to see Verdicts for each Dish.</p>}
      <div className="dish-list">
        {restaurant.dishes.map((d) => {
          const { verdicts, answer } = dishVerdicts(d, profile)
          return (
            <article key={d.name} className="card dish-card">
              <div className="dish-head">
                <div>
                  <h3>{d.name}</h3>
                  <p className="muted small">{d.description}</p>
                </div>
                <span className="dish-price">{d.price}</span>
              </div>
              {verdicts.length > 0 && (
                <>
                  <VerdictBadge value={answer} />
                  <div className="dish-verdicts">
                    {verdicts.map((v) => (
                      <span key={v.restrictionKey} className={`mini-verdict mini-${v.value}`} title={v.reason}>
                        {v.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </article>
          )
        })}
      </div>
    </main>
  )
}
