import type { ReactNode } from 'react'
import { CATEGORY_LABELS, RULES_BY_ID } from '../domain/restrictions'
import type { FindingType, RestrictionCategory, RestrictionProfile, SourceKind, VerdictValue } from '../domain/types'
import { BackIcon } from './icons'

// Display words. Never "safe" or "unsafe" (GLOSSARY: Verdict).
export const VERDICT_LABELS: Record<VerdictValue, string> = {
  fits: 'Fits',
  doesnt_fit: "Doesn't fit",
  not_enough_info: 'Not enough info',
}

export const SOURCE_KIND_LABELS: Record<SourceKind, string> = {
  official_certification: 'Official certification',
  manufacturer: 'Manufacturer',
  restaurant_confirmed: 'Restaurant-confirmed',
  community_reported: 'Community-reported',
  online_menu: 'Read from an online menu',
}

export const FINDING_TYPE_LABELS: Record<FindingType, string> = {
  ingredient: 'Ingredient',
  may_contain: 'May contain',
  certification: 'Certification',
  claim: 'Claim',
}

export function PageHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <header className="page-header">
      {onBack ? (
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
      ) : (
        <span className="icon-btn-spacer" />
      )}
      <h1>{title}</h1>
      {right ?? <span className="icon-btn-spacer" />}
    </header>
  )
}

export function VerdictBadge({ value, large }: { value: VerdictValue; large?: boolean }) {
  return <span className={`badge badge-${value}${large ? ' badge-lg' : ''}`}>{VERDICT_LABELS[value]}</span>
}

export function SourceKindBadge({ kind }: { kind: SourceKind }) {
  return <span className={`kind kind-${kind}`}>{SOURCE_KIND_LABELS[kind]}</span>
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner" />
      {label && <p>{label}</p>}
    </div>
  )
}

/** The Diner's Restriction profile as chips, grouped by Restriction category. */
export function ProfileSummary({ profile }: { profile: RestrictionProfile }) {
  const groups: RestrictionCategory[] = ['religious', 'lifestyle', 'medical']
  const empty = !profile.restrictions.length && !profile.custom.length
  return (
    <div className="summary">
      {empty && <p className="muted">No restrictions picked yet.</p>}
      {groups.map((cat) => {
        const names = [
          ...profile.restrictions.filter((id) => RULES_BY_ID[id]?.category === cat).map((id) => RULES_BY_ID[id].label),
          ...profile.custom.filter((c) => c.category === cat).map((c) => c.text),
        ]
        if (!names.length) return null
        return (
          <div key={cat} className="summary-group">
            <h3>{CATEGORY_LABELS[cat]}</h3>
            <div className="chip-row">
              {names.map((n) => (
                <span key={n} className="chip chip-static">{n}</span>
              ))}
            </div>
          </div>
        )
      })}
      <div className="summary-group">
        <h3>Cuisine preferences</h3>
        {profile.cuisines.length ? (
          <div className="chip-row">
            {profile.cuisines.map((c) => (
              <span key={c} className="chip chip-static chip-soft">{c}</span>
            ))}
          </div>
        ) : (
          <p className="muted">None picked.</p>
        )}
      </div>
    </div>
  )
}

/** Short one-line list of the Diner's Restrictions, for the Scanner. */
export function restrictionNames(profile: RestrictionProfile): string[] {
  return [...profile.restrictions.map((id) => RULES_BY_ID[id]?.label).filter(Boolean), ...profile.custom.map((c) => c.text)]
}
