import { describe, expect, it } from 'vitest'
import { seedAgents } from '@/features/ai-agents/agent-store'
import { activePlanFromImprovementPlan } from '@/features/ai-studio/self-improving/self-improving-approval'
import { PASSWORD_RESET_PLAN } from '@/features/ai-studio/self-improving/self-improving-data'
import {
  ALL_CHANGES,
  changesFromPlan,
  CYCLES,
  GATE_LABEL,
  GATE_LANE,
  LANES,
  LANE_LABEL,
  laneFor,
  LOOP,
  MEMORY,
  TOTAL_CYCLES,
  type GateKey,
} from './pipeline-data'

describe('gates and lanes', () => {
  it('routes each gate to exactly one lane', () => {
    expect(laneFor('under-20-percent')).toBe('deployed')
    expect(laneFor('new-api-call')).toBe('held')
    expect(laneFor('core-flow')).toBe('held')
    expect(laneFor('metric-regression')).toBe('rolled-back')
    expect(laneFor('experiment')).toBe('testing')
  })

  it('draws the four lanes in the diagram’s top-to-bottom order', () => {
    expect(LANES).toEqual(['deployed', 'testing', 'held', 'rolled-back'])
    expect(LANES.map((lane) => LANE_LABEL[lane])).toEqual([
      'Applied',
      'Experiment running',
      'Pending asks',
      'Rolled back',
    ])
  })

  it('labels every gate, so a lane can always explain itself', () => {
    const keys = Object.keys(GATE_LANE) as GateKey[]
    expect(keys).toHaveLength(5)
    for (const key of keys) {
      expect(GATE_LABEL[key]).toBeTruthy()
    }
  })
})

describe('changesFromPlan', () => {
  const changes = changesFromPlan(PASSWORD_RESET_PLAN)
  const fixes = PASSWORD_RESET_PLAN.weeks.flatMap((week) => week.fixes)

  it('produces one change per fix, in plan order, all keyed to the plan’s agent', () => {
    expect(changes.map((change) => change.id)).toEqual(fixes.map((fix) => fix.id))
    expect(new Set(changes.map((change) => change.agentId))).toEqual(new Set(['w8']))
    expect(new Set(changes.map((change) => change.agentName))).toEqual(new Set(['Password Reset']))
  })

  it('imports the plan’s wording rather than restating it', () => {
    for (const fix of fixes) {
      const change = changes.find((candidate) => candidate.id === fix.id)
      expect(change?.title).toBe(fix.title)
      expect(change?.description).toBe(fix.description)
    }
  })

  it('holds exactly the fixes the plan chipped needs-approval', () => {
    for (const week of PASSWORD_RESET_PLAN.weeks) {
      for (const fix of week.fixes) {
        const change = changes.find((candidate) => candidate.id === fix.id)
        expect(change).toBeDefined()
        expect(laneFor(change!.gate) === 'held').toBe(week.chip === 'needs-approval')
      }
    }
  })

  it('agrees with the plan the AI Studio panel approves', () => {
    const active = activePlanFromImprovementPlan(PASSWORD_RESET_PLAN)
    const held = changes.filter((change) => laneFor(change.gate) === 'held')
    expect(held).toHaveLength(active.awaitingApproval)
    expect(held).toHaveLength(2)
  })

  it('reports a measured effect only where a change has shipped', () => {
    for (const change of changes) {
      if (laneFor(change.gate) === 'deployed') {
        expect(change.effect).toBeDefined()
      } else {
        expect(change.effect).toBeUndefined()
      }
    }
  })

  it('gives every change a rationale and a blast radius', () => {
    for (const change of changes) {
      expect(change.rationale.length).toBeGreaterThan(20)
      expect(change.blastRadius).toBeTruthy()
    }
  })
})

describe('the authored dataset', () => {
  it('fills all four lanes, so no lane renders permanently empty', () => {
    const lanes = new Set(ALL_CHANGES.map((change) => laneFor(change.gate)))
    expect(lanes).toEqual(new Set(['deployed', 'testing', 'held', 'rolled-back']))
  })

  it('gives every change a unique id', () => {
    expect(new Set(ALL_CHANGES.map((change) => change.id)).size).toBe(ALL_CHANGES.length)
  })

  it('touches more than one agent — the loop manages a fleet', () => {
    expect(new Set(ALL_CHANGES.map((change) => change.agentId)).size).toBeGreaterThan(4)
  })

  it('lists cycles newest first, as a window onto a longer history', () => {
    expect(CYCLES).toHaveLength(6)
    const ordinals = CYCLES.map((cycle) => cycle.ordinal)
    expect(ordinals).toEqual([...ordinals].sort((a, b) => b - a))
    expect(ordinals[0]).toBe(TOTAL_CYCLES)
    expect(TOTAL_CYCLES).toBeGreaterThan(CYCLES.length)
  })

  it('resolves every id a cycle references', () => {
    const changeIds = new Set(ALL_CHANGES.map((change) => change.id))
    const memoryIds = new Set(MEMORY.map((entry) => entry.id))
    for (const cycle of CYCLES) {
      expect(cycle.journal.length).toBeGreaterThan(0)
      for (const id of cycle.changeIds) expect(changeIds.has(id)).toBe(true)
      for (const id of cycle.recalled) expect(memoryIds.has(id)).toBe(true)
    }
  })

  it('attributes the plan’s changes to the cycle that produced them', () => {
    const planCycle = CYCLES.find((cycle) => cycle.changeIds.includes('if4'))
    expect(planCycle).toBeDefined()
    expect(planCycle!.changeIds).toContain('if5')
  })

  it('records both a verdict and a retry label for every memory entry', () => {
    expect(MEMORY.length).toBeGreaterThanOrEqual(5)
    for (const entry of MEMORY) {
      expect(['ruled-out', 'working']).toContain(entry.verdict)
      expect(entry.retryLabel).toBeTruthy()
      expect(entry.outcome).toBeTruthy()
    }
    expect(MEMORY.some((entry) => entry.verdict === 'ruled-out')).toBe(true)
    expect(MEMORY.some((entry) => entry.verdict === 'working')).toBe(true)
  })

  it('describes the loop without computing a date', () => {
    expect(LOOP.scheduleLabel).toBeTruthy()
    expect(LOOP.nextWakeLabel).toBeTruthy()
    expect(LOOP.signals).toBe(6)
  })

  it('assesses the whole seeded fleet, so no cycle can claim a stale count', () => {
    for (const cycle of CYCLES) expect(cycle.assessed).toBe(seedAgents().length)
  })

  it('keeps a linked memory outcome in step with the effect it describes', () => {
    const linked = MEMORY.filter((entry) => entry.changeId !== undefined)
    expect(linked).toHaveLength(3)
    for (const entry of linked) {
      const change = ALL_CHANGES.find((candidate) => candidate.id === entry.changeId)
      expect(change?.effect).toBeDefined()
      expect(entry.outcome).toContain(change!.effect!.from)
      expect(entry.outcome).toContain(change!.effect!.to)
      expect(entry.outcome).toContain(change!.effect!.window)
    }
  })
})
