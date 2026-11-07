import type { RestrictionCategory, RestrictionId } from './types'

// Ingredient word lists. Plurals are matched automatically.
const PORK = ['pork', 'bacon', 'ham', 'lard', 'prosciutto', 'pancetta', 'chorizo', 'pepperoni', 'salami']
const OTHER_MEAT = ['beef', 'chicken', 'turkey', 'lamb', 'mutton', 'veal', 'duck', 'goat', 'venison', 'meat', 'sausage', 'broth', 'stock', 'gelatin', 'gelatine', 'rennet']
const MEAT = [...PORK, ...OTHER_MEAT]
const FISH = ['fish', 'salmon', 'tuna', 'cod', 'anchovy', 'anchovies', 'sardine', 'tilapia', 'trout', 'haddock', 'mackerel', 'halibut', 'pollock']
const SHELLFISH = ['shellfish', 'shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop', 'squid', 'calamari', 'octopus', 'crayfish', 'krill']
const DAIRY = ['milk', 'butter', 'cream', 'cheese', 'cheddar', 'mozzarella', 'parmesan', 'whey', 'casein', 'caseinate', 'lactose', 'yogurt', 'yoghurt', 'ghee', 'curd', 'buttermilk', 'paneer']
const DAIRY_LOOKALIKES = [
  'coconut milk', 'almond milk', 'oat milk', 'soy milk', 'rice milk', 'cashew milk', 'coconut cream',
  'cocoa butter', 'peanut butter', 'almond butter', 'nut butter', 'shea butter', 'apple butter', 'cream of tartar',
]
const EGG = ['egg', 'albumen', 'albumin', 'ovalbumin', 'mayonnaise', 'meringue', 'lysozyme']
const ALCOHOL = ['alcohol', 'wine', 'beer', 'rum', 'brandy', 'sake', 'mirin', 'liqueur', 'vodka', 'whisky', 'whiskey', 'ethanol', 'bourbon']
const ALCOHOL_LOOKALIKES = ['sugar alcohol', 'alcohol-free', 'alcohol free', 'non-alcoholic', 'wine vinegar']
const OTHER_ANIMAL = ['honey', 'beeswax', 'carmine', 'cochineal', 'shellac', 'lanolin', 'collagen']
const GLUTEN = ['wheat', 'barley', 'rye', 'malt', 'spelt', 'semolina', 'durum', 'farro', 'triticale', 'couscous', 'seitan', 'bulgur', 'gluten', 'oat']
const GLUTEN_LOOKALIKES = ['buckwheat', 'gluten-free oats', 'gluten free oats', 'gluten-free', 'gluten free']
const PLANT_LOOKALIKES = ['vegetable broth', 'vegetable stock', 'veggie broth', 'mushroom broth', 'mushroom stock', 'agar gelatin']
const PEANUT = ['peanut', 'groundnut', 'arachis']
const TREE_NUT = ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut', 'pine nut', 'praline', 'marzipan', 'tree nut', 'nut']
const TREE_NUT_LOOKALIKES = ['coconut', 'nutmeg', 'butternut', 'doughnut', 'donut', 'peanut', 'groundnut']
const SOY = ['soy', 'soya', 'soybean', 'edamame', 'tofu', 'tempeh', 'miso', 'tamari', 'shoyu']
const SESAME = ['sesame', 'tahini', 'benne', 'gingelly']

export interface RestrictionRule {
  id: RestrictionId
  label: string
  category: RestrictionCategory
  /** Any of these in an ingredient or "may contain" Finding means Doesn't fit. */
  conflicts: string[]
  /** Phrases that look like a conflict but are not, such as "coconut milk". */
  lookalikes?: string[]
  /** Certification word that counts as proof, such as "halal". */
  certification?: string
  /** These are allowed only with a matching certification. */
  needsCertification?: string[]
  /** Conflicts only when both groups appear together (meat with dairy for Kosher). */
  notTogether?: [string[], string[]]
}

export const RESTRICTIONS: RestrictionRule[] = [
  {
    id: 'halal', label: 'Halal', category: 'religious',
    conflicts: [...PORK, ...ALCOHOL, 'carmine'],
    lookalikes: [...ALCOHOL_LOOKALIKES, ...PLANT_LOOKALIKES, 'fish gelatin'],
    certification: 'halal',
    needsCertification: OTHER_MEAT,
  },
  {
    id: 'kosher', label: 'Kosher', category: 'religious',
    conflicts: [...PORK, ...SHELLFISH, 'carmine'],
    lookalikes: [...PLANT_LOOKALIKES, 'fish gelatin'],
    certification: 'kosher',
    needsCertification: [...OTHER_MEAT, ...ALCOHOL],
    notTogether: [OTHER_MEAT.filter((m) => m !== 'gelatin' && m !== 'gelatine'), DAIRY],
  },
  { id: 'vegetarian', label: 'Vegetarian', category: 'lifestyle', conflicts: [...MEAT, ...FISH, ...SHELLFISH], lookalikes: PLANT_LOOKALIKES },
  { id: 'pescatarian', label: 'Pescatarian', category: 'lifestyle', conflicts: MEAT, lookalikes: PLANT_LOOKALIKES },
  {
    id: 'vegan', label: 'Vegan', category: 'lifestyle',
    conflicts: [...MEAT, ...FISH, ...SHELLFISH, ...DAIRY, ...EGG, ...OTHER_ANIMAL],
    lookalikes: [...DAIRY_LOOKALIKES, ...PLANT_LOOKALIKES],
  },
  { id: 'gluten_free', label: 'Gluten-free', category: 'medical', conflicts: GLUTEN, lookalikes: GLUTEN_LOOKALIKES },
  { id: 'dairy_free', label: 'Dairy-free', category: 'medical', conflicts: DAIRY, lookalikes: DAIRY_LOOKALIKES },
  {
    id: 'lactose_intolerance', label: 'Lactose intolerance', category: 'medical',
    conflicts: DAIRY,
    lookalikes: [...DAIRY_LOOKALIKES, 'lactose-free milk', 'lactose free milk', 'lactose-free', 'lactose free'],
  },
  { id: 'peanut_free', label: 'Peanut-free', category: 'medical', conflicts: PEANUT },
  { id: 'tree_nut_free', label: 'Tree-nut-free', category: 'medical', conflicts: TREE_NUT, lookalikes: TREE_NUT_LOOKALIKES },
  { id: 'shellfish_free', label: 'Shellfish-free', category: 'medical', conflicts: SHELLFISH },
  { id: 'fish_free', label: 'Fish-free', category: 'medical', conflicts: [...FISH, 'fish sauce', 'fish oil'] },
  { id: 'egg_free', label: 'Egg-free', category: 'medical', conflicts: EGG },
  { id: 'soy_free', label: 'Soy-free', category: 'medical', conflicts: SOY },
  { id: 'sesame_free', label: 'Sesame-free', category: 'medical', conflicts: SESAME },
]

export const RULES_BY_ID = Object.fromEntries(RESTRICTIONS.map((r) => [r.id, r])) as Record<RestrictionId, RestrictionRule>

export const CATEGORY_LABELS: Record<RestrictionCategory, string> = {
  religious: 'Religious',
  lifestyle: 'Lifestyle',
  medical: 'Medical',
}

export const CUISINES = ['Chinese', 'Indian', 'Middle Eastern', 'Italian', 'Mexican', 'Japanese', 'Thai', 'Korean', 'Mediterranean', 'Caribbean', 'Fast food', 'Desserts']
