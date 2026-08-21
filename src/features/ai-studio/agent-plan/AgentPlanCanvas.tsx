// The plan panel: 590px of reviewable document beside the conversation that
// produced it. Fully controlled — review state, the build trace and every
// side effect belong to AgentPlanFlow, so this file stays a rendering of
// (plan, state) and is testable without a router or a store.
import type { ReactNode } from 'react'
import { ListTree, Sparkles, Target, X } from 'lucide-react'
import { ZendeskLogo } from '@/components/ZendeskLogo'
import { STUDIO_ICON_BUTTON } from '../AiStudioFrame'
import { AGENT_PLAN, SECTION_LABEL, type AgentPlan, type PlanSectionKey } from './agent-plan-data'
import { BUILD_TRACE } from './plan-build-trace'
import {
  approvalHint,
  canApprove,
  editCount,
  sectionChip,
  type PlanReviewState,
} from './plan-review-state'
import { PlanAgentSection } from './PlanAgentSection'
import { PlanImpactSection } from './PlanImpactSection'
import { PlanOverviewSection } from './PlanOverviewSection'
import { PlanAccordion } from '../plan-parts/PlanAccordion'
import { PlanThinkingSection } from './PlanThinkingSection'

// The frame's four glyphs: a list tree, a gauge-like mark, the logomark for the
// agent itself, and the sparkle for the model's own reasoning. 16px, because they
// now sit in the 28px tile PlanAccordion draws rather than loose in the row.
const SECTION_ICON: Record<PlanSectionKey, ReactNode> = {
  overview: <ListTree size={16} aria-hidden />,
  impact: <Target size={16} aria-hidden />,
  agent: <ZendeskLogo size={16} />,
  thinking: <Sparkles size={16} aria-hidden />,
}

export function AgentPlanCanvas({
  plan = AGENT_PLAN,
  state,
  onToggleSection,
  onEdit,
  onApprove,
  onAskForChanges,
  onClose,
  onOpenAction,
  building = false,
  traceStep = 0,
}: {
  plan?: AgentPlan
  state: PlanReviewState
  onToggleSection: (section: PlanSectionKey) => void
  onEdit: (fieldId: string, text: string, original: string) => void
  onApprove: () => void
  onAskForChanges: () => void
  onClose: () => void
  onOpenAction?: (actionId: string) => void
  building?: boolean
  traceStep?: number
}) {
  const edit = {
    resolve: (fieldId: string, original: string) => state.edits[fieldId] ?? original,
    onEdit,
  }
  const hint = approvalHint(state)
  const edits = editCount(state)
  const approvable = canApprove(state) && !building

  const sections: { key: PlanSectionKey; body: ReactNode }[] = [
    { key: 'overview', body: <PlanOverviewSection steps={plan.overview} edit={edit} /> },
    { key: 'impact', body: <PlanImpactSection impact={plan.impact} /> },
    {
      key: 'agent',
      body: <PlanAgentSection agent={plan.agent} edit={edit} onOpenAction={onOpenAction} />,
    },
    { key: 'thinking', body: <PlanThinkingSection steps={plan.thinking} onOpenAction={onOpenAction} /> },
  ]

  return (
    <div
      data-testid="agent-plan-canvas"
      // No surface of its own: the studio's panel slot owns the tint and the
      // hairline, the way it owns the history sidebar's.
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Header: the frame puts Approve in this row, left of the close X. The
          height is the studio header's own h-16, and the padding its px-6, so
          this row sits on one baseline with the hamburger and wordmark across
          the divider instead of 20px below them. */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-6">
        <span className="flex-1 text-[12px] font-medium leading-[18px] tracking-[-0.1px] text-grey-700">
          Create new agent plan
        </span>
        <button
          type="button"
          onClick={onAskForChanges}
          disabled={building}
          className="rounded-full border border-grey-200 bg-white/70 px-4 py-1.5 text-[14px] font-semibold text-[#01567a] transition-colors hover:bg-white disabled:opacity-50"
        >
          Ask for changes
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={!approvable}
          className="rounded-full bg-[#ebf5f7] px-4 py-1.5 text-[14px] font-semibold tracking-[-0.1px] text-[#193d50] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Approve plan
        </button>
        {/* The same control as the studio's own close (STUDIO_ICON_BUTTON). The
            glyph stays a step smaller than that one, as the frame draws it (12px
            of ink here against 16px there); what was wrong was the muted grey and
            a hover square the exact size of the X. */}
        <button
          type="button"
          aria-label="Close plan"
          onClick={onClose}
          className={`size-8 ${STUDIO_ICON_BUTTON}`}
        >
          <X size={24} aria-hidden />
        </button>
      </div>

      {/* pt-2 is the transcript's own py-2: with both headers 64px tall, the
          plan's title and the conversation's first line start on one line. */}
      <div className="flex-1 overflow-y-auto px-6 pt-2 pb-8">
        <h2 className="text-[20px] font-semibold leading-[30px] tracking-[-0.1px] text-ink">
          {`Agent ‘${plan.agentName}’`}
        </h2>

        {/* Why Approve is disabled, and what the user has changed. Both live here
            rather than under the button, which sits in a one-line header row. */}
        {(hint || edits > 0) && !building && (
          <p className="mt-1 flex items-center gap-2 text-[12px] leading-[18px] text-grey-700">
            {hint && <span>{hint}</span>}
            {edits > 0 && <span>{`${edits} edit${edits === 1 ? '' : 's'}`}</span>}
          </p>
        )}

        {building ? (
          <ol className="mt-6 flex flex-col gap-3" data-testid="plan-build-trace">
            {BUILD_TRACE.slice(0, traceStep).map((line) => (
              <li key={line} className="flex items-center gap-2 text-[14px] leading-5 text-ink">
                <ZendeskLogo size={18} />
                {line}
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {sections.map(({ key, body }) => (
              <PlanAccordion
                key={key}
                title={SECTION_LABEL[key]}
                icon={SECTION_ICON[key]}
                chip={sectionChip(state, key)}
                expanded={state.expanded === key}
                onToggle={() => onToggleSection(key)}
              >
                {body}
              </PlanAccordion>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
