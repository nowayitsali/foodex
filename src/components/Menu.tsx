import type { User } from '@supabase/supabase-js'
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { ChevronRight, MapPin, Menu as MenuBars, Settings, Store, UserRound, X } from 'lucide-react'
import type { Screen } from '../App'
import { Avatar, displayName } from '../screens/Profile'
import { MorphingPopover, MorphingPopoverClose, MorphingPopoverContent, MorphingPopoverTrigger } from './ui/morphing-popover'

const ITEMS: { screen: Screen; label: string; icon: ReactNode }[] = [
  { screen: 'nearby', label: 'Nearby', icon: <MapPin size={18} /> },
  { screen: 'restaurants', label: 'Restaurant Search', icon: <Store size={18} /> },
  { screen: 'profile', label: 'Profile', icon: <UserRound size={18} /> },
  { screen: 'settings', label: 'Settings', icon: <Settings size={18} /> },
]

interface Props {
  open: boolean
  user: User | null
  demo: boolean
  onOpenChange: (open: boolean) => void
  onGo: (s: Screen) => void
}

/** The round glass menu button. Tapping it morphs it into a small panel of links. */
export function Menu({ open, user, demo, onOpenChange, onGo }: Props) {
  return (
    <MorphingPopover open={open} onOpenChange={onOpenChange} className="menu-pop">
      <MorphingPopoverTrigger className="glass-btn glass-icon" label="Menu">
        <MenuBars size={20} />
      </MorphingPopoverTrigger>

      <MorphingPopoverContent className="menu-panel" label="Menu">
        <div className="menu-head">
          <Avatar user={user} size={36} />
          <div className="menu-who">
            <strong>{displayName(user)}</strong>
            <span>{demo ? 'Demo mode' : user?.email}</span>
          </div>
          <MorphingPopoverClose className="menu-close" label="Close menu">
            <X size={20} />
          </MorphingPopoverClose>
        </div>
        <ul className="menu-list">
          {ITEMS.map((it, i) => (
            <motion.li
              key={it.screen}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.14 + i * 0.04, duration: 0.2 } }}
            >
              <button type="button" className="menu-item" onClick={() => onGo(it.screen)}>
                <span className="menu-item-icon">{it.icon}</span>
                <span className="menu-item-label">{it.label}</span>
                {it.screen === 'nearby' ? <span className="soon">Soon</span> : <ChevronRight size={16} className="menu-item-chev" />}
              </button>
            </motion.li>
          ))}
        </ul>
      </MorphingPopoverContent>
    </MorphingPopover>
  )
}
