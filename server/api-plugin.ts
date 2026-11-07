import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import type { Identification } from '../src/domain/types'
import { identifyPhoto, MissingKeyError } from './gemini'
import { getProduct, productToIdentification, productToResearch, searchProducts } from './openfoodfacts'

// Runs the API routes inside the Vite dev server, so the Gemini key stays
// on the server and the prototype needs only `npm run dev`.

const MAX_BODY = 8 * 1024 * 1024

function readJson(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => {
      size += c.length
      if (size > MAX_BODY) {
        reject(new Error('Request too large'))
        req.destroy()
      } else chunks.push(c)
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

// Typed Search costs no Gemini calls. A photo costs exactly one.
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

async function research(b: { item?: Identification }) {
  const code = b.item?.code
  const product = code ? await getProduct(code) : null
  if (!product) return { findings: [], ingredientsComplete: false, searched: [] }
  const result = productToResearch(product)
  const page = result.findings[0]?.source ?? { title: `Open Food Facts: ${product.product_name ?? code}`, url: `https://world.openfoodfacts.org/product/${code}` }
  return { ...result, searched: [{ title: page.title, url: page.url }] }
}

const routes: Record<string, (body: any) => Promise<unknown>> = {
  '/api/identify': async (b) => ({ identifications: await identify(b) }),
  '/api/research': async (b) => research(b),
}

export function apiPlugin(): Plugin {
  return {
    name: 'foodex-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handler = req.method === 'POST' && req.url ? routes[req.url.split('?')[0]] : undefined
        if (!handler) return next()
        try {
          send(res, 200, await handler(await readJson(req)))
        } catch (e) {
          const missingKey = e instanceof MissingKeyError
          console.error('[foodex-api]', e)
          send(res, missingKey ? 503 : 500, { error: e instanceof Error ? e.message : 'Something went wrong' })
        }
      })
    },
  }
}
