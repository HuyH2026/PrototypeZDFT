// The four things a self-improving cycle does: an ordinal, a title, a
// description, and the signals each step touches. Nothing here is editable —
// this plan reports measurements rather than authoring an agent, so there is no
// edit model behind it (unlike agent-plan's PlanOverviewSection).
import { PlanPill } from '../plan-parts/PlanPill'
import type { ImprovementStep } from './self-improving-data'

export function ImprovementOverviewSection({ steps }: { steps: ImprovementStep[] }) {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`flex gap-3 py-4 ${index === 0 ? 'pt-0' : 'border-t border-[#d2d9e5]'}`}
        >
          <span className="w-9 shrink-0 text-[14px] font-medium leading-5 text-grey-700">
            {step.ordinal}
          </span>
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-semibold leading-5 text-ink">{step.title}</span>
              <span className="text-[14px] leading-5 text-grey-700">{step.description}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {step.pills.map((pill) => (
                <PlanPill key={pill}>{pill}</PlanPill>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
