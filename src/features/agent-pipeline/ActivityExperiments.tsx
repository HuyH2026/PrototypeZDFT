import { Button } from '@/components/flora/Button'
import { Card } from '@/components/flora/Card'
import type { Change, Decisions, PipelineDecision } from './pipeline-data'

export type ActivityExperimentsProps = {
  changes: Change[]
  decisions: Decisions
  disabled?: boolean
  getDisabledReason?: (change: Change) => string | null
  onAdvance: (changeId: string, decision: PipelineDecision) => void
}

export function ActivityExperiments({
  changes,
  decisions,
  disabled = false,
  getDisabledReason,
  onAdvance,
}: ActivityExperimentsProps) {
  const handleAdvance = (
    change: Change,
    decision: PipelineDecision,
    disabledReason: string | null,
  ) => {
    if (disabled || disabledReason) return
    onAdvance(change.id, decision)
  }

  if (changes.length === 0) return null

  return (
    <Card data-testid="activity-experiments" className="px-6 py-5">
      <h2 className="text-[14px] font-semibold text-ink">Active experiments</h2>
      <p className="mt-1 text-[12px] text-ink-muted">
        Guarded tests authorized from Pending asks. Winners return here before application.
      </p>
      <ul className="mt-3 flex flex-col">
        {changes.map((change) => {
          const decision = decisions[change.id]
          const winnerReady = decision === 'winner-ready'
          const nextDecision: PipelineDecision = winnerReady ? 'applied' : 'winner-ready'
          const actionLabel = winnerReady ? 'Publish winner' : 'Complete mock test'
          const disabledReason = getDisabledReason?.(change) ?? null
          const rowDisabled = disabled || disabledReason !== null
          return (
            <li
              key={change.id}
              data-testid={`experiment-row-${change.id}`}
              className="flex items-start gap-4 border-t border-surface-border py-3 first:border-t-0 first:pt-1"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-ink">{change.title}</p>
                  <span
                    className={
                      winnerReady
                        ? 'rounded-full bg-[#fff3cc] px-2 py-0.5 text-[10px] font-semibold text-[#6b5300]'
                        : 'rounded-full bg-[#e8effb] px-2 py-0.5 text-[10px] font-semibold text-[#294b85]'
                    }
                  >
                    {winnerReady ? 'Winner ready' : 'Experiment running'}
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-5 text-ink-muted">{change.rationale}</p>
                <p className="mt-1 text-[11px] text-grey-600">
                  {change.agentName} · {change.blastRadius} · risk {change.risk}
                </p>
                {disabledReason ? (
                  <p className="mt-1 text-[11px] leading-4 text-ink-muted">{disabledReason}</p>
                ) : null}
              </div>
              <Button
                size="sm"
                variant="primary"
                disabled={rowDisabled}
                aria-label={`${actionLabel}: ${change.title}`}
                onClick={() => handleAdvance(change, nextDecision, disabledReason)}
              >
                {actionLabel}
              </Button>
            </li>
          )
        })}
      </ul>
      {disabled ? (
        <p className="mt-2 text-[11px] text-ink-muted">
          Resume the loop before completing or publishing experiments.
        </p>
      ) : null}
    </Card>
  )
}
