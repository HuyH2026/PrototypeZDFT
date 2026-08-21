// Right-side palette of step types, restyled after the web-call policy detail
// frame (Explore-Voice-Unification 170:63332): rows of tinted-squircle step
// icons with a drag grip. Each row can be clicked to append a block or dragged
// into the policy/block canvas.
import { X, GripVertical } from 'lucide-react'
import { useDrag } from 'react-dnd'
import { STEP_TYPES, type StepType } from '../agent-store'
import { STEP_ICON, STEP_BADGE, EDITOR_PANEL_W, type VoiceStep } from './editor-data'
import { Card } from '@/components/flora/Card'

export const EDITOR_DND_TYPE = 'editor-step'
export type StepDragItem = { stepType: StepType }

function PaletteRow({
  stepType,
  label,
  onAddStep,
}: {
  stepType: StepType
  label: string
  onAddStep: (stepType: StepType) => void
}) {
  const Icon = STEP_ICON[stepType]
  const badge = STEP_BADGE[stepType]
  const [{ isDragging }, drag] = useDrag({
    type: EDITOR_DND_TYPE,
    item: (): StepDragItem => ({ stepType }),
    collect: (m) => ({ isDragging: m.isDragging() }),
  })
  // Row geometry per the frame: 16px padding, grip ▸ squircle ▸ semibold label;
  // no hover-plus affordance (the row itself is the add control).
  return (
    <button
      type="button"
      ref={drag as unknown as React.Ref<HTMLButtonElement>}
      aria-label={`Add ${label} step`}
      onClick={() => onAddStep(stepType)}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="flex w-full cursor-grab items-center gap-2 rounded-lg border border-flora-divider bg-white py-4 pe-4 ps-2 text-left transition-colors duration-instant ease-soft hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 active:cursor-grabbing"
    >
      <GripVertical size={16} className="shrink-0 text-ink-muted" aria-hidden />
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: badge.bg, color: badge.fg }}
      >
        <Icon size={18} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink">{label}</span>
    </button>
  )
}

export function StepsPalette({
  onClose,
  onAddStep,
  steps,
}: {
  onClose: () => void
  onAddStep: (stepType: StepType) => void
  // When provided (Voice), renders these custom-labelled steps instead of the
  // default palette; each still appends the shared canvas block for its StepType.
  steps?: VoiceStep[]
}) {
  return (
    // Docked in the same right-hand slot as the AI Studio panel, holding the
    // rail's width clear of it (see AgentEditorScreen).
    <Card
      flat
      style={{ width: EDITOR_PANEL_W }}
      className="me-[72px] flex shrink-0 flex-col gap-4 p-4"
    >
      <div className="flex items-center justify-between">
        {/* The frame's heading is a bare 18px "Steps" — no subtitle. */}
        <h2 className="text-[18px] font-normal text-ink">Steps</h2>
        <button type="button" aria-label="Close steps" onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-ink-muted hover:bg-control-hover hover:text-ink">
          <X size={18} aria-hidden />
        </button>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto pe-0.5">
        {steps
          ? steps.map((s) => (
              <VoicePaletteRow key={s.label} step={s} onAddStep={onAddStep} />
            ))
          : STEP_TYPES.map((s) => (
              <PaletteRow key={s.type} stepType={s.type} label={s.label} onAddStep={onAddStep} />
            ))}
      </div>
    </Card>
  )
}

// A Voice step row: same drag/click behaviour as PaletteRow, but the icon and
// tinted badge come from the voice step definition rather than STEP_ICON.
function VoicePaletteRow({
  step,
  onAddStep,
}: {
  step: VoiceStep
  onAddStep: (stepType: StepType) => void
}) {
  const { Icon } = step
  const [{ isDragging }, drag] = useDrag({
    type: EDITOR_DND_TYPE,
    item: (): StepDragItem => ({ stepType: step.stepType }),
    collect: (m) => ({ isDragging: m.isDragging() }),
  })
  return (
    <button
      type="button"
      ref={drag as unknown as React.Ref<HTMLButtonElement>}
      aria-label={`Add ${step.label} step`}
      onClick={() => onAddStep(step.stepType)}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="flex w-full cursor-grab items-center gap-2 rounded-lg border border-flora-divider bg-white py-4 pe-4 ps-2 text-left transition-colors duration-instant ease-soft hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 active:cursor-grabbing"
    >
      <GripVertical size={16} className="shrink-0 text-ink-muted" aria-hidden />
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: step.badge.bg, color: step.badge.fg }}
      >
        <Icon size={18} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink">{step.label}</span>
    </button>
  )
}
