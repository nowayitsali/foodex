import type { Finding, Research, Source, SourceKind } from '../domain/types'

// Demo data for the Restaurant Search layout. Not real restaurants or menus.
// Each Dish carries Findings, so its Verdicts still come from judge().

export interface DemoDish {
  name: string
  description: string
  price: string
  research: Research
}

export interface DemoRestaurant {
  id: string
  name: string
  cuisine: string
  distanceKm: number
  /** The best Source kind behind this restaurant's menu. */
  verification: SourceKind
  dishes: DemoDish[]
}

function dish(
  name: string,
  description: string,
  price: string,
  source: Source,
  ingredients: string[],
  opts: { complete?: boolean; mayContain?: string[]; certifications?: string[] } = {},
): DemoDish {
  const findings: Finding[] = [
    ...ingredients.map((text) => ({ type: 'ingredient' as const, text, source })),
    ...(opts.mayContain ?? []).map((text) => ({ type: 'may_contain' as const, text, source })),
    ...(opts.certifications ?? []).map((text) => ({ type: 'certification' as const, text, source })),
  ]
  return { name, description, price, research: { findings, ingredientsComplete: opts.complete ?? true } }
}

const src = (title: string, kind: SourceKind): Source => ({ title, url: 'https://example.com/demo', kind })

const saffron = src('Saffron House menu (demo)', 'restaurant_confirmed')
const dragon = src('Golden Dragon on a delivery app (demo)', 'online_menu')
const olive = src('Olive & Thyme reviews (demo)', 'community_reported')
const sakura = src('Sakura Sushi menu (demo)', 'online_menu')

export const DEMO_RESTAURANTS: DemoRestaurant[] = [
  {
    id: 'saffron',
    name: 'Saffron House',
    cuisine: 'Indian',
    distanceKm: 0.4,
    verification: 'restaurant_confirmed',
    dishes: [
      dish('Chana Masala', 'Chickpeas in a spiced tomato and onion sauce', '$14', saffron, ['chickpeas', 'tomato', 'onion', 'garlic', 'ginger', 'vegetable oil', 'spices']),
      dish('Butter Chicken', 'Chicken in a creamy tomato sauce', '$18', saffron, ['chicken', 'butter', 'cream', 'tomato', 'spices'], {
        certifications: ['Halal certified chicken'],
      }),
      dish('Garlic Naan', 'Tandoor flatbread with garlic', '$4', saffron, ['wheat flour', 'yogurt', 'butter', 'garlic']),
    ],
  },
  {
    id: 'dragon',
    name: 'Golden Dragon',
    cuisine: 'Chinese',
    distanceKm: 1.2,
    verification: 'online_menu',
    dishes: [
      dish('Vegetable Spring Rolls', 'Crispy rolls with cabbage and carrot', '$7', dragon, ['wheat flour wrapper', 'cabbage', 'carrot', 'vegetable oil', 'soy sauce']),
      dish('Kung Pao Chicken', 'Wok-fried chicken with peanuts and chili', '$16', dragon, ['chicken', 'peanuts', 'soy sauce', 'dried chili'], { complete: false }),
      dish('Steamed Rice', 'Plain jasmine rice', '$3', dragon, ['jasmine rice', 'water']),
    ],
  },
  {
    id: 'olive',
    name: 'Olive & Thyme',
    cuisine: 'Mediterranean',
    distanceKm: 2.0,
    verification: 'community_reported',
    dishes: [
      dish('Falafel Wrap', 'Falafel, salad and tahini in pita', '$11', olive, ['chickpeas', 'parsley', 'tahini', 'wheat pita', 'lettuce']),
      dish('Lentil Soup', 'Red lentils with cumin and lemon', '$8', olive, ['red lentils', 'onion', 'carrot', 'olive oil', 'cumin', 'lemon']),
      dish('Lamb Kofta', 'Grilled spiced lamb skewers', '$19', olive, ['lamb', 'onion', 'parsley'], { complete: false }),
    ],
  },
  {
    id: 'sakura',
    name: 'Sakura Sushi',
    cuisine: 'Japanese',
    distanceKm: 2.6,
    verification: 'online_menu',
    dishes: [
      dish('Avocado Roll', 'Avocado and rice in nori', '$8', sakura, ['sushi rice', 'avocado', 'nori', 'rice vinegar'], { mayContain: ['may contain sesame'] }),
      dish('Salmon Nigiri', 'Fresh salmon over rice', '$10', sakura, ['sushi rice', 'salmon', 'rice vinegar']),
      dish('Edamame', 'Steamed soybeans with sea salt', '$6', sakura, ['edamame', 'sea salt']),
    ],
  },
]
