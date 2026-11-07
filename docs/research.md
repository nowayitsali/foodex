# Research: Dietary Food Accessibility Platform

_Text recognized from the team's "HMW Info" Google Doc (45 pages). Recognition errors are possible; the original doc is the source of truth._

Dietary Food Accessibility Platform
Problem Research, Market Analysis, Solution
Evaluation, and Hackathon MVP Recommendations

## PART 1: PROJECT OVERVIEW

### 1. Original Problem Statement
"How might we make food more easily accessible for those with dietary restrictions?"
The problem concerns the difficulties people experience when trying to find, purchase, and
consume food that accommodates their dietary requirements.
Dietary restrictions can arise from several circumstances, including:
• Food allergies, such as peanut, dairy, egg, and shellfish allergies.
• Food intolerances, such as lactose intolerance.
• Medical dietary requirements, such as gluten-free, low-sodium, or low-FODMAP
diets.
• Religious requirements, such as halal and kosher.
• Lifestyle choices, such as veganism and vegetarianism.
• Cultural food preferences and requirements.
The problem extends beyond whether a particular food is compatible with someone's dietary
restrictions. People may also experience difficulties finding affordable options, locating
suitable restaurants, identifying appropriate grocery products, accessing food at university
campuses, and obtaining suitable food through food banks.

### 2. Proposed Solution
The proposed solution is a digital food-discovery platform available through a web or mobile
application.
Users create a personalized dietary profile containing their restrictions, allergies,
intolerances, and food preferences. The application then uses that profile to identify food
products and restaurant options that accommodate their requirements.
The three main proposed features are:
1. Food scanning: Users scan a barcode or food label to determine whether a product
contains ingredients or allergens that conflict with their dietary restrictions.
2. Food search: Users search for particular food products, brands, ingredients, or types
of food to obtain dietary compatibility information without scanning a product.
3. Restaurant discovery: Users search for nearby restaurants based on their dietary
requirements and preferred cuisine. For example, someone who follows a halal diet
but wants Chinese food could discover halal Chinese restaurants or suitable
alternatives.
The underlying concept is to create one personalized dietary profile that can be used across
multiple food-discovery experiences.

## PART 2: MARKET RESEARCH AND
EVIDENCE OF DEMAND

### 3. Is There a Real Problem?
Yes. There is substantial evidence that people with dietary restrictions experience difficulties
accessing appropriate food.
The most important distinction is between the number of people with dietary restrictions and
the actual difficulties they experience when trying to find suitable food.
The problem can be divided into five areas:
1. Food discovery: Finding products, restaurants, and individual dishes that satisfy
dietary requirements.
2. Food affordability: Finding appropriate food at a reasonable price.
3. Food availability: Having appropriate products and meals available at grocery stores,
restaurants, campuses, and food banks.
4. Information reliability: Determining whether food actually accommodates someone's
requirements.
5. Convenience: Reducing the time and effort required to research ingredients, contact
restaurants, and visit multiple stores.
The research below identifies evidence of these problems in different environments.

### 4. Restaurants and Eating Out
Restaurants are one of the strongest areas of evidence for the proposed application.
A particularly relevant Canadian study was published in 2025 in the Journal of Food
Protection.
Researchers examined 1,000 non-chain restaurants in Toronto to determine how frequently
their online menus disclosed allergen information.
Findings:
• Only 16% of restaurants included an allergen statement on their online menus.
• Only 10% used allergen symbols.
• Only 4 restaurants provided an ingredient chart.
• Only 6 restaurants offered a separate allergen menu.
The study examined publicly available online information, not the actual
allergen-management practices of every restaurant.
Nevertheless, it demonstrates a significant information-access problem. Customers
frequently cannot determine whether a restaurant accommodates their dietary requirements
before visiting.
Source:
https://pubmed.ncbi.nlm.nih.gov/403680071
Food Allergy Canada's Consumer Experience Research
Food Allergy Canada's "Recipe for Success: Consumer Experience Report" surveyed 1,000
food-allergic consumers and 500 consumers without food allergies.
Among food-allergic respondents, the following barriers to eating out were reported:
• 53% identified cross-contamination risk as a barrier.
• 47% identified a lack of access to ingredient information.
• 46% identified meals that were not safe for their allergies.
The report also identified concerning experiences:
• 52% had experienced a near miss during their lifetime, meaning they ordered
something they believed was safe but subsequently discovered it contained an
allergen.
• 33% had experienced a severe allergic reaction while dining out or ordering in.
• Among those who reported a severe reaction, 78% said the establishment had been
informed of their allergy.
The report also found that:
• 80% of food-allergic consumers surveyed said allergen-management policies
influenced their restaurant choices.
• 86% said food allergies influenced their loyalty to particular restaurants.
These findings demonstrate that consumers are concerned not only with finding suitable
restaurants but also with trusting the information and food-handling practices of those
establishments.
Source:
https://foodallergycanada.ca/wp-content/uploads/Recipe-for-Success-Consumer-Experience
-Report-For-Foodservice-Resource.pdf
Implications for the Proposed Application
People with dietary restrictions frequently need to:
• Examine restaurant menus individually.
• Contact restaurants to inquire about ingredients.
• Ask employees about food preparation.
• Investigate potential cross-contamination.
• Rely on reviews and recommendations from other people with similar restrictions.
A centralized restaurant-discovery platform could reduce the effort involved in finding
suitable restaurants and dishes.
However, identifying a restaurant as suitable is not sufficient. The application needs to
distinguish between restaurant-level compatibility and individual menu-item compatibility.
For example, a restaurant may serve halal meat but also sell non-halal meat. It may have
some dairy-free meals while preparing them using shared equipment.
The application should provide dish-level information and communicate what has and has
not been verified.

### 5. Grocery Stores and Purchasing Food
Grocery shopping presents a different set of challenges.
People with dietary restrictions must examine:
• Ingredient lists.
• Allergen declarations.
• Alternative names for ingredients.
• Precautionary allergen statements.
• Product formulations.
• Product availability.
• Prices of specialized alternatives.
Celiac Canada's 2026 Gluten-Free Grocery Research
Celiac Canada published research titled "The Gluten-Free Grocery Hunt: Why One Store Is
Rarely Enough for Canadian Gluten-Free Consumers."
The research investigated Canadian gluten-free consumers' grocery-shopping experiences.
Reported findings:
• 84% experienced problems finding gluten-free products at their regular grocery store.
• 83% regularly visited multiple stores to purchase gluten-free products.
• 93% purchased gluten-free products at their main grocery store.
• 59% experienced difficulty finding gluten-free bread.
This demonstrates that even when grocery stores carry some suitable products, they may
not consistently carry everything consumers need.
For example, someone might find gluten-free pasta and snacks at their regular grocery store
but need to visit another store for bread and flour.
A food-discovery application could potentially help by identifying which nearby stores carry
particular compatible products.
An important technical distinction is that knowing a product exists does not necessarily mean
it is currently in stock at a particular store. Real-time inventory information would require
separate integrations.
Source:
https://www.celiac.ca/the-gluten-free-grocery-hunt/
Food Allergies and Canadian Food Labelling
Health Canada estimates that approximately 7% of Canadians self-report having a food
allergy. The proportion with physician-diagnosed food allergies is lower.
This represents more than 3 million Canadians based on the approximate self-reported
prevalence.
Canadian packaged-food regulations require priority allergens and gluten sources to be
declared. However, precautionary statements such as "may contain" are voluntary.
This creates several potential problems:
• Consumers may not recognize alternative names for allergen-derived ingredients.
• Products may have incomplete or outdated database records.
• Manufacturers may change product formulations.
• The absence of a precautionary statement does not establish that cross-contact is
impossible.
A product-scanning application could help consumers interpret ingredient information and
identity potential conflicts.
Source:
olerances.html
https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/food-allergies-int
Implications for the Proposed Application
The product scanner and food-search features could help users:
• Identify incompatible ingredients.
• Search for products without scanning a barcode.
• Discover alternatives.
• Compare compatible products.
• Identify potential allergens.
• Understand unfamiliar ingredient names.
The application could eventually incorporate store availability and product prices, although
these require additional data sources.

### 6. Food Prices and Affordability
Finding a suitable product does not necessarily mean someone can afford it.
This is an important problem because specialized foods can cost significantly more than
conventional alternatives.
Canadian Allergy-Friendly Product Pricing Study (2026)
A Canadian study published October 15, 2026, compared allergy-friendly products with
conventional alternatives at major grocery retailers.
The researchers reported:
• In 2023, allergy-friendly products cost an average of 84.1% more.
• In 2026, allergy-friendly products still cost an average of 71.2% more.
• The study included 296 products in the original comparison.
• Of those products, 276 were available for comparison again in 2026.
• Snacks and cereals experienced some of the largest price differences.
Source:
https://link.springer.com/article/10.1186/s13223-026-01069-3
Canadian Gluten-Free Product Pricing Study (2024)
Another Canadian study found that gluten-free staple foods cost an average of 114% more
than conventional alternatives across studies conducted between 2014 and 2024.
In the 2024 comparison:
• Gluten-free flour cost 597% more.
• Gluten-free bread cost 190% more.
• Gluten-free pasta cost 66% more.
• Gluten-free cereal cost 54% more.
The study also identified differences in iron content in several gluten-free staple-food
categories.
Source:
https://pubmed.ncbi.nlm.nih.gov/38536944/
Implications for the Proposed Application
An application that identifies compatible food products is useful.
However, an application that also helps users discover affordable compatible products could
provide even more value.
Potential future features include:
• Comparing prices between compatible products.
• Identifying cheaper alternatives.
• Comparing grocery stores.
• Finding sales on compatible products.
• Identifying affordable restaurant options.

## PART 3: UNIVERSITY CAMPUSES AND
STUDENT FOOD ACCESSIBILITY

### 7. Dietary Restrictions and Student Food Insecurity
University campuses are a particularly interesting environment for this project.
Students frequently have limited budgets, busy schedules, and limited control over the
available food options on campus.
For students with dietary restrictions, these problems can become more complicated.
University of Alberta Students' Union Study (2021)
A July 2021 briefing by the University of Alberta Students' Union examined food insecurity
among undergraduate students using its Fall 2019 student survey.
The analysis included 3,944 undergraduate students and used the standardized Health
Canada Household Food Security Survey Module.
The report found:
• 41% of students reporting at least one dietary restriction experienced moderate or
severe food insecurity.
• 30% of students without dietary restrictions experienced food insecurity.
• The report also identified particularly high food-insecurity figures among certain
dietary subgroups, including approximately 52% among vegan students and 44-46%
among gluten-free students.
The report estimated the following undergraduate populations with particular dietary
requirements:
• Vegetarian: 2,800 students.
• Halal: 1,400 students.
• Serious allergies: 1,200 students.
• Gluten-free for medical reasons: 780 students.
• Vegan: 880 students.
• Gluten-free by choice: 460 students.
• Kosher: 160 students.
The figures demonstrate that dietary restrictions and student food insecurity can overlap.
Students may have difficulty finding affordable food that accommodates their requirements.
Source:
https://www2.su.ualberta.ca/media/uploads/1143/Food%20Insecurity %20and%20Dietary %2
ORequirements.pdf
University of Alberta Students' Union Annual Survey (2024)
The University's 2024 Annual Survey included 2,930 respondents.
It asked students about dietary requirements and whether they had visited a food bank
during the previous year.
Reported results:
• Halal: 7.2% of respondents reported this requirement; 12% of that group reported
visiting a food bank.
• Vegetarian: 7.0% reported this requirement; 6% visited a food bank.
• Serious allergies: 4.9%; 7% visited a food bank.
• Gluten-free for medical reasons: 2.6%; 9% visited a food bank.
• Vegan: 1.3%; 6% visited a food bank.
• Gluten-free by choice: 1.2%; 3% visited a food bank.
Kosher: 0.8%; 38% visited a food bank.
• Other dietary requirements: 23.4%; 7% visited a food bank.
Approximately 6% of the comparison group outside the halal and kosher categories reported
visiting a food bank.
The kosher percentage should be interpreted cautiously because the subgroup was very
small. The findings demonstrate an association and do not establish that dietary
requirements caused food-bank use.
Source:
https:/www2.su.ualberta.ca/media/uploads/1143/2024AnnualSurvey.pdf

### 8. Western University: On-Campus Food Availability
and Acceptability (2026)
A study titled "Student Perceptions of On-Campus Foodscapes at a Canadian University"
was published on May 25, 2026, in Canadian Geographies.
The study examined student experiences with Western University's campus food
environment.
The research included:
• 250 student survey participants.
• 9 student interviews.
• An examination of availability, affordability, accessibility, and acceptability.
Researchers identified several recurring problems.
Availability:
• Food outlet hours did not always align with students' schedules.
• Access to kitchenettes, microwaves, and food preparation facilities was uneven.
Accessibility:
• Students sometimes had difficulty reaching food outlets during short breaks.
• Distances, queues, and limited time between classes affected access.
Affordability:
• Students frequently considered campus food expensive compared with groceries or
preparing their own meals.
Acceptability:
• Students reported limited cultural food choices.
• Some students struggled to find options compatible with their dietary restrictions.
• Students identified difficulties related to religious and medical requirements.
One participant discussed having a roommate with a dairy allergy and explained that when
they went out together on campus, they sometimes had to return home because there was
nothing suitable for the roommate to eat.
This research demonstrates that students can have access to numerous food outlets while
still struggling to find food that is acceptable, affordable, and compatible with their dietary
requirements.
Source:
https://doi.org/10.1111/cag.70079
Implications for the Proposed Application
A university-focused version of the platform could allow students to:
• Search all participating campus dining locations.
• Filter by dietary restrictions.
• Find compatible menu items.
• Search by cuisine.
• Check dietary information before visiting a restaurant.
• Identify nearby alternatives.
• Compare prices.
This could be particularly useful for universities with multiple dining halls, restaurants, cafes,
and food outlets.

## PART 4: FOOD BANKS AND
COMMUNITY FOOD ASSISTANCE

### 9. Dietary Restrictions and Traditional Food Bank
Distribution
Food banks are another important environment to consider.
People visiting food banks frequently have limited control over the types of food they receive.
Traditional food hamper systems often distribute predetermined packages based on
donations and available inventory.
This can create difficulties for people with medical, religious, cultural, and lifestyle dietary
requirements.
A Canadian study published in BMC Public Health in 2021, titled "The Impact of Novel and
Traditional Food Bank Approaches on Food Insecurity: A Longitudinal Study in Ottawa,
Canada," examined 11 food banks over 18 months.
The research discussed how traditional food hampers may not accommodate requirements
such as:
Lactose intolerance.
• Diabetes-related dietary requirements.
• Gluten allergies.
• Halal requirements.
• Kosher requirements.
• Avoidance of animal-derived ingredients, including gelatin and particular broths.
People may receive food that they cannot or do not wish to consume.
This can create unnecessary food waste and undermine the dignity of the food assistance
experience.
Source:
https:/link.springer.com/article/10.1186/s12889-021-10841-6

### 10. The Benefits of Choice-Based Food Bank Models
The Ottawa study compared traditional hamper distribution with choice-based food bank
models.
Instead of receiving a predetermined package, clients could walk through a food display and
select the products they wanted.
The research found:
• Food insecurity scores were 0.53 points lower on a 10-point scale among users of
choice-model food banks compared with hamper-model food banks.
• Choice-model food banks had lower proportions of moderately and severely
food-insecure participants.
• Previous research referenced by the study also identified benefits such as increased
fruit and vegetable consumption.
• Choice-based models could better accommodate medical, cultural, and religious
requirements.
However, one disadvantage was longer line-ups.
The important takeaway is that making food accessible isn't necessarily just about
increasing the quantity of food available. Giving people more control over the food they
receive can also make a significant difference.

### 11. Calgary Food Bank: Client-Choice Model (2025)
The Calgary Food Bank introduced a client-choice model in October 2024 and made it a
standard offering for emergency food hampers at its main location by April 2025.
Clients received a tablet showing available food categories and a points-based allocation
system.
This allowed them to select the foods that went into their hampers.
The Calgary Food Bank published the following client feedback:
• 76% reported that the new model better accommodated their dietary restrictions.
• 73% reported that it better accommodated their cultural requirements.
• 95% liked the available food choices.
• 82% said they were able to save more on groceries.
The public announcement did not specify the survey sample size, so these numbers should
be treated as organizationally reported client feedback rather than a nationally
representative study.
Source:
https://www.ca|garyfoodbank.com/2025/choice-model/

### 12. Cultural Food Accessibility and Newcomers in
Toronto
A 2013 study examined perceived barriers to accessing food among recent Latin American
immigrants in Toronto.
Researchers identified several issues:
• Limited availability of culturally familiar food.
• Insufficient culturally appropriate food at grocery stores and food banks.
• Higher prices for certain culturally familiar products.
• Limited access to ethnic grocery stores.
• Food bank opening hours and geographical barriers.
• Stigma and embarrassment associated with seeking food assistance.
• Identification and eligibility requirements.
The study also discussed how individuals with medical dietary needs could struggle to afford
the foods necessary to manage their conditions.
This demonstrates that food accessibility isn't limited to medical or religious requirements.
People may also struggle to find foods that are culturally familiar and meaningful to them.
Source:
https://pmc.ncbi.nlm.nih.gov/articles/PMC3547743/

### 13. Food Bank Accommodation for Dietary
Restrictions: US University Study (2024)
An American study published in November 2024 investigated how university food pantries
accommodate students with food allergies and other dietary requirements.
Researchers approached 120 universities, and 35 campus food pantries completed the
survey.
Findings:
• 48% asked students about dietary restrictions.
• 37% tracked the number of patrons with dietary restrictions.
• 30% processed requests for allergen-friendly products.
• 17% provided staff training on dietary restrictions.
• Only 4% modified their food distribution processes to accommodate dietary
restrictions.
Dairy-free and gluten-free products were among the most frequently requested
accommodations.
Gluten-free products were also among the most difficult items to accommodate.
Additionally, 48% of respondents wanted an external source of allergen-friendly and
gluten-free food products.
This is American evidence and should not be represented as a national Canadian statistic.
However, it provides insight into the operational problems campus food banks can
experience.
Source:
https://pubmed.ncbi.nlm.nih.gov/39019435/
Implications for the Proposed Application
A future version of your application could potentially serve food banks and community food
assistance organizations.
Possible features include:
• Showing food bank inventories.
• Filtering available products by dietary restrictions.
• Identifying compatible food donations.
• Helping organizations understand the dietary needs of their clients.
• Allowing clients to search for food that accommodates their requirements.
This could expand the product beyond a conventional consumer application.

## PART 5: HOW MANY PEOPLE HAVE
DIETARY RESTRICTIONS?

### 14. Canadian Dietary Practices Survey
Agriculture and Agri-Food Canada commissioned a national consumer survey in December
2023, published in February 2024.
The survey included 2,011 respondents.
Approximately 29% reported following some form of special diet.
Reported dietary practices included:
• Reduced-meat diets: 9%.
• Plant-based diets: 7%.
• Gluten-free diets: 6%.
• Dairy-free diets: 6%.
• Halal diets: 4%.
• Meat-based diets: 5%.
These categories can overlap and should not be added together.
The survey also asked respondents why they followed special diets.
Among those following special diets:
• Food intolerance or allergy: 20%.
• Belief that the diet is healthier: 18%.
• Healthcare professional recommendation: 13%.
• Weight loss: 12%.
• Religious or cultural practices: 10%.
• Animal welfare: 10%.
• Reducing food costs: 8%.
One interesting generational finding was that 11% of Gen Z respondents reported following
halal dietary requirements, compared with 4% of the overall sample.
This survey is particularly valuable because it captures medical, lifestyle, and religious
dietary practices in a single study.
Source:
https://epe.bac-lac.gc.ca/100/200/301/pwgsc-tpsgc/por-ef/agriculture_agri-food/2024/054-23
-e/POR054-23-report.html?nodisclaimer=1

### 15. Food Allergy Prevalence
Health Canada estimates that approximately 7% of Canadians self-report having a food
allergy.
The estimated number of Canadians affected is greater than 3 million.
The proportion with physician-diagnosed food allergies is lower than the self-reported
estimate.
Source:
olerances.html
https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/food-allergies-int

### 16. Food Insecurity in Canada
Statistics Canada's 2024 data indicates that approximately 9.8 million Canadians, or 24% of
the population, lived in households experiencing some form of food insecurity.
Food insecurity measures financial difficulty accessing sufficient food. It does not specifically
measure difficulties caused by dietary restrictions.
Food Banks Canada's 2026 HungerCount reported 2,355,075 food bank visits in March
2026, an 8.7% increase compared with March 2025.
These are visits, not unique individuals.
Sources:
Statistics Canada: https://www150.statcan.gc.ca/
Food Banks Canada: https://foodbankscanada.ca/hungercount/

## PART 6: COMPETITIVE LANDSCAPE

### 17. Do Similar Applications Already Exist?
Yes. Several applications already solve individual aspects of your proposed solution.
The most important competitor is Fig, which already offers an integrated experience
involving dietary profiles, food scanning, product searching, and restaurant discovery.
Your team should not claim that these features are entirely new.
However, there are opportunities to differentiate the product through multi-restriction
matching, Canadian coverage, restaurant information transparency, and a unified discovery
experience.

### 18. Main Competitors
1. Fig
Website: https://foodisgood.com/
Fig is probably the closest overall competitor.
Its features include:
• Personalized dietary profiles.
• Support for numerous allergies, intolerances, and lifestyle diets.
• Barcode scanning.
• Product searching.
• Ingredient compatibility explanations.
• Restaurant discovery and restaurant-vetting features.
Fig supports thousands of dietary profiles, including combinations of different restrictions.
Its restaurant approach is particularly relevant because its team researches restaurant
websites and contacts restaurant staff to collect information.
Its official website has historically described its service as US-focused, so Canadian
availability should be checked directly.
Competitive implications:
Fig already demonstrates demand for an integrated food-discovery platform.
Simply combining scanning, searching, and restaurant discovery will not provide sufficient
differentiation.
Potential opportunities include stronger Canadian coverage, more granular multi-restriction
support, and transparent information verification.

### 2. Spoonful
Website: https://spoonfulapp.com/
Spoonful is a dietary food-scanning and discovery application.
Features include:
• Barcode scanning.
• Photo-based food scanning.
• Personalized dietary profiles.
• Ingredient compatibility checking.
• Support for 26 diets.
• Grocery product searching.
Supported diets include low-FODMAP, gluten-free, dairy-free, and vegan.
Spoonful reports more than 700,000 products in its database and approximately 75%
coverage of products scanned in Canada, the UK, Australia, and New Zealand.
These are company-reported figures.
Competitive implications:
Spoonful demonstrates that grocery product scanning and ingredient checking are
established parts of the market.
Your team should explore whether better multi-restriction searching and restaurant discovery
offer a meaningful advantage.

### 3. Spokin
Website:
https://www.spokin.com/
Spokin focuses on food allergy management and discovery.
Features include:
• Personalized food allergy information.
• Restaurant discovery.
• Food recommendations.
• Travel recommendations.
• Community reviews.
• Allergy-specific warnings.
Competitive implications:
Spokin demonstrates the value of personalized recommendations and
community-contributed experiences.
Its community aspect is particularly relevant because dietary compatibility information can be
difficult to obtain directly from restaurants.

### 4. Find Me Gluten Free
Website:
https://www.findmeglutenfree.com/
This application focuses on gluten-free restaurant discovery.
Features include:
• Gluten-free restaurant searching.
• Location-based discovery.
• Community reviews.
• Restaurant recommendations.
• Dedicated gluten-free filters.
Competitive implications:
This application shows that people have a demand for restaurant-discovery tools specifically
designed around dietary requirements.

### 5. Zabihah
Website:
https://www.zabihah.com/
Zabihah is a halal restaurant and food-discovery platform.
Features include:
• Halal restaurant searching.
• Cuisine and dish searches.
• Community reviews.
• Halal confidence ratings.
• Restaurant information.
Zabihah is particularly interesting because its newer features allow users to search for
individual dishes, such as biryani, shawarma, and nihari.
It also considers different forms of evidence and confidence relating to halal status.
Competitive implications:
Zabihah demonstrates the importance of treating halal compatibility as something that can
involve certification, restaurant information, community knowledge, and different standards.

### 6. HalalBiz
Website:
https://www.halalbiz.ca/
HalalBiz is a Canadian halal business directory.
It reports:
• 458 listings.
• Coverage across 41 Canadian cities.
Its directory includes halal food businesses and related information.
Competitive implications:
HalalBiz is particularly relevant to the Canadian market and GTA.
It illustrates that a locally focused dietary business directory can provide value independently
of a national food-discovery platform.

### 19. Competitive Comparison
Personalized dietary profiles:
• Fig
• Spoonful
• Spokin
Barcode scanning:
• Fig
• Spoonful
Product search:
• Fig
• Spoonful
Food allergy-oriented restaurant discovery:
• Fig
• Spokin
Gluten-free restaurant discovery:
• Find Me Gluten Free
Halal restaurant discovery:
• Zabihah
• HalalBiz
Cuisine- and dish-based discovery:
• Zabihah
• Find Me Gluten Free
Potential Differentiation Opportunities
1. Multi-restriction matching.
A user could simultaneously select halal, dairy-free, and peanut allergy requirements.
The application would evaluate results against all applicable restrictions instead of requiring
the user to search multiple databases.
2. Canada-first coverage.
Canadian grocery products, Canadian food labelling, local restaurants, and Canadian dietary
standards could receive greater attention.
3. Unified discovery.
A single dietary profile would apply to packaged products, individual foods, and restaurant
dishes.
4. Transparent dietary information.
The application would show the source of its information, why an item matches, what
information is missing, and whether it has been verified.
5. Restaurant and dish-level information.
Instead of labelling an entire establishment as compatible, the application would evaluate
individual menu items.

## PART 7: EVALUATION OF THE
PROPOSED SOLUTION

### 20. Core Application Architecture
The strongest approach is to create one shared dietary compatibility system that powers all
three main features.
The application would operate as follows:
Step 1: User creates a personalized dietary profile.
Step 2: User chooses one of three experiences:
• Scan a product.
• Search for food.
• Discover restaurants.
Step 3: The application retrieves product or restaurant information.
Step 4: The shared dietary compatibility engine evaluates the results against the user's
profile.
Step 5: The application displays compatibility results and explanations.
The important architectural decision is that the three features should not have three
independent dietary-matching systems.
They should all use the same underlying matching logic.

### 21. Feature One: Food Scanning
Assessment: Strong feature.
Users scan a food barcode or label to determine whether a product accommodates their
dietary requirements.
An example:
A user follows a dairy-free diet and has a peanut allergy.
They scan a chocolate snack.
The application retrieves its ingredient information and identifies milk as an incompatible
ingredient.
It displays:
• Product name.
• Ingredients.
• Detected allergens.
• Ingredients conflicting with the user's profile.
• Precautionary allergen statements.
• Additional information that is missing or unverified.
Technical requirements:
Barcode scanner.
• Product database.
• Ingredient information.
• Allergen information.
• Dietary matching engine.
• Product result interface.
An important distinction is that scanning a barcode does not automatically read the
ingredients. It usually identifies the product, which is then retrieved from a database.
A useful source is Open Food Facts.
Website:
https://world.openfoodfacts.org/
API documentation:
https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/
Open Food Facts offers a public product database containing information such as product
names, ingredients, and allergen information.
However, its data is community-contributed and is not guaranteed to be complete or
accurate.
Assessment:
Barcode scanning is a useful feature, but it is not particularly innovative by itself. The
interesting part is the personalized ingredient-matching explanation.

### 22. Feature Two: Food Search
Assessment: Strong feature.
Users can search for specific products, brands, food items, or ingredients instead of
scanning a barcode.
Examples:
• Search for a particular brand of bread.
• Search for a snack.
• Search for an ingredient.
• Search for dairy-free desserts.
• Search for halal instant noodles.
• Search for gluten-free pizza.
• Search for peanut-free protein bars.
The application compares search results against the user's dietary profile.
This feature should also allow users to discover alternative products.
For example, instead of only telling a user whether a particular product is compatible, the
application could recommend alternative products that satisfy the same requirements.
Assessment:
Product search and scanning should be combined into one product-discovery section
because both use the same database and compatibility logic.

### 23. Feature Three: Restaurant Discovery
Assessment: Strongest differentiation opportunity.
Users search for restaurants based on:
• Dietary restrictions.
• Cuisine.
• Individual dishes.
• Location.
• Price.
• Other food preferences.
Example:
A user selects:
• Halal.
• Dairy-free.
• Chinese cuisine.
• Preferred neighbourhood.
The application searches for restaurants and individual menu items that accommodate those
requirements.
The system should distinguish between dietary restrictions and preferences.
For example:
• Non-negotiable requirement: Halal.
• Additional requirement: Dairy-free.
• Preferred cuisine: Chinese.
• Alternative cuisine: Thai.
Dietary restrictions should take priority over cuisine preferences.
If no Chinese restaurants can be identified as matching the requirements, the application
can suggest alternatives that meet the dietary criteria.
It should not silently recommend a restaurant that violates a user's non-negotiable
requirements.
Restaurant-Level Versus Dish-Level Matching
This distinction is essential.
A restaurant might serve both halal and non-halal meat.
A restaurant might offer dairy-free menu items but prepare them using shared cooking
equipment.
A restaurant might offer vegetarian meals without being a vegetarian establishment.
Therefore, dietary compatibility needs to be assessed at the individual menu-item level
whenever possible.
The application should communicate:
• Which menu items are compatible according to available information.
• Which ingredients support that determination.
• Whether the establishment has confirmed the information.
• Whether certification exists where relevant.
• Whether preparation practices have been verified.
• What information remains unknown.

## PART 8: RISKS AND TECHNICAL
CHALLENGES

### 24. Incorrect Dietary Compatibility Information
This is the highest-priority risk.
For people with severe allergies, incorrect dietary information could have serious
consequences.
For example:
Someone has a severe peanut allergy.
They scan a product.
The application's database contains no record of peanuts and displays a positive
compatibility result.
However, the physical packaging says "May contain peanuts."
This could create a dangerous situation.
Canadian regulations require priority allergens and gluten sources to be declared on
applicable prepackaged foods, but precautionary cross-contamination statements are
voluntary.
The absence of a precautionary statement does not establish that cross-contact is
impossible.
Potential solution:
Use three main compatibility statuses:
INCOMPATIBLE:
A known ingredient or dietary rule conflicts with the user's profile.
MATCHES LISTED CRITERIA:
The available information matches the user's specified dietary requirements.
INSUFFICIENT INFORMATION:
There is insufficient evidence to establish compatibility.
For serious allergies, the absence of relevant information should never result in an
unconditional positive safety claim.
Additional safeguards:
• Display ingredient sources.
• Display last-updated dates where available.
• Identify precautionary statements.
• Explain why a product received a particular status.
• Tell users when information requires confirmation.
• Encourage verification against the current physical product label.
Avoid arbitrary compatibility percentages. A product with an 87% compatibility score is not
necessarily safe when one unknown allergen detail could matter enormously.

### 25. Restaurant Information Is Difficult to Obtain
This is likely the biggest long-term operational challenge.
Google Maps can identify restaurants and provide location information, but its Places API
does not provide standardized attributes for every relevant dietary requirement.
For example, it supports a vegetarian-food attribute, but equivalent standardized attributes
for halal, kosher, dairy-free, gluten-free, and allergen-free food are not universally available.
Google Business Profile also supports food-menu information with optional dietary and
allergen attributes, but businesses must contribute the information.
Potential solutions:
1. Allow restaurants to submit their menus, ingredients, and dietary information.
2. Allow restaurants to confirm and maintain their own dietary profiles.
3. Allow customers to submit information and report changes.
4. Clearly distinguish official, restaurant-reported, community-reported, and inferred
information.
5. Maintain compatibility information at the individual dish level.
A useful model would be to assign different verification sources:
• Official certification.
• Restaurant-confirmed information.
• Manufacturer-provided information.
• Community-reported information.
• Information inferred from an online menu.
• Unknown information.
These sources should not all carry the same confidence.

### 26. Dietary Requirements Are Not Interchangeable
Different restrictions require different matching rules.
Examples:
Allergies:
Peanuts, dairy, shellfish, eggs, and other allergens can cause potentially severe reactions.
Cross-contact must be considered.
Intolerances:
tolerance.
Lactose intolerance and FODMAP-related restrictions can involve different levels of
Religious requirements:
Halal and kosher restrictions can involve certification, ingredients, meat sourcing,
preparation, and other standards.
Lifestyle diets:
Vegan and vegetarian diets involve ingredient and preparation preferences.
Medical dietary requirements:
Gluten-free, low-sodium, and other medical diets can have requirements beyond simple
ingredient exclusion.
A user profile should eventually support additional details and distinctions.
For example, a halal profile might allow a user to specify whether they require official
certification, halal meat only, or an entirely halal establishment.
Likewise, a gluten-free profile should distinguish between someone who avoids gluten by
preference and someone who needs medically appropriate celiac-safe food.

### 27. User Trust
If the application recommends something as suitable and the user later discovers it is
incompatible, the application could lose credibility.
Therefore, information transparency should be a central design principle.
The platform should distinguish:
• Restaurant-reported information.
• Official certification.
• Community-reported information.
• Information extracted from online menus.
• Missing or unverified information.
Paying restaurants should not receive higher dietary compatibility or safety ratings.
Paid promotion should be clearly separated from the actual matching process.

### 28. Data Coverage
Even a very good matching algorithm cannot provide useful results without sufficient food
and restaurant information.
Potential problems:
• Products are missing from the database.
• Product ingredients are outdated.
• Restaurants have incomplete online menus.
• Restaurant locations have changed.
• Dietary information has not been verified.
• Smaller cities have fewer listings.
• Local stores do not share inventory information.
The application should handle missing information gracefully.
An empty search result should not imply that no compatible food exists.

### 29. Privacy
Users may disclose food allergies, medical dietary requirements, and religious dietary
preferences.
Depending on the circumstances, these can constitute sensitive personal information.
The platform should:
• Collect only necessary information.
• Explain why information is collected
• Obtain meaningful consent.
• Protect stored dietary profiles.
• Avoid unnecessary user registration.
• Provide appropriate control over profile information.
For the hackathon prototype, a locally stored demonstration profile is sufficient.
For a production application, privacy should be considered from the beginning.

## PART 9: BUSINESS AND PRODUCT
VIABILITY

### 30. Overall Market Assessment
The market opportunity appears promising, but there is already considerable competition.
Assessment by dimension:
User need: High.
There is documented evidence of difficulties finding suitable food in restaurants, grocery
stores, food banks, and university environments.
Consumer appeal: High.
The application could reduce research time and make more food options discoverable.
Competition: High.
Fig, Spoonful, Spokin, Find Me Gluten Free, Zabihah, and HalalBiz already solve parts of the
problem.
Technical feasibility: High for a limited MVP.
A rule-based matching engine, product search, and restaurant search can be implemented
relatively quickly.
Restaurant data acquisition: Low to moderate.
This is the most difficult long-term operational challenge because accurate information
requires restaurant participation and ongoing verification.
Differentiation: Moderate to high.
There is an opportunity to combine multi-restriction matching, Canadian coverage, and
transparent dish-level dietary information.
Monetization potential: Moderate.
Potential opportunities exist through consumer subscriptions and restaurant-facing services.
Long-term defensibility: Moderate.
A large, reliable, current, locally relevant database of food and dietary information could
become valuable.

### 31. Potential Business Models
Consumer Freemium Model
Basic features could be free:
• Dietary profile creation.
• Limited product scanning.
• Product search.
• Basic restaurant discovery.
• Dietary compatibility results.
Premium functionality could include:
• Unlimited scans.
• Multiple family profiles.
• Advanced filtering.
• Saved products and restaurants.
• Price comparisons.
• More detailed product recommendations.
• Advanced dietary profile customization.
Restaurant-Facing Services
Restaurants could use a separate dashboard to maintain their dietary information.
Potential services:
• Menu uploads.
• Ingredient and allergen information.
• Dietary compatibility tagging.
• Individual dish verification.
• Menu updates.
• Customer-facing dietary profiles.
• Analytics on searches and dietary preferences.
This could create value for restaurants by helping them reach customers with specific dietary
requirements.
There is also evidence that allergen-aware accommodation can influence restaurant choice
and customer loyalty.
However, restaurant payments must never influence compatibility or safety assessments.

## PART 10: RECOMMENDED PROBLEM
STATEMENT

### 32. Refining the Original HMW
Original:
"How might we make food more easily accessible for those with dietary restrictions?"
The original is a good starting point, but it is broad.
The term "accessible" could mean:
• Increasing food affordability.
• Increasing food availability.
• Improving access to grocery stores.
• Making food easier to discover.
• Helping people identify food that accommodates dietary requirements.
Your application primarily addresses discovery and information reliability.
Recommended version:
ẠHow might we help people with multiple dietary restrictions easily discover food products
and restaurant dishes that accommodate their needs and food preferences?"
Alternative:
"How might we reduce the time and uncertainty people with dietary restrictions experience
when deciding what to buy or where to eat?"
Another alternative:
ẠHow might we make it easier for people with complex dietary requirements to find diverse
food options without having to manually research ingredients and restaurant menus?"
The first version is recommended because it gives your team enough flexibility to develop all
three proposed features while emphasizing personalized food discovery.

## PART 11: SIX-HOUR HACKATHON MVP

### 33. Recommended Prototype Scope
The objective should be to create a convincing, interactive proof of concept in six hours.
It is unrealistic to create a comprehensive food database, reliable restaurant-verification
system, full authentication infrastructure, and advanced recommendation engine within that
However, a functional, mobile-responsive web application with a common dietary profile and
three simplified discovery experiences is achievable.
The prototype should demonstrate the central concept rather than attempt to deliver a
production-ready system.
Features to Include
User dietary profile:
• Functional profile creation.
• Selectable allergies.
• Selectable intolerances.
• Selectable religious and lifestyle dietary requirements.
• Preferred cuisines.
Food scanning:
• Simplified barcode entry.
• A working barcode scanner if time permits.
• Product lookup.
• Ingredient and allergen matching.
Food search:
• Search a small predefined product dataset.
• Search product names and brands.
• Display ingredients and compatibility information.
Restaurant discovery:
• Search a small predefined restaurant dataset.
• Filter by cuisine and location.
• Display restaurant information.
• Evaluate individual menu items.
Compatibility engine:
• Shared rule-based matching system.
• Three compatibility outcomes.
• Ingredient conflict explanations.
• Missing-information warnings.
Features to Exclude
The following features should not be prioritized in the six-hour build:
• User authentication.
• Complex account management.
• Restaurant account dashboards.
• Real-time restaurant verification.
• Comprehensive Google Maps integration.
• OCR-based ingredient extraction.
• Full Al recommendation systems.
• Comprehensive nutritional analytics.
• Large-scale product databases.
• Full real-time inventory integration.
These can be considered for future development.

### 34. Recommended User Journey
Prepare one coherent demonstration rather than showing three disconnected features.
Example user:
Alex follows a halal and dairy-free diet and wants Chinese food.
Step 1: Alex creates a dietary profile.
Step 2: Alex selects halal and dairy-free.
Step 3: Alex opens restaurant discovery.
Step 4: Alex searches for Chinese restaurants in a preferred neighbourhood.
Step 5: The application displays nearby restaurants and relevant menu items.
Step 6: Alex opens an individual dish.
Step 7: The application explains which requirements are satisfied according to available
information and highlights any unknown information.
Step 8: Alex switches to grocery discovery.
Step 9: Alex searches for a product or enters a barcode.
Step 10: The same dietary profile is applied to the product.
This demonstrates the project's central value proposition:
One dietary profile, multiple food-discovery experiences.
Aim for approximately one to two minutes for the demonstration.

### 35. Recommended Architecture
Frontend:
React + TypeScript + Vite.
Styling:
Regular CSS or Tailwind CSS.
Backend:
Optional Node.js/Express API.
Database:
Local JSON initially, or Supabase if persistence is necessary.
Product data:
Open Food Facts API v3.
Restaurant data:
Small curated demonstration dataset.
Barcode scanning:
A browser-compatible barcode library, with manual entry as a fallback.
Location:
Predefined neighbourhoods and sample distances.
Open Food Facts Considerations
Open Food Facts provides a public product API.
Its newer API v3 is recommended for new integrations.
Important technical considerations:
• Product information is community-contributed.
• Accuracy and completeness are not guaranteed.
• API usage has request limits.
• The published limits include 15 product reads per minute and 10 search requests per
minute per IP.
• Use a custom application User-Agent.
• Provide appropriate attribution.
• Review its Open Database License (ODbL) and share-alike requirements before
distributing a real application.
Documentation:
https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/
Google Places Considerations
Google Places can eventually help identify restaurants and provide location information.
However, it does not independently solve the dietary-verification problem.
Its API also requires billing to be enabled, with pricing depending on the fields and API
products used.
For the hackathon, a small predefined restaurant database is preferable to spending
significant development time integrating a live location service.

### 36. Recommended Demonstration Dataset
Use a dataset large enough to demonstrate different matching scenarios.
Suggested sizes:
Packaged products: 10-15.
Store:
• Product name.
• Barcode.
• Brand.
• Ingredients.
• Allergens.
• Precautionary statements.
• Dietary tags.
Restaurants: 8-12.
Store:
• Restaurant name.
• Cuisine.
• Location.
• Dietary information.
• Verification status.
Restaurant menu items: 2-4 per restaurant.
Store:
• Dish name.
• Ingredients.
• Allergens.
• Dietary tags.
• Preparation information where available.
• Verification status.
User profiles: 3-4.
Include different combinations of restrictions.
Do not populate every restaurant with perfect data.
Include restaurants with:
• Missing allergen information.
• Partial halal menus.
• Unverified community claims.
• Incomplete ingredient lists.
This allows you to demonstrate that the application understands uncertainty.
All invented information must be labelled as demonstration data rather than presented as
real, verified restaurant information.

### 37. Shared Dietary Matching Engine
The matching engine is the most important technical component.
It should evaluate products and restaurant dishes against the user's dietary profile.
Example profile:
{
allergies: ["peanuts"],
intolerances: [' dairy],
dietaryRules: ["halali],
preferredCuisines: ["Chinese"]
Example product:
name: "Chocolate Snack",
ingredients: ["milk", "cocoa", "sugar"],
allergens: ["milk"],
mayContain: ['peanuts"],
dietary Tags: I
The engine should:
1. Identify the user's hard restrictions.
2. Identify known ingredient conflicts.
3. Identify missing or unverified information.
4. Determine the compatibility status.
5. Explain the result.
6. Rank otherwise suitable options using preferences.
Hard dietary requirements should take priority over preferences.
Avoid using percentages to represent compatibility.
For example, a result with 87% compatibility is not meaningful if one missing allergen detail
could be dangerous.

### 38. Six-Hour Development Schedule
Phase 1: Scope and Setup - 30 minutes.
• Agree on the demonstration scenario.
• Choose supported dietary restrictions.
• Choose supported cuisines.
• Define product and restaurant data structures.
• Set up the project.
• Establish the matching engine interface.
Phase 2: User Profile - 45 minutes.
• Build the dietary onboarding screen.
• Add selectable restrictions.
• Add preferred cuisines.
• Implement profile state.
• Store the profile locally.
Phase 3: Matching Engine - 60 minutes.
• Implement ingredient matching.
• Implement dietary rule matching.
• Implement the three compatibility statuses.
• Add explanations.
• Test against predefined product and restaurant examples.
Phase 4: Product Discovery - 75 minutes.
• Build product search.
• Add simplified barcode lookup
• Connect product results to the matching engine.
• Display compatibility explanations.
Phase 5: Restaurant Discovery - 75 minutes.
• Build cuisine searching.
• Add location filtering.
• Create restaurant cards.
• Create menu-item results.
• Connect restaurant dishes to the matching engine.
Phase 6: Polish and Demo Testing - 75 minutes.
Connect all screens.
• Test the complete user journey.
• Fix major problems.
• Improve the interface.
• Prepare sample data.
• Rehearse the presentation.
Total: 360 minutes (6 hours).

### 39. Suggested Team Division
For a team of four:
Developer 1:
• Frontend layout.
• User profile.
• Navigation.
• Shared interface components.
Developer 2:
• Product search.
• Barcode functionality.
• Product dataset.
• Product results.
Developer 3:
• Restaurant discovery.
• Cuisine filters.
• Restaurant dataset.
• Menu-item results.
Developer 4:
• Shared dietary matching engine.
• Integration.
• Testing.
• Demo preparation.
The matching engine should have a clearly defined interface before implementation begins.
Otherwise, developers may implement different assumptions about dietary compatibility.
For smaller teams, combine responsibilities and prioritize profile creation, restaurant
discovery, and the shared matching system.

## PART 12: CUSTOMER AND MARKET
VALIDATION

### 40. Consumer Interviews
The existing research demonstrates a real problem, but it doesn't establish that consumers
will prefer your application over existing alternatives.
The team should interview approximately 10-15 people across different dietary groups.
The objective should be to understand their existing experiences rather than simply asking
whether they like the idea.
Recommended interview questions:
1. When was the last time you struggled to find something you could eat?
2. What did you do to determine whether that food was compatible with your dietary
requirements?
3. Do you currently use any applications or websites to find suitable food?
4. What is the most frustrating part of finding restaurants that accommodate your
restrictions?
5. How do you determine whether information about a product or restaurant is
trustworthy?
6. How much time do you typically spend researching a food product or restaurant?
7. Have you experienced situations where a restaurant or product appeared suitable but
was not?
8. Would a centralized dietary profile that automatically filters grocery products and
restaurants solve a problem your current tools do not?
Pay particular attention to the applications people already use.
This helps determine whether the proposed product is replacing existing tools or providing
capabilities they cannot currently obtain.

### 41. Restaurant Interviews
Speak with approximately 3-5 independent restaurants.
Investigate whether they would be willing to:
• Provide ingredients and allergen information for individual menu items.
• Identify menu items that accommodate specific dietary requirements.
• Maintain a digital dietary profile.
• Explain food preparation practices.
• Update information when menus or suppliers change.
• Participate in a platform that helps dietary-conscious customers discover their
restaurant.
This is important because the restaurant information problem cannot be solved entirely
through software development.
Your platform depends on businesses being willing and able to provide accurate information.

### 42. Suggested Validation Metrics
Time to find a compatible food option:
Measures whether the application saves users time.
Search success rate:
Measures whether users can actually find appropriate food.
Missing-information rate:
Measures whether the available product and restaurant data is sufficient.
User trust:
Measures whether users consider the information reliable.
Repeat usage interest:
Measures whether the platform offers ongoing value.
Restaurant participation interest:
Measures whether the restaurant-facing model is realistic.
Data accuracy:
Measures how frequently information is correct and current.
For a real product, the percentage of listings with accurate, current, and source-backed
information may be more important than the total number of listings.

## PART 13: FINAL RECOMMENDATIONS

### 43. Recommended Project Direction
Develop a Canada-first personalized food-discovery platform for people with multiple dietary
requirements.
The platform should allow users to create personalized dietary profiles and discover
compatible food products, ingredients, restaurants, and individual menu items through one
centralized matching system.
Primary differentiator:
Multi-restriction matching combined with transparent dietary information and restaurant
discovery.
Recommended priorities:
Problem statement:
Refine it to emphasize discovery and uncertainty.
Initial target audience:
People managing multiple dietary requirements, particularly those who struggle to find
suitable products or restaurants.
Main differentiator:
One dietary profile applied across multiple food-discovery experiences.
Most promising feature:
Restaurant and individual dish discovery.
Supporting features:
Product search and barcode scanning.
Technical approach:
A shared, rule-based compatibility engine.
Data strategy:
contributions.
Start with a curated dataset, then gradually introduce external data and community
Prototype:
An interactive three-feature application using a small product and restaurant dataset.
Long-term direction:
A Canada-first food-discovery platform supported by restaurant participation and more
comprehensive dietary information.

### 44. The Strongest Long-Term Opportunity
The most significant opportunity may not be creating a better barcode scanner.
It may be developing a reliable database that connects people's dietary requirements with
actual available food options.
Imagine someone searching for any food they are craving and receiving results showing:
• Which products accommodate their requirements.
• Which restaurants offer suitable dishes.
• Which nearby grocery stores carry compatible products.
• Which options are affordable.
• Why each result matches their profile.
• What information is missing or requires confirmation.
This is a broader and more compelling concept than simply scanning food products.
The platform could eventually support consumers, grocery retailers, restaurants, universities,
and food banks.
However, the strongest foundation would be a trustworthy dietary compatibility system and a
reliable dataset.

## PART 14: OVERALL RESEARCH
SUMMARY
The research identifies five recurring problems experienced by people with dietary
restrictions.
1. Difficulty discovering suitable food.
People often have to manually search restaurant menus, contact food establishments,
inspect packaging, and visit multiple grocery stores.
Supporting evidence:
• 47% of food-allergic Canadian survey respondents identified missing ingredient
information as a barrier to eating out.
• 83% of Canadian gluten-free survey respondents regularly visit multiple stores to
obtain products.
• Only 16% of sampled Toronto non-chain restaurants included online allergen
statements.
2. Higher costs and limited affordability.
Specialized foods can cost substantially more than conventional alternatives.
Supporting evidence:
• Allergy-friendly products cost 71.2% more on average in a Canadian 2026
comparison.
• Gluten-free staple foods were found to cost an average of 114% more across studies
conducted between 2014 and 2024.
• UAlberta students with dietary restrictions experienced greater food insecurity than
those without restrictions.
3. Uncertainty about food compatibility.
Consumers may not have access to reliable ingredient, allergen, preparation, and
cross-contamination information.
Supporting evidence:
• 53% of food-allergic Canadian respondents identified cross-contamination risk as a
barrier to eating out.
• 47% identified insufficient ingredient information as a barrier.
• 52% reported experiencing a food-allergy near miss during their lifetime.
4. Inadequate availability and selection.
Grocery stores, food banks, and campus dining services may not carry products and meals
that accommodate particular dietary requirements.
Supporting evidence:
• 84% of Canadian gluten-free survey respondents reported difficulties finding
gluten-free products at their usual grocery store.
• Western University students reported limited cultural and dietary food options.
• Research on traditional food bank hampers identified difficulties accommodating
medical, cultural, and religious requirements.
• 76% of Calgary Food Bank clients said the client-choice model better accommodated
their dietary restrictions.
5. Time and inconvenience.
People spend additional time researching products, contacting restaurants, visiting different
stores, and identifying alternatives.
Supporting evidence:
• Canadian gluten-free consumers frequently visit multiple grocery stores.
• University students report difficulties accessing food between classes.
• Restaurant allergen information is frequently unavailable online.

### 45. Final Conclusion
The proposed problem is supported by substantial Canadian research, particularly in
restaurants, grocery shopping, university food environments, and food banks.
There is evidence that people with allergies, intolerances, religious dietary requirements, and
lifestyle diets experience additional barriers when finding and purchasing appropriate food.
Existing applications demonstrate that there is a market for food scanning, personalized
ingredient checking, and restaurant discovery.
However, the market already has established competitors, so combining these features
alone is not sufficient differentiation.
The strongest opportunity is to create a centralized platform that applies one personalized
dietary profile across different food-discovery experiences.
The biggest challenge will be maintaining accurate, reliable, and current product and
restaurant information.
For the hackathon, the recommended approach is to build a working dietary profile, a shared
matching engine, and three simplified discovery experiences using a small demonstration
dataset.
The central message for the project is:
"Don't just build three food-related features. Build one personalized dietary matching system
and demonstrate three ways people can use it."
That provides a coherent technical foundation, a compelling user experience, and a practical
path toward further development.

## PART 15: CONSOLIDATED
REFERENCES
Canadian Dietary Prevalence and Food Insecurity
1. Agriculture and Agri-Food Canada. Canadian Consumers Survey, Wave II (2023).
https://epe.bac-lac.gc.ca/100/200/301/pwgsc-tpsgc/por-ef/agriculture_agri-food/2024/
054-23-e/POR054-23-report.html?nodisclaimer=1
2. Health Canada. Food Allergies and Intolerances.
https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/food-aller
gies-intolerances.html
3. Statistics Canada. Canadian household food insecurity statistics.
https://www150.statcan.gc.ca/
4. Food Banks Canada. HungerCount.
https://foodbankscanada.ca/hungercount/
Restaurants and Food Allergies
5. Food Allergy Canada. Recipe for Success: Consumer Experience Report.
https://foodallergycanada.ca/wp-content/uploads/Recipe-for-Success-Consumer-Exp
erience-Report-For-Foodservice-Resource.pdf
6. Toronto restaurant allergen-disclosure research (2025).
https://pubmed.ncbi.nlm.nih.gov/40368007/
Grocery Stores and Food Pricing
7. Celiac Canada. The Gluten-Free Grocery Hunt.
https://www.celiac.ca/the-gluten-free-grocery-hunt/
8. Canadian allergy-friendly food pricing study (2026).
https://link.springer.com/article/10.1186/s13223-026-01069-3
9. Canadian gluten-free food pricing research (2024).
https://pubmed.ncbi.nlm.nih.gov/38536944/
University Campuses and Student Food Access
10. University of Alberta Students' Union. Food Insecurity and Dietary Requirements
(2021).
https://www2.su.ualberta.ca/media/uploads/1143/Food%20Insecurity%20and%20Die
tary%20Requirements.pdf
11. University of Alberta Students' Union. 2024 Annual Survey.
https://www2.su.ualberta.ca/media/uploads/1143/2024AnnualSurvey.pdf
12. Clarke (2026). Student Perceptions of On-Campus Foodscapes at a Canadian
University.
https: /doi.org/10.1111/cag.70079
13. Miller et al. (2024). The Availability of Allergen-Friendly Food for College Students
Experiencing Food Insecurity.
https://pubmed.ncbi.n/m.nih.gov/39019435/
Food Banks and Community Food Access
14. The Impact of Novel and Traditional Food Bank Approaches on Food Insecurity: A
Longitudinal Study in Ottawa, Canada (2021).
https://link.springer.com/article/10.1186/s12889-021-10841-6
15. Calgary Food Bank. Choice Model (2025).
https://www.calgaryfoodbank.com/2025/choice-model/
16. Vahabi and Damba (2013). Perceived Barriers in Accessing Food Among Recent
Latin American Immigrants in Toronto.
https://pmc.ncbi.nlm.nih.gov/articles/PMC3547743/
Competitor Applications
17. Fig.
https://foodisgood.com/
18. Spoonful.
https://spoonfulapp.com/
19. Spokin.
https://www.spokin.com/
20. Find Me Gluten Free.
https://www.findmeglutenfree.com/
21. Zabihah.
https://www.zabihah.com/
22. HalalBiz.
https://www.halalbiz.ca/
Technical Resources
23. Open Food Facts.
https://world.openfoodfacts.org/
24. Open Food Facts API Documentation.
https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/
25. Google Places API Documentation.
https://developers.google.com/maps/documentation/places/web-service/overview
26. Office of the Privacy Commissioner of Canada.
https://www.priv.gc.ca/
RESEARCH AND INTERPRETATION NOTES
• Survey findings represent the specific samples and populations studied. They should
not automatically be generalized to all Canadians.
• Figures from different studies should not be added together because their
populations, survey methods, and definitions differ.
• Food insecurity is not equivalent to dietary-restriction accessibility. A person may
experience one without the other.
• Restaurant menu disclosures do not establish whether a restaurant's actual food
preparation practices are safe.
• Community-contributed product information should not be treated as a guarantee of
current product ingredients.
• Food compatibility should be distinguished from medical safety.
• Some studies examine specific subgroups with small sample sizes. Those subgroup
statistics should be interpreted cautiously.
• The application should communicate the source, completeness, and verification
status of food information rather than making unconditional safety claims.
