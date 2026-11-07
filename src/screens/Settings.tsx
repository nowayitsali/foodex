import { useState } from 'react'
import type { RestrictionProfile } from '../domain/types'
import { RestrictionPicker } from '../components/RestrictionPicker'
import { LogOut } from 'lucide-react'
import { PageHeader } from '../components/ui'

interface Props {
  profile: RestrictionProfile
  demo: boolean
  onSave: (p: RestrictionProfile) => Promise<void>
  onSignOut: () => Promise<void>
  onBack: () => void
}

export function Settings({ profile, demo, onSave, onSignOut, onBack }: Props) {
  const [signingOut, setSigningOut] = useState(false)
  return (
    <main className="page">
      <PageHeader title="Settings" onBack={onBack} />
      <div className="cr-intro">
        <p className="cr-eyebrow"><span /> Your restrictions</p>
        <h2 className="cr-title">Tune what we <em>watch for.</em></h2>
        <p className="cr-sub">Changes apply to your next check right away.</p>
      </div>
      <RestrictionPicker initial={profile} submitLabel="Save changes" onSave={onSave} />

      <section className="card cr-account">
        <div>
          <h2>Account</h2>
          <p>
            {demo ? 'Leaving demo mode clears the restrictions saved on this device.' : 'Sign out before handing your phone to someone else.'}
          </p>
        </div>
        <button
          type="button"
          className="cr-signout"
          disabled={signingOut}
          onClick={async () => {
            setSigningOut(true)
            await onSignOut().catch(() => setSigningOut(false))
          }}
        >
          <LogOut size={16} />
          {signingOut ? 'Signing out…' : demo ? 'Leave demo mode' : 'Sign out'}
        </button>
      </section>
    </main>
  )
}
