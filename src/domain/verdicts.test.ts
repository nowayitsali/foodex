import { describe, expect, it } from 'vitest'
import { judge } from './verdicts'
import type { Finding, FindingType, RestrictionId, RestrictionProfile, Research, SourceKind } from './types'

const src = (kind: SourceKind = 'manufacturer') => ({ title: 'Label', url: 'https://example.com', kind })
const f = (type: FindingType, text: string, kind?: SourceKind): Finding => ({ type, text, source: src(kind) })
const profile = (restrictions: RestrictionId[], custom: RestrictionProfile['custom'] = []): RestrictionProfile => ({
  restrictions,
  custom,
  cuisines: [],
})
const research = (findings: Finding[], ingredientsComplete = true): Research => ({ findings, ingredientsComplete })
const only = (r: Research, p: RestrictionProfile) => {
  const verdicts = judge(r, p)
  expect(verdicts).toHaveLength(1)
  return verdicts[0]
}

describe('judge', () => {
  it('gives one Verdict per Restriction, including Custom restrictions', () => {
    const v = judge(research([f('ingredient', 'water')]), profile(['vegan', 'peanut_free'], [{ category: 'medical', text: 'mustard' }]))
    expect(v.map((x) => x.restrictionKey)).toEqual(['vegan', 'peanut_free', 'custom:mustard'])
  })

  it('says Doesn\'t fit when an ingredient conflicts, and cites it as Evidence', () => {
    const milk = f('ingredient', 'skim milk powder')
    const v = only(research([f('ingredient', 'sugar'), milk]), profile(['dairy_free']))
    expect(v.value).toBe('doesnt_fit')
    expect(v.evidence).toEqual([milk])
    expect(v.reason).toMatch(/milk/i)
  })

  it('treats a "may contain" trace as Doesn\'t fit', () => {
    const v = only(research([f('ingredient', 'oats'), f('may_contain', 'May contain peanuts')]), profile(['peanut_free']))
    expect(v.value).toBe('doesnt_fit')
  })

  it('ignores look-alike ingredients that do not conflict', () => {
    const r = research([f('ingredient', 'coconut milk'), f('ingredient', 'cocoa butter'), f('ingredient', 'nutmeg'), f('ingredient', 'buckwheat')])
    expect(judge(r, profile(['dairy_free', 'tree_nut_free', 'gluten_free'])).map((v) => v.value)).toEqual(['fits', 'fits', 'fits'])
  })

  it('still catches peanut butter for Peanut-free even though it is not dairy', () => {
    const r = research([f('ingredient', 'peanut butter')])
    expect(judge(r, profile(['dairy_free', 'peanut_free'])).map((v) => v.value)).toEqual(['fits', 'doesnt_fit'])
  })

  it('does not flag vegetable broth, gluten-free oats or butternut squash', () => {
    const r = research([f('ingredient', 'vegetable broth'), f('ingredient', 'gluten-free oats'), f('ingredient', 'butternut squash')])
    expect(judge(r, profile(['vegan', 'gluten_free', 'dairy_free'])).map((v) => v.value)).toEqual(['fits', 'fits', 'fits'])
  })

  it('says Fits only when the ingredient list is complete', () => {
    const findings = [f('ingredient', 'rice'), f('ingredient', 'salt')]
    expect(only(research(findings, true), profile(['vegan'])).value).toBe('fits')
    expect(only(research(findings, false), profile(['vegan'])).value).toBe('not_enough_info')
  })

  it('says Not enough info when nothing was found', () => {
    expect(only(research([], false), profile(['gluten_free'])).value).toBe('not_enough_info')
  })

  it('matches plurals and is not fooled by case', () => {
    expect(only(research([f('ingredient', 'EGGS')]), profile(['egg_free'])).value).toBe('doesnt_fit')
    expect(only(research([f('ingredient', 'Shrimps')]), profile(['shellfish_free'])).value).toBe('doesnt_fit')
  })

  it('lets Lactose intolerance accept lactose-free milk but not regular milk', () => {
    expect(only(research([f('ingredient', 'lactose-free milk')]), profile(['lactose_intolerance'])).value).toBe('fits')
    expect(only(research([f('ingredient', 'whole milk')]), profile(['lactose_intolerance'])).value).toBe('doesnt_fit')
  })

  describe('lifestyle', () => {
    it('lets Pescatarian eat fish but not Vegetarian', () => {
      const r = research([f('ingredient', 'salmon'), f('ingredient', 'rice')])
      expect(judge(r, profile(['pescatarian', 'vegetarian'])).map((v) => v.value)).toEqual(['fits', 'doesnt_fit'])
    })

    it('rejects honey and eggs for Vegan but not for Vegetarian', () => {
      const r = research([f('ingredient', 'honey'), f('ingredient', 'egg')])
      expect(judge(r, profile(['vegetarian', 'vegan'])).map((v) => v.value)).toEqual(['fits', 'doesnt_fit'])
    })

    it('treats gelatin as meat for Vegetarian', () => {
      expect(only(research([f('ingredient', 'gelatin')]), profile(['vegetarian'])).value).toBe('doesnt_fit')
    })
  })

  describe('religious', () => {
    it('rejects pork and alcohol for Halal', () => {
      expect(only(research([f('ingredient', 'bacon bits')]), profile(['halal'])).value).toBe('doesnt_fit')
      expect(only(research([f('ingredient', 'white wine')]), profile(['halal'])).value).toBe('doesnt_fit')
    })

    it('needs a halal certification when the item contains meat', () => {
      const chicken = research([f('ingredient', 'chicken'), f('ingredient', 'salt')])
      expect(only(chicken, profile(['halal'])).value).toBe('not_enough_info')
      const cert = f('certification', 'Certified halal by HMA', 'official_certification')
      const v = only(research([...chicken.findings, cert]), profile(['halal']))
      expect(v.value).toBe('fits')
      expect(v.evidence).toContainEqual(cert)
    })

    it('accepts a complete meat-free, alcohol-free list as Halal', () => {
      expect(only(research([f('ingredient', 'potatoes'), f('ingredient', 'sunflower oil')]), profile(['halal'])).value).toBe('fits')
    })

    it('does not let a certification override a conflicting ingredient', () => {
      const r = research([f('ingredient', 'pork'), f('certification', 'Halal certified')])
      expect(only(r, profile(['halal'])).value).toBe('doesnt_fit')
    })

    it('does not count a certification for a different Restriction', () => {
      const r = research([f('ingredient', 'beef'), f('certification', 'Kosher certified (OU)')])
      expect(only(r, profile(['halal'])).value).toBe('not_enough_info')
    })

    it('rejects shellfish and meat with dairy for Kosher', () => {
      expect(only(research([f('ingredient', 'shrimp')]), profile(['kosher'])).value).toBe('doesnt_fit')
      const cheeseburger = research([f('ingredient', 'beef'), f('ingredient', 'cheddar cheese'), f('certification', 'Kosher certified')])
      expect(only(cheeseburger, profile(['kosher'])).value).toBe('doesnt_fit')
    })
  })

  describe('custom restrictions', () => {
    it('says Doesn\'t fit when a Finding mentions it', () => {
      const v = only(research([f('ingredient', 'Dijon mustard')]), profile([], [{ category: 'medical', text: 'Mustard' }]))
      expect(v.value).toBe('doesnt_fit')
      expect(v.label).toBe('Mustard')
    })

    it('says Not enough info otherwise, because rules cannot confirm free text', () => {
      const v = only(research([f('ingredient', 'rice')]), profile([], [{ category: 'medical', text: 'low FODMAP' }]))
      expect(v.value).toBe('not_enough_info')
    })

    it('says Fits when an allergy typed as an ingredient is absent from a complete list', () => {
      const p = profile([], [{ category: 'medical', text: 'mustard' }])
      expect(only(research([f('ingredient', 'rice'), f('ingredient', 'salt')]), p).value).toBe('fits')
      expect(only(research([f('ingredient', 'rice')], false), p).value).toBe('not_enough_info')
    })

    it('understands "no X" and "X-free" as the ingredient X', () => {
      const r = research([f('ingredient', 'garlic powder'), f('ingredient', 'corn starch')])
      expect(only(r, profile([], [{ category: 'medical', text: 'no garlic' }])).value).toBe('doesnt_fit')
      expect(only(r, profile([], [{ category: 'medical', text: 'corn-free' }])).value).toBe('doesnt_fit')
      expect(only(r, profile([], [{ category: 'medical', text: 'celery free' }])).value).toBe('fits')
    })

    it('keeps faith and diet descriptions as Not enough info even with a complete list', () => {
      const r = research([f('ingredient', 'rice')])
      expect(only(r, profile([], [{ category: 'religious', text: 'Jain' }])).value).toBe('not_enough_info')
      expect(only(r, profile([], [{ category: 'medical', text: 'low sodium' }])).value).toBe('not_enough_info')
    })
  })
})
