// Every wake the loop has had, newest first. Selecting a row repositions the
// hero to that cycle — which is what keeps the diagram historical rather than
// decorative (agent-pipeline spec, Decision 5).
import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/flora/Card'
import { cn } from '@/lib/cn'
import {
  LANE_LABEL,
  LANES,
  type Change,
  type Cycle,
  type Decisions,
  type MemoryEntry,
  type OutcomeLane,
  type PipelineDecision,
  laneFor,
} from './pipeline-data'
import { changesForCycle } from './pipeline-selectors'

export type CycleLogProps = {
  cycles: Cycle[]
  totalCycles: number
  changes: Change[]
  memory: MemoryEntry[]
  decisions: Decisions
  selectedId: string
  onSelect: (cycleId: string) => void
}

const VERDICT_LABEL: Record<MemoryEntry['verdict'], string> = {
  'ruled-out': 'Ruled out',
  working: 'Working',
  declined: 'Declined',
}

// What the operator consulted before deciding, resolved against the raw
// memory ledger — a cycle is history, so this must never be affected by a
// decision the human makes on the screen today.
function recalledEntries(cycle: Cycle, memory: MemoryEntry[]): MemoryEntry[] {
  return cycle.recalled
    .map((id) => memory.find((entry) => entry.id === id))
    .filter((entry): entry is MemoryEntry => entry !== undefined)
}

const CHIP_TINT: Record<OutcomeLane, string> = {
  deployed: 'bg-[#ddf0c9] text-[#25390f]',
  testing: 'bg-[#e4eaf6] text-[#1f335a]',
  held: 'bg-[#f6eba6] text-[#6b5300]',
  'rolled-back': 'bg-[#f7e5e6] text-[#5f1c20]',
}

function laneTally(cycleChanges: Change[]): { lane: OutcomeLane; count: number }[] {
  const tally = new Map<OutcomeLane, number>()
  for (const change of cycleChanges) {
    const lane = laneFor(change.gate)
    tally.set(lane, (tally.get(lane) ?? 0) + 1)
  }
  return LANES.map((lane) => ({ lane, count: tally.get(lane) ?? 0 })).filter(
    (entry) => entry.count > 0,
  )
}

const DECISION_EVENT: Record<PipelineDecision, (change: Change) => string> = {
  approved: (change) => `${change.title}: guarded experiment authorized after cycle close`,
  'winner-ready': (change) => `${change.title}: test complete, winner ready to publish`,
  applied: (change) => `${change.title}: winner published and change applied`,
  rejected: (change) => `${change.title}: proposal declined and saved as a constraint`,
}

function decisionEvents(changes: Change[], decisions: Decisions): string[] {
  return changes.flatMap((change) => {
    const decision = decisions[change.id]
    return decision === undefined ? [] : [DECISION_EVENT[decision](change)]
  })
}

export function CycleLog({
  cycles,
  totalCycles,
  changes,
  memory,
  decisions,
  selectedId,
  onSelect,
}: CycleLogProps) {
  return (
    <Card data-testid="cycle-log" className="px-6 py-5">
      <h3 className="text-[13px] text-ink-muted">
        Last {cycles.length} cycles · {totalCycles} total
      </h3>
      <ul className="mt-3 flex flex-col">
        {cycles.map((cycle) => {
          const expanded = cycle.id === selectedId
          const cycleChanges = changesForCycle(cycle, changes)
          const currentDecisions = cycle.id === cycles[0].id ? decisions : {}
          const events = decisionEvents(cycleChanges, currentDecisions)
          return (
            <li
              key={cycle.id}
              data-testid={`cycle-row-${cycle.id}`}
              className="border-t border-surface-border first:border-t-0"
            >
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => onSelect(cycle.id)}
                className="flex w-full items-center gap-3 py-3 text-left"
              >
                <span className="font-mono text-[13px] text-ink">#{cycle.ordinal}</span>
                <span className="text-[13px] text-ink-muted">{cycle.whenLabel}</span>
                <span className="text-[12px] text-grey-600">
                  assessed {cycle.assessed} · {cycle.signals} signals
                </span>
                <span className="ml-auto flex items-center gap-2">
                  {laneTally(cycleChanges).map(({ lane, count }) => (
                    <span
                      key={lane}
                      className={cn('rounded-full px-2 py-0.5 text-[11px]', CHIP_TINT[lane])}
                    >
                      {count} {LANE_LABEL[lane].toLowerCase()}
                    </span>
                  ))}
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      'size-4 text-grey-600 transition-transform duration-instant ease-soft',
                      expanded && 'rotate-180',
                    )}
                  />
                </span>
              </button>

              {expanded && (
                <div data-testid={`cycle-detail-${cycle.id}`} className="animate-fade-in pb-4 pl-1">
                  <section
                    data-testid={`cycle-close-record-${cycle.id}`}
                    aria-labelledby={`cycle-close-record-heading-${cycle.id}`}
                  >
                    <h4
                      id={`cycle-close-record-heading-${cycle.id}`}
                      className="text-[11px] font-medium tracking-[0.04em] text-grey-600"
                    >
                      Cycle-close record · immutable
                    </h4>
                    <ol className="mt-1 flex flex-col gap-1 border-l border-surface-border pl-4">
                      {cycle.journal.map((line) => (
                        <li key={line} className="font-mono text-[12px] text-ink-muted">
                          {line}
                        </li>
                      ))}
                    </ol>
                  </section>
                  {(() => {
                    const recalled = recalledEntries(cycle, memory)
                    if (recalled.length === 0) return null
                    return (
                      <div data-testid={`cycle-recalled-${cycle.id}`} className="mt-3 pl-4">
                        <p className="text-[11px] font-medium tracking-[0.04em] text-grey-600">
                          Recalled from memory
                        </p>
                        <ul className="mt-1 flex flex-col gap-1">
                          {recalled.map((entry) => (
                            <li key={entry.id} className="text-[12px] text-ink-muted">
                              {entry.title} — {VERDICT_LABEL[entry.verdict]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })()}
                  {cycleChanges.length === 0 ? (
                    <p className="mt-3 pl-4 text-[12px] text-grey-600">
                      The loop changed nothing this cycle.
                    </p>
                  ) : (
                    <ul className="mt-3 flex flex-col gap-2 pl-4">
                      {cycleChanges.map((change) => (
                        <li key={change.id} className="rounded-xl bg-grey-100 px-3 py-2">
                          <p className="text-[13px] text-ink">{change.title}</p>
                          <p className="mt-0.5 text-[12px] text-ink-muted">{change.rationale}</p>
                          {change.effect !== undefined && (
                            <p className="mt-1 text-[12px] text-grey-700">
                              {change.effect.metric} {change.effect.from} → {change.effect.to}{' '}
                              {change.effect.window}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {events.length > 0 && (
                    <section
                      data-testid={`cycle-after-close-${cycle.id}`}
                      aria-labelledby={`cycle-after-close-heading-${cycle.id}`}
                      className="mt-4 border-t border-surface-border pt-3"
                    >
                      <h4
                        id={`cycle-after-close-heading-${cycle.id}`}
                        className="text-[11px] font-medium tracking-[0.04em] text-[#294b85]"
                      >
                        After cycle close · operator decisions
                      </h4>
                      <ol className="mt-1 flex flex-col gap-1 border-l border-[#b8c9e8] pl-4">
                        {events.map((line) => (
                          <li key={line} className="font-mono text-[12px] text-[#294b85]">
                            {line}
                          </li>
                        ))}
                      </ol>
                    </section>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
