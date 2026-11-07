import type { User } from '@supabase/supabase-js'
import type { ReactNode } from 'react'
import type { Screen } from '../App'
import { Avatar, displayName } from '../screens/Profile'
import { ChevronIcon, CloseIcon, PinIcon, SettingsIcon, StoreIcon, UserIcon } from './icons'

const ITEMS: { screen: Screen; label: string; icon: ReactNode }[] = [
  { screen: 'nearby', label: 'Nearby', icon: <PinIcon /> },
  { screen: 'restaurants', label: 'Restaurant Search', icon: <StoreIcon /> },
  { screen: 'profile', label: 'Profile', icon: <UserIcon /> },
  { screen: 'settings', label: 'Settings', icon: <SettingsIcon /> },
]

interface Props {
  open: boolean
  user: User | null
  demo: boolean
  onClose: () => void
  onGo: (s: Screen) => void
}

export function Menu({ open, user, demo, onClose, onGo }: Props) {
  if (!open) return null
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <nav className="drawer" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <Avatar user={user} size={44} />
          <div>
            <strong>{displayName(user)}</strong>
            <span className="muted small">{demo ? 'Demo mode' : user?.email}</span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>
        <ul>
          {ITEMS.map((it) => (
            <li key={it.screen}>
              <button onClick={() => onGo(it.screen)}>
                <span className="drawer-icon">{it.icon}</span>
                <span className="drawer-label">{it.label}</span>
                {it.screen === 'nearby' && <span className="soon">Soon</span>}
                <ChevronIcon size={18} />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
