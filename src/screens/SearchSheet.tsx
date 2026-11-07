import { useState } from 'react'
import { CloseIcon, SearchIcon } from '../components/icons'
import type { CheckRequest } from './CheckFlow'

const EXAMPLES = ['Oreo cookies', 'Doritos Nacho Cheese', 'Haribo Goldbears', 'Chicken shawarma']

export function SearchSheet({ onClose, onSearch }: { onClose: () => void; onSearch: (req: CheckRequest) => void }) {
  const [query, setQuery] = useState('')
  const [hints, setHints] = useState('')

  const submit = (q = query) => {
    if (!q.trim()) return
    onSearch({ query: q.trim(), hints: hints.trim() })
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="Search" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-head">
          <h2>Search</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div className="search-box">
            <SearchIcon size={20} />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Food, product or brand"
              enterKeyHint="search"
            />
          </div>
          <label className="field">
            <span>Hints (optional)</span>
            <input type="text" value={hints} onChange={(e) => setHints(e.target.value)} placeholder="Brand, restaurant or country" />
          </label>
          <button className="btn btn-primary btn-block" type="submit" disabled={!query.trim()}>
            Search
          </button>
        </form>
        <div className="search-examples">
          <span className="muted small">Try:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} className="chip" type="button" onClick={() => submit(ex)}>
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
