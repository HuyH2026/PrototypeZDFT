import { useEffect, useId, useRef } from 'react'
import { Check, LockKeyhole, ShieldCheck, Target } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { Card } from '@/components/flora/Card'
import type { StoredAgent } from '@/features/ai-agents/agent-store'
import type { ManagementMode } from './cockpit-data'

const MODE_LABEL: Record<Exclude<ManagementMode, 'shadow'>, string> = {
  suggest: 'Suggest & test',
  full: 'Full management',
}

const MODE_PERMISSION: Record<Exclude<ManagementMode, 'shadow'>, string> = {
  suggest: 'Ask for approval before publishing a winning change.',
  full: 'Apply proven low-risk winners and hold anything outside the guardrails.',
}

const PLATFORM_CSAT_HARD_FLOOR = '4.17'

export type EnrollmentDialogProps = {
  agent: StoredAgent
  targetMode: Exclude<ManagementMode, 'shadow'>
  onConfirm: () => void
  onCancel: () => void
}

/**
 * A deliberate enrollment ceremony for granting the optimization loop write
 * authority. The parent owns the mode change; this surface only explains and
 * confirms the customer-visible contract.
 */
export function EnrollmentDialog({
  agent,
  targetMode,
  onConfirm,
  onCancel,
}: EnrollmentDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    dialogRef.current?.querySelector<HTMLButtonElement>('[data-enrollment-cancel]')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onCancel()
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

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [onCancel])

  const modeLabel = MODE_LABEL[targetMode]
  const csatBaseline = agent.csat.toFixed(1)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
      <div
        data-testid="enrollment-scrim"
        className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
        onClick={onCancel}
        aria-hidden="true"
      />
      <Card
        ref={dialogRef}
        data-testid="enrollment-dialog"
        flat
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative flex max-h-[calc(100vh-40px)] w-[560px] flex-col overflow-hidden shadow-[0_22px_70px_rgba(0,0,0,0.22)]"
      >
        <div className="min-h-0 overflow-y-auto p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eef8e9] text-[#31591e]">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-ink-muted">{agent.name}</p>
              <h2 id={titleId} className="mt-0.5 text-[22px] font-semibold text-ink">
                Enroll agent
              </h2>
              <p id={descriptionId} className="mt-1 text-[13px] leading-5 text-ink-muted">
                Grant <span className="font-medium text-ink">{modeLabel}</span> authority to the
                optimization loop with a recorded outcome baseline and safety floor.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[16px] border border-[#b9d9ad] bg-[#f4faef] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4b6d3b]">
              Mode being granted
            </p>
            <p className="mt-1 text-[16px] font-semibold text-[#31591e]">{modeLabel}</p>
          </div>

          <section aria-labelledby={`${titleId}-baseline`} className="mt-5">
            <div className="flex items-center gap-2">
              <LockKeyhole className="size-4 text-ink-muted" aria-hidden="true" />
              <h3 id={`${titleId}-baseline`} className="text-[14px] font-semibold text-ink">
                Immutable baseline snapshot
              </h3>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-surface-border bg-surface-border">
              <div className="bg-white p-4">
                <dt className="text-[11px] text-ink-muted">Resolution rate</dt>
                <dd className="mt-1 text-[22px] font-semibold text-ink">{agent.resolutionRate}</dd>
              </div>
              <div className="bg-white p-4">
                <dt className="text-[11px] text-ink-muted">AI-interaction CSAT</dt>
                <dd className="mt-1 text-[22px] font-semibold text-ink">{csatBaseline}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby={`${titleId}-contract`} className="mt-5">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-ink-muted" aria-hidden="true" />
              <h3 id={`${titleId}-contract`} className="text-[14px] font-semibold text-ink">
                60-day outcome contract
              </h3>
            </div>
            <dl className="mt-3 flex flex-col gap-2 rounded-[14px] bg-grey-100 p-3">
              <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-3 py-2.5">
                <dt className="text-[12px] text-ink-muted">Day-60 resolution target</dt>
                <dd className="text-[13px] font-semibold text-[#31591e]">+5 points</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-3 py-2.5">
                <dt className="text-[12px] text-ink-muted">CSAT floor</dt>
                <dd className="text-[13px] font-semibold text-ink">
                  {PLATFORM_CSAT_HARD_FLOOR}{' '}
                  <span className="font-normal text-ink-muted">· locked platform hard floor</span>
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby={`${titleId}-permissions`} className="mt-5">
            <h3 id={`${titleId}-permissions`} className="text-[14px] font-semibold text-ink">
              What the loop can do
            </h3>
            <ul className="mt-3 flex flex-col gap-2.5">
              {[
                'Diagnose outcome gaps and rank findings using evidence.',
                'Run guarded experiments within this agent’s scope.',
                MODE_PERMISSION[targetMode],
              ].map((permission) => (
                <li key={permission} className="flex gap-2 text-[12px] leading-5 text-ink-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#3f6b2a]" aria-hidden="true" />
                  {permission}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-surface-border bg-white px-6 py-4">
          <Button data-enrollment-cancel variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Enroll agent
          </Button>
        </div>
      </Card>
    </div>
  )
}
