// The channel between the AI Studio assistant and the Home dashboard.
//
// AI Studio is the driver: the user asks for a dashboard in the assistant's
// composer, and Home renders the result. The two live in different subtrees (the
// assistant is mounted by AppLayout, Home by the route), so neither can hold the
// other's state — this module is the small external store they share, in the same
// backend-free spirit as views-store.
//
// Deliberately not React context: the assistant must be able to publish a request
// whether or not Home happens to be mounted, and Home must be able to read the
// latest request without the assistant re-rendering it.
//
// `intent` is how the assistant asks for something without owning it. Home stays
// the only writer of its saved views: it watches the request and reacts —
// 'preview' shows the layout unsaved, 'apply' commits it as a new view.
import type { NewView } from './views-store'

export type DashboardRequest = {
  // What the user typed (or the prefill they accepted), kept so the assistant can
  // echo the request back above its answer.
  prompt: string
  view: NewView
  intent: 'preview' | 'apply'
}

let current: DashboardRequest | null = null
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

export function subscribeDashboardRequest(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// useSyncExternalStore compares snapshots by identity, so this must return the
// same object until the request actually changes — never a fresh copy.
export function getDashboardRequest(): DashboardRequest | null {
  return current
}

// Ask Home to show a layout without saving it.
export function previewDashboard(request: { prompt: string; view: NewView }): void {
  current = { ...request, intent: 'preview' }
  emit()
}

// Ask Home to commit the layout it is previewing. No-op with nothing pending, so
// a stray Apply can't invent a view out of nothing.
export function applyDashboard(): void {
  if (current === null || current.intent === 'apply') return
  current = { ...current, intent: 'apply' }
  emit()
}

// Drops the pending request — used both by Discard and by Home once it has
// committed an 'apply', so a later remount doesn't resurrect a dealt-with preview.
export function clearDashboardRequest(): void {
  if (current === null) return
  current = null
  emit()
}
