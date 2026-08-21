// Every count the screen renders comes from here, so no component can compute a
// total of its own and disagree with its neighbour.
import {
  LANES,
  laneFor,
  TOTAL_CYCLES,
  type Change,
  type Cycle,
  type Decisions,
  type MemoryEntry,
  type OutcomeLane,
} from './pipeline-data'

/**
 * Which lane a change sits in once the human has had their say.
 * `null` means no lane at all — a rejected change was never applied, so
 * counting it anywhere would overstate what the loop did.
 */
export function effectiveLane(change: Change, decisions: Decisions): OutcomeLane | null {
  const lane = laneFor(change.gate)
  // A decision only means anything for a change that was held for one.
  if (lane !== 'held') return lane
  const decision = decisions[change.id]
  if (decision === 'approved') return 'testing'
  if (decision === 'winner-ready') return 'held'
  if (decision === 'applied') return 'deployed'
  if (decision === 'rejected') return null
  return 'held'
}

export function laneCounts(changes: Change[], decisions: Decisions): Record<OutcomeLane, number> {
  const counts = Object.fromEntries(LANES.map((lane) => [lane, 0])) as Record<OutcomeLane, number>
  for (const change of changes) {
    const lane = effectiveLane(change, decisions)
    if (lane !== null) counts[lane] += 1
  }
  return counts
}

export function heldChanges(changes: Change[], decisions: Decisions): Change[] {
  return changes.filter(
    (change) => laneFor(change.gate) === 'held' && decisions[change.id] === undefined,
  )
}

export function activeExperimentChanges(changes: Change[], decisions: Decisions): Change[] {
  return changes.filter((change) => {
    if (laneFor(change.gate) !== 'held') return false
    const decision = decisions[change.id]
    return decision === 'approved' || decision === 'winner-ready'
  })
}

export function changesForCycle(cycle: Cycle, changes: Change[]): Change[] {
  return cycle.changeIds
    .map((id) => changes.find((change) => change.id === id))
    .filter((change): change is Change => change !== undefined)
}

function cycleOrdinalFor(changeId: string, cycles: Cycle[]): number {
  return cycles.find((cycle) => cycle.changeIds.includes(changeId))?.ordinal ?? TOTAL_CYCLES
}

/**
 * Memory, plus anything the human turned down. A preference is retained as a
 * customer constraint, not misrepresented as experimental evidence.
 */
export function memoryWithDecisions(
  entries: MemoryEntry[],
  changes: Change[],
  decisions: Decisions,
  cycles: Cycle[],
): MemoryEntry[] {
  const rejected = changes.filter((change) => decisions[change.id] === 'rejected')
  const rememberedChangeIds = new Set(
    entries.flatMap((entry) => (entry.changeId === undefined ? [] : [entry.changeId])),
  )
  const applied = changes.filter(
    (change) => decisions[change.id] === 'applied' && !rememberedChangeIds.has(change.id),
  )
  if (rejected.length === 0 && applied.length === 0) return entries
  return [
    ...rejected.map((change) => ({
      id: `declined-${change.id}`,
      title: change.title,
      agentName: change.agentName,
      triedInCycle: cycleOrdinalFor(change.id, cycles),
      outcome: 'Declined before any test or application',
      verdict: 'declined' as const,
      retryLabel: 'Saved as a customer constraint until you revisit it',
    })),
    ...applied.map((change) => ({
      id: `monitoring-${change.id}`,
      title: change.title,
      agentName: change.agentName,
      triedInCycle: cycleOrdinalFor(change.id, cycles),
      outcome: 'Winner published; outcome measurement is pending',
      verdict: 'working' as const,
      retryLabel: 'Monitoring before this becomes an accepted pattern',
      changeId: change.id,
    })),
    ...entries,
  ]
}
