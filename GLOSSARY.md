# Foodex

Foodex tells a person whether a food, product or restaurant dish fits their dietary restrictions, and shows the sources behind that answer. One Restriction profile is applied everywhere: scanning, searching and nearby restaurants.

## People and profiles

**Diner**:
A person using Foodex to check food against their own restrictions.
_Avoid_: User, customer, eater

**Restriction**:
One rule a Diner's food must satisfy, such as Halal, Vegan or Peanut-free. Every Restriction is strict: any trace of a conflicting ingredient, including a "may contain" statement, means the food does not fit.
_Avoid_: Diet, preference, filter

**Restriction category**:
The group a Restriction belongs to: Religious, Lifestyle or Medical.

**Custom restriction**:
A Restriction the Diner types in themselves because it is not on the list, entered under Religious "Other" or Medical "Other".
_Avoid_: Other allergy, unlisted restriction

**Cuisine preference**:
A kind of food the Diner would like, such as Chinese. It only changes the order of results and never overrides a Restriction.
_Avoid_: Restriction, filter

**Restriction profile**:
The full set of Restrictions and Cuisine preferences a Diner has chosen.
_Avoid_: Settings, preferences

## Checking food

**Scan**:
Pointing the camera at a food, package or menu to find out what it is.
_Avoid_: 360 scan, photo check

**Search**:
Typing the name of a food, product or brand to find out what it is.
_Avoid_: Lookup, query

**Hint**:
A detail the Diner adds that the camera may not show, such as the brand or the restaurant name.
_Avoid_: Manual info, extra info

**Identification**:
Foodex's guess at exactly which food or product a Scan or Search is about, shown to the Diner before any research is trusted.
_Avoid_: Detection, match

**Confirmed item**:
An Identification the Diner has accepted as correct. Verdicts are only given for Confirmed items.
_Avoid_: Product, result

**Finding**:
One fact research turned up about a Confirmed item, such as an ingredient, a "may contain" statement or a halal certification, always tied to its Source.
_Avoid_: Data, info, attribute

**Verdict**:
The answer for one Restriction about one Confirmed item: Fits, Doesn't fit or Not enough info. When the Findings are weak or missing, the Verdict is Not enough info, never Fits.
_Avoid_: Safe, unsafe, result, score, rating

**Evidence**:
The Findings a Verdict rests on, such as the certifier that lists a product as halal or the ingredient that makes it not fit.
_Avoid_: References, proof

**Source**:
One web page, database entry or document that a Finding came from.
_Avoid_: Link, citation

**Source kind**:
How much a Source can be trusted, from most to least: Official certification, Manufacturer, Restaurant-confirmed, Community-reported, Read from an online menu.
_Avoid_: Confidence, reliability score

## Nearby

**Restaurant**:
A place near the Diner that serves food, found by location.
_Avoid_: Venue, place, store

**Dish**:
One item on a Restaurant's menu. Verdicts are given per Dish, never for a whole Restaurant.
_Avoid_: Menu item, meal

**Fitting dish**:
A Dish whose Verdicts are Fits for every Restriction in the Diner's Restriction profile.
_Avoid_: Safe item, match
