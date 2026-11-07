// Search input whose empty state types out example searches.
// Adapted from the shadcn "SuggestiveSearch" component for this app's plain CSS
// (no Tailwind): typewriter effect only, plus submit on Enter.
import { useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Search } from 'lucide-react'

interface TypewriterProps {
  text: string
  typeDurationMs: number
  deleteDurationMs: number
  pauseAfterTypeMs: number
  reducedMotion: boolean
  /** Hide the fake cursor while the real one is blinking. */
  hideCursor?: boolean
  onDone: () => void
}

/**
 * Reveals the text left to right, holds it, then hides it and calls onDone.
 * The parent gives each suggestion its own key, so every one starts fresh in
 * the typing phase. (Reusing one instance made it skip or stick on a blank.)
 */
function Typewriter({ text, typeDurationMs, deleteDurationMs, pauseAfterTypeMs, reducedMotion, hideCursor, onDone }: TypewriterProps) {
  const [phase, setPhase] = useState<'typing' | 'paused' | 'deleting'>('typing')
  const timer = useRef<number | undefined>(undefined)
  const done = useRef(false)
  const finish = () => {
    if (done.current) return
    done.current = true
    onDone()
  }

  useEffect(() => {
    if (reducedMotion) timer.current = window.setTimeout(finish, Math.max(1500, pauseAfterTypeMs))
    return () => window.clearTimeout(timer.current)
  }, [])

  if (reducedMotion) return <span className="ss-suggestion">{text}</span>

  return (
    <motion.div
      className="ss-reveal"
      initial={{ width: '0%' }}
      animate={{ width: phase === 'deleting' ? '0%' : '100%' }}
      transition={
        phase === 'typing'
          ? { duration: typeDurationMs / 1000, ease: 'linear' }
          : phase === 'deleting'
            ? { duration: deleteDurationMs / 1000, ease: 'linear' }
            : {}
      }
      onAnimationComplete={() => {
        if (phase === 'typing') {
          setPhase('paused')
          timer.current = window.setTimeout(() => setPhase('deleting'), pauseAfterTypeMs)
        } else if (phase === 'deleting') finish()
      }}
    >
      <span className="ss-suggestion">{text}</span>
      {!hideCursor && (
      <motion.span
        aria-hidden
        className="ss-cursor"
        animate={phase === 'deleting' ? { opacity: 0 } : { opacity: [0, 1, 0] }}
        transition={phase === 'deleting' ? { duration: 0.1 } : { repeat: Infinity, duration: 0.9, ease: 'linear' }}
      />
      )}
    </motion.div>
  )
}

export interface SuggestiveSearchProps {
  suggestions: string[]
  /** Called with the trimmed text when the Diner presses Enter. */
  onSubmit?: (query: string) => void
  onChange?: (value: string) => void
  className?: string
  /** Accessible name for the input. */
  label?: string
  Leading?: () => ReactElement
  /** Shown at the right end, for example a close button. */
  trailing?: ReactNode
  autoFocus?: boolean
  /** Called when the Diner presses Escape. */
  onEscape?: () => void
  typeDurationMs?: number
  deleteDurationMs?: number
  pauseAfterTypeMs?: number
}

export function SuggestiveSearch({
  suggestions,
  onSubmit,
  onChange,
  className,
  label = 'Search',
  Leading = () => <Search size={18} aria-hidden />,
  trailing,
  autoFocus,
  onEscape,
  typeDurationMs = 700,
  deleteDurationMs = 300,
  pauseAfterTypeMs = 1600,
}: SuggestiveSearchProps) {
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)
  const [index, setIndex] = useState(0)
  const current = suggestions[index % Math.max(1, suggestions.length)] ?? ''
  const inputRef = useRef<HTMLInputElement>(null)

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  // The typed-out suggestion acts as an animated placeholder while the box is empty.
  const overlayActive = !search && suggestions.length > 0

  return (
    <form
      role="search"
      className={['ss-wrapper', trailing ? 'ss-has-trailing' : '', className].filter(Boolean).join(' ')}
      onSubmit={(e) => {
        e.preventDefault()
        const q = search.trim()
        if (q) {
          onSubmit?.(q)
          inputRef.current?.blur()
        }
      }}
    >
      <span className="ss-leading">
        <Leading />
      </span>
      <input
        ref={inputRef}
        className="ss-input"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        aria-label={label}
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onEscape?.()
        }}
        value={search}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setSearch(e.target.value)
          onChange?.(e.target.value)
        }}
      />
      {trailing}
      {overlayActive && (
        <div className="ss-overlay" aria-hidden>
          <Typewriter
            key={`${index}:${current}`}
            text={current}
            typeDurationMs={typeDurationMs}
            deleteDurationMs={deleteDurationMs}
            pauseAfterTypeMs={pauseAfterTypeMs}
            reducedMotion={reducedMotion}
            hideCursor={focused}
            onDone={() => setIndex((i) => (i + 1) % suggestions.length)}
          />
        </div>
      )}
    </form>
  )
}

export default SuggestiveSearch
