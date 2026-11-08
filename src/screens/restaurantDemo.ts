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
const noor = src('Al-Noor Grill menu (demo)', 'restaurant_confirmed')
const napoli = src('Bella Napoli on a delivery app (demo)', 'online_menu')
const seoul = src('Seoul Kitchen menu (demo)', 'online_menu')
const istanbul = src('Istanbul Kebab House menu (demo)', 'restaurant_confirmed')
const fiesta = src('Taco Fiesta reviews (demo)', 'community_reported')
const smoke = src('Smokehouse BBQ menu (demo)', 'online_menu')
const bistro = src('Le Petit Bistro menu (demo)', 'online_menu')

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
  {
    id: 'noor',
    name: 'Al-Noor Grill',
    cuisine: 'Middle Eastern',
    distanceKm: 3.4,
    verification: 'restaurant_confirmed',
    dishes: [
      dish('Chicken Shawarma Plate', 'Marinated chicken, rice, garlic sauce', '$17', noor, ['chicken', 'rice', 'garlic', 'lemon', 'olive oil', 'spices'], {
        certifications: ['Halal certified chicken'],
      }),
      dish('Beef Kebab', 'Charcoal-grilled beef skewers', '$19', noor, ['beef', 'onion', 'parsley', 'sumac'], { certifications: ['Halal certified beef'] }),
      dish('Hummus', 'Chickpeas, tahini, lemon, olive oil', '$7', noor, ['chickpeas', 'tahini', 'lemon', 'garlic', 'olive oil']),
      dish('Fattoush', 'Crisp pita salad with sumac', '$9', noor, ['lettuce', 'tomato', 'cucumber', 'wheat pita', 'sumac', 'olive oil']),
    ],
  },
  {
    id: 'napoli',
    name: 'Bella Napoli',
    cuisine: 'Italian',
    distanceKm: 4.7,
    verification: 'online_menu',
    dishes: [
      dish('Margherita Pizza', 'Tomato, mozzarella, basil', '$15', napoli, ['wheat flour', 'tomato', 'mozzarella', 'basil', 'olive oil']),
      dish('Pepperoni Pizza', 'Tomato, mozzarella, pepperoni', '$17', napoli, ['wheat flour', 'tomato', 'mozzarella', 'pepperoni']),
      dish('Penne alla Vodka', 'Penne in a creamy tomato vodka sauce', '$16', napoli, ['wheat penne', 'tomato', 'cream', 'vodka', 'parmesan']),
      dish('Tiramisu', 'Coffee-soaked ladyfingers and mascarpone', '$9', napoli, ['ladyfingers', 'mascarpone cheese', 'coffee', 'egg', 'rum']),
    ],
  },
  {
    id: 'seoul',
    name: 'Seoul Kitchen',
    cuisine: 'Korean',
    distanceKm: 6.3,
    verification: 'online_menu',
    dishes: [
      dish('Vegetable Bibimbap', 'Rice bowl with vegetables and gochujang', '$14', seoul, ['rice', 'spinach', 'carrot', 'bean sprouts', 'gochujang', 'sesame oil']),
      dish('Pork Bulgogi', 'Spicy grilled pork', '$18', seoul, ['pork', 'gochujang', 'garlic', 'soy sauce']),
      dish('Beef Bulgogi', 'Sweet soy-marinated beef', '$19', seoul, ['beef', 'soy sauce', 'pear', 'garlic'], { complete: false }),
    ],
  },
  {
    id: 'istanbul',
    name: 'Istanbul Kebab House',
    cuisine: 'Turkish',
    distanceKm: 8.1,
    verification: 'restaurant_confirmed',
    dishes: [
      dish('Lamb Doner', 'Shaved lamb, salad, yogurt sauce in bread', '$16', istanbul, ['lamb', 'wheat bread', 'lettuce', 'tomato', 'yogurt'], {
        certifications: ['Halal certified lamb'],
      }),
      dish('Adana Kebab', 'Spiced minced lamb skewer', '$18', istanbul, ['lamb', 'red pepper', 'onion', 'spices'], { certifications: ['Halal certified lamb'] }),
      dish('Lentil Kofte', 'Red lentil and bulgur patties', '$10', istanbul, ['red lentils', 'bulgur', 'onion', 'parsley', 'olive oil']),
      dish('Baklava', 'Filo pastry with pistachio and syrup', '$7', istanbul, ['wheat filo', 'pistachio', 'butter', 'sugar syrup']),
    ],
  },
  {
    id: 'fiesta',
    name: 'Taco Fiesta',
    cuisine: 'Mexican',
    distanceKm: 9.4,
    verification: 'community_reported',
    dishes: [
      dish('Bean Burrito', 'Black beans, rice, salsa, flour tortilla', '$11', fiesta, ['black beans', 'rice', 'tomato salsa', 'wheat tortilla']),
      dish('Carnitas Tacos', 'Slow-cooked pork, onion, cilantro', '$13', fiesta, ['pork', 'corn tortilla', 'onion', 'cilantro']),
      dish('Chicken Tacos', 'Grilled chicken, lime, cilantro', '$12', fiesta, ['chicken', 'corn tortilla', 'lime', 'cilantro']),
    ],
  },
  {
    id: 'smoke',
    name: 'Smokehouse BBQ',
    cuisine: 'American',
    distanceKm: 2.9,
    verification: 'online_menu',
    dishes: [
      dish('Pork Ribs', 'Slow-smoked ribs with BBQ sauce', '$24', smoke, ['pork ribs', 'bbq sauce', 'spices']),
      dish('Pulled Pork Sandwich', 'Smoked pork shoulder on a bun', '$15', smoke, ['pork', 'wheat bun', 'coleslaw']),
      dish('Bacon Mac and Cheese', 'Macaroni, cheddar and bacon', '$12', smoke, ['wheat macaroni', 'cheddar', 'milk', 'bacon']),
    ],
  },
  {
    id: 'bistro',
    name: 'Le Petit Bistro',
    cuisine: 'French',
    distanceKm: 5.6,
    verification: 'online_menu',
    dishes: [
      dish('Coq au Vin', 'Chicken braised in red wine', '$26', bistro, ['chicken', 'red wine', 'mushrooms', 'bacon']),
      dish('Croque Monsieur', 'Ham and gruyere toastie', '$14', bistro, ['wheat bread', 'ham', 'gruyere cheese', 'butter']),
      dish('French Onion Soup', 'Onion soup with wine and melted cheese', '$11', bistro, ['onion', 'beef stock', 'white wine', 'gruyere cheese']),
    ],
  },
]
