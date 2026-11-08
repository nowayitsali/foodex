import { RULES_BY_ID, type RestrictionRule } from './restrictions'
import type { CustomRestriction, Finding, RestrictionProfile, Research, Verdict } from './types'

// The one rule-based check every feature uses (ADR 0001).
// Findings + Restriction profile -> one Verdict per Restriction.

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Finds the first listed word in text, as a whole word, plural allowed. */
function firstMatch(text: string, words: string[], lookalikes: string[] = []): string | undefined {
  let t = text.toLowerCase()
  for (const l of lookalikes) t = t.replace(new RegExp(escape(l.toLowerCase()), 'g'), ' ')
  return words.find((w) => new RegExp(`\\b${escape(w)}(s|es)?\\b`, 'i').test(t))
}

const isContent = (f: Finding) => f.type === 'ingredient' || f.type === 'may_contain'

function hits(findings: Finding[], words: string[], lookalikes?: string[]) {
  const out: { finding: Finding; word: string }[] = []
  for (const finding of findings.filter(isContent)) {
    const word = firstMatch(finding.text, words, lookalikes)
    if (word) out.push({ finding, word })
  }
  return out
}

function describe(h: { finding: Finding; word: string }[]) {
  return h.map(({ finding, word }) => (finding.type === 'may_contain' ? `may contain ${word}` : `contains ${word}`)).join(', ')
}

function judgeRule(rule: RestrictionRule, research: Research): Verdict {
  const { findings, ingredientsComplete } = research
  const base = { restrictionKey: rule.id, label: rule.label }

  const conflicts = hits(findings, rule.conflicts, rule.lookalikes)
  if (conflicts.length) {
    return { ...base, value: 'doesnt_fit', reason: capitalize(describe(conflicts)) + '.', evidence: conflicts.map((c) => c.finding) }
  }

  if (rule.notTogether) {
    const a = hits(findings, rule.notTogether[0], rule.lookalikes)
    const b = hits(findings, rule.notTogether[1], rule.lookalikes)
    if (a.length && b.length) {
      return { ...base, value: 'doesnt_fit', reason: `Mixes ${a[0].word} with ${b[0].word}.`, evidence: [a[0].finding, b[0].finding] }
    }
  }

  const about = rule.certification
    ? findings.filter((f) => f.type === 'certification' && firstMatch(f.text, [rule.certification!]))
    : []
  const certs = about.filter((f) => !/\bnot\b/i.test(f.text))
  // A certifier saying "not approved" isn't proof of a conflict (it can mean the maker never
  // answered), but it rules out Fits. It also outweighs a label saying the opposite.
  const refusals = about.filter((f) => /\bnot\b/i.test(f.text))
  if (refusals.length) {
    return { ...base, value: 'not_enough_info', reason: `${capitalize(refusals[0].text.replace(/\.$/, ''))}.`, evidence: [...refusals, ...certs] }
  }

  if (rule.needsCertification) {
    const needing = hits(findings, rule.needsCertification, rule.lookalikes)
    if (needing.length && !certs.length) {
      return {
        ...base,
        value: 'not_enough_info',
        reason: `${capitalize(describe(needing))} with no ${rule.certification} certification found.`,
        evidence: needing.map((n) => n.finding),
      }
    }
  }

  const ingredients = findings.filter(isContent)
  if (certs.length) {
    const proof = certs[0].source.kind === 'official_certification' ? certs[0].text : `${certs[0].text} on the package`
    return { ...base, value: 'fits', reason: `${capitalize(proof)}, and no conflicting ingredients found.`, evidence: [...certs, ...ingredients] }
  }
  if (!ingredientsComplete || ingredients.length === 0) {
    return { ...base, value: 'not_enough_info', reason: 'No complete ingredient list was found.', evidence: ingredients }
  }
  return { ...base, value: 'fits', reason: 'No conflicting ingredients in the full ingredient list.', evidence: ingredients }
}

// An allergy or intolerance typed as a plain ingredient name ("mustard", "no garlic", "corn-free")
// can be checked against a full ingredient list. Anything else ("low FODMAP", "Jain") is a
// description, not an ingredient, so the rules can't confirm it.
const DESCRIPTION_WORDS = /\b(low|high|diet|fodmap|keto|paleo|reduced|less|added|natural|organic|processed|style)\b/i

function ingredientName(custom: CustomRestriction): string | undefined {
  if (custom.category !== 'medical') return undefined
  const core = custom.text.trim().toLowerCase().replace(/^no\s+/, '').replace(/[\s-]+free$/, '').trim()
  if (!/^[a-z]+(?:[ '-][a-z]+){0,2}$/.test(core) || DESCRIPTION_WORDS.test(core)) return undefined
  return core
}

function judgeCustom(custom: CustomRestriction, research: Research): Verdict {
  const text = custom.text.trim()
  const base = { restrictionKey: `custom:${text.toLowerCase()}`, label: text }
  const word = ingredientName(custom) ?? text.toLowerCase()
  const content = research.findings.filter(isContent)
  const found = content.filter((f) => firstMatch(f.text, [word]))
  if (found.length) return { ...base, value: 'doesnt_fit', reason: `Mentions ${word}.`, evidence: found }
  if (ingredientName(custom) && research.ingredientsComplete && content.length) {
    return { ...base, value: 'fits', reason: `No ${word} in the full ingredient list.`, evidence: content }
  }
  return { ...base, value: 'not_enough_info', reason: `Foodex can't confirm "${text}" automatically. Check the Sources.`, evidence: [] }
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function judge(research: Research, profile: RestrictionProfile): Verdict[] {
  return [
    ...profile.restrictions.map((id) => judgeRule(RULES_BY_ID[id], research)),
    ...profile.custom.filter((c) => c.text.trim()).map((c) => judgeCustom(c, research)),
  ]
}

/** Overall answer for an item: the worst Verdict wins. */
export function overall(verdicts: Verdict[]): Verdict['value'] {
  if (verdicts.some((v) => v.value === 'doesnt_fit')) return 'doesnt_fit'
  if (verdicts.some((v) => v.value === 'not_enough_info')) return 'not_enough_info'
  return 'fits'
}
