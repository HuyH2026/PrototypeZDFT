// The plan panel's review state: which section is open, which have been read,
// which the assistant has since changed, and the user's inline edits. One pure
// reducer so the rules are unit-tested without jsdom; AgentPlanFlow feeds it
// with useReducer.
import { SECTION_LABEL, type PlanSectionKey } from './agent-plan-data'

export type PlanChip = 'needs-approval' | 'reviewed' | 'updated' | 'estimated'

export type PlanReviewState = {
  // Single-open, as every frame draws it.
  expanded: PlanSectionKey | null
  reviewed: Record<PlanSectionKey, boolean>
  updated: Record<PlanSectionKey, boolean>
  // fieldId → text. Only fields that actually differ from the plan are kept, so
  // "3 edits" can never count a field the user retyped identically.
  edits: Record<string, string>
}

export type PlanReviewAction =
  | { type: 'toggle'; section: PlanSectionKey }
  | { type: 'edit'; fieldId: string; text: string; original: string }
  | { type: 'requested-changes' }

// Impact never gates: it is an estimate, not a commitment. AI thinking never
// gates: it is a record of reasoning, not an input.
export const GATING_SECTIONS: readonly PlanSectionKey[] = ['overview', 'agent']

const NO_FLAGS: Record<PlanSectionKey, boolean> = {
  overview: false,
  impact: false,
  agent: false,
  thinking: false,
}

export const INITIAL_PLAN_REVIEW: PlanReviewState = {
  expanded: null,
  reviewed: NO_FLAGS,
  updated: NO_FLAGS,
  edits: {},
}

export function planReviewReducer(state: PlanReviewState, action: PlanReviewAction): PlanReviewState {
  switch (action.type) {
    case 'toggle': {
      const opening = state.expanded !== action.section
      return {
        ...state,
        expanded: opening ? action.section : null,
        // Reading a section is what marks it reviewed — there is no separate
        // "mark as reviewed" control in any frame.
        reviewed: opening ? { ...state.reviewed, [action.section]: true } : state.reviewed,
        updated: opening ? { ...state.updated, [action.section]: false } : state.updated,
      }
    }
    case 'edit': {
      const edits = { ...state.edits }
      if (action.text.trim() === action.original.trim()) delete edits[action.fieldId]
      else edits[action.fieldId] = action.text
      return { ...state, edits }
    }
    case 'requested-changes': {
      // The assistant rewrote these two sections, so the gate re-opens: what was
      // reviewed was a different plan.
      const touched: PlanSectionKey[] = ['overview', 'agent']
      const reviewed = { ...state.reviewed }
      const updated = { ...state.updated }
      for (const section of touched) {
        reviewed[section] = false
        updated[section] = true
      }
      return { ...state, expanded: null, reviewed, updated }
    }
  }
}

export function canApprove(state: PlanReviewState): boolean {
  return GATING_SECTIONS.every((section) => state.reviewed[section])
}

export function editCount(state: PlanReviewState): number {
  return Object.keys(state.edits).length
}

// Derived, never authored. Nothing shows on the open section: the frame puts the
// chip only on collapsed rows (1:173843).
export function sectionChip(state: PlanReviewState, section: PlanSectionKey): PlanChip | null {
  if (state.expanded === section) return null
  if (section === 'thinking') return null
  if (section === 'impact') return 'estimated'
  if (state.updated[section]) return 'updated'
  return state.reviewed[section] ? 'reviewed' : 'needs-approval'
}

// The reason under a disabled Approve button, so it is never a dead control.
export function approvalHint(state: PlanReviewState): string | null {
  const missing = GATING_SECTIONS.filter((section) => !state.reviewed[section]).map((s) => SECTION_LABEL[s])
  if (missing.length === 0) return null
  const names = missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}`
  return `Review ${names} to approve`
}

// How a section talks to the reducer for one editable field. `resolve` reads the
// current value (edit or authored), `onEdit` commits on blur with the original in
// hand so an unchanged retype is not counted as an edit.
export type PlanEditHandlers = {
  resolve: (fieldId: string, original: string) => string
  onEdit: (fieldId: string, text: string, original: string) => void
}
