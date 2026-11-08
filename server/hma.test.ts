import { describe, expect, it } from 'vitest'
import { hmaFinding, indexRows, matchHma, normalize } from './hma'
import { judge } from '../src/domain/verdicts'

// Rows shaped like HMA's public table.
const rows = indexRows([
  { value: { category: 'Chips', brandname: 'Doritos', productname: 'Doritos, Tortilla Chips, Flavour: Cool Ranch', ruling: 'Not Approved', checkdate: '3-Jun-2025', remarks: 'Product is not Lacto-Ovo Vegetarian Suitable' } },
  { value: { category: 'Dip', brandname: 'Doritos', productname: 'Doritos, Dip, Flavour: Cool Ranch Jalapeno', ruling: 'Approved', checkdate: '15-Feb-2024', remarks: '' } },
  { value: { category: 'Spread', brandname: 'Ferrero', productname: 'Ferrero Nutella Spread', ruling: 'Approved', checkdate: '6-May-2026', remarks: 'Product Approved due to Trusted Authority' } },
  { value: { category: 'Pasta', brandname: 'Italpasta', productname: 'Italpasta, Alphabets Pasta', ruling: 'HMA Certified', checkdate: 'Apr 26, 2024', remarks: 'Product is HMA Certified' } },
  { value: { category: 'Cookies', brandname: 'Oreo', productname: 'Oreo, Mint Cookies', ruling: 'Approved', checkdate: '1-Jan-2026', remarks: '' } },
  { value: { category: 'Cookies', brandname: 'Oreo', productname: 'Oreo, Mint Cookies', ruling: 'Not Approved', checkdate: '1-Feb-2026', remarks: '' } },
  { value: { category: 'Bad', brandname: '', productname: 'No brand', ruling: 'Approved' } },
  { value: { category: 'Bad', brandname: 'X', productname: 'Unknown ruling', ruling: 'Maybe' } },
])

describe('HMA matching', () => {
  it('skips rows without a brand or a known ruling', () => {
    expect(rows).toHaveLength(6)
  })

  it('normalizes accents, apostrophes and "&"', () => {
    expect(normalize("Lay's Sour Cream & Onion Crème")).toBe('lays sour cream and onion creme')
  })

  it('matches on brand and every distinctive word of the name', () => {
    expect(matchHma(rows, 'Doritos Cool Ranch Tortilla Chips', 'Doritos')?.product).toBe('Doritos, Tortilla Chips, Flavour: Cool Ranch')
  })

  it('never matches chips to the dip', () => {
    expect(matchHma(rows, 'Doritos Cool Ranch', 'Doritos')?.product).toBe('Doritos, Tortilla Chips, Flavour: Cool Ranch')
    expect(matchHma(rows, 'Doritos Cool Ranch Jalapeno Dip', 'Doritos')?.product).toBe('Doritos, Dip, Flavour: Cool Ranch Jalapeno')
  })

  it('finds the brand inside the name when the brand given is a parent company', () => {
    expect(matchHma(rows, 'Doritos Cool Ranch', 'Frito-Lay')?.ruling).toBe('Not Approved')
    expect(matchHma(rows, 'Italpasta Alphabets Pasta')?.ruling).toBe('HMA Certified')
  })

  it('does not match a different product of the same brand', () => {
    expect(matchHma(rows, 'Doritos Spicy Nacho', 'Doritos')).toBeUndefined()
    expect(matchHma(rows, 'Kinder Bueno', 'Ferrero')).toBeUndefined()
  })

  it('gives up when equally good rows disagree', () => {
    expect(matchHma(rows, 'Oreo Mint Cookies', 'Oreo')).toBeUndefined()
  })
})

describe('HMA rulings in Verdicts', () => {
  const halal = { restrictions: ['halal' as const], custom: [], cuisines: [] }
  const row = (ruling: string, remarks = '') => matchHma(indexRows([{ brandname: 'Acme', productname: 'Acme, Crackers', ruling, checkdate: '1-Jan-2026', remarks }]), 'Acme Crackers', 'Acme')!
  const verdict = (ruling: string, remarks = '', extra: Parameters<typeof judge>[0]['findings'] = []) =>
    judge({ findings: [hmaFinding(row(ruling, remarks)), ...extra], ingredientsComplete: false }, halal)[0]

  it('HMA Certified and Approved count as halal proof', () => {
    expect(verdict('HMA Certified').value).toBe('fits')
    const approved = verdict('Approved')
    expect(approved.value).toBe('fits')
    expect(approved.reason).toMatch(/approved as halal by HMA/i)
  })

  it('Not Approved keeps halal at Not enough info, with HMA\'s reason', () => {
    const v = verdict('Not Approved', 'Manufacturer has not responded back to our Inquiry')
    expect(v.value).toBe('not_enough_info')
    expect(v.reason).toMatch(/not approved as halal by HMA: Manufacturer has not responded/i)
  })

  it('Not Approved outweighs a halal label on the package', () => {
    const label = { type: 'certification' as const, text: 'Halal label', source: { title: 'OFF', url: 'https://off', kind: 'community_reported' as const } }
    expect(verdict('Not Approved', '', [label]).value).toBe('not_enough_info')
  })

  it('a conflicting ingredient still wins over an approval', () => {
    const pork = { type: 'ingredient' as const, text: 'pork', source: { title: 'OFF', url: 'https://off', kind: 'community_reported' as const } }
    expect(verdict('Approved', '', [pork]).value).toBe('doesnt_fit')
  })

  it('Undetermined changes nothing', () => {
    expect(verdict('Undetermined').value).toBe('not_enough_info')
    expect(hmaFinding(row('Undetermined')).type).toBe('claim')
  })

  it('HMA rulings never count for kosher', () => {
    const kosher = { restrictions: ['kosher' as const], custom: [], cuisines: [] }
    expect(judge({ findings: [hmaFinding(row('HMA Certified'))], ingredientsComplete: false }, kosher)[0].value).toBe('not_enough_info')
  })
})
