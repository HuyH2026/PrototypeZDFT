// The outer loop's data. Authored or derived — no React, no DOM, no model call,
// and no clock (see the plan's Global Constraints).
//
// A change carries the *gate* that admitted it, never a lane. The lane follows
// from the gate, so a lane count can never be authored beside the changes it
// counts and then drift from them.
import {
  PASSWORD_RESET_PLAN,
  type ImprovementPlan,
} from '@/features/ai-studio/self-improving/self-improving-data'

/** The diagram's four outcome lanes, in top-to-bottom order. */
export type OutcomeLane = 'deployed' | 'testing' | 'held' | 'rolled-back'

export const LANES: readonly OutcomeLane[] = ['deployed', 'testing', 'held', 'rolled-back']

export const LANE_LABEL: Record<OutcomeLane, string> = {
  deployed: 'Applied',
  testing: 'Experiment running',
  held: 'Pending asks',
  'rolled-back': 'Rolled back',
}

export type Risk = 'low' | 'medium' | 'high'

/**
 * The guardrails the approved self-improving plan already describes in prose
 * (see `self-improving-data.ts` → `PASSWORD_RESET_PLAN.guardrails`), made
 * machine-readable. `experiment` is the one addition: a change in test is in a
 * state, not through a gate.
 */
export type GateKey =
  'under-20-percent' | 'new-api-call' | 'core-flow' | 'metric-regression' | 'experiment'

export const GATE_LANE: Record<GateKey, OutcomeLane> = {
  'under-20-percent': 'deployed',
  'new-api-call': 'held',
  'core-flow': 'held',
  'metric-regression': 'rolled-back',
  experiment: 'testing',
}

/** Why a change is in its lane, in the guardrails' own words. */
export const GATE_LABEL: Record<GateKey, string> = {
  'under-20-percent': 'Under the 20% auto-apply threshold',
  'new-api-call': 'Introduces a new API call',
  'core-flow': 'Modifies a core conversation flow',
  'metric-regression': 'A metric worsened by >10% within 48h',
  experiment: 'Running as an experiment',
}

export function laneFor(gate: GateKey): OutcomeLane {
  return GATE_LANE[gate]
}

/** An authored measurement, only ever read inside this feature (Spec Decision 8). */
export type ChangeEffect = {
  metric: string
  from: string
  to: string
  direction: 'improved' | 'worsened' | 'flat'
  window: string
}

export type Change = {
  id: string
  /** Keyed by id, not name, so renaming an agent cannot orphan a change. */
  agentId: string
  agentName: string
  title: string
  description: string
  /** Why the operator picked this, in this cycle. */
  rationale: string
  blastRadius: string
  risk: Risk
  /** The lane follows from this. There is deliberately no `lane` field. */
  gate: GateKey
  /** Shipped and rolled-back changes only. */
  effect?: ChangeEffect
}

// The loop's own framing of each plan fix. The fix's *content* comes from the
// plan; what is authored here is why the operator chose it and which guardrail
// admitted it. Keyed by the plan's fix ids (if1–if6).
//
// The gates are not free choices: if4 and if5 are the plan's two
// `needs-approval` fixes, so their gates must be ones that hold. The
// "holds exactly the fixes the plan chipped needs-approval" test enforces that.
const PLAN_FIX_FRAMING: Record<
  string,
  { gate: GateKey; risk: Risk; blastRadius: string; rationale: string; effect?: ChangeEffect }
> = {
  if1: {
    gate: 'under-20-percent',
    risk: 'low',
    blastRadius: 'affects <20% of conversations',
    rationale:
      'Fallback rate was the worst of the six signals at 58%, and intent coverage is the cheapest lever on it.',
    effect: {
      metric: 'Fallback rate',
      from: '58%',
      to: '41%',
      direction: 'improved',
      window: 'in the first 12h',
    },
  },
  if2: {
    gate: 'under-20-percent',
    risk: 'low',
    blastRadius: 'affects ~8% of conversations',
    rationale:
      'API timeouts accounted for roughly 8% of escalations, and every one of them was recoverable with a retry.',
    effect: {
      metric: 'Escalation rate',
      from: '41%',
      to: '34%',
      direction: 'improved',
      window: 'in the first 12h',
    },
  },
  if3: {
    gate: 'under-20-percent',
    risk: 'low',
    blastRadius: 'affects <20% of conversations',
    rationale:
      'Handle time was 8.1 min against a 3 min target, and confirmation length is its largest fixed cost.',
    effect: {
      metric: 'Avg handle time',
      from: '8.1 min',
      to: '6.4 min',
      direction: 'improved',
      window: 'in the first 12h',
    },
  },
  if4: {
    gate: 'new-api-call',
    risk: 'medium',
    blastRadius: 'affects ~30% of conversations',
    rationale:
      'SSO users are being given instructions that cannot work. Requires approval because it introduces getAuthMethod.',
  },
  if5: {
    gate: 'core-flow',
    risk: 'medium',
    blastRadius: 'affects 50% of conversations for 14 days',
    rationale:
      'Two plausible resolution paths and no evidence which wins. Requires approval because it changes the primary flow.',
  },
  if6: {
    gate: 'experiment',
    risk: 'low',
    blastRadius: 'affects 50% of conversations',
    rationale:
      'Promotes whichever variant clears p < 0.05. Nothing to decide until the test reads out.',
  },
}

/**
 * The plan's fixes as loop changes. Titles and descriptions are the plan's own,
 * so this screen and the AI Studio panel cannot describe the same change
 * differently — and the count of held changes is the plan's `awaitingApproval`.
 */
export function changesFromPlan(plan: ImprovementPlan): Change[] {
  return plan.weeks.flatMap((week) =>
    week.fixes.map((fix) => {
      const framing = PLAN_FIX_FRAMING[fix.id]
      if (framing === undefined) {
        throw new Error(`No pipeline framing authored for plan fix ${fix.id}`)
      }
      return {
        id: fix.id,
        agentId: plan.agentId,
        agentName: plan.agentName,
        title: fix.title,
        description: fix.description,
        rationale: framing.rationale,
        blastRadius: framing.blastRadius,
        risk: framing.risk,
        gate: framing.gate,
        effect: framing.effect,
      }
    }),
  )
}

export const PLAN_CHANGES: Change[] = changesFromPlan(PASSWORD_RESET_PLAN)

export type Cycle = {
  id: string
  ordinal: number
  /** Authored, never computed — see the plan's Global Constraints. */
  whenLabel: string
  assessed: number
  signals: number
  /** MemoryEntry ids the operator consulted before deciding. */
  recalled: string[]
  changeIds: string[]
  /**
   * The ticker replays this, and the expanded cycle row lists it. One array, so
   * the strip cannot narrate a line the row does not show (Spec Decision 6).
   */
  journal: string[]
}

export type MemoryEntry = {
  id: string
  title: string
  agentName: string
  triedInCycle: number
  outcome: string
  verdict: 'ruled-out' | 'working' | 'declined'
  retryLabel: string
  /** The change this entry remembers, where one exists — so an authored outcome cannot drift from the effect it describes. */
  changeId?: string
}

export type LoopConfig = {
  scheduleLabel: string
  nextWakeLabel: string
  cadence: string
  operatorLabel: string
  scopeLabel: string
  signals: number
  medianTimeToFix: string
}

export const LOOP: LoopConfig = {
  scheduleLabel: 'Outcome drift',
  nextWakeLabel: 'On material drift',
  cadence: 'drift-triggered',
  operatorLabel: 'AI Studio',
  // No brand filter: these agents are use cases organised by channel, not by
  // brand, so a brand control here would not filter anything (Spec Decision 9).
  scopeLabel: 'All agents, every channel',
  signals: 6,
  medianTimeToFix: '4.2d',
}

/** The window the cycle log shows is 6; the loop has run 148 times. */
export const TOTAL_CYCLES = 148

// Changes for agents other than w8. Names match agent-builder-data.ts seeds so
// the fleet tab can join on agentId.
export const FLEET_CHANGES: Change[] = [
  {
    id: 'fc1',
    agentId: 'w2',
    agentName: 'Fallback',
    title: 'Route unmatched intents to the closest sibling use case',
    description:
      'Where an unmatched message scores within 0.08 of a known intent, hand off to that use case instead of replying generically.',
    rationale:
      'Fallback absorbs every miss in the Widget channel, so its own deflection is the ceiling on everyone else’s.',
    blastRadius: 'affects ~11% of conversations',
    risk: 'low',
    gate: 'under-20-percent',
    effect: {
      metric: 'Deflection rate',
      from: '52%',
      to: '58%',
      direction: 'improved',
      window: 'over 9 days',
    },
  },
  {
    id: 'fc2',
    agentId: 'w5',
    agentName: 'Tax document processing',
    title: 'Auto-close resolved threads after 24h of silence',
    description:
      'Closes a thread with no customer reply 24h after a resolution message, instead of holding it open for 7 days.',
    rationale:
      'Open-thread count was inflating handle time without any customer waiting on a reply.',
    blastRadius: 'affects ~14% of conversations',
    risk: 'medium',
    gate: 'metric-regression',
    effect: {
      metric: 'CSAT',
      from: '3.9',
      to: '3.4',
      direction: 'worsened',
      window: 'within 48h',
    },
  },
  {
    id: 'fc3',
    agentId: 'v1',
    agentName: 'Call routing',
    title: 'Shorten the opening prompt by one sentence',
    description:
      'Drops the second sentence of the greeting, which restated what the first had already said.',
    rationale: 'Callers were interrupting the greeting in 38% of calls, which forces a re-prompt.',
    blastRadius: 'affects <20% of conversations',
    risk: 'low',
    gate: 'under-20-percent',
    effect: {
      metric: 'Avg handle time',
      from: '4.6 min',
      to: '4.1 min',
      direction: 'improved',
      window: 'over 12 days',
    },
  },
  {
    id: 'fc4',
    agentId: 'h1',
    agentName: 'API resolver',
    title: 'A/B: structured status payload vs prose reply',
    description:
      '50/50 split — variant A returns a structured payload with the tracking state, variant B answers in prose.',
    rationale:
      'Prose replies were being followed by a clarifying request in 29% of calls into the resolver.',
    blastRadius: 'affects 50% of conversations',
    risk: 'low',
    gate: 'experiment',
  },
  {
    id: 'fc5',
    agentId: 'c1',
    agentName: 'Email escalation',
    title: 'Escalate to a human on the second unresolved reply',
    description: 'Hands off after two consecutive low-confidence replies rather than three.',
    rationale:
      'The third attempt resolved 4% of the time and added a day to the thread, which is a bad trade on an email escalation.',
    blastRadius: 'affects ~6% of conversations',
    risk: 'low',
    gate: 'under-20-percent',
    effect: {
      metric: 'Escalation rate',
      from: '18%',
      to: '21%',
      direction: 'worsened',
      window: 'over 5 days',
    },
  },
]

export const ALL_CHANGES: Change[] = [...PLAN_CHANGES, ...FLEET_CHANGES]

export const MEMORY: MemoryEntry[] = [
  {
    id: 'm1',
    title: 'Proactive reset link instead of guided steps',
    agentName: 'Password Reset',
    triedInCycle: 121,
    outcome: 'Lost on deflection: −4.2 pts against control over 14 days',
    verdict: 'ruled-out',
    retryLabel: 'Won’t retry before Q4',
  },
  {
    id: 'm2',
    title: 'Auto-close resolved threads after 24h',
    agentName: 'Tax document processing',
    triedInCycle: 146,
    outcome: 'CSAT fell 3.9 → 3.4 within 48h; rolled back automatically',
    verdict: 'ruled-out',
    retryLabel: 'Won’t retry — the regression was the metric it targeted',
    changeId: 'fc2',
  },
  {
    id: 'm3',
    title: 'Repeat routing choices after every interruption',
    agentName: 'Call routing',
    triedInCycle: 138,
    outcome: 'Handle time rose 9% with no resolution lift over 10 days',
    verdict: 'ruled-out',
    retryLabel: 'Won’t retry — it added friction without improving resolution',
  },
  {
    id: 'm4',
    title: 'Expanded intent coverage from live fallback transcripts',
    agentName: 'Password Reset',
    triedInCycle: 148,
    outcome: 'Fallback rate fell 58% → 41% in the first 12h',
    verdict: 'working',
    retryLabel: 'Kept — extending the same approach to Login Help',
    changeId: 'if1',
  },
  {
    id: 'm5',
    title: 'Sibling-intent handoff from Fallback',
    agentName: 'Fallback',
    triedInCycle: 139,
    outcome: 'Deflection rose 52% → 58% over 9 days',
    verdict: 'working',
    retryLabel: 'Kept — promoted to 100%',
    changeId: 'fc1',
  },
  {
    id: 'm6',
    title: 'Third reply attempt before escalating an email thread',
    agentName: 'Email escalation',
    triedInCycle: 144,
    outcome: 'Resolved 4% of the time while adding a day to the thread',
    verdict: 'ruled-out',
    retryLabel: 'Won’t retry on email channels',
  },
]

export const CYCLES: Cycle[] = [
  {
    id: 'c148',
    ordinal: 148,
    whenLabel: '12 hours ago',
    assessed: 39,
    signals: 6,
    recalled: ['m1'],
    changeIds: ['if1', 'if2', 'if3', 'if4', 'if5', 'if6'],
    journal: [
      'Outcome drift triggered a pass — reading 6 signals across the fleet',
      'Password Reset is the only agent below target on 4 of 6 signals',
      'Executing the active management plan for this agent',
      'Recalled 1 prior experiment on this agent — already ruled out',
      'Skipped the proactive-link variant — lost on deflection in cycle 121',
      'Applied 3 changes under the 20% auto-apply threshold',
      'Raised 2 pending asks: one adds an API call, one alters the primary flow',
      'Cycle complete — 3 applied, 1 experiment running, 2 pending asks',
    ],
  },
  {
    id: 'c147',
    ordinal: 147,
    whenLabel: '2 days ago',
    assessed: 39,
    signals: 6,
    recalled: ['m5'],
    changeIds: ['fc1'],
    journal: [
      'Outcome drift triggered a pass — reading 6 signals across the fleet',
      'Fallback deflection had been flat for 3 cycles',
      'Promoted the sibling-intent handoff from 50% to 100%',
      'Cycle complete — 1 applied',
    ],
  },
  {
    id: 'c146',
    ordinal: 146,
    whenLabel: '3 days ago',
    assessed: 39,
    signals: 6,
    recalled: ['m2'],
    changeIds: ['fc2'],
    journal: [
      'Outcome drift triggered a pass — reading 6 signals across the fleet',
      'CSAT on Tax document processing fell 3.9 → 3.4 within 48h of the auto-close change',
      'Auto-rollback triggered: the regression exceeded the 10% threshold',
      'Reverted the change and recorded it as ruled out',
      'Cycle complete — 1 rolled back, flagged for your review',
    ],
  },
  {
    id: 'c145',
    ordinal: 145,
    whenLabel: '4 days ago',
    assessed: 39,
    signals: 6,
    recalled: [],
    changeIds: [],
    journal: [
      'Outcome drift triggered a pass — reading 6 signals across the fleet',
      'Every agent within target on every signal',
      'No action taken',
    ],
  },
  {
    id: 'c144',
    ordinal: 144,
    whenLabel: '5 days ago',
    assessed: 39,
    signals: 6,
    recalled: ['m6'],
    changeIds: ['fc4', 'fc5'],
    journal: [
      'Outcome drift triggered a pass — reading 6 signals across the fleet',
      'API resolver replies carried a clarifying request 29% of the time',
      'Launched an A/B test on reply format at a 50/50 split',
      'Tightened Email escalation from three low-confidence replies to two',
      'Cycle complete — 1 applied, 1 experiment running',
    ],
  },
  {
    id: 'c143',
    ordinal: 143,
    whenLabel: '6 days ago',
    assessed: 39,
    signals: 6,
    recalled: ['m3'],
    changeIds: ['fc3'],
    journal: [
      'Outcome drift triggered a pass — reading 6 signals across the fleet',
      'Callers interrupted the Voice greeting in 38% of calls',
      'Shortened the opening prompt by one sentence',
      'Cycle complete — 1 applied',
    ],
  },
]

/** The customer-visible lifecycle after the loop raises a pending ask. */
export type PipelineDecision = 'approved' | 'winner-ready' | 'applied' | 'rejected'

/** Change id → decision. Absent means undecided. */
export type Decisions = Record<string, PipelineDecision>
