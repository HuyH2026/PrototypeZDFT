import { describe, expect, it } from 'vitest'
import { activePlanFromImprovementPlan } from '@/features/ai-studio/self-improving/self-improving-approval'
import { PASSWORD_RESET_PLAN } from '@/features/ai-studio/self-improving/self-improving-data'
import { ALL_CHANGES, CYCLES, MEMORY, laneFor, type Decisions } from './pipeline-data'
import {
  activeExperimentChanges,
  changesForCycle,
  effectiveLane,
  heldChanges,
  laneCounts,
  memoryWithDecisions,
} from './pipeline-selectors'

const NONE: Decisions = {}

describe('effectiveLane', () => {
  it('follows the gate while a change is undecided', () => {
    for (const change of ALL_CHANGES) {
      expect(effectiveLane(change, NONE)).toBe(laneFor(change.gate))
    }
  })

  it('moves an approved held proposal into testing', () => {
    expect(effectiveLane(held()[0], { [held()[0].id]: 'approved' })).toBe('testing')
  })

  it('holds a completed winner for publication, then moves an applied winner to Applied', () => {
    const change = held()[0]
    expect(effectiveLane(change, { [change.id]: 'winner-ready' })).toBe('held')
    expect(effectiveLane(change, { [change.id]: 'applied' })).toBe('deployed')
  })

  it('removes a rejected held change from every lane', () => {
    expect(effectiveLane(held()[0], { [held()[0].id]: 'rejected' })).toBeNull()
  })

  it('ignores a decision on a change that was never held', () => {
    const deployed = ALL_CHANGES.find((change) => laneFor(change.gate) === 'deployed')!
    expect(effectiveLane(deployed, { [deployed.id]: 'rejected' })).toBe('deployed')
  })
})

function held() {
  return heldChanges(ALL_CHANGES, NONE)
}

describe('laneCounts', () => {
  it('derives every lane from the gates, never from a literal', () => {
    const counts = laneCounts(ALL_CHANGES, NONE)
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0)
    expect(total).toBe(ALL_CHANGES.length)
    for (const lane of ['deployed', 'testing', 'held', 'rolled-back'] as const) {
      expect(counts[lane]).toBe(
        ALL_CHANGES.filter((change) => laneFor(change.gate) === lane).length,
      )
    }
  })

  it('moves one from Pending asks to Experiment running when a test is approved', () => {
    const before = laneCounts(ALL_CHANGES, NONE)
    const after = laneCounts(ALL_CHANGES, { [held()[0].id]: 'approved' })
    expect(after.held).toBe(before.held - 1)
    expect(after.testing).toBe(before.testing + 1)
  })

  it('drops the total when a change is rejected', () => {
    const before = laneCounts(ALL_CHANGES, NONE)
    const after = laneCounts(ALL_CHANGES, { [held()[0].id]: 'rejected' })
    expect(after.held).toBe(before.held - 1)
    expect(after.deployed).toBe(before.deployed)
  })
})

describe('heldChanges', () => {
  it('agrees with the plan the AI Studio panel approves', () => {
    expect(heldChanges(ALL_CHANGES, NONE)).toHaveLength(
      activePlanFromImprovementPlan(PASSWORD_RESET_PLAN).awaitingApproval,
    )
  })

  it('empties once every held change is decided', () => {
    const decisions: Decisions = {}
    for (const change of heldChanges(ALL_CHANGES, NONE)) decisions[change.id] = 'approved'
    expect(heldChanges(ALL_CHANGES, decisions)).toHaveLength(0)
  })

  it('contains only undecided proposals, not winner-ready publication asks', () => {
    const [first, second] = held()
    const decisions: Decisions = {
      [first.id]: 'winner-ready',
      [second.id]: 'applied',
    }

    expect(heldChanges(ALL_CHANGES, decisions)).toEqual([])
  })
})

describe('activeExperimentChanges', () => {
  it('keeps running and winner-ready experiments active until application', () => {
    const [running, ready] = held()
    const decisions: Decisions = {
      [running.id]: 'approved',
      [ready.id]: 'winner-ready',
    }

    expect(activeExperimentChanges(ALL_CHANGES, decisions).map((change) => change.id)).toEqual([
      running.id,
      ready.id,
    ])
    expect(
      activeExperimentChanges(ALL_CHANGES, { ...decisions, [running.id]: 'applied' }).map(
        (change) => change.id,
      ),
    ).toEqual([ready.id])
  })

  it('ignores lifecycle-shaped decisions on changes that were never pending asks', () => {
    const directChange = ALL_CHANGES.find((change) => laneFor(change.gate) === 'deployed')!

    expect(activeExperimentChanges(ALL_CHANGES, { [directChange.id]: 'approved' })).toEqual([])
  })
})

describe('changesForCycle', () => {
  it('resolves a cycle’s change ids in order', () => {
    const cycle = CYCLES[0]
    expect(changesForCycle(cycle, ALL_CHANGES).map((change) => change.id)).toEqual(cycle.changeIds)
  })

  it('returns nothing for a cycle that took no action', () => {
    const quiet = CYCLES.find((cycle) => cycle.changeIds.length === 0)!
    expect(changesForCycle(quiet, ALL_CHANGES)).toEqual([])
  })
})

describe('memoryWithDecisions', () => {
  it('leaves memory alone when nothing has been rejected', () => {
    expect(memoryWithDecisions(MEMORY, ALL_CHANGES, NONE, CYCLES)).toEqual(MEMORY)
  })

  it('records a rejection as a customer constraint, not experimental evidence', () => {
    const change = held()[0]
    const entries = memoryWithDecisions(MEMORY, ALL_CHANGES, { [change.id]: 'rejected' }, CYCLES)
    expect(entries).toHaveLength(MEMORY.length + 1)
    const added = entries.find((entry) => entry.title === change.title)
    expect(added).toMatchObject({
      verdict: 'declined',
      agentName: change.agentName,
      triedInCycle: 148,
    })
    expect(added?.outcome).toContain('Declined')
    expect(added?.retryLabel).toContain('customer constraint')
  })

  it('does not record an approval', () => {
    const change = held()[0]
    expect(memoryWithDecisions(MEMORY, ALL_CHANGES, { [change.id]: 'approved' }, CYCLES)).toEqual(
      MEMORY,
    )
  })

  it('records a published winner as monitoring until outcome measurement arrives', () => {
    const change = held()[0]
    const entries = memoryWithDecisions(MEMORY, ALL_CHANGES, { [change.id]: 'applied' }, CYCLES)
    const added = entries.find((entry) => entry.id === `monitoring-${change.id}`)

    expect(added).toMatchObject({
      verdict: 'working',
      changeId: change.id,
      outcome: 'Winner published; outcome measurement is pending',
    })
    expect(added?.retryLabel).toContain('Monitoring')
  })

  it('does not duplicate a change already represented in authored memory', () => {
    const remembered = MEMORY.find((entry) => entry.changeId !== undefined)!
    expect(
      memoryWithDecisions(MEMORY, ALL_CHANGES, { [remembered.changeId!]: 'applied' }, CYCLES),
    ).toEqual(MEMORY)
  })
})
