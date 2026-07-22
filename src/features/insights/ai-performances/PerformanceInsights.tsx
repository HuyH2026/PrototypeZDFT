// "Performance insights (AI)" — a single gradient-bordered card listing the
// worst-performing workflows, with a decorative carousel control. Static data.
import { ChevronLeft, ChevronRight, Info, MessageSquare } from 'lucide-react'
import { WORST_WORKFLOWS } from './ai-performances-data'

function ColHead({ label, info }: { label: string; info?: boolean }) {
  return (
    <span className="flex items-center gap-1 text-[13px] text-ink">
      {label}
      {info ? <Info className="h-3.5 w-3.5 text-ink-muted" /> : null}
    </span>
  )
}

export function PerformanceInsights() {
  return (
    // Soft gradient border ring per Figma: a padded gradient wrapper around a
    // white inner card.
    <div className="rounded-3xl bg-gradient-to-r from-[#f4d9c4] via-white to-[#cfeef0] p-[1.5px]">
      <div className="rounded-3xl bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#BE297B]">
              <MessageSquare className="h-4 w-4 text-white" />
            </span>
            <h3 className="text-[16px] font-semibold text-ink">Worst performing workflow</h3>
          </div>
          <button type="button" className="flex items-center gap-1 text-[13px] text-accent-blue">
            View more <span aria-hidden>→</span>
          </button>
        </div>
        <p className="mt-2 max-w-3xl text-[13px] text-ink-muted">
          We identified the top three workflows with issues. Reviewing where customers frequently drop off and enhancing
          the workflows can improve both self service rates and customer satisfaction!
        </p>

        <div className="mt-6 grid grid-cols-[1.6fr_1.4fr_1fr_1.4fr_auto] items-center gap-y-4 text-[14px]">
          <ColHead label="Workflow" />
          <ColHead label="Non-deflections" info />
          <ColHead label="Avg. CSAT" />
          <ColHead label="Top dropped off step" info />
          <span />
          {WORST_WORKFLOWS.map((w) => (
            <Row key={w.workflow} {...w} />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#01567A] text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="h-1 w-40 rounded-full bg-surface-border">
            <div className="h-1 w-1/3 rounded-full bg-[#01567A]" />
          </div>
          <button
            type="button"
            aria-label="Next"
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#01567A] text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({
  workflow,
  nonDeflections,
  pct,
  csat,
  step,
}: {
  workflow: string
  nonDeflections: string
  pct: string
  csat: string
  step: string
}) {
  return (
    <>
      <button type="button" className="text-left text-accent-blue">
        {workflow}
      </button>
      <span className="text-ink">
        {nonDeflections} <span className="text-ink-muted">({pct})</span>
      </span>
      <span className="text-ink">{csat}</span>
      <button type="button" className="text-left text-accent-blue">
        {step}
      </button>
      <button
        type="button"
        className="justify-self-end rounded-full border border-surface-border px-4 py-1.5 text-[13px] text-ink"
      >
        View workflow
      </button>
    </>
  )
}
