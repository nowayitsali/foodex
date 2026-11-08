import type { Finding, Source } from '../src/domain/types'

// HMA (Halal Monitoring Authority, Canada) "Halal Check": about 17,000 Canadian products,
// each with HMA's ruling and the date it was checked. HMA has no API. Its public page loads the
// whole list as JSON in chunks of 3,000 rows, so the server downloads it once a day and matches
// products by brand and name (the list has no barcodes).
// The ruling is HMA's, quoted as a Finding. The rules still decide the Verdict (ADR 0001).

export const HMA_PAGE = 'https://hmacanada.org/halal-check/'
const TABLE_URL =
  'https://hmacanada.org/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=33468&target_action=get-all-data&default_sorting=old_first&skip_rows=0&limit_rows=0&chunk_number='
const MAX_CHUNKS = 10
const DAY_MS = 24 * 60 * 60 * 1000
const USER_AGENT = 'Foodex/0.1 (hackathon prototype)'

export type HmaRuling = 'HMA Certified' | 'Approved' | 'Not Approved' | 'Undetermined'

export interface HmaRow {
  brand: string
  product: string
  ruling: HmaRuling
  checked: string
  remarks: string
  category: string
}

interface IndexedRow extends HmaRow {
  brandKey: string
  tokens: Set<string>
}

// Words that don't tell two products apart.
const STOP = new Set([
  'flavour', 'flavor', 'flavoured', 'flavored', 'flavours', 'and', 'with', 'the', 'of', 'in', 'a', 'g', 'kg', 'ml', 'l', 'oz',
  'pack', 'size', 'family', 'value', 'product', 'products', 'new', 'brand', 'by',
])

/** Lower case, no accents or punctuation, "&" as "and". */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Words worth comparing, singular, without the brand's own words. */
function tokens(text: string, brandKey: string): Set<string> {
  const brandWords = new Set(brandKey.split(' '))
  return new Set(
    normalize(text)
      .split(' ')
      .filter((w) => w && !STOP.has(w) && !brandWords.has(w) && !/^\d+$/.test(w))
      .map((w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w)),
  )
}

// A brand's spin-off products ("Doritos Cool Ranch Dip", "Oreo Cereal"). A row with one of these
// only matches when the scanned name says it too, so chips never match the dip.
const SPIN_OFFS = new Set([
  'dip', 'sauce', 'mix', 'cake', 'cereal', 'ice', 'bar', 'drink', 'beverage', 'seasoning', 'supplement', 'vitamin', 'gum',
  'candy', 'frosting', 'pudding', 'shake', 'creamer', 'syrup', 'cone', 'cupcake', 'truffle', 'brownie', 'muffin', 'pie',
  'dessert', 'popsicle', 'milkshake', 'topping', 'filling', 'coating', 'dressing', 'marinade', 'soup',
])

const RULINGS: HmaRuling[] = ['HMA Certified', 'Approved', 'Not Approved', 'Undetermined']

export function indexRows(raw: unknown[]): IndexedRow[] {
  const out: IndexedRow[] = []
  for (const r of raw) {
    const v = ((r as { value?: unknown })?.value ?? r) as Record<string, unknown>
    const ruling = RULINGS.find((x) => x.toLowerCase() === String(v?.ruling ?? '').trim().toLowerCase())
    const brand = String(v?.brandname ?? '').trim()
    const product = String(v?.productname ?? '').trim()
    if (!ruling || !brand || !product) continue
    const brandKey = normalize(brand)
    out.push({
      brand,
      product,
      ruling,
      checked: String(v.checkdate ?? '').trim(),
      remarks: String(v.remarks ?? '').trim(),
      category: String(v.category ?? '').trim(),
      brandKey,
      tokens: tokens(product, brandKey),
    })
  }
  return out
}

function sameBrand(a: string, b: string) {
  if (!a || !b) return false
  if (a === b) return true
  // "doritos" and "doritos canada", but not "la" inside "lays".
  const [short, long] = a.length < b.length ? [a, b] : [b, a]
  return short.length >= 4 && (long.startsWith(short + ' ') || long.endsWith(' ' + short))
}

/**
 * The HMA row for this product, or undefined. Conservative on purpose: the product name's
 * distinctive words must all appear in the HMA row, and if the best rows disagree, no match.
 */
export function matchHma(rows: IndexedRow[], name: string, brand?: string): HmaRow | undefined {
  const brandKey = normalize(brand ?? '')
  let candidates = brandKey ? rows.filter((r) => sameBrand(r.brandKey, brandKey)) : []
  // No brand, or a parent company as the brand ("Frito-Lay" for Doritos): the brand must be part of the name.
  if (!candidates.length) {
    const nameKey = ` ${normalize(name)} `
    candidates = rows.filter((r) => r.brandKey.length >= 4 && nameKey.includes(` ${r.brandKey} `))
  }
  if (!candidates.length) return undefined

  const scored = candidates
    .map((r) => {
      const want = tokens(name, r.brandKey)
      if (!want.size) return null
      if ([...r.tokens].some((w) => SPIN_OFFS.has(w) && !want.has(w))) return null
      const shared = [...want].filter((w) => r.tokens.has(w)).length
      return { r, mine: shared / want.size, theirs: r.tokens.size ? shared / r.tokens.size : 0 }
    })
    .filter((s): s is { r: IndexedRow; mine: number; theirs: number } => !!s && s.mine === 1 && s.theirs >= 0.4)
    .sort((a, b) => b.theirs - a.theirs)

  if (!scored.length) return undefined
  const best = scored.filter((s) => s.theirs === scored[0].theirs)
  if (new Set(best.map((s) => s.r.ruling)).size > 1) return undefined
  const { brandKey: _b, tokens: _t, ...row } = best[0].r
  return row
}

/** HMA's ruling as a Finding. "Not approved" and "undetermined" never count as halal. */
export function hmaFinding(row: HmaRow): Finding {
  const source: Source = {
    title: `HMA Halal Check: ${row.product}${row.checked ? ` (checked ${row.checked})` : ''}`,
    url: HMA_PAGE,
    kind: 'official_certification',
  }
  const why = row.remarks.replace(/\.$/, '')
  switch (row.ruling) {
    case 'HMA Certified':
      return { type: 'certification', text: 'HMA Certified halal', source }
    case 'Approved':
      return { type: 'certification', text: 'Approved as halal by HMA (ingredient review, no certificate)', source }
    case 'Not Approved':
      return { type: 'certification', text: `Not approved as halal by HMA${why ? `: ${why}` : ''}`, source }
    default:
      return { type: 'claim', text: `HMA: halal status undetermined${why ? ` (${why})` : ''}`, source }
  }
}

// ---------- Loading the list ----------

let cache: { rows: IndexedRow[]; at: number } | null = null
let loading: Promise<IndexedRow[]> | null = null

async function fetchChunk(n: number): Promise<unknown[]> {
  const res = await fetch(TABLE_URL + n, {
    headers: { 'User-Agent': USER_AGENT, Referer: 'https://hmacanada.org/all-products/' },
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`HMA list unavailable (${res.status})`)
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

/** The whole list, downloaded at most once a day. Chunks load in parallel. */
export function loadHma(): Promise<IndexedRow[]> {
  if (cache && Date.now() - cache.at < DAY_MS) return Promise.resolve(cache.rows)
  if (loading) return loading
  loading = (async () => {
    const chunks = await Promise.all(Array.from({ length: MAX_CHUNKS }, (_, n) => fetchChunk(n).catch((e) => (n === 0 ? Promise.reject(e) : []))))
    const rows = indexRows(chunks.flat())
    if (!rows.length) throw new Error('HMA list came back empty')
    cache = { rows, at: Date.now() }
    return rows
  })().finally(() => {
    loading = null
  })
  return loading
}

export type HmaLookup = { status: 'matched'; row: HmaRow; finding: Finding } | { status: 'no_match' } | { status: 'unavailable' }

/** Looks a product up, waiting at most `waitMs` for the list to load. */
export async function lookupHma(name: string, brand: string | undefined, waitMs = 8000): Promise<HmaLookup> {
  try {
    const rows = await Promise.race([
      loadHma(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), waitMs)),
    ])
    const row = matchHma(rows, name, brand)
    return row ? { status: 'matched', row, finding: hmaFinding(row) } : { status: 'no_match' }
  } catch {
    return { status: 'unavailable' }
  }
}
