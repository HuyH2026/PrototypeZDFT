// The four things the agent will do: an ordinal, an editable title and
// description, and the metrics each step moves. Editing here is the point of the
// section — this is the part of the plan a user is most likely to want in their
// own words (spec Decision 6).
//
// Drawn as a numbered timeline. The ordinals used to be grey text in a 36px
// gutter with a full-bleed hairline between steps, which cut the section into
// four unrelated slabs; a node on a rail says the same thing and says it is a
// sequence — which is what a plan is.
import {
  overviewDescriptionField,
  overviewTitleField,
  type PlanOverviewStep,
} from './agent-plan-data'
import type { PlanEditHandlers } from './plan-review-state'
import { PlanEditableText } from './PlanEditableText'
import { PlanPill } from '../plan-parts/PlanPill'

export function PlanOverviewSection({
  steps,
  edit,
}: {
  steps: PlanOverviewStep[]
  edit: PlanEditHandlers
}) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => (
        <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
          {/* The rail runs from under this node to the next one, so the last step
              ends the sequence instead of trailing a line into the padding. */}
          {index < steps.length - 1 && (
            <span
              aria-hidden
              className="absolute start-3 top-6 bottom-0 w-px -translate-x-1/2 bg-[#e4e7f0]"
            />
          )}
          <span
            aria-hidden
            className="mt-px flex size-6 shrink-0 items-center justify-center rounded-full bg-[#ebf5f7] text-[11px] font-semibold tracking-[-0.2px] text-[#01567a]"
          >
            {step.ordinal}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
            <PlanEditableText
              fieldId={overviewTitleField(step)}
              original={step.title}
              edit={edit}
              className="block text-[14px] font-semibold leading-5 tracking-[-0.1px] text-ink"
            />
            {/* A step below its title, so the two do not read as one block of
                same-size text. */}
            <PlanEditableText
              fieldId={overviewDescriptionField(step)}
              original={step.description}
              edit={edit}
              className="block text-[13px] leading-[20px] text-[#5f6572]"
            />
            {/* The metrics are labels, not controls. Bordered pills read as
                buttons — these are soft fills that stay behind the prose. */}
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              {step.metrics.map((metric) => (
                <PlanPill key={metric}>{metric}</PlanPill>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
