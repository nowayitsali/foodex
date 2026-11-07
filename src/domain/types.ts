// Shared vocabulary. Names follow GLOSSARY.md.

export type RestrictionCategory = 'religious' | 'lifestyle' | 'medical'

export type RestrictionId =
  | 'halal'
  | 'kosher'
  | 'vegetarian'
  | 'pescatarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'lactose_intolerance'
  | 'peanut_free'
  | 'tree_nut_free'
  | 'shellfish_free'
  | 'fish_free'
  | 'egg_free'
  | 'soy_free'
  | 'sesame_free'

export interface CustomRestriction {
  category: 'religious' | 'medical'
  text: string
}

export interface RestrictionProfile {
  restrictions: RestrictionId[]
  custom: CustomRestriction[]
  cuisines: string[]
}

export type SourceKind =
  | 'official_certification'
  | 'manufacturer'
  | 'restaurant_confirmed'
  | 'community_reported'
  | 'online_menu'

export interface Source {
  title: string
  url: string
  kind: SourceKind
}

export type FindingType = 'ingredient' | 'may_contain' | 'certification' | 'claim'

export interface Finding {
  type: FindingType
  text: string
  source: Source
}

/** Everything research turned up about one Confirmed item. */
export interface Research {
  findings: Finding[]
  /** True when a full ingredient list was found, not just a few ingredients. */
  ingredientsComplete: boolean
}

export type VerdictValue = 'fits' | 'doesnt_fit' | 'not_enough_info'

export interface Verdict {
  /** A RestrictionId, or "custom:<text>" for a Custom restriction. */
  restrictionKey: string
  label: string
  value: VerdictValue
  reason: string
  evidence: Finding[]
}

export interface Identification {
  name: string
  brand?: string
  kind: 'packaged_product' | 'dish' | 'ingredient' | 'menu' | 'other'
  description: string
}
