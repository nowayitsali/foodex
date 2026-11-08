import type { Finding, Identification } from '../src/domain/types'
import { identifyPhoto, MissingKeyError } from './gemini.js'
import { getProduct, productToIdentification, productToResearch, searchProducts } from './openfoodfacts.js'
import { lookupHma } from './hma.js'

// The API routes, shared by the Vite dev server (api-plugin.ts) and the Vercel functions (api/).

// Typed Search and scanned codes cost no Gemini calls. A photo costs exactly one.
async function identify(b: { image?: string; query?: string; code?: string; hints?: string }): Promise<Identification[]> {
  // A scanned barcode or QR code: look the product up directly.
  if (typeof b.code === 'string' && /^\d{8,14}$/.test(b.code)) {
    const product = await getProduct(b.code)
    return product ? [productToIdentification(product)] : []
  }
  const hints = typeof b.hints === 'string' ? b.hints.trim() : ''
  if (typeof b.image === 'string' && b.image) {
    const guesses = await identifyPhoto(b.image, hints || undefined)
    const product = guesses.find((g) => g.kind === 'packaged_product')
    // Match the best packaged-product guess to real products, so the Diner confirms an actual product.
    const matches = product ? await searchProducts(`${product.brand ?? ''} ${product.name}`, 3).catch(() => []) : []
    return [...matches, ...guesses]
  }
  const query = [typeof b.query === 'string' ? b.query : '', hints].join(' ').trim()
  return searchProducts(query)
}

/** True when the Diner keeps halal, so HMA's list is worth checking. */
function wantsHalal(profile: unknown): boolean {
  const p = profile as { restrictions?: unknown; custom?: { text?: unknown }[] } | undefined
  const ids = Array.isArray(p?.restrictions) ? p.restrictions : []
  const custom = Array.isArray(p?.custom) ? p.custom : []
  return ids.includes('halal') || custom.some((c) => /halal|zabiha/i.test(String(c?.text ?? '')))
}

async function research(b: { item?: Identification; profile?: unknown }) {
  const item = b.item
  const code = item?.code
  // Open Food Facts and HMA are looked up at the same time.
  const [product, hma] = await Promise.all([
    code ? getProduct(code) : Promise.resolve(null),
    item?.name && wantsHalal(b.profile) ? lookupHma(item.name, item.brand) : Promise.resolve(undefined),
  ])
  const searched: { title: string; url: string }[] = []
  let result: { findings: Finding[]; ingredientsComplete: boolean } = { findings: [], ingredientsComplete: false }
  if (product) {
    result = productToResearch(product)
    const page = result.findings[0]?.source ?? { title: `Open Food Facts: ${product.product_name ?? code}`, url: `https://world.openfoodfacts.org/product/${code}` }
    searched.push({ title: page.title, url: page.url })
  }
  if (hma?.status === 'matched') {
    result = { ...result, findings: [...result.findings, hma.finding] }
    searched.push({ title: hma.finding.source.title, url: hma.finding.source.url })
  }
  return { ...result, searched, ...(hma ? { hma: hma.status } : {}) }
}

export const routes: Record<string, (body: any) => Promise<unknown>> = {
  '/api/identify': async (b) => ({ identifications: await identify(b) }),
  '/api/research': async (b) => research(b),
}

/** Runs a route and returns [status, body]. */
export async function runRoute(path: string, body: unknown): Promise<[number, unknown]> {
  const handler = routes[path]
  if (!handler) return [404, { error: 'Not found' }]
  try {
    return [200, await handler(body ?? {})]
  } catch (e) {
    console.error('[foodex-api]', e)
    return [e instanceof MissingKeyError ? 503 : 500, { error: e instanceof Error ? e.message : 'Something went wrong' }]
  }
}

/** A Web-standard POST handler for one route (used by the Vercel functions). */
export function postHandler(path: string) {
  return async (request: Request): Promise<Response> => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    const [status, out] = await runRoute(path, body)
    return Response.json(out, { status })
  }
}
