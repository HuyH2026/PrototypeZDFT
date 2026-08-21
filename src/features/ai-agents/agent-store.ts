// Mutable agent layer for the Agent Builder create/edit flow. Seeds from the
// frozen CHANNELS const and extends each agent with editor fields (policy doc +
// canvas blocks) and create-form metadata. Pure reducers here are unit-tested
// without jsdom; the React hook (below) wires them to state + localStorage.
import { useMemo, useSyncExternalStore } from 'react'
import { CHANNELS, type Agent, type CallDirection, type ChannelKey } from './agent-builder-data'
import { POLICY_SEEDS, POLICY_TITLE } from './policy-seeds'

export type StepType =
  | 'options'
  | 'condition'
  | 'form'
  | 'text'
  | 'dynamic-card'
  | 'image'
  | 'csat'
  | 'attachment'
  | 'code'
  // From the web-call policy detail's Steps panel (Explore-Voice-Unification
  // 170:63332): a policy-in-policy block, and the spoken-reply block.
  | 'nested-policy'
  | 'say'

// Order and labels follow the Steps panel in the web-call policy detail frame
// (Explore-Voice-Unification 170:63332). `attachment` is not in that frame — it
// stays for the older widget surface that references it.
export const STEP_TYPES: { type: StepType; label: string }[] = [
  { type: 'options', label: 'Options' },
  { type: 'condition', label: 'Condition' },
  { type: 'nested-policy', label: 'Nested Policy' },
  { type: 'form', label: 'Forms' },
  { type: 'text', label: 'Text card' },
  { type: 'dynamic-card', label: 'Dynamic cards' },
  { type: 'image', label: 'Image' },
  { type: 'code', label: 'Code' },
  { type: 'say', label: 'Say' },
  { type: 'attachment', label: 'Attachment' },
  { type: 'csat', label: 'CSAT Survey Trigger Point' },
]

export type ChipVariant =
  | 'form'
  | 'routing'
  | 'event'
  | 'action'
  | 'trigger'
  | 'variable'
  | 'agent'
  | 'article'

export type PolicyChip = { kind: 'chip'; id: string; variant: ChipVariant; label: string }
export type PolicyProse = { kind: 'prose'; id: string; text: string }
export type PolicySegment = PolicyProse | PolicyChip
export type PolicyDoc = { title: string; segments: PolicySegment[] }

export type ConditionRow = { id: string; label: string }
export type CanvasBlock = {
  id: string
  stepType: StepType
  title: string
  collapsed?: boolean
  // Condition content (present for condition-type blocks). The last row acts as
  // the "Otherwise…" fallthrough when its label is the sentinel.
  header?: string
  subtitle?: string
  rows?: ConditionRow[]
}

// What the editor calls a policy document. Declared alongside the seeded policy
// content in policy-seeds.ts and re-exported here, where callers already look
// for it.
export { POLICY_TITLE }

export type StoredAgent = Agent & {
  channel: ChannelKey
  policy: PolicyDoc
  blocks: CanvasBlock[]
  allSegments: boolean
  tags: string[]
  customerRequest: string
  triggerPhrases: string[]
  // When an AI Studio plan has been approved, the editor shows the inline
  // accept/reject diff preview instead of the policy editor. Persisted so the
  // preview survives reload / navigation until the changes are resolved.
  previewPending?: boolean
}

let seq = 0
export function nextId(prefix: string): string {
  return `${prefix}-${++seq}`
}
export function syncSeq(agents: { id: string }[]): void {
  for (const a of agents) {
    const m = /-(\d+)$/.exec(a.id)
    if (m) seq = Math.max(seq, Number(m[1]))
  }
}

export function chipVariantForStep(step: StepType): ChipVariant {
  switch (step) {
    case 'form':
      return 'form'
    case 'condition':
      return 'routing'
    case 'csat':
      return 'event'
    case 'text':
      return 'trigger'
    default:
      return 'action'
  }
}

export function insertChip(doc: PolicyDoc, index: number, chip: PolicyChip): PolicyDoc {
  const segments = [...doc.segments]
  segments.splice(index, 0, chip)
  return { ...doc, segments }
}
export function removeChip(doc: PolicyDoc, chipId: string): PolicyDoc {
  return { ...doc, segments: doc.segments.filter((s) => !(s.kind === 'chip' && s.id === chipId)) }
}

// The slash menu's insertion: `caretOffset` sits right after the '/' that
// triggered it, so the character before it is the '/' itself — dropped here
// rather than left behind as literal text. Splits the prose segment around
// that point into up to two prose segments plus the chip; empty halves are
// omitted so picking a menu item at the very start or end of a segment
// doesn't leave an empty, still-editable span behind.
export function insertChipInProse(
  doc: PolicyDoc,
  segmentId: string,
  caretOffset: number,
  chip: PolicyChip,
): PolicyDoc {
  const index = doc.segments.findIndex((s) => s.kind === 'prose' && s.id === segmentId)
  const segment = doc.segments[index]
  if (index === -1 || segment.kind !== 'prose') return doc

  const before = segment.text.slice(0, Math.max(caretOffset - 1, 0))
  const after = segment.text.slice(caretOffset)
  const replacement: PolicySegment[] = [
    ...(before ? [{ kind: 'prose' as const, id: segment.id, text: before }] : []),
    chip,
    ...(after ? [{ kind: 'prose' as const, id: nextId('p'), text: after }] : []),
  ]

  const segments = [...doc.segments]
  segments.splice(index, 1, ...replacement)
  return { ...doc, segments }
}
export function appendBlock(blocks: CanvasBlock[], block: CanvasBlock): CanvasBlock[] {
  return [...blocks, block]
}
export function createCanvasBlock(stepType: StepType, ordinal: number): CanvasBlock {
  const block: CanvasBlock = {
    id: nextId('b'),
    stepType,
    title: `Untitled classic block ${String(ordinal).padStart(2, '0')}`,
    collapsed: stepType === 'condition' ? undefined : true,
  }

  if (stepType !== 'condition') return block

  return {
    ...block,
    header: 'Conditions',
    subtitle: 'Shipping status',
    rows: [
      { id: nextId('r'), label: 'Condition description' },
      { id: nextId('r'), label: 'Condition description' },
      { id: nextId('r'), label: 'Otherwise…' },
    ],
  }
}
export function nextBlockOrdinal(blocks: CanvasBlock[]): number {
  const highest = blocks.reduce((max, block) => {
    const match = /^Untitled classic block (\d+)$/.exec(block.title)
    return Math.max(max, match ? Number(match[1]) : 0)
  }, 0)
  return highest + 1
}
export function moveBlock(blocks: CanvasBlock[], from: number, to: number): CanvasBlock[] {
  const next = [...blocks]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
export function removeBlock(blocks: CanvasBlock[], id: string): CanvasBlock[] {
  return blocks.filter((b) => b.id !== id)
}

function patchBlock(
  blocks: CanvasBlock[],
  id: string,
  fn: (b: CanvasBlock) => CanvasBlock,
): CanvasBlock[] {
  return blocks.map((b) => (b.id === id ? fn(b) : b))
}
export function addConditionRow(
  blocks: CanvasBlock[],
  blockId: string,
  row: ConditionRow,
): CanvasBlock[] {
  return patchBlock(blocks, blockId, (b) => {
    const rows = b.rows ?? []
    const fallbackIndex = rows.findIndex((item) =>
      item.label.trim().toLowerCase().startsWith('otherwise'),
    )
    const insertAt = fallbackIndex === -1 ? rows.length : fallbackIndex
    return {
      ...b,
      rows: [...rows.slice(0, insertAt), row, ...rows.slice(insertAt)],
    }
  })
}
export function editConditionRow(
  blocks: CanvasBlock[],
  blockId: string,
  rowId: string,
  label: string,
): CanvasBlock[] {
  return patchBlock(blocks, blockId, (b) => ({
    ...b,
    rows: (b.rows ?? []).map((r) => (r.id === rowId ? { ...r, label } : r)),
  }))
}
export function removeConditionRow(
  blocks: CanvasBlock[],
  blockId: string,
  rowId: string,
): CanvasBlock[] {
  return patchBlock(blocks, blockId, (b) => ({
    ...b,
    rows: (b.rows ?? []).filter((r) => r.id !== rowId),
  }))
}
export function toggleBlockCollapse(blocks: CanvasBlock[], blockId: string): CanvasBlock[] {
  return patchBlock(blocks, blockId, (b) => ({ ...b, collapsed: !b.collapsed }))
}

export function removeAgents<T extends { id: string }>(agents: T[], ids: string[]): T[] {
  if (ids.length === 0) return agents
  const drop = new Set(ids)
  return agents.filter((a) => !drop.has(a.id))
}

/**
 * Read a policy document back as one line of plain text, chips rendered as their
 * labels. The editor stores the design's own line breaks and renders them
 * `whitespace-pre-wrap`; callers that need a single sentence-run (the preview
 * overlay's Policy Description line) collapse them through here.
 */
export function policyToText(doc: PolicyDoc): string {
  return doc.segments
    .map((segment) => (segment.kind === 'chip' ? segment.label : segment.text))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function starterPolicy(name: string): PolicyDoc {
  return {
    title: POLICY_TITLE,
    segments: [{ kind: 'prose', id: 'p1', text: `Describe how the ${name} agent should respond.` }],
  }
}

export function seedAgents(): StoredAgent[] {
  const agents: StoredAgent[] = []
  for (const channel of CHANNELS) {
    for (const a of channel.agents) {
      // Authored content per use case lives in policy-seeds.ts. An agent with no
      // seed there (nothing does today) still gets a usable starter policy.
      const seed = POLICY_SEEDS[a.id]
      agents.push({
        ...a,
        channel: channel.key,
        policy: seed?.policy ?? starterPolicy(a.name),
        blocks: seed?.blocks ?? [],
        allSegments: true,
        tags: a.tags,
        customerRequest: seed?.customerRequest ?? '',
        triggerPhrases: seed?.triggerPhrases ?? [],
      })
    }
  }
  return agents
}

const STORAGE_KEY = 'agent-builder-store-v1'

// Clear persisted agent edits once per full page load (this module body runs
// exactly once per browser refresh, not per SPA navigation), so a hard
// refresh always starts the builder flow from the clean seed data instead of
// carrying over previous demo/session edits.
try {
  window.localStorage?.removeItem(STORAGE_KEY)
} catch {
  /* ignore missing/unavailable storage */
}

const STEP_TITLE: Record<StepType, string> = STEP_TYPES.reduce(
  (acc, s) => ({ ...acc, [s.type]: s.label }),
  {} as Record<StepType, string>,
)

export type CreateAgentFields = {
  name: string
  channel: ChannelKey
  allSegments: boolean
  tags: string[]
  customerRequest: string
  triggerPhrases: string[]
  // Voice ▸ Outbound's create drawer (frame 155:58932) adds a subflow, not a
  // top-level intent — these carry that shape. Omitted elsewhere.
  callDirection?: CallDirection
  isSubflow?: boolean
  type?: string
  // Supplied by the AI Studio plan approval, which creates an agent that already
  // has its policy and its blocks and is deliberately switched off. Omitted
  // everywhere else, so the create panel and the wizard behave exactly as before.
  policy?: PolicyDoc
  blocks?: CanvasBlock[]
  on?: boolean
}

function loadAgents(): StoredAgent[] {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoredAgent[]
      if (Array.isArray(parsed) && parsed.every((a) => a && typeof a.id === 'string')) {
        syncSeq(parsed)
        return parsed
      }
    }
  } catch {
    /* ignore missing/malformed storage */
  }
  const seeded = seedAgents()
  syncSeq(seeded)
  return seeded
}

// Module-level state, not per-hook: AiAssistantHost (mounted by RootLayout) and
// AgentBuilderScreen (mounted by the route) are different subtrees reading the
// same agents. Same idiom as agent-roster-store.ts.
let agents: StoredAgent[] = loadAgents()
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// useSyncExternalStore compares snapshots by identity, so this returns the same
// array until the list actually changes — never a fresh copy.
function getSnapshot(): StoredAgent[] {
  return agents
}

function persist(next: StoredAgent[]): void {
  agents = next
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota/availability errors */
  }
  emit()
}

// Test seam: module state outlives a single test, so tests reset it explicitly.
export function resetAgentStore(next: StoredAgent[] = seedAgents()): void {
  seq = 0
  syncSeq(next)
  agents = next
  emit()
}

export function useAgentStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return useMemo(
    () => ({
      agents: snapshot,
      getAgent: (id: string) => snapshot.find((a) => a.id === id),
      createAgent: (fields: CreateAgentFields) => {
        const id = nextId('agent')
        const agent: StoredAgent = {
          id,
          name: fields.name,
          on: fields.on ?? true,
          isSubflow: fields.isSubflow ?? false,
          type: fields.type ?? 'With intent',
          callDirection: fields.callDirection,
          conversations: 0,
          resolutions: 0,
          resolutionRate: '0%',
          csat: 0,
          channel: fields.channel,
          tags: fields.tags,
          allSegments: fields.allSegments,
          customerRequest: fields.customerRequest,
          triggerPhrases: fields.triggerPhrases,
          policy: fields.policy ?? {
            title: POLICY_TITLE,
            segments: [{ kind: 'prose', id: nextId('p'), text: '' }],
          },
          blocks: fields.blocks ?? [],
        }
        persist([...snapshot, agent])
        return id
      },
      updateAgent: (id: string, patch: Partial<StoredAgent>) =>
        persist(snapshot.map((a) => (a.id === id ? { ...a, ...patch } : a))),
      toggleAgent: (id: string) =>
        persist(snapshot.map((a) => (a.id === id ? { ...a, on: !a.on } : a))),
      deleteAgents: (ids: string[]) => persist(removeAgents(snapshot, ids)),
    }),
    [snapshot],
  )
}

export { STEP_TITLE }
