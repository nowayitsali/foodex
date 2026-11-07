import { useEffect, useMemo, useRef, useState } from 'react'
import type { Finding, Identification, RestrictionProfile, Verdict } from '../domain/types'
import { judge, overall } from '../domain/verdicts'
import { identify, research, type ResearchResult } from '../lib/api'
import { AlertIcon, CloseIcon, InfoIcon, LinkIcon } from '../components/icons'
import { FINDING_TYPE_LABELS, SourceKindBadge, Spinner, VerdictBadge } from '../components/ui'

// Scan or Search -> Identification -> Confirmed item -> research -> Verdicts.
// Verdicts come only from judge() on this device (ADR 0001).

export interface CheckRequest {
  /** Base64 JPEG without the data: prefix (Scan). */
  image?: string
  /** data: URL of the same photo, for showing it. */
  preview?: string
  /** Typed name (Search). */
  query?: string
  /** Product barcode read from a barcode or QR code. Skips straight to results. */
  code?: string
  hints: string
}

type Step =
  | { kind: 'identifying' }
  /** refining: the confirmed guess we are now matching to an exact product. */
  | { kind: 'candidates'; items: Identification[]; refining?: Identification }
  | { kind: 'rejected'; empty: boolean }
  | { kind: 'researching'; item: Identification }
  | { kind: 'results'; item: Identification; result: ResearchResult }
  | { kind: 'error'; message: string; retry: () => void }

const KIND_LABELS: Record<Identification['kind'], string> = {
  packaged_product: 'Packaged product',
  dish: 'Dish',
  ingredient: 'Ingredient',
  menu: 'Menu',
  other: 'Food',
}

function errorMessage(e: unknown) {
  let msg = e instanceof Error ? e.message : String(e)
  // Gemini errors can arrive as raw JSON text.
  try {
    msg = JSON.parse(msg)?.error?.message ?? msg
  } catch {
    // Plain text already.
  }
  if (/failed to fetch|networkerror|load failed/i.test(msg)) return "Couldn't reach the Foodex server. Check your connection and that the dev server is running."
  if (/quota|RESOURCE_EXHAUSTED|rate limit/i.test(msg)) return "Gemini's free quota is used up for now. Wait a minute and try again."
  if (/high demand|overloaded|UNAVAILABLE/i.test(msg)) return 'Gemini is busy right now. Try again in a minute.'
  return msg
}

interface Props {
  request: CheckRequest
  profile: RestrictionProfile
  onClose: () => void
  onSearchInstead: () => void
}

export function CheckFlow({ request, profile, onClose, onSearchInstead }: Props) {
  const [hints, setHints] = useState(request.hints)
  const [step, setStep] = useState<Step>({ kind: 'identifying' })
  // Each call gets a number, so a late answer from an old call is ignored.
  const run = useRef(0)

  function runIdentify(h: string) {
    const id = ++run.current
    setStep({ kind: 'identifying' })
    identify({ image: request.image, query: request.query, code: request.code, hints: h.trim() || undefined })
      .then((items) => {
        if (id !== run.current) return
        // A scanned code names one exact product, so there is nothing to confirm.
        if (request.code && items.length === 1) doResearch(items[0], id)
        else setStep(items.length ? { kind: 'candidates', items } : { kind: 'rejected', empty: true })
      })
      .catch((e) => {
        if (id === run.current) setStep({ kind: 'error', message: errorMessage(e), retry: () => runIdentify(h) })
      })
  }

  function confirm(item: Identification) {
    const id = ++run.current
    // A guess with no barcode has no ingredient data. Match it to a real
    // product first (a typed Search, so no Gemini call), then research that.
    if (!item.code && item.kind !== 'dish' && item.kind !== 'menu') {
      setStep({ kind: 'identifying' })
      identify({ query: [item.brand, item.name].filter(Boolean).join(' ') })
        .then((items) => {
          if (id !== run.current) return
          if (items.length) setStep({ kind: 'candidates', items, refining: item })
          else doResearch(item, id)
        })
        .catch(() => {
          if (id === run.current) doResearch(item, id)
        })
      return
    }
    doResearch(item, id)
  }

  function doResearch(item: Identification, id: number) {
    setStep({ kind: 'researching', item })
    research({ item, profile, hints: hints.trim() || undefined })
      .then((result) => {
        if (id === run.current) setStep({ kind: 'results', item, result })
      })
      .catch((e) => {
        if (id === run.current) setStep({ kind: 'error', message: errorMessage(e), retry: () => confirm(item) })
      })
  }

  useEffect(() => {
    runIdentify(request.hints)
    return () => {
      run.current++
    }
  }, [])

  const title = step.kind === 'results' ? 'Results' : step.kind === 'researching' ? 'Researching' : 'Identification'

  return (
    <div className="overlay-page" role="dialog" aria-label={title}>
      <header className="page-header">
        <span className="icon-btn-spacer" />
        <h1>{title}</h1>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      </header>

      <div className="page-body">
        <div className="check-subject">
          {request.preview ? <img src={request.preview} alt="Your Scan" /> : null}
          <div>
            <span className="muted small">{request.code ? 'Barcode' : request.image ? 'Scan' : 'Search'}</span>
            <strong>{request.code ?? request.query ?? 'Photo from your camera'}</strong>
            {hints.trim() && <span className="muted small">Hints: {hints.trim()}</span>}
          </div>
        </div>

        {step.kind === 'identifying' && <Spinner label="Working out what this is…" />}

        {step.kind === 'candidates' && (
          <section>
            <h2 className="section-title">{step.refining ? 'Which exact product?' : 'Is this it?'}</h2>
            <p className="muted small">
              {step.refining
                ? `Pick the product that matches your ${step.refining.name}, so Foodex can read its ingredients.`
                : 'Confirm the right item before Foodex researches it.'}
            </p>
            <div className="candidates">
              {step.items.map((item, i) => (
                <article key={i} className="card candidate">
                  <div className="candidate-head">
                    <span className="kind-tag">{KIND_LABELS[item.kind] ?? 'Food'}</span>
                    {i === 0 && step.items.length > 1 && <span className="kind-tag kind-tag-best">Best guess</span>}
                  </div>
                  {item.imageUrl && <img className="candidate-image" src={item.imageUrl} alt="" loading="lazy" />}
                  <h3>{item.name}</h3>
                  {item.brand && <p className="candidate-brand">{item.brand}</p>}
                  {item.description && <p className="muted small">{item.description}</p>}
                  {!item.code && item.kind !== 'dish' && item.kind !== 'menu' && (
                    <p className="muted small">Not matched to a product yet. Foodex will look for the exact one next.</p>
                  )}
                  <button className="btn btn-primary btn-block" onClick={() => confirm(item)}>
                    Yes, that's it
                  </button>
                </article>
              ))}
            </div>
            {step.refining ? (
              <button className="btn btn-secondary btn-block" onClick={() => doResearch(step.refining!, ++run.current)}>
                None of these, check it anyway
              </button>
            ) : (
              <button className="btn btn-secondary btn-block" onClick={() => setStep({ kind: 'rejected', empty: false })}>
                None of these
              </button>
            )}
          </section>
        )}

        {step.kind === 'rejected' && request.code && (
          <section className="card retry">
            <h2>This barcode isn't in Open Food Facts yet</h2>
            <p className="muted small">Search for the product by name instead, or take a photo of the label.</p>
            <button className="btn btn-primary btn-block" onClick={onSearchInstead}>Search by name</button>
          </section>
        )}

        {step.kind === 'rejected' && !request.code && (
          <section className="card retry">
            <h2>{step.empty ? "Foodex couldn't tell what this is" : 'Help Foodex find it'}</h2>
            <p className="muted small">Add a Hint the {request.image ? 'photo' : 'name'} doesn't show, like the brand, flavour or restaurant.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                runIdentify(hints)
              }}
            >
              <label className="field">
                <span>Hints</span>
                <input autoFocus type="text" value={hints} onChange={(e) => setHints(e.target.value)} placeholder="e.g. Nestlé, dark chocolate, UK" />
              </label>
              <button className="btn btn-primary btn-block" type="submit">Try again</button>
            </form>
            {request.image && (
              <button className="btn btn-ghost btn-block" onClick={onSearchInstead}>Search by name instead</button>
            )}
          </section>
        )}

        {step.kind === 'researching' && (
          <Spinner label={`Looking up ${step.item.name}: ingredients, allergens and labels…`} />
        )}

        {step.kind === 'error' && <ErrorCard message={step.message} onRetry={step.retry} />}

        {step.kind === 'results' && (
          <Results
            item={step.item}
            result={step.result}
            profile={profile}
            onWrongItem={() => runIdentify(hints)}
            onDone={onClose}
          />
        )}
      </div>
    </div>
  )
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  const missingKey = /GEMINI_API_KEY/.test(message)
  return (
    <section className={`note ${missingKey ? 'note-warn' : 'note-error'} error-card`} role="alert">
      <AlertIcon size={20} />
      <div>
        <strong>{missingKey ? "Gemini isn't set up yet" : 'Something went wrong'}</strong>
        <p>{message}</p>
        {missingKey ? (
          <p className="small">Get a free key at aistudio.google.com, put it in <code>.env</code> as <code>GEMINI_API_KEY</code>, and restart <code>npm run dev</code>.</p>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={onRetry}>Try again</button>
        )}
      </div>
    </section>
  )
}

const OVERALL_TEXT = {
  fits: (n: number) => (n === 1 ? 'Fits your restriction.' : `Fits all ${n} of your restrictions.`),
  doesnt_fit: (n: number, bad: number) => (n === 1 ? "Doesn't fit your restriction." : `Doesn't fit ${bad} of your ${n} restrictions.`),
  not_enough_info: (n: number, unsure: number) =>
    n === 1 ? "Foodex couldn't confirm your restriction." : `Foodex couldn't confirm ${unsure} of your ${n} restrictions.`,
}

// Cards that need attention come first.
const SEVERITY: Record<Verdict['value'], number> = { doesnt_fit: 0, not_enough_info: 1, fits: 2 }

interface ResultsProps {
  item: Identification
  result: ResearchResult
  profile: RestrictionProfile
  onWrongItem: () => void
  onDone: () => void
}

function Results({ item, result, profile, onWrongItem, onDone }: ResultsProps) {
  // Recomputed when the profile changes, so edits apply right away.
  const verdicts = useMemo(
    () => judge({ findings: result.findings, ingredientsComplete: result.ingredientsComplete }, profile),
    [result, profile],
  )
  const answer = overall(verdicts)
  const count = (v: Verdict['value']) => verdicts.filter((x) => x.value === v).length
  const searched = dedupe(result.searched, (s) => s.url)

  return (
    <section className="results">
      <div className={`verdict-hero verdict-hero-${verdicts.length ? answer : 'none'}`}>
        <span className="muted small">{item.brand ? `${item.name} · ${item.brand}` : item.name}</span>
        {verdicts.length ? (
          <>
            <VerdictBadge value={answer} large />
            <p>{OVERALL_TEXT[answer](verdicts.length, count(answer))}</p>
          </>
        ) : (
          <p>You haven't picked any restrictions, so there's nothing to check. Add some in Settings.</p>
        )}
      </div>

      {[...verdicts]
        .sort((a, b) => SEVERITY[a.value] - SEVERITY[b.value])
        .map((v) => (
          <VerdictCard key={v.restrictionKey} verdict={v} />
        ))}

      <p className="note note-info">
        <InfoIcon size={18} />
        <span>
          Always check the physical label too. Recipes change, and online sources can be out of date. Foodex says whether food fits the
          restrictions you listed. It isn't medical advice.
        </span>
      </p>

      {result.findings.length > 0 && (
        <details className="card all-findings">
          <summary>All Findings ({result.findings.length}){result.ingredientsComplete ? ' · full ingredient list found' : ' · ingredient list incomplete'}</summary>
          <ul className="evidence">
            {result.findings.map((f, i) => (
              <EvidenceItem key={i} finding={f} />
            ))}
          </ul>
        </details>
      )}

      <section className="card">
        <h2>Source</h2>
        {searched.length ? (
          <ul className="searched">
            {searched.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title} <LinkIcon />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted small">
            {item.code
              ? "This product's page on Open Food Facts has no ingredient data yet."
              : "This item isn't matched to a product in Open Food Facts, so there's no ingredient list to check. Try Search by name to find the exact product."}
          </p>
        )}
        <p className="muted small">
          Ingredient data from{' '}
          <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener noreferrer">Open Food Facts</a>, a community database
          (ODbL). It can be incomplete or out of date.
        </p>
      </section>

      <div className="results-actions">
        <button className="btn btn-primary btn-block" onClick={onDone}>Check something else</button>
        <button className="btn btn-ghost btn-block" onClick={onWrongItem}>Wrong item? Identify again</button>
      </div>
    </section>
  )
}

const EVIDENCE_SHOWN = 3

function VerdictCard({ verdict }: { verdict: Verdict }) {
  const [showAll, setShowAll] = useState(false)
  const evidence = dedupe(verdict.evidence, (f) => f.type + f.text + f.source.url)
  const shown = showAll ? evidence : evidence.slice(0, EVIDENCE_SHOWN)
  return (
    <article className={`card verdict-card verdict-card-${verdict.value}`}>
      <div className="verdict-card-head">
        <h3>{verdict.label}</h3>
        <VerdictBadge value={verdict.value} />
      </div>
      <p className="verdict-reason">{verdict.reason}</p>
      {evidence.length > 0 ? (
        <>
          <h4>Evidence</h4>
          <ul className="evidence">
            {shown.map((f, i) => (
              <EvidenceItem key={i} finding={f} />
            ))}
          </ul>
          {evidence.length > EVIDENCE_SHOWN && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Show less' : `Show ${evidence.length - EVIDENCE_SHOWN} more`}
            </button>
          )}
        </>
      ) : (
        <p className="muted small">No Findings back this up yet.</p>
      )}
    </article>
  )
}

function EvidenceItem({ finding }: { finding: Finding }) {
  const label = FINDING_TYPE_LABELS[finding.type]
  // Skip the label when the text already starts with it ("May contain milk").
  const repeats = finding.text.toLowerCase().startsWith(label.toLowerCase())
  return (
    <li className={`evidence-item evidence-${finding.type}`}>
      <div>
        {!repeats && <span className="finding-type">{label}</span>} {finding.text}
      </div>
      <div className="evidence-source">
        <SourceKindBadge kind={finding.source.kind} />
        <a href={finding.source.url} target="_blank" rel="noopener noreferrer">
          {finding.source.title || hostOf(finding.source.url)} <LinkIcon />
        </a>
      </div>
    </li>
  )
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function dedupe<T>(items: T[], key: (t: T) => string) {
  const seen = new Set<string>()
  return items.filter((t) => {
    const k = key(t)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}
