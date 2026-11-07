import type { User } from '@supabase/supabase-js'
import type { RestrictionProfile } from '../domain/types'
import { PageHeader, ProfileSummary } from '../components/ui'

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
  return (
    <main className="page">
      <PageHeader title="Profile" onBack={onBack} />
      <section className="profile-head">
        <Avatar user={user} />
        <div>
          <h2>{displayName(user)}</h2>
          {user ? <p className="muted">{user.email}</p> : <p className="muted">Demo mode: saved on this device only</p>}
        </div>
      </section>
      <section className="card">
        <div className="card-title-row">
          <h2>Restriction profile</h2>
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>Edit</button>
        </div>
        <ProfileSummary profile={profile} />
      </section>
    </main>
  )
}
