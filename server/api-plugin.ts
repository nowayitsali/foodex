import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { runRoute, routes } from './handlers.js'

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

export function apiPlugin(): Plugin {
  return {
    name: 'foodex-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0] ?? ''
        if (req.method !== 'POST' || !routes[path]) return next()
        try {
          const [status, body] = await runRoute(path, await readJson(req))
          send(res, status, body)
        } catch (e) {
          send(res, 400, { error: e instanceof Error ? e.message : 'Bad request' })
        }
      })
    },
  }
}
