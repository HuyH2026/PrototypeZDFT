// The one canned self-improving plan AI Studio can produce, transcribed from the
// Figma "Self-Improving agent" section (1:163482). Data only: no React, no DOM,
// no model call. Every string here is the frame's, with the four copy fixes
// recorded in the plan's Global Constraints.
import type { PlanChipKey } from '../plan-parts/plan-chip'

export type ImprovementSectionKey =
  | 'overview'
  | 'health'
  | 'plan'
  | 'monitor'
  | 'validate'
  | 'guardrails'

export const IMPROVEMENT_SECTIONS: readonly ImprovementSectionKey[] = [
  'overview',
  'health',
  'plan',
  'monitor',
  'validate',
  'guardrails',
]

export const SECTION_LABEL: Record<ImprovementSectionKey, string> = {
  overview: 'Plan overview',
  health: 'Agent health evaluation',
  plan: 'Self-improving plan',
  monitor: 'Monitor and improve',
  validate: 'Validate and check',
  guardrails: 'Autonomy guardrails',
}

// The chips this panel draws are a subset of the shared tint table's keys, so
// the two panels cannot drift apart on a colour the frames share.
export type ImprovementChip = Extract<
  PlanChipKey,
  'critical' | 'needs-approval' | 'tracking' | 'active-check-ins' | 'auto-applied'
>

// Authored semantics, never a function of review state (spec Decision 3): these
// report what the plan *is*. Plan overview — the mechanism — has none.
export const SECTION_CHIP: Record<ImprovementSectionKey, ImprovementChip | null> = {
  overview: null,
  health: 'critical',
  plan: 'needs-approval',
  monitor: 'tracking',
  validate: 'active-check-ins',
  guardrails: 'auto-applied',
}

export type ImprovementStep = {
  id: string
  ordinal: string
  title: string
  description: string
  pills: string[]
}

export type HealthStat = {
  key: string
  caption: string
  // '' when a glyph stands in for the number, as Sentiment does.
  value: string
  unit?: string
  target: string
  // Authored, not derived: all six signals miss their targets, but the frame
  // reddens only three. Deriving this would contradict the frame.
  tone: 'critical' | 'neutral'
  glyph?: 'frown'
}

// `pills` is a free string[] on purpose: the frame's fix cards share no schema
// (Affects/Risk/Reversible, then Test duration/Traffic split/Primary metric,
// then Significance threshold/Auto-promotes). A typed record would force three
// optional shapes and still not cover the next card.
export type ImprovementFix = {
  id: string
  title: string
  description: string
  pills: string[]
}

export type ImprovementWeek = {
  id: string
  label: string
  summary: string
  chip: ImprovementChip
  fixes: ImprovementFix[]
}

export type MonitoringGroup = { id: string; title: string; items: string[] }
export type ExitCondition = { id: string; lead: string; outcome: string }

// Glyph keys, not components: this module stays free of React imports, and the
// section that draws a row maps the key to its lucide icon (spec Decision 4).
export type CheckInGlyph = 'wrench' | 'test-tube' | 'signal' | 'checklist'
export type GuardrailGlyph = 'allowed' | 'approval' | 'rollback' | 'cadence'

export type CheckIn = {
  id: string
  glyph: CheckInGlyph
  title: string
  description: string
  cadence: string
}

export type Guardrail = { id: string; glyph: GuardrailGlyph; title: string; body: string }

export type ImprovementPlan = {
  agentName: string
  agentId: string
  overview: ImprovementStep[]
  health: { stats: HealthStat[]; caseTitle: string; caseIntro: string; caseCauses: string[] }
  weeks: ImprovementWeek[]
  monitor: {
    intro: string
    groups: MonitoringGroup[]
    exitTitle: string
    exits: ExitCondition[]
  }
  checkIns: CheckIn[]
  guardrails: Guardrail[]
}

export const PASSWORD_RESET_PLAN: ImprovementPlan = {
  agentName: 'Password Reset',
  // The seeded Widget use case (agent-builder-data.ts). Keyed by id, not name,
  // so a rename cannot orphan the plan.
  agentId: 'w8',
  overview: [
    {
      id: 'io1',
      ordinal: '01',
      title: 'Evaluate agent health',
      description:
        'Continuously monitors resolution rate, CSAT, and escalation signals to detect where it’s underperforming.',
      pills: ['Deflection rate', 'CSAT', 'Escalation signals'],
    },
    {
      id: 'io2',
      ordinal: '02',
      title: 'Execute improvement plan',
      description:
        'Generates a ranked list of fixes with suggested timelines. Admin reviews, adjusts priorities, and approves the plan before anything changes.',
      pills: ['Ranked fixes', 'Timeline', 'Admin sign-off'],
    },
    {
      id: 'io3',
      ordinal: '03',
      title: 'Monitor and improve',
      description:
        'Applies approved fixes and watches live metrics. Admin can pause or override at any point.',
      pills: ['Knowledge content snippet', 'Policy tuning', 'Live monitoring'],
    },
    {
      id: 'io4',
      ordinal: '04',
      title: 'Validate and check',
      description:
        'Runs regression checks and surfaces a summary. Admin confirms results before the next cycle begins.',
      pills: ['Regression test suite', 'A/B test results', 'Admin sign-off'],
    },
  ],
  health: {
    stats: [
      {
        key: 'health-score',
        caption: 'Health Score',
        value: 'Critical',
        target: 'target ≥Healthy',
        tone: 'critical',
      },
      {
        key: 'deflection',
        caption: 'Deflection rate',
        value: '34',
        unit: '%',
        target: 'target ≥75%',
        tone: 'neutral',
      },
      { key: 'csat', caption: 'CSAT', value: '1.3', target: 'target ≥3.0', tone: 'neutral' },
      {
        key: 'sentiment',
        caption: 'Sentiment',
        value: '',
        target: 'target ≥Positive',
        tone: 'critical',
        glyph: 'frown',
      },
      {
        key: 'handle-time',
        caption: 'Avg handle time',
        value: '8.1',
        unit: 'min',
        target: 'target ≤3 min',
        tone: 'critical',
      },
      {
        key: 'fallback',
        caption: 'Fallback rate',
        value: '58',
        unit: '%',
        target: 'target ≤15%',
        tone: 'neutral',
      },
    ],
    caseTitle: 'The case for a self-improving agent',
    caseIntro:
      'CSAT dropped 32% in 21 days. Escalations are at 41% and the root causes are already known.',
    caseCauses: [
      'Intent recognition misses common variants — “locked out”, “forgot credentials” — driving ~60% fallback rate.',
      'SSO users (~30%) get wrong reset instructions.',
      'API timeouts (~8%) drop to a generic error and escalate.',
    ],
  },
  weeks: [
    {
      id: 'iw1',
      label: 'Week 1',
      summary: 'Immediate auto-fixes',
      chip: 'auto-applied',
      fixes: [
        {
          id: 'if1',
          title: 'Expand intent recognition — 14 new trigger phrases',
          // Copy fix 1: the frame says 38% here and 58% everywhere else.
          description:
            'Adds “can’t log in”, “locked out”, “forgot credentials” to the intent map. No behavior change — broader coverage only. Expected to cut fallback rate from 58% to ~18%.',
          pills: ['Affects: Deflection', 'Risk: low', 'Reversible: yes'],
        },
        {
          id: 'if2',
          title: 'API timeout retry + graceful error message',
          description:
            '2-retry wrapper with exponential backoff. On failure, shows a specific message with a manual reset link instead of a generic error.',
          pills: ['Affects: Escalation rate', 'Risk: low', 'Reversible: yes'],
        },
        {
          id: 'if3',
          title: 'Shorten confirmation messages by ~40%',
          description:
            'Rewrites 180-word confirmations to ~110 words with the action step first. Targets handle time reduction.',
          pills: ['Affects: CSAT', 'Risk: low', 'Reversible: yes'],
        },
      ],
    },
    {
      id: 'iw2',
      label: 'Week 2',
      summary: 'Approval required',
      chip: 'needs-approval',
      fixes: [
        {
          id: 'if4',
          title: 'SSO detection + separate flow branch',
          description:
            'Detects SSO users via $auth_method and routes them to SSO-specific instructions. Adds a new API call and affects ~30% of users.',
          pills: ['Affects: Deflection, CSAT', 'Risk: medium', 'New API call: getAuthMethod'],
        },
        {
          id: 'if5',
          title: 'A/B test: proactive link vs guided steps',
          description:
            '50/50 split — variant A sends a direct reset link, variant B walks through steps. Changes the primary resolution path for 50% of users during the test.',
          pills: ['Test duration: 14 days', 'Traffic split: 50/50', 'Primary metric: Deflection rate'],
        },
      ],
    },
    {
      id: 'iw34',
      label: 'Weeks 3–4',
      summary: 'Monitor and promote winners',
      chip: 'auto-applied',
      fixes: [
        {
          id: 'if6',
          title: 'Promote A/B winner + close experiment',
          description:
            'At p < 0.05, promotes the winner to 100% and archives the loser. No clear winner surfaces a “No winner” recommendation. Health score re-evaluated at end of week 4.',
          pills: ['Significance threshold: p < 0.05', 'Auto-promotes if clear winner'],
        },
      ],
    },
  ],
  monitor: {
    intro:
      'Track six signals continuously — agent health, deflection rate, CSAT, sentiment, fallback rate, and average handle time — and act on what they surface.',
    groups: [
      {
        id: 'daily',
        title: 'Daily',
        items: [
          'Confirm each auto-fix applied correctly',
          'Flag any metric moving in the wrong direction',
          'Regression check against pre-improvement baseline',
        ],
      },
      {
        id: 'weekly',
        title: 'Weekly',
        // Copy fix 3: the frame duplicates the Daily bullets here. Authored
        // replacements, written to be what a weekly pass would actually add.
        items: [
          'Re-score all six signals against their targets',
          'Compare the week against the pre-improvement baseline',
          'Re-rank the fixes still to come',
        ],
      },
      {
        id: 'wrong',
        title: 'If something goes wrong',
        items: [
          'Agent surfaces the regression with the likely cause',
          'Admin can pause, roll back, or override in one action',
          'No fix is permanent until the admin confirms it holds',
        ],
      },
    ],
    exitTitle: 'Exit condition',
    exits: [
      { id: 'ie1', lead: 'Health score ≥ 70', outcome: 'Returns to standard monitoring' },
      { id: 'ie2', lead: 'Below 70 after week 4', outcome: 'AI Studio proposes a follow-on cycle' },
    ],
  },
  checkIns: [
    {
      id: 'ic1',
      glyph: 'wrench',
      title: 'Auto-fix health review',
      description: 'Confirm changes applied correctly',
      cadence: 'Daily',
    },
    {
      id: 'ic2',
      glyph: 'test-tube',
      title: 'A/B experiment mid-point read',
      description: 'Flag early winners or anomalies',
      cadence: 'Daily',
    },
    {
      id: 'ic3',
      glyph: 'signal',
      title: 'Full signal review',
      // Copy fix 2: the frame says "All 5 metrics" against a six-stat scorecard.
      description: 'All 6 signals against targets',
      cadence: 'Weekly',
    },
    {
      id: 'ic4',
      glyph: 'checklist',
      title: 'Recovery assessment',
      description: 'Health score re-evaluated, plan extended or closed',
      cadence: 'Day 28',
    },
  ],
  guardrails: [
    {
      id: 'ig1',
      glyph: 'allowed',
      title: 'Auto-apply threshold',
      body: 'Changes affecting <20% of conversations, classified as intent expansion or message rewrite, apply automatically — no approval needed.',
    },
    {
      id: 'ig2',
      glyph: 'approval',
      title: 'Approval required when',
      body: 'Any change affects >20% of conversations, introduces a new API call, or modifies a core conversation flow.',
    },
    {
      id: 'ig3',
      glyph: 'rollback',
      title: 'Auto-rollback triggers',
      body: 'Any metric worsens by >10% within 48h of an auto-fix — change is rolled back and flagged for admin review.',
    },
    {
      id: 'ig4',
      glyph: 'cadence',
      title: 'AI self-assessment cadence',
      body: 'Plan re-evaluated weekly. No improvement by week 3 → escalates with a revised diagnosis and new recommendations.',
    },
  ],
}

// There is exactly one canned plan today, keyed by the agent it targets rather
// than assumed by callers — so a caller like the Agent Builder editor can ask
// "does this agent have a plan" without hardcoding which one.
const IMPROVEMENT_PLANS: Record<string, ImprovementPlan> = {
  [PASSWORD_RESET_PLAN.agentId]: PASSWORD_RESET_PLAN,
}

export function getImprovementPlan(agentId: string): ImprovementPlan | undefined {
  return IMPROVEMENT_PLANS[agentId]
}

// 'Week 1' | 'Weeks 3–4' → the highest week number the plan names. Derived so a
// heading can never contradict the weeks listed beneath it (spec Decision 2).
export function weekCount(plan: ImprovementPlan): number {
  return plan.weeks.reduce((highest: number, week) => {
    const numbers = week.label.match(/\d+/g) ?? []
    return numbers.reduce((max, digits) => Math.max(max, Number(digits)), highest)
  }, 0)
}

// Deterministic, in the shape of wantsAgentPlan: a health word with an agent
// word, or an explicit "self-improving" anywhere. It shares no vocabulary with
// wantsAgentPlan's build/create verbs, so neither matcher can steal the other's
// ordinary phrasing — and the host checks this one first, because the one string
// both accept ("create a self-improving plan for my agent") is unambiguously this
// flow.
//
// "How are they doing?" is also this question, so the vocabulary covers asking
// after an agent's state and not only naming it as bad: `doing`, `performing`,
// `performance` and `attention` sit beside the struggle words, which is what lets
// "I wanted to check in on how our AI agents are doing" match on its own rather
// than needing "struggling" after it. Both halves stay required, and that pairing
// is what keeps `performance` off "Catch me up on Solve performance" and `doing`
// off a question about a workflow.
const HEALTH_WORDS =
  /\b(struggling|struggle|struggles|underperforming|underperform|failing|unhealthy|health|improve|improvement|performing|performance|doing|attention)\b/
const AGENT_WORDS = /\b(agent|agents|autoflow)\b/
const SELF_IMPROVING_WORDS = /\bself-improving\b/

export function wantsSelfImprovingPlan(prompt: string): boolean {
  const text = prompt.trim().toLowerCase()
  if (!text) return false
  if (SELF_IMPROVING_WORDS.test(text)) return true
  return HEALTH_WORDS.test(text) && AGENT_WORDS.test(text)
}
