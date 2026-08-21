// Deterministic prototype data for the outcome-led management cockpit. These
// fixtures describe the customer flow only: they do not model a scheduler,
// backend, or measurement system.

export type ManagementMode = 'shadow' | 'suggest' | 'full'

export const MANAGEMENT_MODE_LABEL: Record<ManagementMode, string> = {
  shadow: 'Shadow',
  suggest: 'Suggest',
  full: 'Full',
}

export type OutcomeMetricId =
  | 'ai-resolution-rate'
  | 'entitlement-consumption'
  | 'cost-avoided'
  | 'ai-interaction-csat'
  | 'policy-compliance-rate'

type OutcomeMetricBase = {
  id: OutcomeMetricId
  label: string
  current: number
  format: 'percent' | 'compact-number' | 'currency' | 'rating'
}

/**
 * Growth outcomes have a target; the trust guardrail has a hard floor; a
 * metric with neither always maximizes toward its format's natural ceiling
 * (100% for a percent) with no operator-set number of its own. The union
 * prevents a metric from quietly being treated as more than one of these.
 */
export type OutcomeMetric = OutcomeMetricBase &
  (
    | { target: number; hardFloor?: never }
    | { target?: never; hardFloor: number }
    | { target?: never; hardFloor?: never }
  )

export const OUTCOME_METRICS: OutcomeMetric[] = [
  {
    id: 'ai-resolution-rate',
    label: 'AI resolution rate',
    current: 42.1,
    format: 'percent',
  },
  {
    id: 'entitlement-consumption',
    label: 'Entitlement consumption',
    current: 38_400,
    target: 50_000,
    format: 'compact-number',
  },
  {
    id: 'cost-avoided',
    label: 'Cost avoided',
    current: 312_000,
    target: 450_000,
    format: 'currency',
  },
  {
    id: 'ai-interaction-csat',
    label: 'AI-interaction CSAT',
    current: 4.21,
    hardFloor: 4.17,
    format: 'rating',
  },
  {
    id: 'policy-compliance-rate',
    label: 'Policy compliance rate',
    current: 99.6,
    hardFloor: 99.0,
    format: 'percent',
  },
]

export type CockpitChannel = 'Widget' | 'Email' | 'Voice'
export type FindingState = 'observed' | 'testing' | 'awaiting-approval' | 'applied'
export type FindingRisk = 'low' | 'medium' | 'high'

export type CockpitFinding = {
  id: string
  title: string
  summary: string
  targetAgentIds: string[]
  channel: CockpitChannel
  projectedResolutionDelta: number
  entitlementReach: string
  confidence: number
  csatProjection: string
  state: FindingState
  risk: FindingRisk
  evidence: string[]
  proposedChange: string
  /** The action changes with the authority granted to the selected agent. */
  ctaByMode: Record<ManagementMode, string>
}

export const FINDINGS: CockpitFinding[] = [
  {
    id: 'password-reset-lockout-language',
    title: 'Recognize account-lockout language earlier',
    summary:
      'Password Reset misses locked-account and expired-code phrasing, sending recoverable Widget conversations to fallback.',
    targetAgentIds: ['w8'],
    channel: 'Widget',
    projectedResolutionDelta: 3.1,
    entitlementReach: '6.8k AI interactions / month',
    confidence: 92,
    csatProjection: '4.23 projected · above 4.17 floor',
    state: 'awaiting-approval',
    risk: 'medium',
    evidence: [
      '58% fallback rate in the diagnosed Password Reset cohort',
      'Locked-account language appears in 31% of recoverable misses',
    ],
    proposedChange:
      'Expand the trigger phrases and branch on authentication method before presenting reset steps.',
    ctaByMode: {
      shadow: 'View evidence',
      suggest: 'Review proposal',
      full: 'Review held change',
    },
  },
  {
    id: 'fallback-near-match-routing',
    title: 'Preserve captured context during sibling handoff',
    summary:
      'Fallback’s proven sibling-intent handoff drops captured order or account context, making the receiving use case ask again.',
    targetAgentIds: ['w2'],
    channel: 'Widget',
    projectedResolutionDelta: 2.4,
    entitlementReach: '11.2k AI interactions / month',
    confidence: 88,
    csatProjection: '4.20 projected · above 4.17 floor',
    state: 'testing',
    risk: 'low',
    evidence: [
      '22% of sibling handoffs repeat a question the customer already answered',
      'A seven-day replay retaining context cut repeat prompts by 61%',
    ],
    proposedChange:
      'Pass validated captured fields into the receiving use case while preserving its existing confirmation guardrails.',
    ctaByMode: {
      shadow: 'View replay evidence',
      suggest: 'Review experiment',
      full: 'View live test',
    },
  },
  {
    id: 'call-routing-opening-prompt',
    title: 'Wait for a pause before replaying routing choices',
    summary:
      'Call routing replays its choices immediately after an interruption, speaking over callers and forcing another prompt.',
    targetAgentIds: ['v1'],
    channel: 'Voice',
    projectedResolutionDelta: 1.8,
    entitlementReach: '4.2k AI interactions / month',
    confidence: 84,
    csatProjection: '4.22 projected · above 4.17 floor',
    state: 'testing',
    risk: 'low',
    evidence: [
      'Callers interrupted the opening in 38% of sampled calls',
      'A short silence window reduced recovery re-prompts in the early test cohort',
    ],
    proposedChange:
      'Wait for a short silence window before replaying the recovery prompt while preserving all routing choices.',
    ctaByMode: {
      shadow: 'View evidence',
      suggest: 'View published change',
      full: 'View change receipt',
    },
  },
  {
    id: 'email-escalation-context',
    title: 'Collect urgency context before escalation',
    summary:
      'Email escalation can resolve more threads when it gathers order age and SLA urgency before handing off.',
    targetAgentIds: ['c1'],
    channel: 'Email',
    projectedResolutionDelta: 1.4,
    entitlementReach: '2.1k AI interactions / month',
    confidence: 79,
    csatProjection: '4.19 projected · above 4.17 floor',
    state: 'observed',
    risk: 'medium',
    evidence: [
      '27% of escalated threads are missing order age or SLA context',
      'Complete context prevented a handoff in 12 of 50 reviewed threads',
    ],
    proposedChange:
      'Ask one contextual question, then resolve or escalate using the existing urgency policy.',
    ctaByMode: {
      shadow: 'Inspect evidence',
      suggest: 'Draft proposal',
      full: 'Start guarded test',
    },
  },
  {
    id: 'widget-recovery-language',
    title: 'Reuse the proven recovery-language pattern',
    summary:
      'Password Reset and Fallback share a recoverable dead-end pattern that can use the same concise clarification step.',
    targetAgentIds: ['w8', 'w2'],
    channel: 'Widget',
    projectedResolutionDelta: 0.7,
    entitlementReach: '3.6k AI interactions / month',
    confidence: 76,
    csatProjection: '4.18 projected · above 4.17 floor',
    state: 'observed',
    risk: 'low',
    evidence: [
      'The clarification pattern won in two earlier Widget cohorts',
      'Both agents end these turns with the same missing-context signal',
    ],
    proposedChange:
      'Add the approved one-question clarification pattern to both agents and replay recent misses.',
    ctaByMode: {
      shadow: 'Compare evidence',
      suggest: 'Create proposals',
      full: 'Start scoped tests',
    },
  },
]

export const INITIAL_MANAGEMENT_MODES: Record<string, ManagementMode> = {
  w1: 'full',
  w2: 'full',
  w3: 'suggest',
  w4: 'suggest',
  w5: 'shadow',
  w6: 'shadow',
  w7: 'suggest',
  w8: 'suggest',
  w9: 'full',
  w10: 'full',
  w11: 'full',
  w12: 'full',
  w13: 'full',
  w14: 'full',
  w15: 'full',
  w16: 'suggest',
  w17: 'suggest',
  w18: 'suggest',
  w19: 'suggest',
  w20: 'suggest',
  w21: 'suggest',
  c1: 'shadow',
  v1: 'full',
  v2: 'shadow',
  v3: 'suggest',
  v4: 'shadow',
  v5: 'shadow',
  v6: 'shadow',
  v7: 'shadow',
  v8: 'shadow',
  v9: 'shadow',
  // Web Call's four seeded rows (frame 120:57534); the voice v10 row is being
  // replaced by the outbound redesign in flight, so it is absent for now.
  wc1: 'shadow',
  wc2: 'shadow',
  wc3: 'full',
  wc4: 'suggest',
  h1: 'full',
  h2: 'suggest',
  h3: 'shadow',
  h4: 'full',
}

export function findingsForAgent(agentId: string): CockpitFinding[] {
  return FINDINGS.filter((finding) => finding.targetAgentIds.includes(agentId))
}

export function topFindingForAgent(agentId: string): CockpitFinding | undefined {
  return findingsForAgent(agentId).reduce<CockpitFinding | undefined>((top, finding) => {
    if (top === undefined) return finding
    if (finding.projectedResolutionDelta > top.projectedResolutionDelta) return finding
    if (
      finding.projectedResolutionDelta === top.projectedResolutionDelta &&
      finding.confidence > top.confidence
    ) {
      return finding
    }
    return top
  }, undefined)
}

export function projectedOutcomeImpactForAgent(agentId: string): number {
  return findingsForAgent(agentId).reduce(
    (total, finding) => total + finding.projectedResolutionDelta,
    0,
  )
}

function rankedAttentionAgentIds(): string[] {
  const agentIds = new Set(FINDINGS.flatMap((finding) => finding.targetAgentIds))
  return [...agentIds].sort((left, right) => {
    const impactDifference =
      projectedOutcomeImpactForAgent(right) - projectedOutcomeImpactForAgent(left)
    return impactDifference || left.localeCompare(right)
  })
}

/** The four agents with the largest aggregate projected resolution lift. */
export const ATTENTION_AGENT_IDS: string[] = rankedAttentionAgentIds().slice(0, 4)

export function modeCounts(
  modes: Readonly<Record<string, ManagementMode>> = INITIAL_MANAGEMENT_MODES,
): Record<ManagementMode, number> {
  const counts: Record<ManagementMode, number> = { shadow: 0, suggest: 0, full: 0 }
  for (const mode of Object.values(modes)) counts[mode] += 1
  return counts
}
