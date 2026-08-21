// Which agents are on a self-improving plan.
//
// A module-level external store, not per-hook state: the assistant is mounted by
// RootLayout and the screens that read this by their routes, so separate copies
// would mean an approved plan never showing up on the screen behind the studio.
// Same idiom as agent-roster-store.ts.
//
// This records a *commitment* to improve an agent, not the improvement: no
// policy, action, knowledge content or metric is written anywhere. A fallback
// rate that dropped because a fix "applied" would be a fabricated metric.
//
// Persists across refreshes by design, unlike agent-store.ts which wipes its
// key at module load. An approved plan is sticky until localStorage is cleared.
import { useMemo, useSyncExternalStore } from 'react'
import type { ActiveImprovementPlan } from './self-improving-approval'

export const SELF_IMPROVEMENT_STORAGE_KEY = 'self-improvement-plans-v1'

type Plans = Record<string, ActiveImprovementPlan>

// Every field the render paths dereference is checked, not just the identity
// ones: this store never resets itself, so one bad entry would break the Agent
// Builder table and the Home health card on every load with no way out in the
// app. The counts are interpolated into a status string; the labels are rendered
// directly.
function isActivePlan(value: unknown): value is ActiveImprovementPlan {
  if (typeof value !== 'object' || value === null) return false
  const plan = value as Partial<ActiveImprovementPlan>
  return (
    typeof plan.agentName === 'string' &&
    typeof plan.agentId === 'string' &&
    typeof plan.weekLabel === 'string' &&
    typeof plan.stage === 'string' &&
    typeof plan.nextCheckIn === 'string' &&
    typeof plan.autoApplied === 'number' &&
    typeof plan.awaitingApproval === 'number'
  )
}

// Exported for the store's own test: the module-level load runs once at import,
// so this is the only way to exercise a corrupt payload.
export function loadPlansFromStorage(): Plans {
  try {
    const raw = window.localStorage?.getItem(SELF_IMPROVEMENT_STORAGE_KEY)
    if (raw === null || raw === undefined) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    const valid: Plans = {}
    for (const [agentId, value] of Object.entries(parsed)) {
      if (isActivePlan(value)) valid[agentId] = value
    }
    return valid
  } catch {
    return {}
  }
}

let plans: Plans = loadPlansFromStorage()
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
// same object until the store actually changes — never a fresh copy.
function getSnapshot(): Plans {
  return plans
}

function persist(): void {
  try {
    window.localStorage?.setItem(SELF_IMPROVEMENT_STORAGE_KEY, JSON.stringify(plans))
  } catch {
    // Storage unavailable or full — the in-memory plans are still correct.
  }
}

// Idempotent: an agent already on a plan keeps the plan it has. There is no way
// to un-approve outside resetSelfImprovementStore, which is deliberate — this
// phase has no pause, rollback or completion (spec Limitations).
export function activatePlan(plan: ActiveImprovementPlan): void {
  if (plans[plan.agentId]) return
  plans = { ...plans, [plan.agentId]: plan }
  persist()
  emit()
}

// Test seam: module state outlives a single test, so tests reset it explicitly.
export function resetSelfImprovementStore(next: Plans = {}): void {
  plans = next
  persist()
  emit()
}

export function useSelfImprovementPlans() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return useMemo(() => ({ plans: snapshot, activatePlan }), [snapshot])
}
