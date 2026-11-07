// Search input whose empty state types out example searches.
// Adapted from the shadcn "SuggestiveSearch" component for this app's plain CSS
// (no Tailwind): typewriter effect only, plus submit on Enter.
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { motion } from 'motion/react'
import { Search } from 'lucide-react'

interface TypewriterProps {
  text: string
  typeDurationMs: number
  deleteDurationMs: number
  pauseAfterTypeMs: number
  reducedMotion: boolean
  onDone: () => void
}

/** Reveals the text left to right, holds it, then hides it and calls onDone. */
function Typewriter({ text, typeDurationMs, deleteDurationMs, pauseAfterTypeMs, reducedMotion, onDone }: TypewriterProps) {
  const [phase, setPhase] = useState<'typing' | 'paused' | 'deleting'>('typing')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    setPhase('typing')
    if (reducedMotion) timer.current = window.setTimeout(onDone, Math.max(1500, pauseAfterTypeMs))
    return () => window.clearTimeout(timer.current)
  }, [text, reducedMotion])

  if (reducedMotion) return <span className="ss-suggestion">{text}</span>

  return (
    <motion.div
      key={text}
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
        } else if (phase === 'deleting') onDone()
      }}
    >
      <span className="ss-suggestion">{text}</span>
      <motion.span
        aria-hidden
        className="ss-cursor"
        animate={phase === 'deleting' ? { opacity: 0 } : { opacity: [0, 1, 0] }}
        transition={phase === 'deleting' ? { duration: 0.1 } : { repeat: Infinity, duration: 0.9, ease: 'linear' }}
      />
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

  // The typed-out suggestion shows only while the box is empty and not focused.
  const overlayActive = !search && !focused && suggestions.length > 0

  return (
    <form
      role="search"
      className={['ss-wrapper', className].filter(Boolean).join(' ')}
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
        placeholder={focused ? label : ''}
        value={search}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setSearch(e.target.value)
          onChange?.(e.target.value)
        }}
      />
      {overlayActive && (
        <div className="ss-overlay" aria-hidden>
          <Typewriter
            text={current}
            typeDurationMs={typeDurationMs}
            deleteDurationMs={deleteDurationMs}
            pauseAfterTypeMs={pauseAfterTypeMs}
            reducedMotion={reducedMotion}
            onDone={() => setIndex((i) => (i + 1) % suggestions.length)}
          />
        </div>
      )}
    </form>
  )
}

export default SuggestiveSearch
