// The self-improving plan panel: 590px of reviewable diagnosis beside the
// conversation that produced it. Fully controlled — review state, the activation
// trace and every side effect belong to SelfImprovingFlow, so this file stays a
// rendering of (plan, state) and is testable without a router or a store.
//
// There is no "Ask for changes" and nothing is editable: this plan reports
// measurements, and a scripted rewrite of a diagnosis would be a bigger lie than
// a scripted rewrite of a draft (spec Scope).
import type { ReactNode } from 'react'
import {
  CalendarCheck,
  ClipboardCheck,
  HeartPulse,
  ListChecks,
  LockKeyhole,
  ScanEye,
  X,
} from 'lucide-react'
import { ZendeskLogo } from '@/components/ZendeskLogo'
import { STUDIO_ICON_BUTTON } from '../AiStudioFrame'
import { PlanAccordion } from '../plan-parts/PlanAccordion'
import { approvalHint, canApprove, type ImprovementReviewState } from './improvement-review-state'
import { improvementTraceLines } from './self-improving-approval'
import {
  IMPROVEMENT_SECTIONS,
  PASSWORD_RESET_PLAN,
  SECTION_CHIP,
  SECTION_LABEL,
  weekCount,
  type ImprovementPlan,
  type ImprovementSectionKey,
} from './self-improving-data'
import { CheckInsSection } from './CheckInsSection'
import { GuardrailsSection } from './GuardrailsSection'
import { HealthEvaluationSection } from './HealthEvaluationSection'
import { ImprovementOverviewSection } from './ImprovementOverviewSection'
import { ImprovementPlanSection } from './ImprovementPlanSection'
import { MonitoringSection } from './MonitoringSection'

// Figma draws tabler glyphs; these are the lucide equivalents (spec Decision 4).
// clipboard-heart → ClipboardCheck and heart-plus → HeartPulse are the two
// substitutions; the rest map one to one. 16px, because they sit in the 28px tile
// PlanAccordion draws rather than loose in the row.
const SECTION_ICON: Record<ImprovementSectionKey, ReactNode> = {
  overview: <ListChecks size={16} aria-hidden />,
  health: <ClipboardCheck size={16} aria-hidden />,
  plan: <HeartPulse size={16} aria-hidden />,
  monitor: <ScanEye size={16} aria-hidden />,
  validate: <CalendarCheck size={16} aria-hidden />,
  guardrails: <LockKeyhole size={16} aria-hidden />,
}

export function SelfImprovingCanvas({
  plan = PASSWORD_RESET_PLAN,
  state,
  onToggleSection,
  onApprove,
  onClose,
  activating = false,
  traceStep = 0,
}: {
  plan?: ImprovementPlan
  state: ImprovementReviewState
  onToggleSection: (section: ImprovementSectionKey) => void
  onApprove: () => void
  onClose: () => void
  activating?: boolean
  traceStep?: number
}) {
  const hint = approvalHint(state)
  const approvable = canApprove(state) && !activating
  const trace = improvementTraceLines(plan)

  const body: Record<ImprovementSectionKey, ReactNode> = {
    overview: <ImprovementOverviewSection steps={plan.overview} />,
    health: <HealthEvaluationSection health={plan.health} />,
    plan: <ImprovementPlanSection weeks={plan.weeks} />,
    monitor: <MonitoringSection monitor={plan.monitor} />,
    validate: <CheckInsSection checkIns={plan.checkIns} />,
    guardrails: <GuardrailsSection guardrails={plan.guardrails} />,
  }

  // The plan row is the one heading with a derived suffix: the count comes from
  // the weeks listed inside it, never from the label.
  const titleFor = (key: ImprovementSectionKey) =>
    key === 'plan' ? `${SECTION_LABEL.plan} • ${weekCount(plan)} weeks` : SECTION_LABEL[key]

  return (
    <div data-testid="self-improving-canvas" className="flex h-full flex-col overflow-hidden">
      {/* Header on the studio's own h-16 / px-6, so this row sits on one baseline
          with the wordmark across the divider (as AgentPlanCanvas does). */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-6">
        <span className="flex-1 text-[12px] font-medium leading-[18px] tracking-[-0.1px] text-grey-700">
          Self-improving agent plan
        </span>
        <button
          type="button"
          onClick={onApprove}
          disabled={!approvable}
          className="rounded-full bg-[#ebf5f7] px-4 py-1.5 text-[14px] font-semibold tracking-[-0.1px] text-[#193d50] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Approve plan
        </button>
        <button
          type="button"
          aria-label="Close plan"
          onClick={onClose}
          className={`size-8 ${STUDIO_ICON_BUTTON}`}
        >
          <X size={24} aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-2 pb-8">
        <h2 className="text-[20px] font-semibold leading-[30px] tracking-[-0.1px] text-ink">
          {`Agent ‘${plan.agentName}’`}
        </h2>

        {/* Why Approve is disabled. It lives here rather than under the button,
            which sits in a one-line header row. */}
        {hint && !activating && (
          <p className="mt-1 text-[12px] leading-[18px] text-grey-700">{hint}</p>
        )}

        {activating ? (
          <ol className="mt-6 flex flex-col gap-3" data-testid="improvement-activation-trace">
            {trace.slice(0, traceStep).map((line) => (
              <li key={line} className="flex items-center gap-2 text-[14px] leading-5 text-ink">
                <ZendeskLogo size={18} />
                {line}
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-4 flex flex-col gap-1.5">
            {IMPROVEMENT_SECTIONS.map((key) => (
              <PlanAccordion
                key={key}
                testId={`improvement-section-${key}`}
                title={titleFor(key)}
                icon={SECTION_ICON[key]}
                chip={SECTION_CHIP[key]}
                expanded={state.expanded === key}
                onToggle={() => onToggleSection(key)}
              >
                {body[key]}
              </PlanAccordion>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
