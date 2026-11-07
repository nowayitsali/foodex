import { describe, expect, it } from 'vitest'
import { hitsToIdentifications, productToResearch, splitIngredients } from './openfoodfacts'
import { judge } from '../src/domain/verdicts'

const nutella = {
  code: '3017620422003',
  product_name: 'Nutella',
  brands: 'Nutella, Ferrero',
  ingredients_text_en: 'sugar, palm oil',
  allergens_tags: ['en:milk', 'en:nuts', 'en:soybeans'],
  traces_tags: [],
  labels_tags: ['en:vegetarian', 'en:no-gluten'],
  states_tags: ['en:ingredients-completed'],
}

describe('productToResearch', () => {
  it('turns ingredients, allergens and traces into Findings sourced from the product page', () => {
    const r = productToResearch({ ...nutella, traces_tags: ['en:peanuts'] })
    const src = { title: 'Open Food Facts: Nutella', url: 'https://world.openfoodfacts.org/product/3017620422003', kind: 'community_reported' }
    expect(r.findings).toEqual([
      { type: 'ingredient', text: 'sugar', source: src },
      { type: 'ingredient', text: 'palm oil', source: src },
      { type: 'ingredient', text: 'Contains milk', source: src },
      { type: 'ingredient', text: 'Contains nuts', source: src },
      { type: 'ingredient', text: 'Contains soybeans', source: src },
      { type: 'may_contain', text: 'May contain peanuts', source: src },
      { type: 'claim', text: 'Vegetarian label', source: src },
      { type: 'claim', text: 'No gluten label', source: src },
    ])
    expect(r.ingredientsComplete).toBe(true)
  })

  it('lets allergen tags catch what a short ingredient list misses', () => {
    const verdicts = judge(productToResearch(nutella), { restrictions: ['dairy_free', 'tree_nut_free', 'soy_free'], custom: [], cuisines: [] })
    expect(verdicts.map((v) => v.value)).toEqual(['doesnt_fit', 'doesnt_fit', 'doesnt_fit'])
  })

  it('treats a halal or kosher label as a certification Finding', () => {
    const r = productToResearch({ code: '1', product_name: 'Beef jerky', ingredients_text: 'beef, salt', labels_tags: ['en:halal'], states_tags: ['en:ingredients-completed'] })
    expect(r.findings).toContainEqual(expect.objectContaining({ type: 'certification', text: 'Halal label' }))
    expect(judge(r, { restrictions: ['halal'], custom: [], cuisines: [] })[0].value).toBe('fits')
  })

  it('marks the ingredient list incomplete unless Open Food Facts says it is complete', () => {
    expect(productToResearch({ ...nutella, states_tags: ['en:ingredients-to-be-completed'] }).ingredientsComplete).toBe(false)
    expect(productToResearch({ ...nutella, ingredients_text_en: '', ingredients_text: '' }).ingredientsComplete).toBe(false)
  })

  it('ignores tags in other languages', () => {
    const r = productToResearch({ ...nutella, allergens_tags: ['fr:lait'], labels_tags: [] })
    expect(r.findings.map((f) => f.text)).toEqual(['sugar', 'palm oil'])
  })
})

describe('splitIngredients', () => {
  it('splits on top-level commas only and drops percentages and trailing dots', () => {
    expect(splitIngredients('Sugar, cocoa butter (emulsifier: soy lecithin, vanillin), milk 12%.')).toEqual([
      'Sugar',
      'cocoa butter (emulsifier: soy lecithin, vanillin)',
      'milk',
    ])
  })
})

describe('hitsToIdentifications', () => {
  it('maps search hits to packaged-product Identifications with their barcode', () => {
    const hits = [
      { code: '0060410025604', product_name: "Lay's classic", brands: ["lay's"], image_front_small_url: 'https://img/1.jpg' },
      { code: '2', brands: ['No name'] },
      { code: '3', product_name: 'Lays Classic', brands: 'Lay\'s, PepsiCo' },
    ]
    expect(hitsToIdentifications(hits)).toEqual([
      { name: "Lay's classic", brand: "lay's", kind: 'packaged_product', description: 'Barcode 0060410025604', code: '0060410025604', imageUrl: 'https://img/1.jpg' },
      { name: 'Lays Classic', brand: "Lay's", kind: 'packaged_product', description: 'Barcode 3', code: '3' },
    ])
  })
})
