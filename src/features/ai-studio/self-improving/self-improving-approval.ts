// What approving the plan commits to, and what the panel narrates while it does.
// Pure: both take the plan and return derived values, so the trace can never
// report a different number of fixes than the store holds.
//
// No dates are computed. Cadences are authored labels ('Daily', 'Day 28',
// 'Week 1 of 4') — Date.now() would make every fixture nondeterministic.
import { weekCount, type ImprovementChip, type ImprovementPlan } from './self-improving-data'

// The same 600ms cadence as agent-plan's build trace, declared here rather than
// imported: the two flows share leaves, not modules.
export const IMPROVEMENT_TRACE_STEP_MS = 600

export type ActiveImprovementPlan = {
  agentName: string
  agentId: string
  // 'Week 1 of 4' — the 4 is the plan's derived total, not a literal.
  weekLabel: string
  // 'Week 1 — Immediate auto-fixes'
  stage: string
  // 'Auto-fix health review — Daily'
  nextCheckIn: string
  autoApplied: number
  awaitingApproval: number
}

function fixesChipped(plan: ImprovementPlan, chip: ImprovementChip): number {
  return plan.weeks
    .filter((week) => week.chip === chip)
    .reduce((total, week) => total + week.fixes.length, 0)
}

function weekLabelsChipped(plan: ImprovementPlan, chip: ImprovementChip): string[] {
  return plan.weeks.filter((week) => week.chip === chip).map((week) => week.label)
}

function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? ''
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

export function activePlanFromImprovementPlan(plan: ImprovementPlan): ActiveImprovementPlan {
  const first = plan.weeks[0]
  const next = plan.checkIns[0]
  return {
    agentName: plan.agentName,
    agentId: plan.agentId,
    weekLabel: `${first.label} of ${weekCount(plan)}`,
    stage: `${first.label} — ${first.summary}`,
    nextCheckIn: `${next.title} — ${next.cadence}`,
    autoApplied: fixesChipped(plan, 'auto-applied'),
    awaitingApproval: fixesChipped(plan, 'needs-approval'),
  }
}

export function improvementTraceLines(plan: ImprovementPlan): string[] {
  const active = activePlanFromImprovementPlan(plan)
  const next = plan.checkIns[0]
  return [
    `Enabled monitoring on ${plan.health.stats.length} health signals`,
    `Applied ${active.autoApplied} auto-fixes across ${joinLabels(
      weekLabelsChipped(plan, 'auto-applied'),
    )}`,
    `Scheduled ${plan.checkIns.length} check-ins, starting with the ${next.cadence.toLowerCase()} ${next.title.toLowerCase()}`,
    `Held ${active.awaitingApproval} ${joinLabels(
      weekLabelsChipped(plan, 'needs-approval'),
    )} changes for your approval`,
  ]
}

// Four lines at 600ms each. Stepping one past the last line is what gives that
// line its own dwell, so a flow that waits this long has shown the whole trace.
export const IMPROVEMENT_TRACE_TOTAL_MS = 4 * IMPROVEMENT_TRACE_STEP_MS
