import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Check, Info, ShieldCheck } from 'lucide-react'
import { signInWithGoogle, supabase } from '../lib/supabase'
import { AppleLogo, GoogleLogo } from '../components/icons'
import { HomeButton } from '../components/HomeButton'
import { AnimatedGroup, BorderTrail, Marquee, ShineButton, TextEffect, TextLoop } from '../components/premium'
import './login.css'

const RESTRICTIONS = ['Halal', 'Vegan', 'Kosher', 'Gluten-free', 'Peanut-free', 'Dairy-free', 'Vegetarian', 'Shellfish-free', 'Sesame-free', 'Pescatarian']

function missingSupabaseKeys() {
  const env = import.meta.env
  return ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].filter((k) => !env[k])
}

export function Login({ onDemo, onHome }: { onDemo: () => void; onHome: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const missing = supabase ? [] : missingSupabaseKeys()

  async function google() {
    setBusy(true)
    setError(null)
    try {
      await signInWithGoogle()
      // The browser now leaves for Google and comes back signed in.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Try again.')
      setBusy(false)
    }
  }

  return (
    <div className="lg">
      <header className="lg-nav">
        <HomeButton onHome={onHome} />
        <button type="button" className="lg-back" onClick={onHome}>
          Back to home <ArrowRight size={15} />
        </button>
      </header>

      <main className="lg-main">
        <ShowcasePanel />

        <section className="lg-form" aria-labelledby="lg-title">
          <AnimatedGroup className="lg-form-inner" stagger={0.07}>
            <p className="lg-eyebrow"><span /> Welcome to foodex</p>

            <h1 id="lg-title" className="lg-title">
              <TextEffect>Every craving.</TextEffect>
              <br />
              <em><TextEffect delay={0.18}>Every consideration.</TextEffect></em>
            </h1>

            <p className="lg-sub">
              Sign in once. Every Scan and Search is checked against{' '}
              <TextLoop className="lg-loop" items={['your halal needs.', 'a peanut allergy.', 'going vegan.', 'all of it, together.']} />
            </p>

            <div className="lg-actions">
              <ShineButton className="lg-btn lg-btn-google" onClick={google} disabled={!supabase || busy}>
                <GoogleLogo />
                <span>{busy ? 'Opening Google…' : 'Continue with Google'}</span>
              </ShineButton>
              <button type="button" className="lg-btn lg-btn-apple" disabled aria-disabled>
                <AppleLogo />
                <span>Continue with Apple</span>
                <span className="lg-soon">Soon</span>
              </button>
            </div>

            {error && (
              <p className="lg-note lg-note-error" role="alert">
                <Info size={17} /> <span>{error}</span>
              </p>
            )}

            {!supabase && (
              <div className="lg-demo">
                <div className="lg-divider"><span>or</span></div>
                <div className="lg-note lg-note-warn">
                  <Info size={17} />
                  <span>
                    <strong>Sign-in isn't set up yet.</strong> Missing in <code>.env</code>:{' '}
                    {missing.map((k, i) => (
                      <span key={k}><code>{k}</code>{i < missing.length - 1 ? ', ' : ''}</span>
                    ))}
                    . Demo mode saves your restrictions on this device only.
                  </span>
                </div>
                <ShineButton className="lg-btn lg-btn-primary" onClick={onDemo}>
                  <span>Continue in demo mode</span>
                  <ArrowRight size={17} />
                </ShineButton>
              </div>
            )}

            <ul className="lg-points">
              <li><Check size={15} /> Your restrictions, set once</li>
              <li><Check size={15} /> Sources behind every answer</li>
              <li><Check size={15} /> Clear when it's not confirmed</li>
            </ul>

            <p className="lg-fine">
              <ShieldCheck size={14} /> Foodex tells you whether food fits the restrictions you list. It is not medical advice.
            </p>
          </AnimatedGroup>
        </section>
      </main>
    </div>
  )
}

/** The photo side: a restaurant shot, a floating sample result and a band of restrictions. */
function ShowcasePanel() {
  const reduce = useReducedMotion()
  return (
    <aside className="lg-show" aria-hidden>
      <img src="/images/landing/restaurant-interior.jpg" alt="" />
      <div className="lg-show-shade" />

      <div className="lg-show-copy">
        <span className="lg-show-eyebrow">There's a place</span>
        <p className="lg-show-title">for you <em>here.</em></p>
      </div>

      <motion.div
        className="lg-result"
        initial={reduce ? false : { opacity: 0, y: 24, rotate: -4 }}
        animate={reduce ? undefined : { opacity: 1, y: [0, -8, 0], rotate: -3 }}
        transition={{ opacity: { duration: 0.6, delay: 0.4 }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }, rotate: { duration: 0.6, delay: 0.4 } }}
      >
        <BorderTrail size={60} duration={7} />
        <img src="/images/landing/food-california-roll.webp" alt="" />
        <div className="lg-result-body">
          <strong>California roll</strong>
          <span>Example check · 2 restrictions</span>
          <div className="lg-result-tags">
            <span className="lg-fit"><Check size={12} /> Halal</span>
            <span className="lg-fit"><Check size={12} /> Peanut-free</span>
          </div>
        </div>
      </motion.div>

      <div className="lg-show-band">
        <Marquee duration={34}>
          {RESTRICTIONS.map((r) => <span key={r} className="lg-pill">{r}</span>)}
        </Marquee>
      </div>
    </aside>
  )
}
