// How the model reasoned, as a numbered timeline. Read-only by design: it records
// reasoning, it is not an input (spec Scope).
//
// The reasoning is prose on the sheet, not six near-identical cards on it. Each
// step used to sit in its own bordered box, which turned the longest section in
// the panel into a stack of grey rectangles — the boxes carried no information
// the rail does not, and they broke the one thing this section is: a sequence.
import type { AgentPlan, PlanSpan } from './agent-plan-data'
import { PlanRefChip } from './PlanRefChip'

function Body({ body, onOpenAction }: { body: PlanSpan[]; onOpenAction?: (actionId: string) => void }) {
  return (
    <p className="text-[13px] leading-[21px] text-[#4a5568]">
      {body.map((span, index) =>
        span.kind === 'text' ? (
          <span key={index}>{span.text}</span>
        ) : (
          <PlanRefChip
            key={index}
            refKind={span.refKind}
            label={span.label}
            actionId={span.actionId}
            onOpenAction={onOpenAction}
          />
        ),
      )}
    </p>
  )
}

export function PlanThinkingSection({
  steps,
  onOpenAction,
}: {
  steps: AgentPlan['thinking']
  onOpenAction?: (actionId: string) => void
}) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => (
        <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
          {/* Rail between this node and the next, so the sequence closes on the
              last step rather than trailing off. */}
          {index < steps.length - 1 && (
            <span
              aria-hidden
              className="absolute start-3 top-6 bottom-0 w-px -translate-x-1/2 bg-[#e4e7f0]"
            />
          )}
          {/* The node shows the number and the step's own label names it, so the
              title line is free to be the sentence it is — it used to open with a
              bold "Step 1 – " that took the emphasis off what the step does. */}
          <span
            aria-hidden
            className="mt-px flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f1f4f9] text-[11px] font-semibold tracking-[-0.2px] text-[#5a6b8c]"
          >
            {index + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
            <p className="text-[14px] font-semibold leading-5 tracking-[-0.1px] text-ink">
              <span className="sr-only">{step.label}</span>
              <span>{step.title}</span>
            </p>
            <Body body={step.body} onOpenAction={onOpenAction} />
          </div>
        </li>
      ))}
    </ol>
  )
}
