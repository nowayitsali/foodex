import type { User } from '@supabase/supabase-js'
import type { RestrictionProfile } from '../domain/types'
import { supabase } from './supabase'

// The Restriction profile lives in the Supabase user's metadata, so no table
// is needed. In demo mode (no Supabase keys) it lives on this device.

const META_KEY = 'foodex_profile'
const LOCAL_KEY = 'foodex.profile'

export const EMPTY_PROFILE: RestrictionProfile = { restrictions: [], custom: [], cuisines: [] }

function isProfile(v: unknown): v is RestrictionProfile {
  const p = v as RestrictionProfile
  return !!p && Array.isArray(p.restrictions) && Array.isArray(p.custom) && Array.isArray(p.cuisines)
}

export function loadProfile(user: User | null): RestrictionProfile | null {
  if (user) {
    const p = user.user_metadata?.[META_KEY]
    return isProfile(p) ? p : null
  }
  try {
    const p = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? 'null')
    return isProfile(p) ? p : null
  } catch {
    return null
  }
}

export async function saveProfile(user: User | null, profile: RestrictionProfile) {
  if (user && supabase) {
    const { error } = await supabase.auth.updateUser({ data: { [META_KEY]: profile } })
    if (error) throw error
    return
  }
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(profile))
  } catch {
    // Private mode: the profile still works for this visit.
  }
}

export function clearLocalProfile() {
  try {
    localStorage.removeItem(LOCAL_KEY)
  } catch {
    // ignore
  }
}
