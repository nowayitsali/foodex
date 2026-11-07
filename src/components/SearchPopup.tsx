// The Scanner's search: a round glass button that morphs into a search popup.
// The list uses cmdk (MIT) for filtering and keyboard support; the morph follows
// motion-primitives' MorphingDialog (MIT).
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, type Transition } from 'motion/react'
import { Command } from 'cmdk'
import { ArrowUpRight, Clock, CornerDownLeft, Search, Sparkles, X } from 'lucide-react'

const SPRING: Transition = { type: 'spring', bounce: 0.12, duration: 0.42 }
const RECENT_KEY = 'foodex.recentSearches'
const MAX_RECENT = 5

function readRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list))
  } catch {
    // Private mode or blocked storage: recents just won't stick.
  }
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Product names to offer before the user types. */
  popular: string[]
  onSubmit: (query: string) => void
}

export function SearchPopup({ open, onOpenChange, popular, onSubmit }: Props) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>(readRecent)
  const close = () => onOpenChange(false)

  useEffect(() => {
    if (!open) return
    setQuery('')
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onOpenChange(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  function run(q: string) {
    const text = q.trim()
    if (!text) return
    const next = [text, ...recent.filter((r) => r.toLowerCase() !== text.toLowerCase())].slice(0, MAX_RECENT)
    setRecent(next)
    writeRecent(next)
    close()
    onSubmit(text)
  }

  function clearRecent() {
    setRecent([])
    writeRecent([])
  }

  const typed = query.trim()
  // cmdk needs unique values, so skip popular picks already in Recent.
  const popularLeft = popular.filter((p) => !recent.some((r) => r.toLowerCase() === p.toLowerCase()))

  return (
    <>
      <motion.button
        type="button"
        layoutId={`search-${id}`}
        className="glass-btn glass-icon"
        style={{ borderRadius: 22 }}
        onClick={() => onOpenChange(true)}
        aria-label="Search a food or product"
        aria-expanded={open}
        transition={SPRING}
      >
        <motion.span layoutId={`search-icon-${id}`} className="mp-icon" transition={SPRING}>
          <Search size={20} />
        </motion.span>
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div className="sp-layer" key="layer" exit={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <motion.div
                className="sp-backdrop"
                onClick={close}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                layoutId={`search-${id}`}
                className="sp-panel"
                style={{ borderRadius: 24 }}
                role="dialog"
                aria-modal="true"
                aria-label="Search"
                transition={SPRING}
              >
                <Command label="Search foods and products" className="sp-cmd" loop>
                  <div className="sp-input-row">
                    <motion.span layoutId={`search-icon-${id}`} className="mp-icon sp-input-icon" transition={SPRING}>
                      <Search size={20} />
                    </motion.span>
                    <Command.Input
                      autoFocus
                      value={query}
                      onValueChange={setQuery}
                      placeholder="Search a food, product or brand"
                      enterKeyHint="search"
                    />
                    <button type="button" className="sp-close" onClick={close} aria-label="Close search">
                      <X size={18} />
                    </button>
                  </div>

                  <motion.div
                    className="sp-body"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.12, duration: 0.18 } }}
                    exit={{ opacity: 0, transition: { duration: 0.06 } }}
                  >
                    <Command.List className="sp-list">
                      {typed && (
                        <Command.Group forceMount>
                          <Command.Item value={`__search ${typed}`} onSelect={() => run(typed)} className="sp-item sp-item-main" forceMount>
                            <span className="sp-item-icon"><Search size={17} /></span>
                            <span className="sp-item-label">Search “{typed}”</span>
                            <CornerDownLeft size={15} className="sp-item-end" />
                          </Command.Item>
                        </Command.Group>
                      )}

                      {recent.length > 0 && (
                        <Command.Group
                          heading={
                            <span className="sp-heading-row">
                              Recent
                              <button type="button" className="sp-clear" onClick={clearRecent}>Clear</button>
                            </span>
                          }
                        >
                          {recent.map((r) => (
                            <Command.Item key={`r-${r}`} value={r} onSelect={() => run(r)} className="sp-item">
                              <span className="sp-item-icon"><Clock size={16} /></span>
                              <span className="sp-item-label">{r}</span>
                              <ArrowUpRight size={15} className="sp-item-end" />
                            </Command.Item>
                          ))}
                        </Command.Group>
                      )}

                      {popularLeft.length > 0 && (
                      <Command.Group heading="Popular">
                        {popularLeft.map((p) => (
                          <Command.Item key={`p-${p}`} value={p} onSelect={() => run(p)} className="sp-item">
                            <span className="sp-item-icon"><Sparkles size={16} /></span>
                            <span className="sp-item-label">{p}</span>
                            <ArrowUpRight size={15} className="sp-item-end" />
                          </Command.Item>
                        ))}
                      </Command.Group>
                      )}
                    </Command.List>
                    <p className="sp-foot">Results come from Open Food Facts. Checked against your restrictions.</p>
                  </motion.div>
                </Command>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
