// Deterministic, backend-free dashboard generator. Given a role, focus areas, and
// an optional free-text prompt, it scores the existing widgets and returns a
// { left, right } layout. No LLM, no Date.now()/Math.random() — same input always
// yields the same output. The widget id universe mirrors WidgetId in dashboard-data.
import type { WidgetId, Layout } from './dashboard-data'

// The role list the AI Studio picker offers, keyed as the design names them
// (Ops lead, Product Manager, CS Lead, Knowledge Manager, Executive). A request
// that names no role is role === null, which the picker offers as "Something
// else" and the composer reaches by typing.
export type Role = 'ops' | 'pm' | 'cs' | 'knowledge' | 'exec'
// Grid roles reorder the shared support widgets; 'pm' renders a bespoke layout.
export type GridRole = Exclude<Role, 'pm'>
// The five things a dashboard can be built around, as the picker's second step
// lists them. 'lifecycle' is the odd one out: it asks for the bespoke PM
// dashboard rather than weighting the shared widgets (see wantsPmDashboard).
export type FocusArea = 'health' | 'quality' | 'cost' | 'gaps' | 'lifecycle'

// UI option lists (order matters — the picker, the tests, and the composed
// prompt all read them in this order).
export const ROLES: { key: Role; label: string }[] = [
  { key: 'ops', label: 'Ops lead' },
  { key: 'pm', label: 'Product Manager' },
  { key: 'cs', label: 'CS Lead' },
  { key: 'knowledge', label: 'Knowledge Manager' },
  { key: 'exec', label: 'Executive' },
]

export const FOCUS_AREAS: { key: FocusArea; label: string }[] = [
  { key: 'health', label: 'Agent health and trends' },
  { key: 'quality', label: 'Quality and testing' },
  { key: 'cost', label: 'Cost and efficiency' },
  { key: 'gaps', label: 'Feature gaps and requirements' },
  { key: 'lifecycle', label: 'Product lifecycle' },
]

// Each widget's themes. A widget with no matching focus scores 0 (still eligible
// via the canonical order tail so layouts are never sparse). 'lifecycle' tags
// nothing — it selects a different dashboard rather than ranking widgets.
const WIDGET_TAGS: Record<WidgetId, FocusArea[]> = {
  health: ['health'],
  intents: ['health'],
  approvals: ['health', 'quality'],
  activity: ['health'],
  notifications: ['health'],
  qa: ['quality'],
  policies: ['quality'],
  gaps: ['gaps'],
  knowledge: ['gaps'],
  cost: ['cost'],
}

// Focus areas implied by a role when the user picks none.
const ROLE_BASELINE: Record<GridRole, FocusArea[]> = {
  ops: ['health', 'quality'],
  cs: ['health', 'gaps'],
  knowledge: ['gaps', 'health'],
  exec: ['health', 'cost'],
}

// Free-text keywords → the focus area they imply.
const PROMPT_KEYWORDS: { term: string; focus: FocusArea }[] = [
  { term: 'cost', focus: 'cost' },
  { term: 'spend', focus: 'cost' },
  { term: 'budget', focus: 'cost' },
  { term: 'efficiency', focus: 'cost' },
  { term: 'resolution', focus: 'health' },
  { term: 'health', focus: 'health' },
  { term: 'csat', focus: 'health' },
  { term: 'trend', focus: 'health' },
  { term: 'quality', focus: 'quality' },
  { term: 'test', focus: 'quality' },
  { term: 'approval', focus: 'quality' },
  // 'knowledge' is deliberately absent: it names the Knowledge Manager role as
  // often as it names the subject, and 'gap'/'article' already cover the subject.
  { term: 'gap', focus: 'gaps' },
  { term: 'article', focus: 'gaps' },
  { term: 'requirement', focus: 'gaps' },
  { term: 'lifecycle', focus: 'lifecycle' },
  { term: 'roadmap', focus: 'lifecycle' },
]

// Which focus areas a free-text request asks for. Exported so a prompt-only
// request (the user described what they want to see rather than picking chips)
// can be scored the same way a chip-driven one is.
export function focusesFromPrompt(prompt: string): FocusArea[] {
  const text = prompt.toLowerCase()
  const hits = new Set<FocusArea>(
    PROMPT_KEYWORDS.filter((k) => text.includes(k.term)).map((k) => k.focus),
  )
  // Return them in FOCUS_AREAS order, so the same set of hits always yields the
  // same array regardless of the order the keywords appeared in the sentence.
  return FOCUS_AREAS.filter((f) => hits.has(f.key)).map((f) => f.key)
}

// Role phrases → the role they name. Ordered most-specific-first, and matched on
// word boundaries so "3pm" or "gaps" can't trip a role. A role is only inferred
// from language that actually names one: "knowledge gaps" asks for a knowledge
// *widget*, while "knowledge manager" asks for the knowledge-manager *view*.
const ROLE_PHRASES: { pattern: RegExp; role: Role }[] = [
  { pattern: /\bproduct manager\b|\bproduct owner\b|\bpm\b|\broadmap\b/, role: 'pm' },
  { pattern: /\bknowledge (manager|lead)\b/, role: 'knowledge' },
  { pattern: /\bcs lead\b|\bsupport lead\b|\bcustomer support lead\b/, role: 'cs' },
  { pattern: /\bops (lead|manager)\b|\boperations lead\b/, role: 'ops' },
  { pattern: /\bexecutive\b|\bexec\b|\bleadership\b|\bcxo\b/, role: 'exec' },
]

// The role a free-text request names, or null if it names none.
export function roleFromPrompt(prompt: string): Role | null {
  const text = prompt.toLowerCase()
  return ROLE_PHRASES.find((r) => r.pattern.test(text))?.role ?? null
}

// --- Composing the request the picker sends ----------------------------------
// The guided picker in AI Studio doesn't send its checkboxes — it writes the
// sentence the user would have typed and sends that, so the composer and the
// picker feed the same reader (roleFromPrompt/focusesFromPrompt) and the request
// stays legible in the transcript.

// The kind of dashboard each role asks for, as the sentence names it.
const ROLE_SUBJECT: Record<Role, string> = {
  ops: 'an operations',
  pm: 'a product management',
  cs: 'a customer support',
  knowledge: 'a knowledge',
  exec: 'an executive',
}

// What each focus asks for, as sentence fragments. Several focuses contribute
// two, which is why these are lists rather than single phrases.
const FOCUS_PHRASES: Record<Exclude<FocusArea, 'lifecycle'>, string[]> = {
  health: ['agent health', 'resolution trends'],
  quality: ['testing', 'product quality'],
  cost: ['cost', 'efficiency'],
  gaps: ['feature gaps', 'requirements'],
}

// The order the fragments read best in — gaps and requirements lead, quality
// follows — which is not the order the picker lists its options in.
const PHRASE_ORDER: Exclude<FocusArea, 'lifecycle'>[] = ['gaps', 'quality', 'health', 'cost']

// "a, b, and c" (Oxford comma; two items get no comma).
function listPhrases(phrases: string[]): string {
  if (phrases.length <= 1) return phrases.join('')
  if (phrases.length === 2) return `${phrases[0]} and ${phrases[1]}`
  return `${phrases.slice(0, -1).join(', ')}, and ${phrases[phrases.length - 1]}`
}

// "an Ops lead" / "a Product Manager" — the labels are fixed, so the vowel test
// on the first letter is enough.
function article(label: string): string {
  return /^[aeiou]/i.test(label) ? 'an' : 'a'
}

export function composeDashboardPrompt(input: { role: Role | null; focuses: FocusArea[] }): string {
  const roleLabel = input.role ? ROLES.find((r) => r.key === input.role)?.label : null
  const subject = input.role ? ROLE_SUBJECT[input.role] : 'a'
  const opening = roleLabel
    ? `Build me ${subject} dashboard tailored to my role as ${article(roleLabel)} ${roleLabel}.`
    : 'Build me a dashboard.'

  const themed = PHRASE_ORDER.filter((key) => input.focuses.includes(key)).flatMap(
    (key) => FOCUS_PHRASES[key],
  )
  const lifecycle = input.focuses.includes('lifecycle')

  if (lifecycle && themed.length > 0) {
    return `${opening} The dashboard should provide an end-to-end view of the product lifecycle, with a strong focus on ${listPhrases(themed)}.`
  }
  if (lifecycle) {
    return `${opening} The dashboard should provide an end-to-end view of the product lifecycle.`
  }
  if (themed.length > 0) {
    return `${opening} The dashboard should focus on ${listPhrases(themed)}.`
  }
  return opening
}

// Whether a request asks for the bespoke product-lifecycle dashboard rather than
// the shared widget grid — either by naming the role or by asking to track the
// lifecycle.
export function wantsPmDashboard(input: { role: Role | null; focuses: FocusArea[] }): boolean {
  return input.role === 'pm' || input.focuses.includes('lifecycle')
}

// Executive is its own outcome-and-value surface, but lifecycle remains the
// stronger request so "Executive + Product lifecycle" keeps the PM dashboard.
export function wantsExecutiveDashboard(input: { role: Role | null }): boolean {
  return input.role === 'exec'
}

// Stable tie-break order (also the fallback tail so no layout is empty).
const WIDGET_ORDER: WidgetId[] = [
  'health', 'approvals', 'policies', 'qa', 'gaps',
  'knowledge', 'intents', 'cost', 'activity', 'notifications',
]

// Widgets always present regardless of scoring.
const CORE: WidgetId[] = ['health', 'approvals']

export function generateLayout(input: {
  // Null when the request came as free text that named no role — the prompt's own
  // keywords then carry the layout on their own.
  role: Role | null
  focuses: FocusArea[]
  prompt?: string
}): Layout {
  // Prompt keywords add extra weight to their focus, and stand in for the chips
  // entirely when the request was typed rather than picked.
  const promptFocusList = focusesFromPrompt(input.prompt ?? '')
  const promptFocuses = new Set<FocusArea>(promptFocusList)

  const baseline =
    input.role === null || input.role === 'pm' ? promptFocusList : ROLE_BASELINE[input.role]
  const effective = input.focuses.length > 0 ? input.focuses : baseline
  const focusSet = new Set<FocusArea>(effective)

  const score = (id: WidgetId): number => {
    const tags = WIDGET_TAGS[id]
    let s = 0
    for (const t of tags) {
      if (focusSet.has(t)) s += 2
      if (promptFocuses.has(t)) s += 1
    }
    if (CORE.includes(id)) s += 0.5 // gentle nudge so core sits high, not forced to top
    return s
  }

  // Rank all widgets: score desc, then canonical order for stable ties.
  const ranked = [...WIDGET_ORDER].sort((a, b) => {
    const diff = score(b) - score(a)
    if (diff !== 0) return diff
    return WIDGET_ORDER.indexOf(a) - WIDGET_ORDER.indexOf(b)
  })

  // Split into two columns: highest-ranked to the top of the left column,
  // alternating so both columns fill. Even indices (0, 2, 4…) — the highest-ranked
  // picks — go to the left/primary column.
  const left: WidgetId[] = []
  const right: WidgetId[] = []
  ranked.forEach((id, i) => {
    if (i % 2 === 0) left.push(id)
    else right.push(id)
  })

  return { left, right }
}

// --- PM dashboard widgets (bespoke layout, ordered list not two columns) -----
export type PmWidgetId = 'pm-kpis' | 'pm-spotlight' | 'pm-lifecycle' | 'pm-feed'
export const PM_WIDGET_ID_LIST: PmWidgetId[] = ['pm-kpis', 'pm-spotlight', 'pm-lifecycle', 'pm-feed']
export const DEFAULT_PM_LAYOUT: PmWidgetId[] = ['pm-kpis', 'pm-spotlight', 'pm-lifecycle', 'pm-feed']
