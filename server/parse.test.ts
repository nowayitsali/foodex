import { describe, expect, it } from 'vitest'
import { parseIdentifications } from './parse'

describe('parseIdentifications', () => {
  it('reads JSON even with extra text and code fences around it', () => {
    const text = 'Sure:\n```json\n{"identifications": [{"name": "Kit Kat", "brand": "Nestlé", "kind": "packaged_product", "description": "Wafer bar"}]}\n```'
    expect(parseIdentifications(text)).toEqual([{ name: 'Kit Kat', brand: 'Nestlé', kind: 'packaged_product', description: 'Wafer bar' }])
  })

  it('reads a list of Identifications and fills in a missing kind', () => {
    const text = '{"identifications": [{"name": "Lay\'s Classic", "brand": "Lay\'s", "kind": "packaged_product", "description": "Potato chips"}, {"name": "Pad thai", "description": "Noodle dish"}]}'
    expect(parseIdentifications(text)).toEqual([
      { name: "Lay's Classic", brand: "Lay's", kind: 'packaged_product', description: 'Potato chips' },
      { name: 'Pad thai', kind: 'other', description: 'Noodle dish' },
    ])
  })

  it('drops candidates with no name', () => {
    expect(parseIdentifications('{"identifications": [{"brand": "X"}, {"name": " "}]}')).toEqual([])
  })

  it('returns an empty list for an unreadable answer', () => {
    expect(parseIdentifications('nope')).toEqual([])
  })
})
