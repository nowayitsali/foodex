import type { Finding, Identification, Research, Source } from '../src/domain/types'

// Open Food Facts: a free public product database. We use it instead of a
// Gemini web search, so typed Searches and ingredient research cost no AI calls.
// Data is community-contributed and licensed under ODbL; the UI credits it.

const USER_AGENT = 'Foodex/0.1 (hackathon prototype)'
const PRODUCT_FIELDS = 'code,product_name,brands,image_front_small_url,ingredients_text,ingredients_text_en,allergens_tags,traces_tags,labels_tags,states_tags'
const TIMEOUT_MS = 10_000

export interface OffProduct {
  image_front_small_url?: string
  code: string
  product_name?: string
  brands?: string
  ingredients_text?: string
  ingredients_text_en?: string
  allergens_tags?: string[]
  traces_tags?: string[]
  labels_tags?: string[]
  states_tags?: string[]
}

export interface OffHit {
  code: string
  product_name?: string
  brands?: string | string[]
  image_front_small_url?: string
}

/** "en:sesame-seeds" -> "sesame seeds". Tags in other languages are skipped. */
function englishTag(tag: string): string | undefined {
  return tag.startsWith('en:') ? tag.slice(3).replace(/-/g, ' ') : undefined
}

const firstBrand = (b?: string | string[]) => (Array.isArray(b) ? b[0] : b?.split(',')[0])?.trim() || undefined

/** Splits an ingredient list on commas that are not inside brackets. */
export function splitIngredients(text: string): string[] {
  const out: string[] = []
  let depth = 0
  let current = ''
  for (const ch of text) {
    if ('([{'.includes(ch)) depth++
    if (')]}'.includes(ch)) depth = Math.max(0, depth - 1)
    if ((ch === ',' || ch === ';') && depth === 0) {
      out.push(current)
      current = ''
    } else current += ch
  }
  out.push(current)
  return out.map((s) => s.replace(/\s*\d+([.,]\d+)?\s*%/g, '').replace(/[.\s]+$/, '').trim()).filter(Boolean)
}

export function productToResearch(p: OffProduct): Research {
  const source: Source = {
    title: `Open Food Facts: ${p.product_name || p.code}`,
    url: `https://world.openfoodfacts.org/product/${p.code}`,
    kind: 'community_reported',
  }
  const finding = (type: Finding['type'], text: string): Finding => ({ type, text, source })
  const ingredientsText = (p.ingredients_text_en || p.ingredients_text || '').trim()
  const tags = (list?: string[]) => (list ?? []).map(englishTag).filter((t): t is string => !!t)

  const findings: Finding[] = [
    ...splitIngredients(ingredientsText).map((i) => finding('ingredient', i)),
    ...tags(p.allergens_tags).map((a) => finding('ingredient', `Contains ${a}`)),
    ...tags(p.traces_tags).map((t) => finding('may_contain', `May contain ${t}`)),
    ...tags(p.labels_tags).map((l) =>
      finding(l === 'halal' || l === 'kosher' ? 'certification' : 'claim', `${l.charAt(0).toUpperCase()}${l.slice(1)} label`),
    ),
  ]
  const complete = !!ingredientsText && (p.states_tags ?? []).includes('en:ingredients-completed')
  return { findings, ingredientsComplete: complete }
}

/** One looked-up product as an Identification (for a scanned code). */
export function productToIdentification(p: OffProduct): Identification {
  return hitsToIdentifications([{ ...p, product_name: p.product_name || `Product ${p.code}` }])[0]
}

export function hitsToIdentifications(hits: OffHit[]): Identification[] {
  return hits.flatMap((h) => {
    const name = h.product_name?.trim()
    if (!name || !h.code) return []
    const brand = firstBrand(h.brands)
    return [{
      name,
      ...(brand ? { brand } : {}),
      kind: 'packaged_product' as const,
      description: `Barcode ${h.code}`,
      code: h.code,
      ...(h.image_front_small_url ? { imageUrl: h.image_front_small_url } : {}),
    }]
  })
}

// Results are cached for the life of the dev server, so a repeat lookup is free.
const productCache = new Map<string, OffProduct | null>()
const searchCache = new Map<string, Identification[]>()

async function getJson(url: string): Promise<any> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) throw new Error(`Open Food Facts is unavailable right now (${res.status}). Try again in a minute.`)
  return res.json()
}

export async function searchProducts(query: string, limit = 4): Promise<Identification[]> {
  const key = query.trim().toLowerCase()
  if (!key) return []
  const cached = searchCache.get(key)
  if (cached) return cached
  const url = `https://search.openfoodfacts.org/search?q=${encodeURIComponent(key)}&page_size=${limit}&fields=code,product_name,brands,image_front_small_url`
  const data = await getJson(url)
  const result = hitsToIdentifications(Array.isArray(data?.hits) ? data.hits : [])
  searchCache.set(key, result)
  return result
}

export async function getProduct(code: string): Promise<OffProduct | null> {
  if (productCache.has(code)) return productCache.get(code)!
  const data = await getJson(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${PRODUCT_FIELDS}`)
  const product = data?.status === 1 && data.product ? ({ ...data.product, code } as OffProduct) : null
  productCache.set(code, product)
  return product
}
