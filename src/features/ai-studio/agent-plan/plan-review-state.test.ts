import { describe, expect, it } from 'vitest'
import {
  GATING_SECTIONS,
  INITIAL_PLAN_REVIEW,
  approvalHint,
  canApprove,
  editCount,
  planReviewReducer,
  sectionChip,
} from './plan-review-state'

const reduce = (...actions: Parameters<typeof planReviewReducer>[1][]) =>
  actions.reduce(planReviewReducer, INITIAL_PLAN_REVIEW)

describe('planReviewReducer', () => {
  it('opens one section at a time', () => {
    const state = reduce({ type: 'toggle', section: 'overview' }, { type: 'toggle', section: 'agent' })
    expect(state.expanded).toBe('agent')
  })

  it('collapses the open section when it is toggled again', () => {
    const state = reduce({ type: 'toggle', section: 'overview' }, { type: 'toggle', section: 'overview' })
    expect(state.expanded).toBeNull()
  })

  it('marks a section reviewed by expanding it, and keeps it reviewed once collapsed', () => {
    const state = reduce({ type: 'toggle', section: 'overview' }, { type: 'toggle', section: 'overview' })
    expect(state.reviewed.overview).toBe(true)
    expect(state.reviewed.agent).toBe(false)
  })

  it('gates approval on the overview and the agent, not on impact or thinking', () => {
    expect(GATING_SECTIONS).toEqual(['overview', 'agent'])
    expect(canApprove(INITIAL_PLAN_REVIEW)).toBe(false)
    expect(canApprove(reduce({ type: 'toggle', section: 'overview' }))).toBe(false)
    expect(
      canApprove(reduce({ type: 'toggle', section: 'impact' }, { type: 'toggle', section: 'thinking' })),
    ).toBe(false)
    expect(
      canApprove(reduce({ type: 'toggle', section: 'overview' }, { type: 'toggle', section: 'agent' })),
    ).toBe(true)
  })

  it('names what is still unreviewed in the approval hint, and drops it once approvable', () => {
    expect(approvalHint(INITIAL_PLAN_REVIEW)).toBe('Review Plan overview and Agent to approve')
    expect(approvalHint(reduce({ type: 'toggle', section: 'overview' }))).toBe('Review Agent to approve')
    expect(
      approvalHint(reduce({ type: 'toggle', section: 'overview' }, { type: 'toggle', section: 'agent' })),
    ).toBeNull()
  })

  it('records an edit by field id and counts it once', () => {
    const state = reduce(
      { type: 'edit', fieldId: 'o1.title', text: 'Spot cancellation intent', original: 'Identify cancellation intent' },
      { type: 'edit', fieldId: 'o1.title', text: 'Spot the intent', original: 'Identify cancellation intent' },
    )
    expect(state.edits['o1.title']).toBe('Spot the intent')
    expect(editCount(state)).toBe(1)
  })

  it('does not count an edit that restores the original text', () => {
    const state = reduce(
      { type: 'edit', fieldId: 'o1.title', text: 'Changed', original: 'Identify cancellation intent' },
      { type: 'edit', fieldId: 'o1.title', text: 'Identify cancellation intent ', original: 'Identify cancellation intent' },
    )
    expect(state.edits['o1.title']).toBeUndefined()
    expect(editCount(state)).toBe(0)
  })

  it('re-opens the gate when changes are requested, and marks the touched sections', () => {
    const state = reduce(
      { type: 'toggle', section: 'overview' },
      { type: 'toggle', section: 'agent' },
      { type: 'requested-changes' },
    )
    expect(canApprove(state)).toBe(false)
    expect(state.updated).toMatchObject({ overview: true, agent: true, impact: false, thinking: false })
    expect(state.expanded).toBeNull()
  })

  it('clears the updated marker when the section is expanded again', () => {
    const state = reduce(
      { type: 'toggle', section: 'overview' },
      { type: 'toggle', section: 'agent' },
      { type: 'requested-changes' },
      { type: 'toggle', section: 'agent' },
    )
    expect(state.updated.agent).toBe(false)
    expect(state.updated.overview).toBe(true)
  })
})

describe('sectionChip', () => {
  it('is fixed on Impact and absent on AI thinking', () => {
    expect(sectionChip(INITIAL_PLAN_REVIEW, 'impact')).toBe('estimated')
    expect(sectionChip(INITIAL_PLAN_REVIEW, 'thinking')).toBeNull()
  })

  it('flips from needs-approval to reviewed, and shows updated over both', () => {
    expect(sectionChip(INITIAL_PLAN_REVIEW, 'agent')).toBe('needs-approval')
    const reviewed = reduce({ type: 'toggle', section: 'agent' }, { type: 'toggle', section: 'agent' })
    expect(sectionChip(reviewed, 'agent')).toBe('reviewed')
    const updated = planReviewReducer(reviewed, { type: 'requested-changes' })
    expect(sectionChip(updated, 'agent')).toBe('updated')
  })

  it('hides the chip on the open section, as the frame draws it', () => {
    const state = reduce({ type: 'toggle', section: 'impact' })
    expect(state.expanded).toBe('impact')
    expect(sectionChip(state, 'impact')).toBeNull()
  })
})
