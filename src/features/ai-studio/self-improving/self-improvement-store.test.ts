import { beforeEach, describe, expect, it } from 'vitest'
import { PASSWORD_RESET_PLAN } from './self-improving-data'
import { activePlanFromImprovementPlan } from './self-improving-approval'
import {
  activatePlan,
  loadPlansFromStorage,
  resetSelfImprovementStore,
  SELF_IMPROVEMENT_STORAGE_KEY,
} from './self-improvement-store'

const active = activePlanFromImprovementPlan(PASSWORD_RESET_PLAN)

describe('self-improvement-store', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetSelfImprovementStore()
  })

  it('starts empty', () => {
    expect(loadPlansFromStorage()).toEqual({})
  })

  it('keys an activated plan by its agent id', () => {
    activatePlan(active)
    expect(loadPlansFromStorage()).toEqual({ w8: active })
  })

  it('persists the plan to localStorage', () => {
    activatePlan(active)
    const raw = window.localStorage.getItem(SELF_IMPROVEMENT_STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toEqual({ w8: active })
  })

  // Approving twice for the same agent is idempotent: the panel's own ref stops
  // the second write, and so does this.
  it('does not overwrite an agent already on a plan', () => {
    activatePlan(active)
    activatePlan({ ...active, weekLabel: 'Week 3 of 4' })
    expect(loadPlansFromStorage().w8.weekLabel).toBe('Week 1 of 4')
  })

  it('falls back to empty rather than throwing on a corrupt payload', () => {
    window.localStorage.setItem(SELF_IMPROVEMENT_STORAGE_KEY, 'not json at all')
    expect(loadPlansFromStorage()).toEqual({})
  })

  it('drops an entry that is missing a field the screens read', () => {
    window.localStorage.setItem(
      SELF_IMPROVEMENT_STORAGE_KEY,
      JSON.stringify({ w8: active, w9: { agentId: 'w9' } }),
    )
    expect(Object.keys(loadPlansFromStorage())).toEqual(['w8'])
  })

  it('seeds directly for a test', () => {
    resetSelfImprovementStore({ w8: active })
    expect(loadPlansFromStorage()).toEqual({ w8: active })
    resetSelfImprovementStore()
    expect(loadPlansFromStorage()).toEqual({})
  })
})
