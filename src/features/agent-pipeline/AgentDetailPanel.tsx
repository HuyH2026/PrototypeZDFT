import { useEffect, useRef } from 'react'
import { Check, ChevronRight, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { Card } from '@/components/flora/Card'
import { CHANNELS } from '@/features/ai-agents/agent-builder-data'
import type { StoredAgent } from '@/features/ai-agents/agent-store'
import { cn } from '@/lib/cn'
import { type CockpitFinding, type FindingState, type ManagementMode } from './cockpit-data'

const MODE_LABEL: Record<ManagementMode, string> = {
  shadow: 'Shadow',
  suggest: 'Suggest & test',
  full: 'Full management',
}

const MODE_COPY: Record<ManagementMode, string> = {
  shadow: 'Observe only. The loop can explain what it would do, but cannot change this agent.',
  suggest: 'The loop may run a scoped test. You publish the winner.',
  full: 'The loop may apply low-risk winners and posts a receipt afterward.',
}

const MODE_TONE: Record<ManagementMode, string> = {
  shadow: 'border-grey-400 bg-grey-100 text-grey-800',
  suggest: 'border-[#b8c9ec] bg-[#eef3fc] text-[#294b85]',
  full: 'border-[#b9d9ad] bg-[#eef8e9] text-[#31591e]',
}

const STATE_LABEL: Record<FindingState, string> = {
  observed: 'Finding',
  testing: 'A/B running',
  'awaiting-approval': 'Winner ready',
  applied: 'Applied',
}

const STATE_TONE: Record<FindingState, string> = {
  observed: 'bg-grey-100 text-grey-800',
  testing: 'bg-[#e8effb] text-[#294b85]',
  'awaiting-approval': 'bg-[#fff3cc] text-[#6b5300]',
  applied: 'bg-[#e5f4dc] text-[#31591e]',
}

function actionLabel(
  state: FindingState,
  mode: ManagementMode,
  risk: CockpitFinding['risk'],
): string {
  if (state === 'awaiting-approval') {
    return mode === 'full' ? 'Approve winner' : 'Publish test winner'
  }
  if (state === 'testing') {
    return mode === 'full' && risk === 'low' ? 'Complete test & apply winner' : 'Complete mock test'
  }
  return mode === 'full' ? 'Start guarded test' : 'Start A/B test'
}

export type AgentDetailPanelProps = {
  agent: StoredAgent
  mode: ManagementMode
  actionMode: ManagementMode
  blockingAgentName?: string
  findings: CockpitFinding[]
  findingStates: Readonly<Record<string, FindingState>>
  selectedFindingId: string | null
  agentNameById: (agentId: string) => string
  onSelectFinding: (findingId: string) => void
  onRequestMode: (mode: ManagementMode) => void
  onReviewBlockingAgent?: () => void
  onAdvanceFinding: (findingId: string) => void
  actionsPaused: boolean
  onClose: () => void
}

export function AgentDetailPanel({
  agent,
  mode,
  actionMode,
  blockingAgentName,
  findings,
  findingStates,
  selectedFindingId,
  agentNameById,
  onSelectFinding,
  onRequestMode,
  onReviewBlockingAgent,
  onAdvanceFinding,
  actionsPaused,
  onClose,
}: AgentDetailPanelProps) {
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    dialogRef.current?.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (document.querySelector('[data-testid="enrollment-dialog"]')) return
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [onClose])

  const selected = findings.find((finding) => finding.id === selectedFindingId) ?? findings[0]
  const state = selected ? (findingStates[selected.id] ?? selected.state) : undefined
  const channelLabel =
    CHANNELS.find((channel) => channel.key === agent.channel)?.label ?? agent.channel

  return (
    <div className="fixed inset-0 z-50 flex justify-end p-[10px]" data-testid="agent-detail-layer">
      <button
        type="button"
        aria-label="Close agent details"
        className="absolute inset-0 bg-black/35"
        onClick={onClose}
      />
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${agent.name}`}
        data-testid="agent-detail-panel"
        className="relative flex h-full w-[590px] flex-col overflow-hidden rounded-[20px] border border-surface-border bg-white shadow-xl"
      >
        <header className="flex items-start gap-4 border-b border-surface-border px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-ink-muted">{channelLabel} agent</p>
            <h2 className="mt-1 text-[22px] font-semibold text-ink">{agent.name}</h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              {agent.resolutionRate} resolution · {agent.csat.toFixed(1)} CSAT
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-ink-muted hover:bg-grey-100 hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <section aria-labelledby="management-mode-heading">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 id="management-mode-heading" className="text-[14px] font-semibold text-ink">
                  Management mode
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  Choose how much authority the loop has.
                </p>
              </div>
              <span
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] font-medium',
                  MODE_TONE[mode],
                )}
              >
                {MODE_LABEL[mode]}
              </span>
            </div>
            <div
              role="radiogroup"
              aria-label="Management mode"
              className="mt-3 grid grid-cols-3 rounded-full bg-grey-100 p-1"
            >
              {(Object.keys(MODE_LABEL) as ManagementMode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={mode === option}
                  onClick={() => onRequestMode(option)}
                  className={cn(
                    'rounded-full px-3 py-2 text-[12px] font-medium transition-colors duration-instant ease-soft',
                    mode === option
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {MODE_LABEL[option]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-5 text-ink-muted">{MODE_COPY[mode]}</p>
          </section>

          <div className="my-5 h-px bg-surface-border" />

          <section aria-labelledby="agent-findings-heading">
            <h3 id="agent-findings-heading" className="text-[14px] font-semibold text-ink">
              Findings for this agent
            </h3>
            {findings.length > 1 ? (
              <div className="mt-3 flex flex-col gap-1 rounded-xl bg-grey-100 p-1">
                {findings.map((finding) => (
                  <button
                    key={finding.id}
                    type="button"
                    aria-pressed={selected?.id === finding.id}
                    onClick={() => onSelectFinding(finding.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px]',
                      selected?.id === finding.id
                        ? 'bg-white text-ink shadow-sm'
                        : 'text-ink-muted',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{finding.title}</span>
                    <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                  </button>
                ))}
              </div>
            ) : null}

            {selected && state ? (
              <Card flat data-testid={`finding-detail-${selected.id}`} className="mt-3 p-5">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                      STATE_TONE[state],
                    )}
                  >
                    {STATE_LABEL[state]}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {selected.confidence}% confidence
                  </span>
                  <span className="ml-auto text-[11px] text-ink-muted">Risk · {selected.risk}</span>
                </div>
                <h4 className="mt-3 text-[17px] font-semibold leading-6 text-ink">
                  {selected.title}
                </h4>
                <p className="mt-1 text-[13px] leading-5 text-ink-muted">{selected.summary}</p>

                <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-grey-100 p-3">
                  <div>
                    <dt className="text-[11px] text-ink-muted">Projected resolution</dt>
                    <dd className="mt-0.5 text-[18px] font-semibold text-[#31591e]">
                      +{selected.projectedResolutionDelta.toFixed(1)} pt
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-ink-muted">Monthly reach</dt>
                    <dd className="mt-0.5 text-[13px] font-medium text-ink">
                      {selected.entitlementReach}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#cfe3c5] bg-[#f4faef] px-3 py-2.5">
                  <ShieldCheck className="size-4 text-[#3f6b2a]" aria-hidden />
                  <p className="text-[12px] text-[#31591e]">
                    CSAT guardrail · {selected.csatProjection}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    Proposed change
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-ink">{selected.proposedChange}</p>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    Evidence
                  </p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {selected.evidence.map((item) => (
                      <li key={item} className="flex gap-2 text-[12px] leading-5 text-ink-muted">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-[#3f6b2a]" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {selected.targetAgentIds.length > 1 ? (
                  <p className="mt-4 rounded-xl bg-[#f7f4fb] px-3 py-2 text-[12px] text-[#59446d]">
                    Applies to {selected.targetAgentIds.map(agentNameById).join(' and ')}. The most
                    restrictive mode controls the action: {MODE_LABEL[actionMode]}.
                  </p>
                ) : null}

                {state === 'applied' ? (
                  <div
                    data-testid="change-receipt"
                    className="mt-4 rounded-xl border border-surface-border px-3 py-3 text-[12px] text-ink-muted"
                  >
                    <p className="font-medium text-ink">Change receipt</p>
                    <p className="mt-1">
                      Application complete · outcome measurement pending · CSAT monitoring active
                    </p>
                  </div>
                ) : null}
              </Card>
            ) : (
              <p className="mt-3 rounded-xl bg-grey-100 p-4 text-[13px] text-ink-muted">
                The loop has not surfaced a finding for this agent yet.
              </p>
            )}
          </section>
        </div>

        {selected && state && state !== 'applied' ? (
          <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-surface-border bg-white px-6 py-4">
            {actionMode === 'shadow' ? (
              <>
                <span className="mr-auto max-w-[280px] text-[11px] leading-4 text-ink-muted">
                  {mode === 'shadow'
                    ? 'Shadow mode keeps this finding visible but blocks state changes.'
                    : `Shadow mode on ${blockingAgentName ?? 'another target'} blocks this shared finding.`}
                </span>
                {mode === 'shadow' ? (
                  <Button size="sm" variant="primary" onClick={() => onRequestMode('suggest')}>
                    Enable Suggest & test
                  </Button>
                ) : onReviewBlockingAgent && blockingAgentName ? (
                  <Button size="sm" variant="outline" onClick={onReviewBlockingAgent}>
                    Review {blockingAgentName}
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                {actionsPaused ? (
                  <span className="mr-auto max-w-[280px] text-[11px] leading-4 text-ink-muted">
                    Resume the loop before running or publishing changes.
                  </span>
                ) : null}
                <Button
                  size="sm"
                  variant="primary"
                  disabled={actionsPaused}
                  onClick={() => onAdvanceFinding(selected.id)}
                >
                  {actionLabel(state, actionMode, selected.risk)}
                </Button>
              </>
            )}
          </footer>
        ) : null}
      </aside>
    </div>
  )
}
