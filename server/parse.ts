import type { Finding, FindingType, Identification, Research, SourceKind } from '../src/domain/types'

// Turns the model's raw text answer into Findings and Identifications.
// Anything that does not fit the shape is dropped, so a bad answer can only
// ever lead to "Not enough info", never to "Fits".

const FINDING_TYPES: FindingType[] = ['ingredient', 'may_contain', 'certification', 'claim']
const SOURCE_KINDS: SourceKind[] = ['official_certification', 'manufacturer', 'restaurant_confirmed', 'community_reported', 'online_menu']
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

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

export function parseResearch(text: string): Research {
  const json = extractJson(text)
  const raw: any[] = Array.isArray(json?.findings) ? json.findings : []
  const findings: Finding[] = []
  for (const r of raw) {
    const type = r?.type as FindingType
    const body = str(r?.text)
    const url = str(r?.sourceUrl)
    const host = url && hostOf(url)
    if (!FINDING_TYPES.includes(type) || !body || !url || !host) continue
    const kind = SOURCE_KINDS.includes(r.sourceKind) ? (r.sourceKind as SourceKind) : 'online_menu'
    findings.push({ type, text: body, source: { title: str(r.sourceTitle) ?? host, url, kind } })
  }
  const hasIngredients = findings.some((f) => f.type === 'ingredient')
  return { findings, ingredientsComplete: json?.ingredientsComplete === true && hasIngredients }
}

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
