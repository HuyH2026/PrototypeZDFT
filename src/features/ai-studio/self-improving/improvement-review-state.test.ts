import { describe, expect, it } from 'vitest'
import {
  approvalHint,
  canApprove,
  GATING_SECTIONS,
  improvementReviewReducer,
  INITIAL_IMPROVEMENT_REVIEW,
  type ImprovementReviewState,
} from './improvement-review-state'
import type { ImprovementSectionKey } from './self-improving-data'

const open = (state: ImprovementReviewState, section: ImprovementSectionKey) =>
  improvementReviewReducer(state, { type: 'toggle', section })

describe('improvement-review-state', () => {
  it('starts collapsed with nothing reviewed', () => {
    expect(INITIAL_IMPROVEMENT_REVIEW.expanded).toBeNull()
    expect(Object.values(INITIAL_IMPROVEMENT_REVIEW.reviewed).every((read) => !read)).toBe(true)
  })

  it('gates on the diagnosis and the changes being authorised', () => {
    expect(GATING_SECTIONS).toEqual(['health', 'plan'])
  })

  it('opens one section at a time', () => {
    const first = open(INITIAL_IMPROVEMENT_REVIEW, 'health')
    expect(first.expanded).toBe('health')
    const second = open(first, 'guardrails')
    expect(second.expanded).toBe('guardrails')
  })

  it('collapses the open section when it is toggled again', () => {
    const state = open(open(INITIAL_IMPROVEMENT_REVIEW, 'health'), 'health')
    expect(state.expanded).toBeNull()
    // Still read: collapsing does not un-read it.
    expect(state.reviewed.health).toBe(true)
  })

  it('marks a section read by expanding it', () => {
    expect(open(INITIAL_IMPROVEMENT_REVIEW, 'monitor').reviewed.monitor).toBe(true)
  })

  it('withholds approval until both gating sections are read', () => {
    expect(canApprove(INITIAL_IMPROVEMENT_REVIEW)).toBe(false)
    const health = open(INITIAL_IMPROVEMENT_REVIEW, 'health')
    expect(canApprove(health)).toBe(false)
    expect(canApprove(open(health, 'plan'))).toBe(true)
  })

  it('is unaffected by the four non-gating sections', () => {
    let state = INITIAL_IMPROVEMENT_REVIEW
    for (const section of ['overview', 'monitor', 'validate', 'guardrails'] as const) {
      state = open(state, section)
    }
    expect(canApprove(state)).toBe(false)
  })

  it('names exactly what is missing', () => {
    expect(approvalHint(INITIAL_IMPROVEMENT_REVIEW)).toBe(
      'Review Agent health evaluation and Self-improving plan to approve',
    )
    const health = open(INITIAL_IMPROVEMENT_REVIEW, 'health')
    expect(approvalHint(health)).toBe('Review Self-improving plan to approve')
    expect(approvalHint(open(health, 'plan'))).toBeNull()
  })
})
