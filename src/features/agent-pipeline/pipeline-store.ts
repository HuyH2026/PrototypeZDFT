// What the human decided about the loop's work: which pending tests they approved
// or declined, and whether they paused it.
//
// A module-level external store, not per-hook state — the header's pause control
// and the inbox's buttons sit in different subtrees and must see one truth. Same
// idiom as self-improvement-store.ts.
//
// It holds nothing the loop itself produced. Cycles, memory and lanes are
// authored or derived, so persisting them would create a second, staler copy.
import { useMemo, useSyncExternalStore } from 'react'
import type { Decisions, PipelineDecision } from './pipeline-data'

export const PIPELINE_STORAGE_KEY = 'agent-pipeline-v1'

export type PipelineState = {
  decisions: Decisions
  paused: boolean
}

const EMPTY: PipelineState = { decisions: {}, paused: false }

function isDecision(value: unknown): value is PipelineDecision {
  return (
    value === 'approved' || value === 'winner-ready' || value === 'applied' || value === 'rejected'
  )
}

// Every field the render paths read is checked. One bad entry would otherwise
// break the screen on every load with no way out from inside the app.
export function loadPipelineState(): PipelineState {
  try {
    const raw = window.localStorage?.getItem(PIPELINE_STORAGE_KEY)
    if (raw === null || raw === undefined) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return EMPTY
    const candidate = parsed as { decisions?: unknown; paused?: unknown }
    const decisions: Decisions = {}
    if (typeof candidate.decisions === 'object' && candidate.decisions !== null) {
      for (const [id, value] of Object.entries(candidate.decisions)) {
        if (isDecision(value)) decisions[id] = value
      }
    }
    return { decisions, paused: candidate.paused === true }
  } catch {
    return EMPTY
  }
}

let state: PipelineState = loadPipelineState()
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
function getSnapshot(): PipelineState {
  return state
}

function persist(): void {
  try {
    window.localStorage?.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable or full — the in-memory state is still correct.
  }
}

function commit(next: PipelineState): void {
  state = next
  persist()
  emit()
}

export function decide(changeId: string, decision: PipelineDecision): void {
  commit({ ...state, decisions: { ...state.decisions, [changeId]: decision } })
}

/** Return a declined proposal to Pending asks without disturbing other decisions. */
export function reconsider(changeId: string): void {
  if (state.decisions[changeId] !== 'rejected') return
  const decisions = { ...state.decisions }
  delete decisions[changeId]
  commit({ ...state, decisions })
}

export function setPaused(next: boolean): void {
  commit({ ...state, paused: next })
}

/** Test seam: module state outlives a single test. */
export function resetPipelineStore(next: PipelineState = EMPTY): void {
  commit(next)
}

export function usePipelineStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return useMemo(
    () => ({
      decisions: snapshot.decisions,
      paused: snapshot.paused,
      decide,
      reconsider,
      setPaused,
    }),
    [snapshot],
  )
}
