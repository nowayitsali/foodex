import { useState } from 'react'
import { signInWithGoogle, supabase } from '../lib/supabase'
import { AppleLogo, GoogleLogo, InfoIcon, LeafIcon } from '../components/icons'

function missingSupabaseKeys() {
  const env = import.meta.env
  return ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].filter((k) => !env[k])
}

export function Login({ onDemo }: { onDemo: () => void }) {
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
    <main className="login">
      <div className="login-hero">
        <div className="logo"><LeafIcon size={30} /></div>
        <h1>Foodex</h1>
        <p>Scan or search any food and see if it fits your restrictions, with the sources behind every answer.</p>
      </div>

      <div className="login-actions">
        <button className="btn btn-social" onClick={google} disabled={!supabase || busy}>
          <GoogleLogo />
          {busy ? 'Opening Google…' : 'Continue with Google'}
        </button>
        <button className="btn btn-social btn-apple" disabled aria-disabled>
          <AppleLogo />
          Continue with Apple
          <span className="soon">Coming soon</span>
        </button>

        {error && <p className="note note-error" role="alert">{error}</p>}

        {!supabase && (
          <>
            <div className="note note-warn">
              <InfoIcon size={18} />
              <div>
                <strong>Sign-in isn't set up yet.</strong> Missing in <code>.env</code>:{' '}
                {missing.map((k, i) => (
                  <span key={k}>
                    <code>{k}</code>
                    {i < missing.length - 1 ? ', ' : ''}
                  </span>
                ))}
                . You can still try Foodex in demo mode. Your restrictions are saved on this device only.
              </div>
            </div>
            <button className="btn btn-primary btn-block" onClick={onDemo}>
              Continue in demo mode
            </button>
          </>
        )}
      </div>

      <p className="fine-print">Foodex tells you whether food fits the restrictions you list. It is not medical advice.</p>
    </main>
  )
}
