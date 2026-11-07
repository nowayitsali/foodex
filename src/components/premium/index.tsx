/*
 * Small animated building blocks shared by Login and Scanner.
 * Patterns follow motion-primitives (TextEffect, TextLoop, AnimatedGroup, BorderTrail)
 * and Magic UI (ShineButton, Marquee), rebuilt on `motion` with plain CSS so they
 * match the landing page's cream, forest-green and serif look.
 * Every one of them respects "reduce motion".
 */
import { Children, useEffect, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import './premium.css'

/** Words blur and rise in one after another. */
export function TextEffect({ children, as = 'span', delay = 0, className }: { children: string; as?: 'span' | 'h1' | 'h2' | 'p'; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  const words = children.split(/(\s+)/)
  return (
    <Tag className={className} aria-label={children}>
      {words.map((w, i) =>
        /\s+/.test(w) ? (
          w
        ) : (
          <motion.span
            key={i}
            aria-hidden
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
            initial={reduce ? false : { opacity: 0, y: 10, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, delay: delay + i * 0.035, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
          </motion.span>
        ),
      )}
    </Tag>
  )
}

/** Cycles through short lines of text in place. */
export function TextLoop({ items, interval = 3200, className }: { items: string[]; interval?: number; className?: string }) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (items.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % items.length), interval)
    return () => clearInterval(t)
  }, [items.length, interval])
  return (
    <span className={`pm-loop ${className ?? ''}`} aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={i}
          className="pm-loop-item"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {items[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/** Children fade and lift in one after another. */
export function AnimatedGroup({ children, className, delay = 0, stagger = 0.06, style }: { children: ReactNode; className?: string; delay?: number; stagger?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {Children.map(children, (child) =>
        child == null || child === false ? null : (
          <motion.div
            className="pm-group-item"
            variants={{
              hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: 'blur(6px)' },
              show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {child}
          </motion.div>
        ),
      )}
    </motion.div>
  )
}

/** A soft light that travels around its parent's rounded border. Parent needs position: relative. */
export function BorderTrail({ size = 70, duration = 6, color }: { size?: number; duration?: number; color?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <div className="pm-trail" aria-hidden>
      <motion.div
        className="pm-trail-dot"
        style={{ width: size, height: size, offsetPath: 'rect(0 auto auto 0 round var(--pm-trail-radius, 20px))', ...(color ? { background: color } : {}) }}
        animate={{ offsetDistance: ['0%', '100%'] }}
        transition={{ repeat: Infinity, duration, ease: 'linear' }}
      />
    </div>
  )
}

/** Button with a light sweep on hover and a springy press. */
export function ShineButton({ className = '', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileTap={rest.disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      className={`pm-shine ${className}`}
      {...(rest as Record<string, unknown>)}
    >
      <span className="pm-shine-sweep" aria-hidden />
      {children}
    </motion.button>
  )
}

/** Endless horizontal scroll of its children. */
export function Marquee({ children, duration = 28, reverse = false, className }: { children: ReactNode; duration?: number; reverse?: boolean; className?: string }) {
  return (
    <div className={`pm-marquee ${className ?? ''}`} style={{ '--pm-dur': `${duration}s` } as CSSProperties}>
      {[0, 1].map((n) => (
        <div key={n} className={`pm-marquee-track${reverse ? ' pm-reverse' : ''}`} aria-hidden={n === 1}>
          {children}
        </div>
      ))}
    </div>
  )
}
