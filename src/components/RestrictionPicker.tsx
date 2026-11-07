import { useState } from 'react'
import { CATEGORY_LABELS, CUISINES, RESTRICTIONS } from '../domain/restrictions'
import type { CustomRestriction, RestrictionCategory, RestrictionId, RestrictionProfile } from '../domain/types'
import { CheckIcon } from './icons'

// Picks the Restriction profile. Used on first sign-in and in Settings.

const CATEGORIES: RestrictionCategory[] = ['religious', 'lifestyle', 'medical']

const OTHER_HINT: Record<CustomRestriction['category'], string> = {
  religious: 'e.g. Jain, no beef',
  medical: 'e.g. mustard, celery',
}

function joinCustom(profile: RestrictionProfile, category: CustomRestriction['category']) {
  return profile.custom.filter((c) => c.category === category).map((c) => c.text).join(', ')
}

/** "mustard, celery" -> two Custom restrictions. */
function splitCustom(text: string, category: CustomRestriction['category']): CustomRestriction[] {
  const seen = new Set<string>()
  return text
    .split(/[,;\n]/)
    .map((t) => t.trim())
    .filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()))
    .map((t) => ({ category, text: t }))
}

function toggle<T>(set: Set<T>, value: T) {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

interface Props {
  initial: RestrictionProfile
  submitLabel: string
  onSave: (profile: RestrictionProfile) => Promise<void>
}

export function RestrictionPicker({ initial, submitLabel, onSave }: Props) {
  const [selected, setSelected] = useState(() => new Set<RestrictionId>(initial.restrictions))
  const [other, setOther] = useState({ religious: joinCustom(initial, 'religious'), medical: joinCustom(initial, 'medical') })
  const [cuisines, setCuisines] = useState(() => new Set(initial.cuisines))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changed = () => {
    setSaved(false)
    setError(null)
  }

  async function save() {
    setSaving(true)
    setError(null)
    const profile: RestrictionProfile = {
      restrictions: RESTRICTIONS.map((r) => r.id).filter((id) => selected.has(id)),
      custom: [...splitCustom(other.religious, 'religious'), ...splitCustom(other.medical, 'medical')],
      cuisines: CUISINES.filter((c) => cuisines.has(c)),
    }
    try {
      await onSave(profile)
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const count = selected.size + splitCustom(other.religious, 'religious').length + splitCustom(other.medical, 'medical').length

  return (
    <div className="picker">
      {CATEGORIES.map((cat) => (
        <section key={cat} className="card picker-group">
          <h2>{CATEGORY_LABELS[cat]}</h2>
          <div className="chip-row">
            {RESTRICTIONS.filter((r) => r.category === cat).map((r) => {
              const on = selected.has(r.id)
              return (
                <button
                  key={r.id}
                  type="button"
                  className="chip"
                  aria-pressed={on}
                  onClick={() => {
                    setSelected(toggle(selected, r.id))
                    changed()
                  }}
                >
                  {on && <CheckIcon size={15} />}
                  {r.label}
                </button>
              )
            })}
          </div>
          {(cat === 'religious' || cat === 'medical') && (
            <label className="field">
              <span>Other</span>
              <input
                type="text"
                value={other[cat]}
                placeholder={OTHER_HINT[cat]}
                onChange={(e) => {
                  setOther({ ...other, [cat]: e.target.value })
                  changed()
                }}
              />
              <small>Separate several with commas.</small>
            </label>
          )}
        </section>
      ))}

      <section className="card picker-group">
        <h2>Cuisine preferences</h2>
        <p className="muted small">Only changes the order of results. It never overrides a restriction.</p>
        <div className="chip-row">
          {CUISINES.map((c) => {
            const on = cuisines.has(c)
            return (
              <button
                key={c}
                type="button"
                className="chip chip-cuisine"
                aria-pressed={on}
                onClick={() => {
                  setCuisines(toggle(cuisines, c))
                  changed()
                }}
              >
                {on && <CheckIcon size={15} />}
                {c}
              </button>
            )
          })}
        </div>
      </section>

      <p className="muted small picker-strict">
        Every restriction is strict: any trace, including "may contain", counts as Doesn't fit.
      </p>

      <div className="sticky-actions">
        {error && <p className="note note-error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : saved ? 'Saved' : `${submitLabel}${count ? ` (${count})` : ''}`}
        </button>
      </div>
    </div>
  )
}
