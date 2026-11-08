import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'
import { ArrowRight, Check, CircleHelp, RotateCcw, ScanLine, Search, Sparkles, X } from 'lucide-react'
import type { Finding, Identification, RestrictionProfile, Verdict } from '../domain/types'
import { judge, overall } from '../domain/verdicts'
import { identify, research, type ResearchResult } from '../lib/api'
import { AlertIcon, InfoIcon, LinkIcon } from '../components/icons'
import { FINDING_TYPE_LABELS, SOURCE_KIND_LABELS, VERDICT_LABELS } from '../components/ui'
import { identifySteps, researchSteps, SourceLogo, sourceIdFor, SourceSweep, type SourceId } from '../components/SourceSweep'
import { ThinkingTrace, type TraceEntry } from '../components/ThinkingTrace'
import './checkflow.css'

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
  /** matching: a photo guess being matched to a real product by name (no Gemini call). */
  | { kind: 'identifying'; matching?: string }
  /** refining: the confirmed guess we are now matching to an exact product. */
  | { kind: 'candidates'; items: Identification[]; refining?: Identification }
  | { kind: 'rejected'; empty: boolean }
  | { kind: 'researching'; item: Identification }
  /** trace: what was looked up before research; doneAt: ms from the start to the answer. */
  | { kind: 'results'; item: Identification; result: ResearchResult; trace: TraceEntry[]; doneAt: number }
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

// Motion: each step fades through, and the cards inside it rise in one after another.
const EASE = [0.22, 1, 0.36, 1] as const
const SPRING = { type: 'spring', stiffness: 300, damping: 28, mass: 0.9 } as const
const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.075, delayChildren: 0.05 } } }
const rise: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.97, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: SPRING },
}
const riseReduced: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }

function useRise() {
  return useReducedMotion() ? riseReduced : rise
}

interface Props {
  request: CheckRequest
  profile: RestrictionProfile
  onClose: () => void
  onSearchInstead: () => void
}

export function CheckFlow({ request, profile, onClose, onSearchInstead }: Props) {
  const reduce = useReducedMotion()
  const [hints, setHints] = useState(request.hints)
  const [step, setStep] = useState<Step>({ kind: 'identifying' })
  // Each call gets a number, so a late answer from an old call is ignored.
  const run = useRef(0)
  const pageRef = useRef<HTMLDivElement>(null)
  // A record of what was actually looked up, for the thinking panel on Results.
  const trace = useRef<TraceEntry[]>([])
  // Time spent waiting on lookups only, so time spent choosing an option isn't counted.
  const busy = useRef(0)
  const requestAt = useRef(0)
  const begin = () => {
    requestAt.current = performance.now()
  }
  const end = () => {
    busy.current += performance.now() - requestAt.current
  }
  const elapsed = () => Math.round(busy.current)
  const log = (e: Omit<TraceEntry, 'at'>) => trace.current.push({ ...e, at: elapsed() })

  // Each step replaces the content, so start it at the top. Otherwise picking an item
  // low in a long list leaves the next step out of view, and it looks like nothing happened.
  useEffect(() => {
    pageRef.current?.scrollTo({ top: 0 })
  }, [step.kind, step.kind === 'candidates' ? step.items : null])

  function runIdentify(h: string) {
    const id = ++run.current
    trace.current = []
    busy.current = 0
    setStep({ kind: 'identifying' })
    begin()
    identify({ image: request.image, query: request.query, code: request.code, hints: h.trim() || undefined })
      .then((items) => {
        if (id !== run.current) return
        end()
        logIdentified(items, h.trim())
        // A scanned code names one exact product, so there is nothing to confirm.
        if (request.code && items.length === 1) doResearch(items[0], id)
        else setStep(items.length ? { kind: 'candidates', items } : { kind: 'rejected', empty: true })
      })
      .catch((e) => {
        if (id === run.current) setStep({ kind: 'error', message: errorMessage(e), retry: () => runIdentify(h) })
      })
  }

  function logIdentified(items: Identification[], h: string) {
    const names = (list: Identification[]) => list.slice(0, 3).map((i) => (i.brand ? `${i.name} (${i.brand})` : i.name)).join(', ')
    if (request.code) {
      if (items.length) log({ by: 'off', text: `Found barcode ${request.code}`, detail: names(items) })
      else log({ by: 'off', text: `Barcode ${request.code} isn't in Open Food Facts` })
      return
    }
    if (request.image) {
      const guesses = items.filter((i) => !i.code)
      const matches = items.filter((i) => i.code)
      log({ by: 'gemini', text: 'Read your photo', detail: guesses.length ? `Saw ${names(guesses)}` : 'No food recognised' })
      if (matches.length) log({ by: 'off', text: `Matched ${matches.length} ${matches.length === 1 ? 'product' : 'products'}`, detail: names(matches) })
      return
    }
    const q = [request.query, h].filter(Boolean).join(' ')
    log({
      by: 'off',
      text: `Searched for “${q}”`,
      detail: items.length ? `${items.length} ${items.length === 1 ? 'match' : 'matches'}, ones with a full English ingredient list first` : 'No matches',
    })
  }

  function confirm(item: Identification) {
    log({ by: 'you', text: `Picked ${item.brand ? `${item.name} (${item.brand})` : item.name}` })
    const id = ++run.current
    // A guess with no barcode has no ingredient data. Match it to a real
    // product first (a typed Search, so no Gemini call), then research that.
    if (!item.code && item.kind !== 'dish' && item.kind !== 'menu') {
      const query = [item.brand, item.name].filter(Boolean).join(' ')
      setStep({ kind: 'identifying', matching: query })
      begin()
      identify({ query })
        .then((items) => {
          if (id !== run.current) return
          end()
          log({ by: 'off', text: `Searched for “${query}”`, detail: items.length ? `${items.length} exact ${items.length === 1 ? 'product' : 'products'} to pick from` : 'No exact product found' })
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
    begin()
    research({ item, profile, hints: hints.trim() || undefined })
      .then((result) => {
        if (id !== run.current) return
        end()
        setStep({ kind: 'results', item, result, trace: [...trace.current], doneAt: elapsed() })
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
  const restrictionCount = profile.restrictions.length + profile.custom.length
  const keepsHalal = profile.restrictions.includes('halal') || profile.custom.some((c) => /halal|zabiha/i.test(c.text))

  // Sweep steps are memoised, so the timer restarts only when the stage changes.
  const sweep = useMemo(() => {
    if (step.kind === 'identifying' && step.matching) {
      return { title: 'Finding the exact product', steps: identifySteps({ query: step.matching }), sources: ['off', 'foodex'] as SourceId[] }
    }
    if (step.kind === 'identifying') {
      const steps = identifySteps({ image: !!request.image, code: request.code, query: request.query })
      const sources: SourceId[] = request.image ? ['gemini', 'off', 'foodex'] : ['off', 'foodex']
      return { title: request.code ? 'Looking up the barcode' : request.image ? 'Working out what this is' : 'Searching for matches', steps, sources }
    }
    if (step.kind === 'researching') {
      return {
        title: `Checking ${step.item.name}`,
        steps: researchSteps(restrictionCount, keepsHalal),
        sources: (keepsHalal ? ['off', 'hma', 'foodex'] : ['off', 'foodex']) as SourceId[],
      }
    }
    return null
  }, [step, request.image, request.code, request.query, restrictionCount, keepsHalal])

  // One key per screen, so AnimatePresence plays the hand-off between them.
  const stepKey = step.kind === 'candidates' ? `candidates-${step.refining ? 'r' : 'g'}` : step.kind === 'identifying' && step.matching ? 'matching' : step.kind

  return (
    <div className="overlay-page cr cf" role="dialog" aria-label={title} ref={pageRef}>
      <header className="page-header cf-header">
        <span className="icon-btn-spacer" />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.h1
            key={title}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {title}
          </motion.h1>
        </AnimatePresence>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </header>

      <div className="page-body">
        <motion.div
          className="cf-subject"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <span className="cf-subject-thumb">
            {request.preview ? <img src={request.preview} alt="Your Scan" /> : request.code ? <ScanLine size={22} /> : <Search size={20} />}
          </span>
          <div>
            <span className="cf-eyebrow">
              <span />
              {request.code ? 'Barcode' : request.image ? 'Scan' : 'Search'}
            </span>
            <strong>{request.code ?? request.query ?? 'Photo from your camera'}</strong>
            {hints.trim() && <span className="cf-subject-hint">Hints: {hints.trim()}</span>}
          </div>
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stepKey}
            className="cf-step"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: 'blur(6px)', transition: { duration: 0.2, ease: 'easeIn' } }}
          >
            {sweep && (
              <SourceSweep
                title={sweep.title}
                steps={sweep.steps}
                sources={sweep.sources}
                image={step.kind === 'researching' ? step.item.imageUrl ?? request.preview : request.preview}
              />
            )}

            {step.kind === 'candidates' && (
              <Candidates
                items={step.items}
                refining={step.refining}
                onPick={confirm}
                onNone={() => {
                  if (!step.refining) return setStep({ kind: 'rejected', empty: false })
                  log({ by: 'you', text: `Checked ${step.refining.name} without an exact product` })
                  doResearch(step.refining, ++run.current)
                }}
              />
            )}

            {step.kind === 'rejected' && request.code && (
              <section className="card cf-panel">
                <h2 className="cf-h2">
                  This barcode isn't in <em>Open Food Facts</em> yet
                </h2>
                <p className="cf-sub">Search for the product by name instead, or take a photo of the label.</p>
                <button className="cf-btn cf-btn-primary" onClick={onSearchInstead}>
                  <Search size={16} /> Search by name
                </button>
              </section>
            )}

            {step.kind === 'rejected' && !request.code && (
              <section className="card cf-panel">
                <h2 className="cf-h2">{step.empty ? <>Foodex couldn't tell <em>what this is</em></> : <>Help Foodex <em>find it</em></>}</h2>
                <p className="cf-sub">Add a Hint the {request.image ? 'photo' : 'name'} doesn't show, like the brand, flavour or restaurant.</p>
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
                  <button className="cf-btn cf-btn-primary" type="submit">
                    <Sparkles size={16} /> Try again
                  </button>
                </form>
                {request.image && (
                  <button className="cf-btn cf-btn-ghost" onClick={onSearchInstead}>
                    Search by name instead
                  </button>
                )}
              </section>
            )}

            {step.kind === 'error' && <ErrorCard message={step.message} onRetry={step.retry} />}

            {step.kind === 'results' && (
              <Results item={step.item} result={step.result} trace={step.trace} doneAt={step.doneAt} profile={profile} onWrongItem={() => runIdentify(hints)} onDone={onClose} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

interface CandidatesProps {
  items: Identification[]
  refining?: Identification
  onPick: (item: Identification) => void
  onNone: () => void
}

function Candidates({ items, refining, onPick, onNone }: CandidatesProps) {
  const item = useRise()
  const reduce = useReducedMotion()
  return (
    <motion.section className="cf-cands-wrap" variants={list} initial="hidden" animate="show">
      <motion.div className="cf-intro" variants={item}>
        <h2 className="cf-h2">{refining ? <>Which exact <em>product?</em></> : <>Is this <em>it?</em></>}</h2>
        <p className="cf-sub">
          {refining
            ? `Pick the product that matches your ${refining.name}, so Foodex can read its ingredients.`
            : 'Confirm the right item before Foodex researches it.'}
        </p>
      </motion.div>

      <ul className="cf-cands">
        {items.map((c, i) => {
          const unmatched = !c.code && c.kind !== 'dish' && c.kind !== 'menu'
          return (
            <motion.li key={`${c.code ?? ''}${c.name}${i}`} variants={item}>
              <motion.button
                type="button"
                className={`cf-cand${i === 0 && items.length > 1 ? ' cf-cand-best' : ''}`}
                onClick={() => onPick(c)}
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                aria-label={`Yes, that's it: ${[c.name, c.brand].filter(Boolean).join(', ')}`}
              >
                <span className="cf-cand-img">
                  {c.imageUrl ? <img src={c.imageUrl} alt="" loading="lazy" /> : <span className="cf-cand-initial">{c.name.slice(0, 1)}</span>}
                </span>
                <span className="cf-cand-main">
                  <span className="cf-cand-tags">
                    <span>{KIND_LABELS[c.kind] ?? 'Food'}</span>
                    {i === 0 && items.length > 1 && <span className="cf-best">Best guess</span>}
                  </span>
                  <span className="cf-cand-name">{c.name}</span>
                  {c.brand && <span className="cf-cand-brand">{c.brand}</span>}
                  {c.description && <span className="cf-cand-desc">{c.description}</span>}
                  {unmatched && <span className="cf-cand-desc cf-cand-note">Not matched to a product yet. Foodex will look for the exact one next.</span>}
                </span>
                <span className="cf-cand-go" aria-hidden>
                  <ArrowRight size={18} />
                </span>
              </motion.button>
            </motion.li>
          )
        })}
      </ul>

      <motion.div variants={item}>
        <button className="cf-btn cf-btn-ghost" onClick={onNone}>
          {refining ? 'None of these, check it anyway' : 'None of these'}
        </button>
      </motion.div>
    </motion.section>
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
          <button className="cf-btn cf-btn-secondary cf-btn-sm" onClick={onRetry}>
            <RotateCcw size={14} /> Try again
          </button>
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
  trace: TraceEntry[]
  doneAt: number
  profile: RestrictionProfile
  onWrongItem: () => void
  onDone: () => void
}

/** Findings sorted into the groups people read on a label. */
function groupFindings(findings: Finding[]) {
  const strip = (text: string, prefix: RegExp) => text.replace(prefix, '').trim()
  const uniq = (list: string[]) => [...new Set(list)]
  const isHma = (f: Finding) => sourceIdFor(f.source.url) === 'hma'
  const fromHma = findings.filter(isHma)
  findings = findings.filter((f) => !isHma(f))
  return {
    hma: fromHma,
    ingredients: uniq(findings.filter((f) => f.type === 'ingredient' && !/^contains /i.test(f.text)).map((f) => f.text)),
    allergens: uniq(findings.filter((f) => f.type === 'ingredient' && /^contains /i.test(f.text)).map((f) => strip(f.text, /^contains /i))),
    traces: uniq(findings.filter((f) => f.type === 'may_contain').map((f) => strip(f.text, /^may contain /i))),
    labels: uniq(findings.filter((f) => f.type === 'certification' || f.type === 'claim').map((f) => strip(f.text, / label$/i))),
  }
}

/** What research read, as thinking steps. Built from the data that came back. */
function researchTrace(item: Identification, result: ResearchResult, verdicts: Verdict[], at: number): TraceEntry[] {
  const out: TraceEntry[] = []
  const page = result.searched.find((s) => sourceIdFor(s.url) === 'off')
  const g = groupFindings(result.findings)
  if (result.hma === 'matched' && g.hma[0]) {
    out.push({ by: 'hma', at, text: g.hma[0].text, detail: g.hma[0].source.title.replace(/^HMA Halal Check: /, ''), href: g.hma[0].source.url })
  } else if (result.hma === 'no_match') {
    out.push({ by: 'hma', at, text: "Not on HMA's halal list", detail: 'Matched by brand and name; no listing close enough' })
  } else if (result.hma === 'unavailable') {
    out.push({ by: 'hma', at, text: "HMA's halal list didn't load in time" })
  }
  if (!page) {
    out.push({ by: 'foodex', at, text: item.code ? "Open Food Facts has no data for this product" : 'No barcode, so no ingredient list to read' })
  } else {
    out.push({ by: 'off', at, text: 'Opened the product page', href: page.url, detail: page.title.replace(/^Open Food Facts: /, '') })
    const shown = g.ingredients.slice(0, 8).join(', ')
    out.push(
      g.ingredients.length
        ? {
            by: 'off',
            at,
            text: `Read ${g.ingredients.length} ${g.ingredients.length === 1 ? 'ingredient' : 'ingredients'}${result.ingredientsComplete ? '' : ' (list may be incomplete)'}`,
            detail: g.ingredients.length > 8 ? `${shown} and ${g.ingredients.length - 8} more` : shown,
          }
        : { by: 'off', at, text: 'No English ingredient list on the page' },
    )
    out.push({ by: 'off', at, text: g.allergens.length ? `Allergens listed: ${g.allergens.join(', ')}` : 'No allergens listed' })
    if (g.traces.length) out.push({ by: 'off', at, text: `May contain: ${g.traces.join(', ')}` })
    if (g.labels.length) out.push({ by: 'off', at, text: `Labels: ${g.labels.join(', ')}` })
  }
  if (verdicts.length) {
    const n = (v: Verdict['value']) => verdicts.filter((x) => x.value === v).length
    const parts = [
      n('doesnt_fit') && `${n('doesnt_fit')} doesn't fit`,
      n('not_enough_info') && `${n('not_enough_info')} not enough info`,
      n('fits') && `${n('fits')} ${n('fits') === 1 ? 'fits' : 'fit'}`,
    ].filter(Boolean)
    out.push({
      by: 'foodex',
      at,
      text: `Checked ${verdicts.length} ${verdicts.length === 1 ? 'restriction' : 'restrictions'} on this device`,
      detail: parts.join(' · '),
    })
  }
  return out
}

function Results({ item, result, trace, doneAt, profile, onWrongItem, onDone }: ResultsProps) {
  const rise = useRise()
  // Recomputed when the profile changes, so edits apply right away.
  const verdicts = useMemo(
    () => judge({ findings: result.findings, ingredientsComplete: result.ingredientsComplete }, profile),
    [result, profile],
  )
  const answer = overall(verdicts)
  const count = (v: Verdict['value']) => verdicts.filter((x) => x.value === v).length
  const searched = dedupe(result.searched, (s) => s.url)
  const tone = verdicts.length ? answer : 'none'
  const thinking = useMemo(() => [...trace, ...researchTrace(item, result, verdicts, doneAt)], [trace, item, result, verdicts, doneAt])

  return (
    <motion.section className="results cf-results" variants={list} initial="hidden" animate="show">
      <motion.div variants={rise}>
        <ThinkingTrace entries={thinking} />
      </motion.div>

      <motion.div className={`cf-hero cf-hero-${tone}`} variants={rise}>
        <div className="cf-hero-top">
          {item.imageUrl && <img className="cf-hero-img" src={item.imageUrl} alt="" />}
          <span className="cf-hero-name">{item.brand ? `${item.name} · ${item.brand}` : item.name}</span>
        </div>
        {verdicts.length ? (
          <>
            <motion.strong
              className="cf-hero-verdict"
              initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            >
              {VERDICT_LABELS[answer]}
            </motion.strong>
            <p>{OVERALL_TEXT[answer](verdicts.length, count(answer))}</p>
            <div className="cf-hero-tally" aria-hidden>
              {[...verdicts]
                .sort((a, b) => SEVERITY[a.value] - SEVERITY[b.value])
                .map((v, i) => (
                  <motion.span
                    key={v.restrictionKey}
                    className={`cf-tick cf-tick-${v.value}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.3 + i * 0.05 }}
                  />
                ))}
            </div>
          </>
        ) : (
          <p>You haven't picked any restrictions, so there's nothing to check. Add some in Settings.</p>
        )}
      </motion.div>

      {!result.findings.some((f) => f.type === 'ingredient' || f.type === 'may_contain') && (
        <motion.div className="note note-warn" variants={rise}>
          <InfoIcon size={18} />
          <div>
            <strong>No ingredient data for {item.name}.</strong>{' '}
            {item.kind === 'dish' || item.kind === 'menu'
              ? "Foodex can't see what's inside a dish from a photo. Ask the restaurant, or check their menu."
              : 'Open Food Facts has no ingredient list for it. Scan the barcode on the package, or search for the exact product name.'}
          </div>
        </motion.div>
      )}

      {[...verdicts]
        .sort((a, b) => SEVERITY[a.value] - SEVERITY[b.value])
        .map((v) => (
          <VerdictCard key={v.restrictionKey} verdict={v} />
        ))}

      <motion.p className="note note-info" variants={rise}>
        <InfoIcon size={18} />
        <span>
          Always check the physical label too. Recipes change, and online sources can be out of date. Foodex says whether food fits the
          restrictions you listed. It isn't medical advice.
        </span>
      </motion.p>

      {result.findings.length > 0 && <AllFindings result={result} verdicts={verdicts} />}

      <motion.section className="card cf-source" variants={rise}>
        <h2 className="cf-card-title">Source</h2>
        {searched.length ? (
          <ul className="cf-searched">
            {searched.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  <span className="cf-searched-logo">
                    <SourceLogo id={sourceIdFor(s.url)} size={22} />
                  </span>
                  <span>{s.title}</span>
                  <LinkIcon />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="cf-sub">
            {item.code
              ? "This product's page on Open Food Facts has no ingredient data yet."
              : "This item isn't matched to a product in Open Food Facts, so there's no ingredient list to check. Try Search by name to find the exact product."}
          </p>
        )}
        <p className="cf-fine">
          Ingredient data from{' '}
          <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener noreferrer">Open Food Facts</a>, a community database
          (ODbL). It can be incomplete or out of date.
        </p>
      </motion.section>

      <motion.div className="results-actions" variants={rise}>
        <button className="cf-btn cf-btn-primary" onClick={onDone}>
          <ScanLine size={16} /> Check something else
        </button>
        <button className="cf-btn cf-btn-ghost" onClick={onWrongItem}>
          Wrong item? Identify again
        </button>
      </motion.div>
    </motion.section>
  )
}

/** The full label, compact: groups of small chips. Ingredients behind a "Doesn't fit" are marked. */
function AllFindings({ result, verdicts }: { result: ResearchResult; verdicts: Verdict[] }) {
  const rise = useRise()
  const g = groupFindings(result.findings)
  const flagged = new Set(
    verdicts
      .filter((v) => v.value === 'doesnt_fit')
      .flatMap((v) => v.evidence.map((f) => f.text.replace(/^(contains|may contain) /i, '').replace(/ label$/i, '').toLowerCase())),
  )
  const groups = [
    { title: 'Ingredients', items: g.ingredients },
    { title: 'Allergens', items: g.allergens },
    { title: 'May contain', items: g.traces },
    { title: 'Labels', items: g.labels },
  ].filter((x) => x.items.length)
  const page = result.searched.find((s) => sourceIdFor(s.url) === 'off')
  const hma = g.hma[0]

  return (
    <motion.section className="card cf-label" variants={rise}>
      <div className="cf-label-head">
        <h2 className="cf-card-title">Full label</h2>
        <span className={`cf-label-state${result.ingredientsComplete ? '' : ' cf-label-partial'}`}>
          {result.ingredientsComplete ? 'Complete list' : 'May be incomplete'}
        </span>
      </div>
      {groups.map((grp) => (
        <div key={grp.title} className="cf-label-group">
          <h3>
            {grp.title} <span>{grp.items.length}</span>
          </h3>
          <p className="cf-chips">
            {grp.items.map((t) => (
              <span key={t} className={`cf-chip${flagged.has(t.toLowerCase()) ? ' cf-chip-bad' : ''}`}>
                {t}
              </span>
            ))}
          </p>
        </div>
      ))}
      {hma && (
        <div className="cf-label-group">
          <h3>Halal check</h3>
          <a
            className={`cf-hma${/\bnot\b/i.test(hma.text) ? ' cf-hma-no' : hma.type === 'certification' ? ' cf-hma-yes' : ''}`}
            href={hma.source.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SourceLogo id="hma" size={22} />
            <span className="cf-hma-body">
              <strong>{hma.text}</strong>
              <span>{hma.source.title.replace(/^HMA Halal Check: /, '')}</span>
            </span>
            <LinkIcon size={12} />
          </a>
        </div>
      )}
      {page && (
        <a className="cf-label-src" href={page.url} target="_blank" rel="noopener noreferrer">
          <SourceLogo id="off" size={14} /> Open Food Facts · community-reported <LinkIcon size={12} />
        </a>
      )}
    </motion.section>
  )
}

const EVIDENCE_SHOWN = 12

function VerdictCard({ verdict }: { verdict: Verdict }) {
  const rise = useRise()
  const [showAll, setShowAll] = useState(false)
  const evidence = dedupe(verdict.evidence, (f) => f.type + f.text + f.source.url)
  const shown = showAll ? evidence : evidence.slice(0, EVIDENCE_SHOWN)
  const sources = dedupe(evidence.map((f) => f.source), (src) => src.url)
  // Chips are tinted by what they mean for this verdict.
  const tone = (f: Finding) =>
    verdict.value === 'doesnt_fit'
      ? ' cf-chip-bad'
      : f.type === 'may_contain' || /\bnot\b/i.test(f.text)
        ? ' cf-chip-warn'
        : f.type === 'certification'
          ? ' cf-chip-good'
          : ''
  return (
    <motion.article className={`card verdict-card verdict-card-${verdict.value}`} variants={rise} layout="position">
      <div className="verdict-card-head">
        <span className="cf-vicon" aria-hidden>
          {verdict.value === 'fits' ? <Check size={15} strokeWidth={3} /> : verdict.value === 'doesnt_fit' ? <X size={15} strokeWidth={3} /> : <CircleHelp size={16} strokeWidth={2.4} />}
        </span>
        <h3>{verdict.label}</h3>
        <span className={`cf-pill cf-pill-${verdict.value}`}>
          <span className="cf-pill-dot" />
          {VERDICT_LABELS[verdict.value]}
        </span>
      </div>
      <p className="verdict-reason">{verdict.reason}</p>
      {evidence.length > 0 ? (
        <>
          <h4>
            {verdict.value === 'fits' ? 'Checked' : 'Evidence'} <span className="cf-h4-count">{evidence.length}</span>
          </h4>
          <p className="cf-chips">
            {shown.map((f) => (
              <span key={f.type + f.text} className={`cf-chip${tone(f)}`} title={FINDING_TYPE_LABELS[f.type]}>
                {f.text}
              </span>
            ))}
            {evidence.length > EVIDENCE_SHOWN && (
              <button className="cf-chip cf-chip-more" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show less' : `+${evidence.length - EVIDENCE_SHOWN} more`}
              </button>
            )}
          </p>
          {sources.map((src) => (
            <a key={src.url} className="cf-label-src cf-evidence-src" href={src.url} target="_blank" rel="noopener noreferrer">
              <SourceLogo id={sourceIdFor(src.url)} size={14} /> {src.title || hostOf(src.url)} · {SOURCE_KIND_LABELS[src.kind].toLowerCase()} <LinkIcon size={12} />
            </a>
          ))}
        </>
      ) : (
        <p className="cf-sub">No Findings back this up yet.</p>
      )}
    </motion.article>
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
