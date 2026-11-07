import { describe, expect, it } from 'vitest'
import { parseIdentifications, parseResearch } from './parse'

describe('parseResearch', () => {
  it('reads JSON even with extra text and code fences around it', () => {
    const text = 'Here you go:\n```json\n{"ingredientsComplete": true, "findings": [{"type": "ingredient", "text": "milk", "sourceTitle": "Brand site", "sourceUrl": "https://brand.com/p", "sourceKind": "manufacturer"}]}\n```\nDone.'
    expect(parseResearch(text)).toEqual({
      ingredientsComplete: true,
      findings: [{ type: 'ingredient', text: 'milk', source: { title: 'Brand site', url: 'https://brand.com/p', kind: 'manufacturer' } }],
    })
  })

  it('drops Findings with no Source, because every Finding must be tied to one', () => {
    const text = JSON.stringify({ ingredientsComplete: true, findings: [{ type: 'ingredient', text: 'sugar' }] })
    expect(parseResearch(text).findings).toEqual([])
  })

  it('drops Findings with an unknown type and maps unknown Source kinds to the least trusted kind', () => {
    const text = JSON.stringify({
      ingredientsComplete: false,
      findings: [
        { type: 'vibe', text: 'tasty', sourceUrl: 'https://a.com' },
        { type: 'may_contain', text: 'May contain sesame', sourceUrl: 'https://b.com', sourceKind: 'blog' },
      ],
    })
    expect(parseResearch(text).findings).toEqual([
      { type: 'may_contain', text: 'May contain sesame', source: { title: 'b.com', url: 'https://b.com', kind: 'online_menu' } },
    ])
  })

  it('treats an unreadable answer as no Findings, so every Verdict becomes Not enough info', () => {
    expect(parseResearch('sorry, I could not find it')).toEqual({ ingredientsComplete: false, findings: [] })
  })

  it('never trusts ingredientsComplete without ingredient Findings', () => {
    expect(parseResearch(JSON.stringify({ ingredientsComplete: true, findings: [] })).ingredientsComplete).toBe(false)
  })
})

describe('parseIdentifications', () => {
  it('reads a list of Identifications and fills in a missing kind', () => {
    const text = '{"identifications": [{"name": "Lay\'s Classic", "brand": "Lay\'s", "kind": "packaged_product", "description": "Potato chips"}, {"name": "Pad thai", "description": "Noodle dish"}]}'
    expect(parseIdentifications(text)).toEqual([
      { name: "Lay's Classic", brand: "Lay's", kind: 'packaged_product', description: 'Potato chips' },
      { name: 'Pad thai', kind: 'other', description: 'Noodle dish' },
    ])
  })

  it('returns an empty list for an unreadable answer', () => {
    expect(parseIdentifications('nope')).toEqual([])
  })
})
