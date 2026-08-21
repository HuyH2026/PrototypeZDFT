// Current asks from the loop. This stays visible in Activity so a historical
// cycle replay cannot be mistaken for the set of decisions waiting right now.
import { Button } from '@/components/flora/Button'
import { GATE_LABEL, type Change, type PipelineDecision } from './pipeline-data'

export type ApprovalInboxProps = {
  changes: Change[]
  disabled?: boolean
  getDisabledReason?: (change: Change) => string | null
  onDecide: (changeId: string, decision: PipelineDecision) => void
}

function primaryActionLabel(change: Change): string {
  if (change.gate === 'core-flow') return 'Approve A/B test'
  if (change.gate === 'new-api-call') return 'Approve guarded test'
  return 'Approve change'
}

export function ApprovalInbox({
  changes,
  disabled = false,
  getDisabledReason,
  onDecide,
}: ApprovalInboxProps) {
  const handleDecision = (
    change: Change,
    decision: PipelineDecision,
    disabledReason: string | null,
  ) => {
    if (disabled || disabledReason) return
    onDecide(change.id, decision)
  }

  if (changes.length === 0) {
    return (
      <section
        data-testid="approval-inbox"
        className="rounded-[20px] border border-surface-border bg-white px-6 py-4"
      >
        <h2 className="text-[14px] font-semibold text-ink">Pending asks</h2>
        <p data-testid="inbox-empty" className="mt-1 text-[13px] text-ink-muted">
          No pending asks right now.
        </p>
      </section>
    )
  }

  const proposalSummary =
    changes.length === 1
      ? '1 current proposal needs your decision before testing.'
      : `${changes.length} current proposals need your decision before testing.`

  return (
    // A one-off amber tint: --flora-yellow-surface (#f6eba6) is the chip fill and
    // is too saturated for a full-width surface.
    <section
      data-testid="approval-inbox"
      className="rounded-[20px] border border-[#e8d9a8] bg-[#fffbf0] px-6 py-4"
    >
      <h2 className="text-[14px] font-semibold text-[#6b5300]">Pending asks</h2>
      <p className="mt-1 text-[12px] text-ink-muted">{proposalSummary}</p>
      {disabled ? (
        <p className="mt-1 text-[11px] text-ink-muted">
          Resume the loop before approving or declining proposals.
        </p>
      ) : null}
      <ul className="mt-3 flex flex-col">
        {changes.map((change) => {
          const primaryLabel = primaryActionLabel(change)
          const disabledReason = getDisabledReason?.(change) ?? null
          const rowDisabled = disabled || disabledReason !== null
          return (
            <li
              key={change.id}
              data-testid={`inbox-row-${change.id}`}
              className="flex items-start gap-4 border-t border-[#efe3c4] py-3 first:border-t-0 first:pt-1"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-ink">{change.title}</p>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {change.agentName} · <span>{change.blastRadius}</span> · risk {change.risk}
                </p>
                <p className="mt-1 text-[12px] text-[#6b5300]">{GATE_LABEL[change.gate]}</p>
                {disabledReason ? (
                  <p className="mt-1 text-[11px] leading-4 text-ink-muted">{disabledReason}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  disabled={rowDisabled}
                  aria-label={`${primaryLabel}: ${change.title}`}
                  onClick={() => handleDecision(change, 'approved', disabledReason)}
                >
                  {primaryLabel}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={rowDisabled}
                  aria-label={`Decline ${change.title}`}
                  onClick={() => handleDecision(change, 'rejected', disabledReason)}
                >
                  Decline
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
