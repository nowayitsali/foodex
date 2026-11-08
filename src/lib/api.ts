import type { Identification, Research, RestrictionProfile } from '../domain/types'

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`)
  return data as T
}

export async function identify(input: { image?: string; query?: string; code?: string; hints?: string }) {
  const { identifications } = await post<{ identifications: Identification[] }>('/api/identify', input)
  return identifications
}

export type ResearchResult = Research & {
  searched: { title: string; url: string }[]
  /** Whether HMA's halal list was checked (only when the Diner keeps halal), and what came of it. */
  hma?: 'matched' | 'no_match' | 'unavailable'
}

export function research(input: { item: Identification; profile: RestrictionProfile; hints?: string }) {
  return post<ResearchResult>('/api/research', input)
}
