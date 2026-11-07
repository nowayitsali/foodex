import type { User } from '@supabase/supabase-js'
import type { RestrictionProfile } from '../domain/types'
import { EMPTY_PROFILE } from '../lib/profile'
import { RestrictionPicker } from '../components/RestrictionPicker'
import { TextEffect } from '../components/premium'

export function Onboarding({ user, onSave }: { user: User | null; onSave: (p: RestrictionProfile) => Promise<void> }) {
  const first = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0]
  return (
    <main className="page">
      <div className="cr-intro">
        <p className="cr-eyebrow"><span /> One quick step</p>
        <h1 className="cr-title">
          <TextEffect>{first ? `Welcome, ${first}.` : 'Welcome to foodex.'}</TextEffect>
          <br />
          <em><TextEffect delay={0.2}>What should we watch for?</TextEffect></em>
        </h1>
        <p className="cr-sub">Pick your restrictions once. Foodex checks every Scan and Search against all of them, together.</p>
      </div>
      <RestrictionPicker initial={EMPTY_PROFILE} submitLabel="Save and start scanning" onSave={onSave} />
    </main>
  )
}
