/*
 * Loading view for the Check flow: the sources Foodex reads, with a lens that glides
 * from logo to logo while each step is worked through.
 * Patterns follow Magic UI (AnimatedList) and motion-primitives (TextShimmer, layoutId
 * highlights), rebuilt on `motion` with plain CSS to match the cream and forest-green look.
 *
 * The server answers in one request, so steps advance on a timer. The last step stays
 * active until the answer arrives, so the view never claims work is done that isn't.
 */
import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, ListChecks, ScanBarcode, ShieldAlert, BadgeCheck, Wheat, Search, Images, MoonStar } from 'lucide-react'

export type SourceId = 'gemini' | 'off' | 'hma' | 'foodex'

export interface SweepStep {
  source: SourceId
  label: string
  icon?: ReactNode
}

const OFF_LOGO = 'https://static.openfoodfacts.org/images/logos/off-logo-icon-light.svg'

export const SOURCES: Record<SourceId, { name: string; role: string }> = {
  gemini: { name: 'Gemini', role: 'Reads the photo' },
  off: { name: 'Open Food Facts', role: 'Ingredients database' },
  hma: { name: 'HMA Halal Check', role: 'Canadian halal list' },
  foodex: { name: 'Foodex rules', role: 'On this device' },
}

/** Google Gemini's four-point sparkle. */
function GeminiMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden>
      <defs>
        <linearGradient id="sw-gem" x1="4" y1="24" x2="24" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1C7DFF" />
          <stop offset="0.52" stopColor="#1C69FF" />
          <stop offset="1" stopColor="#F0DCD6" />
        </linearGradient>
      </defs>
      <path
        d="M14 28C14 26.06 13.63 24.24 12.88 22.54C12.16 20.83 11.17 19.35 9.91 18.09C8.65 16.83 7.17 15.84 5.46 15.12C3.76 14.37 1.94 14 0 14C1.94 14 3.76 13.64 5.46 12.92C7.17 12.17 8.65 11.17 9.91 9.91C11.17 8.65 12.16 7.17 12.88 5.46C13.63 3.76 14 1.94 14 0C14 1.94 14.36 3.76 15.08 5.46C15.83 7.17 16.83 8.65 18.09 9.91C19.35 11.17 20.83 12.17 22.54 12.92C24.24 13.64 26.06 14 28 14C26.06 14 24.24 14.37 22.54 15.12C20.83 15.84 19.35 16.83 18.09 18.09C16.83 19.35 15.83 20.83 15.08 22.54C14.36 24.24 14 26.06 14 28Z"
        fill="url(#sw-gem)"
      />
    </svg>
  )
}

function OffMark({ size = 30 }: { size?: number }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className="sw-mono">OFF</span>
  return <img src={OFF_LOGO} width={size} height={size} alt="" onError={() => setFailed(true)} draggable={false} />
}

function FoodexMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 19c0-8 5-14 15-15-.5 10-6.5 15-14 15" />
      <path d="M5 19c3-4 6-6.5 9-8" />
    </svg>
  )
}

/** HMA's own logo isn't used; a crescent mark in its green stands in. */
function HmaMark({ size = 24 }: { size?: number }) {
  return (
    <span className="sw-hma" style={{ width: size, height: size }}>
      <MoonStar size={Math.round(size * 0.68)} strokeWidth={2.2} />
    </span>
  )
}

/** Which source a link belongs to, for its logo. */
export function sourceIdFor(url: string): SourceId {
  return /hmacanada\.org/.test(url) ? 'hma' : 'off'
}

export function SourceLogo({ id, size }: { id: SourceId; size?: number }) {
  if (id === 'gemini') return <GeminiMark size={size} />
  if (id === 'off') return <OffMark size={size} />
  if (id === 'hma') return <HmaMark size={size} />
  return <FoodexMark size={size} />
}

/** Text with a soft light passing through it. */
export function TextShimmer({ children, className = '' }: { children: string; className?: string }) {
  return <span className={`sw-shimmer ${className}`}>{children}</span>
}

const ICON = 16

/** Steps for working out what was scanned or searched. */
export function identifySteps(r: { image?: boolean; code?: string; query?: string }): SweepStep[] {
  if (r.code)
    return [
      { source: 'off', label: `Looking up barcode ${r.code}`, icon: <ScanBarcode size={ICON} /> },
      { source: 'off', label: 'Confirming the product name', icon: <Search size={ICON} /> },
    ]
  if (r.image)
    return [
      { source: 'gemini', label: 'Reading your photo', icon: <Images size={ICON} /> },
      { source: 'gemini', label: 'Spotting brand and product name', icon: <Search size={ICON} /> },
      { source: 'off', label: 'Matching it to real products', icon: <ScanBarcode size={ICON} /> },
      { source: 'foodex', label: 'Ranking the best matches', icon: <ListChecks size={ICON} /> },
    ]
  return [
    { source: 'off', label: `Searching for “${r.query ?? 'your item'}”`, icon: <Search size={ICON} /> },
    { source: 'off', label: 'Finding products with full ingredient lists', icon: <Wheat size={ICON} /> },
    { source: 'foodex', label: 'Ranking the best matches', icon: <ListChecks size={ICON} /> },
  ]
}

/** Steps for reading one confirmed item and checking it. */
export function researchSteps(restrictions: number, halal = false): SweepStep[] {
  return [
    ...(halal ? [{ source: 'hma' as const, label: "Checking HMA's halal list", icon: <MoonStar size={ICON} /> }] : []),
    { source: 'off', label: 'Opening the product page', icon: <Images size={ICON} /> },
    { source: 'off', label: 'Reading the ingredient list', icon: <Wheat size={ICON} /> },
    { source: 'off', label: 'Checking allergens and traces', icon: <ShieldAlert size={ICON} /> },
    { source: 'off', label: 'Reading labels and certifications', icon: <BadgeCheck size={ICON} /> },
    {
      source: 'foodex',
      label: restrictions === 1 ? 'Checking your restriction' : restrictions ? `Checking your ${restrictions} restrictions` : 'Checking your restrictions',
      icon: <ListChecks size={ICON} />,
    },
  ]
}

const EASE = [0.22, 1, 0.36, 1] as const

interface Props {
  title: string
  steps: SweepStep[]
  /** Photo or product image shown in the middle. */
  image?: string
  /** Sources shown in the top row, in order. */
  sources: SourceId[]
  stepMs?: number
}

export function SourceSweep({ title, steps, image, sources, stepMs = 900 }: Props) {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    setActive(0)
    const t = setInterval(() => setActive((n) => Math.min(n + 1, steps.length - 1)), stepMs)
    return () => clearInterval(t)
  }, [steps, stepMs])

  const current = steps[active]
  const doneSources = new Set(steps.slice(0, active).map((s) => s.source))
  doneSources.delete(current.source)

  return (
    <div className="sw" role="status" aria-live="polite" aria-label={`${title}: ${current.label}`}>
      <div className="sw-stage" aria-hidden>
        <span className="sw-ring" />
        <span className="sw-ring sw-ring-2" />
        <motion.div
          className="sw-core"
          initial={reduce ? false : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          {image ? <img src={image} alt="" /> : <SourceLogo id={current.source} size={34} />}
        </motion.div>
      </div>

      <div className="sw-logos" aria-hidden>
        {sources.map((id, i) => {
          const on = current.source === id
          const done = doneSources.has(id) && !on
          return (
            <motion.div
              key={id}
              className={`sw-logo${on ? ' sw-logo-on' : ''}${done ? ' sw-logo-done' : ''}`}
              // No blur here: a leftover filter would give each tile its own layer, and the
              // moving lens would cover the logo it is leaving.
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 + i * 0.08, ease: EASE }}
            >
              {on && <motion.span layoutId="sw-lens" className="sw-lens" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />}
              <motion.span className="sw-logo-mark" animate={{ scale: on && !reduce ? 1.08 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
                <SourceLogo id={id} />
              </motion.span>
              <span className="sw-logo-name">{SOURCES[id].name}</span>
              <span className="sw-logo-role">{SOURCES[id].role}</span>
              <AnimatePresence>
                {done && (
                  <motion.span className="sw-logo-check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }}>
                    <Check size={11} strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <p className="sw-title">
        <TextShimmer>{title}</TextShimmer>
      </p>

      <ol className="sw-steps">
        <AnimatePresence initial={false}>
          {steps.slice(0, active + 1).map((s, i) => {
            const done = i < active
            return (
              <motion.li
                key={s.label}
                layout={!reduce}
                className={`sw-step${done ? ' sw-step-done' : ' sw-step-on'}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: -18, filter: 'blur(6px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              >
                <span className="sw-step-icon">
                  {done ? (
                    <motion.span key="d" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}>
                      <Check size={14} strokeWidth={3} />
                    </motion.span>
                  ) : (
                    s.icon
                  )}
                </span>
                <span className="sw-step-label">{done ? s.label : <TextShimmer>{s.label}</TextShimmer>}</span>
                <span className="sw-step-src">
                  <SourceLogo id={s.source} size={14} />
                </span>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ol>
    </div>
  )
}
