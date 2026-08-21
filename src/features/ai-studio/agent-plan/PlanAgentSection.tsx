// What the agent is, how it behaves, and what it needs. The policy renders as the
// editor's own prose + chip pair, so a chip means the same thing in the plan as
// it does in the editor (spec Decision 2), with the two block previews sitting
// between the runs where the frame puts them.
import { Braces, Wrench, Zap } from 'lucide-react'
import { PolicyChipView } from '@/features/ai-agents/editor/PolicyChipView'
import type { AgentPlan, PlanRefKind } from './agent-plan-data'
import { PlanPolicyBlockCard } from './PlanPolicyBlockCard'
import { PlanRefChip, REF_COLOR } from './PlanRefChip'
import type { PlanEditHandlers } from './plan-review-state'

// An eyebrow, not a heading: at 12px semibold black these labels were the same
// weight as the prose under them, so the section read as one undifferentiated
// column. Small, spaced and grey, they name a field without competing with it.
function Label({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8b90a0]">
      {children}
    </p>
  )
}

// The tile a tool row gets, tinted from the reference colour it already carries.
const TOOL_GLYPH: Record<PlanRefKind, typeof Wrench> = {
  action: Wrench,
  variable: Braces,
  event: Zap,
}
const TOOL_TINT: Record<PlanRefKind, string> = {
  action: '#e8f2fc',
  variable: '#e6f0f4',
  event: '#e6f4f7',
}

export function PlanAgentSection({
  agent,
  edit,
  onOpenAction,
}: {
  agent: AgentPlan['agent']
  edit: PlanEditHandlers
  onOpenAction?: (actionId: string) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label>Agent job</Label>
        <p className="text-[14px] leading-[22px] text-[#4a5568]">{agent.description}</p>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-[#eceff5] pt-4">
        <Label>Policy</Label>
        <div className="flex flex-col">
          {agent.policy.map((node) =>
            node.kind === 'run' ? (
              <p key={node.id} className="whitespace-pre-wrap text-[14px] leading-[22px] text-ink">
                {node.segments.map((segment) =>
                  segment.kind === 'prose' ? (
                    <span key={segment.id}>{segment.text}</span>
                  ) : (
                    <PolicyChipView key={segment.id} chip={segment} />
                  ),
                )}
              </p>
            ) : (
              <PlanPolicyBlockCard key={node.id} nodeId={node.id} block={node.block} edit={edit} />
            ),
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-[#eceff5] pt-4">
        <Label>Tools</Label>
        {/* Rows on their own, not a bordered list: the tile carries the kind, and
            the gap does the separating the hairlines used to. */}
        <div className="flex flex-col gap-2.5">
          {agent.tools.map((tool) => {
            const Glyph = TOOL_GLYPH[tool.kind]
            return (
              <div key={tool.name} className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-px flex size-7 shrink-0 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: TOOL_TINT[tool.kind], color: REF_COLOR[tool.kind] }}
                >
                  <Glyph size={14} />
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[13px] leading-[18px]">
                    <PlanRefChip
                      refKind={tool.kind}
                      label={tool.name}
                      actionId={tool.actionId}
                      variant="row"
                      onOpenAction={onOpenAction}
                    />
                  </span>
                  <span className="text-[12px] leading-[18px] text-[#5f6572]">
                    {tool.description}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
