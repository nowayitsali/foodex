import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// No StrictMode: it would run each camera start and Gemini call twice in dev.
createRoot(document.getElementById('root')!).render(<App />)
