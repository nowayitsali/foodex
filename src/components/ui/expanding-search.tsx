// A round search button that springs open into the SuggestiveSearch field.
// Adapted from the shadcn "ExpandingSearchDock" for this app's plain CSS.
import { AnimatePresence, motion } from 'motion/react'
import { Search, X } from 'lucide-react'
import { SuggestiveSearch } from './suggestive-search'

interface ExpandingSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suggestions: string[]
  onSubmit: (query: string) => void
  label?: string
}

export function ExpandingSearch({ open, onOpenChange, suggestions, onSubmit, label = 'Search' }: ExpandingSearchProps) {
  const close = () => onOpenChange(false)

  return (
    <div className={`xs ${open ? 'xs-open' : ''}`}>
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.button
            key="button"
            type="button"
            className="glass-btn glass-icon"
            aria-label={label}
            onClick={() => onOpenChange(true)}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Search size={20} />
          </motion.button>
        ) : (
          <motion.div
            key="field"
            className="xs-field"
            initial={{ width: 44, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            exit={{ width: 44, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <SuggestiveSearch
              className="ss-glass"
              label={label}
              suggestions={suggestions}
              autoFocus
              onEscape={close}
              onSubmit={(q) => {
                onSubmit(q)
                close()
              }}
              trailing={
                <button type="button" className="ss-close" aria-label="Close search" onClick={close}>
                  <X size={16} />
                </button>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExpandingSearch
