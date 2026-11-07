import './home-button.css'

export function HomeButton({ onHome }: { onHome: () => void }) {
  return <button type="button" className="foodex-home-button" onClick={onHome} aria-label="Go to Foodex home" title="Home">
    <span className="foodex-home-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-7h6v7"/></svg></span>
    <span className="foodex-home-wordmark">foodex<span>.</span></span>
  </button>
}
