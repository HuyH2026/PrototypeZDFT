import { describe, expect, it } from 'vitest'
import { PASSWORD_RESET_PLAN, type ImprovementPlan } from './self-improving-data'
import {
  activePlanFromImprovementPlan,
  improvementTraceLines,
  IMPROVEMENT_TRACE_STEP_MS,
  IMPROVEMENT_TRACE_TOTAL_MS,
} from './self-improving-approval'

const active = activePlanFromImprovementPlan(PASSWORD_RESET_PLAN)

describe('activePlanFromImprovementPlan', () => {
  it('carries the agent it is about', () => {
    expect(active.agentName).toBe('Password Reset')
    expect(active.agentId).toBe('w8')
  })

  it('derives the week label from the plan, not from a string', () => {
    expect(active.weekLabel).toBe('Week 1 of 4')
  })

  it('composes the stage and the next check-in', () => {
    expect(active.stage).toBe('Week 1 — Immediate auto-fixes')
    expect(active.nextCheckIn).toBe('Auto-fix health review — Daily')
  })

  // 3 fixes in Week 1 + 1 in Weeks 3–4 are auto-applied; Week 2's 2 need a human.
  it('counts the fixes by their week chip', () => {
    expect(active.autoApplied).toBe(4)
    expect(active.awaitingApproval).toBe(2)
  })

  it('recounts rather than reports, when the plan changes', () => {
    const trimmed: ImprovementPlan = {
      ...PASSWORD_RESET_PLAN,
      weeks: [PASSWORD_RESET_PLAN.weeks[0]],
    }
    const short = activePlanFromImprovementPlan(trimmed)
    expect(short.autoApplied).toBe(3)
    expect(short.awaitingApproval).toBe(0)
    expect(short.weekLabel).toBe('Week 1 of 1')
  })
})

describe('improvementTraceLines', () => {
  it('narrates exactly what was written', () => {
    expect(improvementTraceLines(PASSWORD_RESET_PLAN)).toEqual([
      'Enabled monitoring on 6 health signals',
      'Applied 4 auto-fixes across Week 1 and Weeks 3–4',
      'Scheduled 4 check-ins, starting with the daily auto-fix health review',
      'Held 2 Week 2 changes for your approval',
    ])
  })

  it('takes its counts from the same derivation the store uses', () => {
    const lines = improvementTraceLines(PASSWORD_RESET_PLAN)
    expect(lines[1]).toContain(`${active.autoApplied} auto-fixes`)
    expect(lines[3]).toContain(`${active.awaitingApproval} Week 2`)
  })

  it('spans four steps of 600ms', () => {
    expect(IMPROVEMENT_TRACE_STEP_MS).toBe(600)
    expect(IMPROVEMENT_TRACE_TOTAL_MS).toBe(
      improvementTraceLines(PASSWORD_RESET_PLAN).length * IMPROVEMENT_TRACE_STEP_MS,
    )
  })
})
