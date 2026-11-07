import type { User } from '@supabase/supabase-js'
import type { RestrictionProfile } from '../domain/types'
import { Pencil, ShieldCheck } from 'lucide-react'
import { PageHeader, ProfileSummary } from '../components/ui'
import { AnimatedGroup } from '../components/premium'

export function displayName(user: User | null) {
  const m = user?.user_metadata ?? {}
  return (m.full_name || m.name || user?.email || 'Demo Diner') as string
}

export function Avatar({ user, size = 72 }: { user: User | null; size?: number }) {
  const url = user?.user_metadata?.avatar_url as string | undefined
  const name = displayName(user)
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return url ? (
    <img className="avatar" src={url} alt="" width={size} height={size} referrerPolicy="no-referrer" />
  ) : (
    <span className="avatar avatar-initials" style={{ width: size, height: size, fontSize: size * 0.38 }}>{initials}</span>
  )
}

interface Props {
  user: User | null
  profile: RestrictionProfile
  onBack: () => void
  onEdit: () => void
}

export function Profile({ user, profile, onBack, onEdit }: Props) {
  const restrictions = profile.restrictions.length + profile.custom.length
  return (
    <main className="page">
      <PageHeader title="Profile" onBack={onBack} />
      <AnimatedGroup className="page-body" stagger={0.08}>
        <section className="cr-profile-hero">
          <Avatar user={user} size={64} />
          <div>
            <h2>{displayName(user)}</h2>
            {user && <p>{user.email}</p>}
            <span className="cr-mode"><ShieldCheck size={12} /> {user ? 'Synced to your account' : 'Demo · on this device'}</span>
          </div>
        </section>

        <div className="cr-stats">
          <div className="cr-stat"><strong>{restrictions}</strong><span>Restrictions</span></div>
          <div className="cr-stat"><strong>{profile.custom.length}</strong><span>Custom</span></div>
          <div className="cr-stat"><strong>{profile.cuisines.length}</strong><span>Cuisines</span></div>
        </div>

        <section className="card">
          <div className="card-title-row">
            <h2>Restriction profile</h2>
            <button type="button" className="cr-edit" onClick={onEdit}><Pencil size={13} /> Edit</button>
          </div>
          <ProfileSummary profile={profile} />
        </section>
      </AnimatedGroup>
    </main>
  )
}
