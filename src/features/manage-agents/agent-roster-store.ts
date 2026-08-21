// The agent roster: brands' agents, as created in Manage agents.
//
// A module-level external store rather than the per-hook useState pattern of
// agent-store.ts, because two different subtrees read the same roster: the
// Manage agents screen (route subtree) and the assistant's setup checklist
// (mounted by AppLayout). Per-hook state would give them separate copies and
// the checklist would never notice a created agent. Same idiom as
// dashboard-request-store.ts.
//
// Unlike agent-store.ts, this does NOT clear itself on page load: emptying the
// roster is how the empty state is reached, so it has to survive a refresh.
import { useMemo, useSyncExternalStore } from 'react'
import { maxIdSuffix } from '@/lib/id-seq'
import { SEED_AGENTS, type AgentHealth, type RosterAgent } from './roster-data'

export const ROSTER_STORAGE_KEY = 'manage-agents-roster-v1'

// A Record, not an array, so adding a variant to AgentHealth is a compile error
// here rather than a value this guard silently rejects.
const HEALTH_VALUES: Record<AgentHealth, true> = {
  good: true,
  'new-insights': true,
  'needs-attention': true,
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

// Checked against the union's members, not just `typeof === 'string'`: the table
// destructures HEALTH_META[health], so an unknown label would destructure undefined.
function isHealth(value: unknown): value is AgentHealth | null {
  if (value === null) return true
  return typeof value === 'string' && HEALTH_VALUES[value as AgentHealth] === true
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === 'number'
}

// Every field the render path dereferences is checked, not just the identity ones:
// this store never resets itself, so one bad entry that got through would
// white-screen /agent-setup on every load with no in-app way out. `formatCount`
// calls .toLocaleString on `conversations`, the table destructures
// HEALTH_META[health], `ar` is interpolated straight into its cell, and
// `insightCount` is compared with > (the three metrics are nullable; the count is not).
function isRosterAgent(value: unknown): value is RosterAgent {
  if (typeof value !== 'object' || value === null) return false
  const agent = value as Partial<RosterAgent>
  return (
    typeof agent.id === 'string' &&
    typeof agent.brandId === 'string' &&
    typeof agent.name === 'string' &&
    isStringArray(agent.channels) &&
    isHealth(agent.health) &&
    isNullableNumber(agent.ar) &&
    isNullableNumber(agent.conversations) &&
    typeof agent.insightCount === 'number'
  )
}

function loadAgents(): RosterAgent[] {
  try {
    const raw = window.localStorage?.getItem(ROSTER_STORAGE_KEY)
    if (raw === null || raw === undefined) return SEED_AGENTS
    const parsed: unknown = JSON.parse(raw)
    // An empty array is a real state (the user deleted every agent), so it is
    // honoured rather than reseeded.
    if (!Array.isArray(parsed)) return SEED_AGENTS
    return parsed.filter(isRosterAgent)
  } catch {
    return SEED_AGENTS
  }
}

let agents: RosterAgent[] = loadAgents()
// Resumed from the highest id suffix present, not from the count: after a delete
// and a reload, a count-derived counter can re-mint a live id — and deleteAgent
// filters by id, so removing one row would remove both.
let seq = maxIdSuffix(agents.map((agent) => agent.id))
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

// useSyncExternalStore compares snapshots by identity, so this must return the
// same array until the roster actually changes — never a fresh copy.
function getSnapshot(): RosterAgent[] {
  return agents
}

function persist(): void {
  try {
    window.localStorage?.setItem(ROSTER_STORAGE_KEY, JSON.stringify(agents))
  } catch {
    // Storage unavailable or full — the in-memory roster is still correct.
  }
}

function createAgent(fields: { brandId: string; name: string; channels: string[] }): string {
  const id = `${fields.name.toLowerCase().replace(/\s+/g, '-')}-${++seq}`
  agents = [
    ...agents,
    {
      id,
      brandId: fields.brandId,
      name: fields.name,
      channels: fields.channels,
      health: null,
      ar: null,
      conversations: null,
      insightCount: 0,
    },
  ]
  persist()
  emit()
  return id
}

// Name and channels only — the metrics are the mock's, not the user's, and the
// id stays put so a rename cannot orphan the top bar's currentAgentId. Returns
// early on an unknown id so the snapshot keeps its identity and no consumer
// re-renders for an edit that did not happen.
function updateAgent(id: string, fields: { name: string; channels: string[] }): void {
  if (!agents.some((agent) => agent.id === id)) return
  agents = agents.map((agent) =>
    agent.id === id ? { ...agent, name: fields.name, channels: fields.channels } : agent,
  )
  persist()
  emit()
}

function deleteAgent(id: string): void {
  const next = agents.filter((agent) => agent.id !== id)
  if (next.length === agents.length) return
  agents = next
  persist()
  emit()
}

// Test seam: module state outlives a single test, so tests reset it explicitly.
export function resetRoster(next: RosterAgent[] = SEED_AGENTS): void {
  agents = next
  seq = maxIdSuffix(next.map((agent) => agent.id))
  emit()
}

export function useAgentRoster() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return useMemo(() => ({ agents: snapshot, createAgent, updateAgent, deleteAgent }), [snapshot])
}
