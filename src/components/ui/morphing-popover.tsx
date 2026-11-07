// A button that morphs into its popover panel.
// Adapted from motion-primitives' MorphingPopover (MIT, Julien Thibeaut) for this app's plain CSS.
import { createContext, useContext, useEffect, useId, useRef, type ReactNode } from 'react'
import { AnimatePresence, MotionConfig, motion, type Transition } from 'motion/react'

const TRANSITION: Transition = { type: 'spring', bounce: 0.1, duration: 0.4 }

interface Ctx {
  isOpen: boolean
  open: () => void
  close: () => void
  id: string
}

const PopoverContext = createContext<Ctx | null>(null)

function usePopover() {
  const ctx = useContext(PopoverContext)
  if (!ctx) throw new Error('MorphingPopover parts must be inside MorphingPopover')
  return ctx
}

interface PopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
  children: ReactNode
}

export function MorphingPopover({ open, onOpenChange, className, children }: PopoverProps) {
  const id = useId()
  return (
    <PopoverContext.Provider value={{ isOpen: open, open: () => onOpenChange(true), close: () => onOpenChange(false), id }}>
      <MotionConfig transition={TRANSITION}>
        <div className={`mp ${className ?? ''}`}>{children}</div>
      </MotionConfig>
    </PopoverContext.Provider>
  )
}

interface TriggerProps {
  className?: string
  label: string
  radius?: number
  children: ReactNode
}

export function MorphingPopoverTrigger({ className, label, radius = 22, children }: TriggerProps) {
  const { isOpen, open, id } = usePopover()
  return (
    <motion.button
      type="button"
      layoutId={`mp-${id}`}
      className={className}
      style={{ borderRadius: radius }}
      onClick={open}
      aria-label={label}
      aria-expanded={isOpen}
      aria-controls={`mp-content-${id}`}
    >
      <motion.span layoutId={`mp-icon-${id}`} className="mp-icon">{children}</motion.span>
    </motion.button>
  )
}

interface ContentProps {
  className?: string
  label: string
  radius?: number
  children: ReactNode
}

export function MorphingPopoverContent({ className, label, radius = 22, children }: ContentProps) {
  const { isOpen, close, id } = usePopover()
  const ref = useRef<HTMLDivElement>(null)

  // Close on a tap outside or Escape.
  useEffect(() => {
    if (!isOpen) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, close])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          layoutId={`mp-${id}`}
          id={`mp-content-${id}`}
          role="dialog"
          aria-label={label}
          className={`mp-content ${className ?? ''}`}
          style={{ borderRadius: radius }}
        >
          {/* Fade the inside in after the shape has mostly grown, so text never looks squashed. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.12, duration: 0.18 } }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** The same morphing icon, for a close button inside the panel. */
export function MorphingPopoverClose({ className, label, children }: { className?: string; label: string; children: ReactNode }) {
  const { close, id } = usePopover()
  return (
    <button type="button" className={className} onClick={close} aria-label={label}>
      <motion.span layoutId={`mp-icon-${id}`} className="mp-icon">{children}</motion.span>
    </button>
  )
}
