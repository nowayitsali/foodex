# AI gathers Findings, rules decide Verdicts

The AI model identifies the item and researches it online, but it never decides whether food fits. It returns Findings, each tied to a Source, and the Diner confirms the Identification. Then one rule-based check compares the Findings with the Restriction profile and gives each Verdict. We chose this over letting the AI answer "safe or not" directly because a wrong Fits can hurt someone with an allergy. Rules are predictable and testable, missing Findings always give Not enough info, and the same check serves Scan, Search and Nearby.
