import { GoogleGenAI, type Part } from '@google/genai'
import type { Identification } from '../src/domain/types'
import { parseIdentifications } from './parse.js'

// Gemini is used for one thing only: reading a photo. Ingredient research comes
// from Open Food Facts, because free Gemini keys get no Google Search.
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
const TIMEOUT_MS = 20_000

export class MissingKeyError extends Error {}

function client() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new MissingKeyError('GEMINI_API_KEY is not set. Add it to .env and restart the dev server.')
  return new GoogleGenAI({ apiKey })
}

/** One Gemini call: what food, product or dish is in this photo? */
export async function identifyPhoto(image: string, hints?: string): Promise<Identification[]> {
  const parts: Part[] = [
    { inlineData: { mimeType: 'image/jpeg', data: image } },
    {
      text: [
        'Identify the food, packaged product, dish or menu in this photo.',
        hints ? `Extra details from the person: ${hints}` : '',
        'Give up to 3 likely candidates, most likely first. Use the exact product name and brand when visible on the package.',
        'Answer only with JSON: {"identifications": [{"name": string, "brand": string | null, "kind": "packaged_product" | "dish" | "ingredient" | "menu" | "other", "description": string}]}',
      ].filter(Boolean).join('\n'),
    },
  ]
  try {
    const res = await client().models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts }],
      config: { responseMimeType: 'application/json', abortSignal: AbortSignal.timeout(TIMEOUT_MS) },
    })
    return parseIdentifications(res.text ?? '')
  } catch (e) {
    if (e instanceof MissingKeyError) throw e
    const msg = e instanceof Error ? e.message : String(e)
    if (/abort|timeout/i.test(msg)) throw new Error('Gemini took too long to answer. Try again, or use Search by name.')
    if (/429|quota|RESOURCE_EXHAUSTED/i.test(msg)) throw new Error("Gemini's free limit is used up for now. Try again later, or use Search by name.")
    if (/503|overloaded|high demand|UNAVAILABLE/i.test(msg)) throw new Error('Gemini is busy right now. Try again in a moment, or use Search by name.')
    throw e
  }
}
