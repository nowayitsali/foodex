import type { Identification } from '../src/domain/types'

// Turns Gemini's raw text answer into Identifications. Anything that does not
// fit the shape is dropped.

const ID_KINDS: Identification['kind'][] = ['packaged_product', 'dish', 'ingredient', 'menu', 'other']

function extractJson(text: string): any {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end <= start) return undefined
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return undefined
  }
}

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

export function parseIdentifications(text: string): Identification[] {
  const json = extractJson(text)
  const raw: any[] = Array.isArray(json?.identifications) ? json.identifications : []
  return raw.flatMap((r) => {
    const name = str(r?.name)
    if (!name) return []
    const brand = str(r?.brand)
    const kind = ID_KINDS.includes(r?.kind) ? r.kind : 'other'
    return [{ name, ...(brand ? { brand } : {}), kind, description: str(r?.description) ?? '' }]
  })
}
