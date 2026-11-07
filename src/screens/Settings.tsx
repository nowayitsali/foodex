import { useState } from 'react'
import type { RestrictionProfile } from '../domain/types'
import { RestrictionPicker } from '../components/RestrictionPicker'
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
      <h2 className="section-title">Your restrictions</h2>
      <p className="muted small">Changes apply to your next check right away.</p>
      <RestrictionPicker initial={profile} submitLabel="Save changes" onSave={onSave} />

      <section className="card settings-account">
        <h2>Account</h2>
        <p className="muted small">
          {demo ? 'Leaving demo mode clears the restrictions saved on this device.' : 'Sign out before handing your phone to someone else.'}
        </p>
        <button
          className="btn btn-danger btn-block"
          disabled={signingOut}
          onClick={async () => {
            setSigningOut(true)
            await onSignOut().catch(() => setSigningOut(false))
          }}
        >
          {signingOut ? 'Signing out…' : demo ? 'Leave demo mode' : 'Sign out'}
        </button>
      </section>
    </main>
  )
}
