import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Camera, Check, ChevronRight, MapPin, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import type { RestrictionId } from '../domain/types'
import { HomeButton } from '../components/HomeButton'
import { AnimatedGroup, ShineButton, TextEffect } from '../components/premium'
import './landing.css'

const PICKS: { id: RestrictionId; name: string }[] = [
  { id: 'halal', name: 'Halal' },
  { id: 'kosher', name: 'Kosher' },
  { id: 'vegan', name: 'Vegan' },
  { id: 'vegetarian', name: 'Vegetarian' },
  { id: 'gluten_free', name: 'Gluten-free' },
  { id: 'dairy_free', name: 'Dairy-free' },
  { id: 'peanut_free', name: 'Peanut-free' },
]

const STEPS = [
  { icon: <SlidersHorizontal size={18} />, title: 'Set your restrictions', body: 'Faith, lifestyle or allergies. Pick them once.' },
  { icon: <Search size={18} />, title: 'Scan or search', body: 'Snap a label, a menu or a plate, or type a product name.' },
  { icon: <ShieldCheck size={18} />, title: 'Get a clear answer', body: 'Fits, Doesn’t fit or Not enough info, with the sources.' },
]

interface Props {
  onRestaurants: (selected: RestrictionId[]) => void
  onScan: () => void
  onLogin: () => void
  signedIn: boolean
  onHome: () => void
}

export function Landing({ onRestaurants, onScan, onLogin, signedIn, onHome }: Props) {
  const [selected, setSelected] = useState<RestrictionId[]>([])
  const toggle = (id: RestrictionId) => setSelected((old) => (old.includes(id) ? old.filter((v) => v !== id) : [...old, id]))

  return (
    <div className="fd-landing lp">
      <header className="lp-nav lp-shell">
        <HomeButton onHome={onHome} />
        <button type="button" className="lp-login" onClick={onLogin}>
          {signedIn ? 'Open my account' : 'Log in'} <ChevronRight size={15} />
        </button>
      </header>

      <main className="lp-shell">
        <section className="lp-hero">
          <AnimatedGroup className="lp-copy" stagger={0.08}>
            <p className="lp-eyebrow"><span /> Food checker for dietary restrictions</p>
            <h1 className="lp-title">
              <TextEffect>Does it fit</TextEffect> <em><TextEffect delay={0.15}>your diet?</TextEffect></em>
            </h1>
            <p className="lp-sub">Scan a label or search a product. Foodex checks it against every restriction you have and shows where the answer came from.</p>

            <div className="lp-picks">
              <span className="lp-picks-label">I avoid or follow</span>
              <div className="lp-chips">
                {PICKS.map((p) => {
                  const on = selected.includes(p.id)
                  return (
                    <button key={p.id} type="button" className="lp-chip" aria-pressed={on} onClick={() => toggle(p.id)}>
                      {on && <Check size={13} strokeWidth={2.6} />}
                      {p.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="lp-actions">
              <ShineButton className="lp-btn lp-btn-primary" onClick={onScan}>
                <Camera size={18} /> Scan a food item
              </ShineButton>
              <button type="button" className="lp-btn lp-btn-ghost" onClick={() => onRestaurants(selected)}>
                <MapPin size={17} /> Find restaurants{selected.length ? ` (${selected.length})` : ''} <ArrowRight size={16} />
              </button>
            </div>
          </AnimatedGroup>

          <ExampleCard />
        </section>

        <section className="lp-steps" aria-label="How it works">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              className="lp-step"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <span className="lp-step-icon">{s.icon}</span>
              <div>
                <strong><span>0{i + 1}</span> {s.title}</strong>
                <p>{s.body}</p>
              </div>
            </motion.div>
          ))}
        </section>
      </main>

      <footer className="lp-footer lp-shell">
        <span>foodex<b>.</b> Different needs, one shared table.</span>
        <span>Not medical advice · Built for UNHack 2026</span>
      </footer>
    </div>
  )
}

/** A sample result so people see what they get before signing in. */
function ExampleCard() {
  return (
    <motion.div
      className="lp-visual"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.8, delay: 0.2 }}
      aria-label="Example result"
    >
      <img className="lp-visual-photo" src="/images/landing/restaurant-bowl.jpg" alt="" />
      <div className="lp-result">
        <div className="lp-result-head">
          <div>
            <span className="lp-result-tag">Example result</span>
            <strong>Hazelnut spread</strong>
          </div>
          <span className="lp-verdict lp-verdict-no">Doesn’t fit</span>
        </div>
        <ul>
          <li><span className="lp-dot lp-dot-no" /> Vegan <em>Contains skim milk powder</em></li>
          <li><span className="lp-dot lp-dot-ok" /> Peanut-free <em>No peanuts listed</em></li>
          <li><span className="lp-dot lp-dot-ok" /> Gluten-free <em>No gluten listed</em></li>
        </ul>
        <p className="lp-source">Source: manufacturer ingredient list</p>
      </div>
    </motion.div>
  )
}
