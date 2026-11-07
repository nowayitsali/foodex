import type { User } from '@supabase/supabase-js'
import type { RestrictionProfile } from '../domain/types'
import { EMPTY_PROFILE } from '../lib/profile'
import { RestrictionPicker } from '../components/RestrictionPicker'

export function Onboarding({ user, onSave }: { user: User | null; onSave: (p: RestrictionProfile) => Promise<void> }) {
  const first = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0]
  return (
    <main className="page">
      <div className="onboarding-intro">
        <h1>{first ? `Welcome, ${first}` : 'Welcome to Foodex'}</h1>
        <p>Pick your restrictions once. Foodex checks every Scan and Search against all of them.</p>
      </div>
      <RestrictionPicker initial={EMPTY_PROFILE} submitLabel="Save and start scanning" onSave={onSave} />
    </main>
  )
}
