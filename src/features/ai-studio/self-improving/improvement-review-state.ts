// The self-improving panel's review state: which section is open and which have
// been read. One pure reducer so the rules are unit-tested without jsdom;
// SelfImprovingFlow feeds it with useReducer.
//
// Smaller than agent-plan's plan-review-state by three things this flow does not
// have: inline edits (the plan reports measurements, so it is read-only), an
// "updated" flag and a 'requested-changes' action (there is no Ask for changes).
import { SECTION_LABEL, type ImprovementSectionKey } from './self-improving-data'

export type ImprovementReviewState = {
  // Single-open, as every frame draws it.
  expanded: ImprovementSectionKey | null
  reviewed: Record<ImprovementSectionKey, boolean>
}

export type ImprovementReviewAction = { type: 'toggle'; section: ImprovementSectionKey }

// Agent health evaluation is the diagnosis you are accepting; Self-improving
// plan is the set of changes you are authorising. The other four describe the
// mechanism and how it runs once approved, so they do not gate.
export const GATING_SECTIONS: readonly ImprovementSectionKey[] = ['health', 'plan']

const NO_FLAGS: Record<ImprovementSectionKey, boolean> = {
  overview: false,
  health: false,
  plan: false,
  monitor: false,
  validate: false,
  guardrails: false,
}

export const INITIAL_IMPROVEMENT_REVIEW: ImprovementReviewState = {
  expanded: null,
  reviewed: NO_FLAGS,
}

export function improvementReviewReducer(
  state: ImprovementReviewState,
  action: ImprovementReviewAction,
): ImprovementReviewState {
  switch (action.type) {
    case 'toggle': {
      const opening = state.expanded !== action.section
      return {
        expanded: opening ? action.section : null,
        // Reading a section is what marks it reviewed — there is no separate
        // "mark as reviewed" control in any frame.
        reviewed: opening ? { ...state.reviewed, [action.section]: true } : state.reviewed,
      }
    }
  }
}

export function canApprove(state: ImprovementReviewState): boolean {
  return GATING_SECTIONS.every((section) => state.reviewed[section])
}

// The reason under a disabled Approve button, so it is never a dead control. The
// frames draw the button enabled from the start; this is the same deliberate
// deviation the create-agent panel already makes.
export function approvalHint(state: ImprovementReviewState): string | null {
  const missing = GATING_SECTIONS.filter((section) => !state.reviewed[section]).map(
    (section) => SECTION_LABEL[section],
  )
  if (missing.length === 0) return null
  const names =
    missing.length === 1
      ? missing[0]
      : `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}`
  return `Review ${names} to approve`
}
