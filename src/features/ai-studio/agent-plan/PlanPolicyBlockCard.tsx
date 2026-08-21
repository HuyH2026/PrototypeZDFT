// A read-only preview of what BlockCanvas will show once the agent exists: the
// step badge and its label, the prompt in a field-shaped row, and either the
// form's $variable tokens or its numbered answers. The Options card's prompt and
// answers are editable (contentEditable + blur commit, the pattern
// ConditionRowView already uses); the Form card is not.
import { Check, ChevronUp } from 'lucide-react'
import { STEP_BADGE, STEP_ICON } from '@/features/ai-agents/editor/editor-data'
import { blockAnswerField, blockPromptField, type PlanPolicyBlock } from './agent-plan-data'
import type { PlanEditHandlers } from './plan-review-state'
import { PlanEditableText } from './PlanEditableText'

export function PlanPolicyBlockCard({
  nodeId,
  block,
  edit,
}: {
  nodeId: string
  block: PlanPolicyBlock
  edit: PlanEditHandlers
}) {
  const badge = STEP_BADGE[block.stepType]
  const BadgeIcon = STEP_ICON[block.stepType]
  const editable = block.stepType === 'options'

  return (
    // The editor draws this frame in its warm neutrals; here it is cooled to the
    // studio's slate. The *chips* are what must mean the same thing in both places
    // (spec Decision 2) — the tray around them is not semantic, and a beige card
    // on the plan's cool white sheet read as a foreign object.
    <div className="my-3.5 rounded-xl border border-[#e9edf3] bg-[#f8f9fb] p-1">
      {/* Card header: what this block is, and the collapse affordance the editor
          will give it. The chevron is decorative here — the plan shows the block
          open so its content can be reviewed. */}
      <div className="flex items-start justify-between px-4 pt-3">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-ink">{block.title}</span>
          <span className="text-[12px] text-[#373a4d]">{block.kindLabel}</span>
        </div>
        <ChevronUp size={16} className="mt-0.5 shrink-0 text-grey-700" aria-hidden />
      </div>

      <div className="p-4">
        <div className="rounded-lg border border-[#e4e7f0] bg-white">
          <div className="flex items-center gap-2 px-3 pt-3">
            <span
              className="flex size-6 items-center justify-center rounded-xl"
              style={{ backgroundColor: badge.bg, color: badge.fg }}
            >
              <BadgeIcon size={14} aria-hidden />
            </span>
            <span className="text-[11px] font-semibold tracking-tight text-[#727583]">
              {block.badgeLabel}
            </span>
          </div>

          {block.heading && (
            <p className="px-3 pt-2 text-[14px] font-semibold text-ink">{block.heading}</p>
          )}

          <div className="flex flex-col gap-2 p-3">
            {/* The prompt row. On a form it is the field-shaped grey row the frame
                draws; on an options block it is the editable question. */}
            <div
              className={
                block.stepType === 'form'
                  ? 'rounded-lg bg-[#f2f4f7] px-3 py-2.5 text-[13px] text-ink'
                  : 'rounded-md border border-[#e4e7f0] px-3 py-2 text-[13px] text-ink'
              }
            >
              {editable ? (
                <PlanEditableText
                  fieldId={blockPromptField(nodeId)}
                  original={block.prompt}
                  edit={edit}
                  testId="plan-block-prompt"
                />
              ) : (
                block.prompt
              )}
            </div>

            {block.fields && (
              <div className="flex flex-col">
                <span className="text-[12px] text-[#9194a0]">Form fields:</span>
                <span className="text-[12px] font-medium text-[#01567a]">{block.fields.join(', ')}</span>
              </div>
            )}

            {block.answers?.map((answer, index) => (
              <div
                key={index}
                data-testid="plan-block-answer"
                className="flex items-center gap-2 rounded-md border border-[#e4e7f0] px-3 py-2 text-[13px] text-ink"
              >
                <span className="font-semibold">{index + 1}.</span>
                <PlanEditableText
                  fieldId={blockAnswerField(nodeId, index)}
                  original={answer}
                  edit={edit}
                  className="flex-1"
                />
                <Check
                  size={14}
                  data-testid="plan-answer-check"
                  className="shrink-0 text-[#048c80]"
                  aria-hidden
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
