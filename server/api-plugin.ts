import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { identify, MissingKeyError, research } from './gemini'

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

const routes: Record<string, (body: any) => Promise<unknown>> = {
  '/api/identify': async (b) => ({ identifications: await identify({ image: b.image, query: b.query, hints: b.hints }) }),
  '/api/research': async (b) => research({ item: b.item, profile: b.profile, hints: b.hints }),
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
