import { useRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { CheckCircle2, FileText, X } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { LIFECYCLE_LABEL, type Opportunity } from './pm-data'
import { PM_TOOL_LABEL, type PmIssueLink } from './pm-integration'

export type PmActionMode = 'issue' | 'brief'

export function PmActionDialog({
  mode,
  opportunity,
  issueLink,
  suggestedAction,
  onClose,
}: {
  mode: PmActionMode
  opportunity: Opportunity
  issueLink?: PmIssueLink
  suggestedAction?: string
  onClose: () => void
}) {
  const openerRef = useRef<HTMLElement | null>(
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  )

  const isIssue = mode === 'issue' && issueLink
  const heading = isIssue ? `${issueLink.key} · ${opportunity.title}` : 'Draft product brief'

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/25 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            openerRef.current?.focus()
          }}
          className="fixed left-1/2 top-1/2 z-[81] w-[calc(100%-4rem)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-flora-divider bg-white p-6 shadow-[0_24px_64px_rgba(10,13,14,0.22)] outline-none"
        >
        <div className="flex items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-grey-200 text-ink">
              {isIssue ? <CheckCircle2 size={18} /> : <FileText size={18} />}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-ink-muted">
                {isIssue ? `${PM_TOOL_LABEL[issueLink.tool]} issue preview` : 'AI-assisted draft'}
              </p>
              <DialogPrimitive.Title className="mt-1 text-[19px] font-semibold leading-6 text-ink">{heading}</DialogPrimitive.Title>
            </div>
          </div>
          <DialogPrimitive.Close asChild>
            <button
              type="button"
              aria-label="Close"
              autoFocus
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-muted outline-none hover:bg-grey-200 focus-visible:outline-2 focus-visible:outline-flora-blue"
            >
              <X size={16} />
            </button>
          </DialogPrimitive.Close>
        </div>

        {isIssue ? (
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-grey-100 p-3">
                <p className="text-[11px] text-ink-muted">Status</p>
                <p className="mt-1 text-[13px] font-semibold text-[#0f6b4d]">Ready for triage</p>
              </div>
              <div className="rounded-xl bg-grey-100 p-3">
                <p className="text-[11px] text-ink-muted">Lifecycle stage</p>
                <p className="mt-1 text-[13px] font-semibold text-ink">{LIFECYCLE_LABEL[opportunity.stage]}</p>
              </div>
            </div>
            <div className="rounded-xl border border-grey-200 p-4">
              <p className="text-[12px] font-semibold text-ink">Evidence attached</p>
              <p className="mt-1 text-[13px] leading-5 text-ink-muted">
                {opportunity.customers} affected customers · {opportunity.revenue} {opportunity.revenueState === 'at-risk' ? 'at risk' : 'asking'} · priority {opportunity.impact}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <section>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.35px] text-ink-muted">Problem</h3>
              <p className="mt-1 text-[13px] leading-5 text-ink">{opportunity.description}</p>
            </section>
            <section>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.35px] text-ink-muted">Evidence</h3>
              <p className="mt-1 text-[13px] leading-5 text-ink">
                {opportunity.customers} customers are affected, representing {opportunity.revenue} {opportunity.revenueState === 'at-risk' ? 'in revenue at risk' : 'in revenue asking'}.
              </p>
            </section>
            <section>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.35px] text-ink-muted">Proposed outcome</h3>
              <p className="mt-1 text-[13px] leading-5 text-ink">{suggestedAction ?? `Validate scope and move this ${opportunity.type} toward an owned product decision.`}</p>
            </section>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <DialogPrimitive.Close asChild>
            <Button variant="primary">Done</Button>
          </DialogPrimitive.Close>
        </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
