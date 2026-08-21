// One inline-editable span: contentEditable with a blur commit, the pattern
// ConditionRowView already uses. The blur handler hands the reducer the original
// text alongside the new, so retyping the authored value is not counted as an edit.
// Shared by the plan's two editable surfaces — the overview steps and the Options
// block's prompt and answers.
import type { PlanEditHandlers } from './plan-review-state'

export function PlanEditableText({
  fieldId,
  original,
  edit,
  className,
  testId,
}: {
  fieldId: string
  original: string
  edit: PlanEditHandlers
  className?: string
  testId?: string
}) {
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      data-testid={testId}
      onBlur={(e) => edit.onEdit(fieldId, e.currentTarget.textContent ?? '', original)}
      className={`outline-none focus:rounded focus:bg-white focus:ring-1 focus:ring-[#acbdd5] ${className ?? ''}`}
    >
      {edit.resolve(fieldId, original)}
    </span>
  )
}
