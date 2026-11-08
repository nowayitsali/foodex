/*
 * The "thinking" record shown above Results: what Foodex actually looked up, in order,
 * with the source of each step. Collapsed to one line ("Checked 2 sources in 3.1s"),
 * like a chat assistant's reasoning panel. Every line comes from a real event or from
 * the data that came back, never from the loading animation's timer.
 */
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronDown, MousePointerClick } from 'lucide-react'
import { LinkIcon } from './icons'
import { SourceLogo, SOURCES, type SourceId } from './SourceSweep'

export interface TraceEntry {
  /** Who did this step: a source, or the Diner picking an option. */
  by: SourceId | 'you'
  text: string
  detail?: string
  href?: string
  /** Milliseconds since the check started. */
  at: number
}

const EASE = [0.22, 1, 0.36, 1] as const

function seconds(ms: number) {
  return ms < 1000 ? `${Math.max(0.1, ms / 1000).toFixed(1)}s` : `${(ms / 1000).toFixed(1)}s`
}

export function ThinkingTrace({ entries }: { entries: TraceEntry[] }) {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  if (!entries.length) return null
  const sources = [...new Set(entries.map((e) => e.by).filter((b): b is SourceId => b !== 'you' && b !== 'foodex'))]
  const total = entries[entries.length - 1].at

  return (
    <div className={`tt${open ? ' tt-open' : ''}`}>
      <button className="tt-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="tt-stack" aria-hidden>
          {[...sources, 'foodex' as const].map((s) => (
            <span key={s} className="tt-stack-logo">
              <SourceLogo id={s} size={14} />
            </span>
          ))}
        </span>
        <span className="tt-head-text">
          Checked {sources.length} {sources.length === 1 ? 'source' : 'sources'} in {seconds(total)}
        </span>
        <motion.span className="tt-chev" animate={{ rotate: open ? 180 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <motion.ol
              className="tt-list"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}
            >
              {entries.map((e, i) => (
                <motion.li
                  key={i}
                  className="tt-item"
                  variants={{
                    hidden: reduce ? { opacity: 0 } : { opacity: 0, x: -12, filter: 'blur(4px)' },
                    show: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 340, damping: 30 } },
                  }}
                >
                  <span className="tt-rail" aria-hidden>
                    <span className="tt-logo">{e.by === 'you' ? <MousePointerClick size={13} /> : <SourceLogo id={e.by} size={14} />}</span>
                  </span>
                  <span className="tt-body">
                    <span className="tt-text">
                      {e.href ? (
                        <a href={e.href} target="_blank" rel="noopener noreferrer">
                          {e.text} <LinkIcon size={12} />
                        </a>
                      ) : (
                        e.text
                      )}
                    </span>
                    {e.detail && <span className="tt-detail">{e.detail}</span>}
                    <span className="tt-meta">
                      {e.by === 'you' ? 'You' : SOURCES[e.by].name} · {seconds(e.at)}
                    </span>
                  </span>
                </motion.li>
              ))}
            </motion.ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
