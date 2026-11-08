# Research: more ingredient sources than Open Food Facts

Date: 2026-11-08. Question: should Foodex read ingredients from more than Open Food Facts, and from where?

## Why

Open Food Facts (OFF) is community-edited and often thin. Example: Nutella, barcode 3017620422003. Its English
ingredient list on OFF is just "sugar, palm oil", yet OFF marks it complete. Foodex then reads 2 ingredients
and misses hazelnut, milk and soy in the list (they only show up through OFF's allergen tags).

## Options checked

| Source | What it has | Cost and access | Verdict |
|---|---|---|---|
| **USDA FoodData Central, Branded Foods** | Full label ingredient text and UPC/GTIN for US branded foods, supplied by brand owners through the USDA Global Branded Foods Database | Free. Public domain (CC0), credit requested. Free api.data.gov key: 1,000 requests/hour. `DEMO_KEY`: 30/hour, 50/day | **Add it.** Best free second source |
| **The photo itself** (Gemini reads the ingredient panel) | Whatever is printed on the package in the Diner's hand | Already one Gemini call per photo Scan | **Add it.** Works for any product and country; AI only transcribes, rules still decide (ADR 0001) |
| Nutritionix | Branded and restaurant foods | Free tier for 2 active users; enterprise from about $1,850/month | Skip for now |
| Spoonacular | Mostly recipes, partial allergen data | 150 requests/day free | Skip |
| Edamam, FatSecret, Chomp | Nutrition-first; some allergen flags | Free tiers with limits, licences restrict storing data | Skip for now |
| UPCitemdb | Product name and brand only, no ingredients | 100 requests/day free | Skip |
| Halal and kosher certifiers (IFANCA, MUI and others) | Lists of certified products | Website search only, no public API found | Later: link out from Results |
| FLIP, University of Toronto | Ingredients for about 70,000 Canadian grocery items | Academic research groups only | Not available |
| Loblaw / PC Express | Canadian store listings | No public API found | Not available |

## Tests run

USDA search, with `DEMO_KEY`, on 2026-11-08:

- "nutella" returned Ferrero U.S.A. items with full lists: "sugar, palm oil, hazelnuts, cocoa, skim milk, whey (milk),
  lecithin as emulsifier (soy), vanillin".
- "oreo" (667 hits) and "doritos nacho" (1,127 hits) returned full manufacturer ingredient lists.
- Barcode lookup works with `gtinUpc:` queries. USDA stores barcodes with 12, 13 or 14 digits, so one query
  should OR the zero-padded variants: `gtinUpc:028400027540 OR gtinUpc:0028400027540 OR gtinUpc:00028400027540`.
- A side-by-side test of the 15 most-scanned Canadian products was cut short: `DEMO_KEY` ran out after about 10
  requests, and OFF started answering 429 and 503. Run it again with a personal key.

## Caveats

- USDA covers US products. Canadian versions of a product can have a different recipe, so a USDA match on a
  Canadian barcode should be shown as "US listing" and checked against the label.
- USDA records carry a published date, and some are a few years old. Show the date.
- Source kind for USDA data: Manufacturer (brand owners submit it), which ranks above Community-reported.

## Recommendation

1. Look up USDA alongside OFF for every barcode and Search. Prefer the fuller English ingredient list, keep both
   as Sources, and show both in the "Checked N sources" panel. Needs a free key from https://api.data.gov/signup
   stored as `FDC_API_KEY` (server only).
2. Add "Scan the ingredients": when the Diner photographs the ingredient panel, Gemini transcribes it in the same
   single call, and the rules check that text. This is the most accurate source and covers every country.
3. Leave the paid APIs and certifier directories for after the hackathon.

## Sources

- [FoodData Central API Guide](https://fdc.nal.usda.gov/api-guide/)
- [Food API list, 2026 (Suggestic)](https://suggestic.com/blog/food-api-ultimate-list)
- [Free food and nutrition APIs, 2026 (DEV Community)](https://dev.to/0012303/8-free-food-nutrition-apis-no-key-tested-2026-3doh)
- [Free barcode lookup APIs in 2026 (Ecomsource)](https://www.ecomsource.ai/blog/free-barcode-lookup-api-2026-guide)
- [How to check if food is halal (HalalSpy)](https://halalspy.com/halal-knowledge/certification/how-to-check-halal/)
- [FLIP, Food Label Information & Price (University of Toronto)](https://labbelab.utoronto.ca/projects/food-label-information-price-flip/)
