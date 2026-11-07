import { PinIcon } from '../components/icons'
import { PageHeader } from '../components/ui'

// Placeholder. Nearby discovery is the next slice.
export function Nearby({ onBack }: { onBack: () => void }) {
  return (
    <main className="page">
      <PageHeader title="Nearby" onBack={onBack} />
      <div className="placeholder">
        <div className="placeholder-icon"><PinIcon size={34} /></div>
        <h2>Coming soon</h2>
        <p className="muted">Restaurants near you, with the Dishes that fit your restrictions.</p>
      </div>
    </main>
  )
}
