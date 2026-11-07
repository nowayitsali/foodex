import { GoogleGenAI, type Part } from '@google/genai'
import type { Identification, Research, RestrictionProfile } from '../src/domain/types'
import { RULES_BY_ID } from '../src/domain/restrictions'
import { parseIdentifications, parseResearch } from './parse'

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash'

export class MissingKeyError extends Error {}

function client() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new MissingKeyError('GEMINI_API_KEY is not set. Add it to .env and restart the dev server.')
  return new GoogleGenAI({ apiKey })
}

export interface IdentifyInput {
  /** Base64 JPEG from the camera, without the data: prefix. */
  image?: string
  query?: string
  hints?: string
}

export async function identify(input: IdentifyInput): Promise<Identification[]> {
  const parts: Part[] = []
  if (input.image) parts.push({ inlineData: { mimeType: 'image/jpeg', data: input.image } })
  parts.push({
    text: [
      input.image ? 'Identify the food, packaged product, dish or menu in this photo.' : `Identify the food or product the person is searching for: "${input.query ?? ''}".`,
      input.hints ? `Extra details from the person: ${input.hints}` : '',
      'Give up to 3 likely candidates, most likely first. Be specific: exact product name and brand when visible.',
      'Answer only with JSON: {"identifications": [{"name": string, "brand": string | null, "kind": "packaged_product" | "dish" | "ingredient" | "menu" | "other", "description": string}]}',
    ].filter(Boolean).join('\n'),
  })
  const res = await client().models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts }],
    config: { responseMimeType: 'application/json' },
  })
  return parseIdentifications(res.text ?? '')
}

export interface ResearchInput {
  item: Identification
  profile: RestrictionProfile
  hints?: string
}

export async function research({ item, profile, hints }: ResearchInput): Promise<Research & { searched: { title: string; url: string }[] }> {
  const restrictions = [
    ...profile.restrictions.map((id) => RULES_BY_ID[id]?.label).filter(Boolean),
    ...profile.custom.map((c) => c.text),
  ]
  const prompt = [
    `Research this food item online: ${item.name}${item.brand ? ` by ${item.brand}` : ''} (${item.kind}). ${item.description}`,
    hints ? `Extra details from the person: ${hints}` : '',
    `The person cares about: ${restrictions.join(', ') || 'general ingredients'}.`,
    'Find the full ingredient list, allergen and "may contain" statements, and any halal, kosher, vegan or gluten-free certifications.',
    'Report only facts you found in a source. Never guess or fill in from memory. Every finding must name the page it came from.',
    'One finding per ingredient. Put "Contains: X" allergen statements as ingredient findings and "may contain X" statements as may_contain findings.',
    'sourceKind: official_certification (a certifier listing), manufacturer (brand or official product page), restaurant_confirmed (the restaurant itself), community_reported (databases like Open Food Facts, reviews, forums), online_menu (third-party menu sites).',
    'Set ingredientsComplete to true only if you found the complete ingredient list.',
    'Answer only with JSON: {"ingredientsComplete": boolean, "findings": [{"type": "ingredient" | "may_contain" | "certification" | "claim", "text": string, "sourceTitle": string, "sourceUrl": string, "sourceKind": string}]}',
  ].filter(Boolean).join('\n')

  const res = await client().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  })
  const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []
  const searched = chunks.flatMap((c) => (c.web?.uri ? [{ title: c.web.title ?? c.web.uri, url: c.web.uri }] : []))
  return { ...parseResearch(res.text ?? ''), searched }
}
