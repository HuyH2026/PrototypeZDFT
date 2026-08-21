// One reference the plan makes: an action, a variable or an event. An action that
// already exists in the catalogue is a link; everything else is a promise, so it
// says so rather than pretending to be navigable. Colors are the frame's
// (variables teal #01567a, actions blue #3489db, events #2f99b3).
import type { PlanRefKind } from './agent-plan-data'

export const REF_COLOR: Record<PlanRefKind, string> = {
  action: '#3489db',
  variable: '#01567a',
  event: '#2f99b3',
}

export function PlanRefChip({
  refKind,
  label,
  actionId,
  variant = 'inline',
  onOpenAction,
}: {
  refKind: PlanRefKind
  label: string
  actionId?: string
  // 'row' is the tools list, which has room for the "will be created" tag;
  // 'inline' sits inside prose, where a tag on every reference would be noise.
  variant?: 'inline' | 'row'
  onOpenAction?: (actionId: string) => void
}) {
  const color = REF_COLOR[refKind]
  // Inline references sit inside dense reasoning prose, where a paragraph can
  // carry six of them: at semibold they out-shouted the sentences that explain
  // them, so inline drops a weight while a tools row — a list of names — keeps it.
  const weight = variant === 'row' ? 'font-semibold' : 'font-medium'

  if (actionId && onOpenAction) {
    return (
      <button
        type="button"
        title={`Open ${label} in the actions catalogue`}
        onClick={() => onOpenAction(actionId)}
        className={`${weight} underline decoration-transparent underline-offset-2 transition-colors duration-instant ease-soft hover:decoration-current`}
        style={{ color }}
      >
        {label}
      </button>
    )
  }

  return (
    <span className="inline-flex items-baseline gap-2">
      <span
        className={weight}
        style={{ color }}
        title={`${label} will be created when the plan is approved`}
      >
        {label}
      </span>
      {variant === 'row' && (
        <span className="rounded-full bg-[#f5f6f7] px-2 py-0.5 text-[11px] font-medium text-grey-700">
          will be created
        </span>
      )}
    </span>
  )
}
