// The one canned agent plan AI Studio can produce, transcribed from the Figma
// "New Agent" section's bottom row (spec panel 1:181829 — the structured-policy
// variant). Data only: no React, no DOM, no model call. Every string here is the
// frame's, with the three copy fixes recorded in the plan's Global Constraints.
import type { PolicySegment, StepType } from '@/features/ai-agents/agent-store'

export type PlanSectionKey = 'overview' | 'impact' | 'agent' | 'thinking'

export const SECTION_LABEL: Record<PlanSectionKey, string> = {
  overview: 'Plan overview',
  impact: 'Impact',
  agent: 'Agent',
  thinking: 'AI thinking',
}

// A reference the plan makes to something outside itself. `actionId` is set only
// where the actions catalogue really has that action; without one the chip reads
// "will be created" (see PlanRefChip), because variables and events have no
// screen in this app and inventing a route for them would be a broken promise.
export type PlanRefKind = 'action' | 'variable' | 'event'
export type PlanSpan =
  | { kind: 'text'; text: string }
  | { kind: 'ref'; refKind: PlanRefKind; label: string; actionId?: string }

export type PlanOverviewStep = {
  id: string
  ordinal: string
  title: string
  description: string
  metrics: string[]
}

// '~60' + '%' + 'fully automated by AI' — the value and its unit are separate
// because the frame sets them at 34px and 16px on one baseline.
export type PlanImpactStat = { caption: string; value: string; unit: string; note: string }

export type PlanToolRow = {
  kind: PlanRefKind
  name: string
  description: string
  actionId?: string
}

export type PlanThinkingStep = { id: string; label: string; title: string; body: PlanSpan[] }

// A read-only preview of what BlockCanvas will show once the agent exists.
// `heading` is absent on the Options card, which goes straight from its badge to
// the prompt row (frame 1:181997). `canvasTitle` is the title the created
// CanvasBlock gets on approval.
export type PlanPolicyBlock = {
  stepType: Extract<StepType, 'form' | 'options'>
  title: string
  kindLabel: string
  badgeLabel: string
  heading?: string
  prompt: string
  fields?: string[]
  answers?: string[]
  canvasTitle: string
}

export type PlanPolicyNode =
  | { kind: 'run'; id: string; segments: PolicySegment[] }
  | { kind: 'block'; id: string; block: PlanPolicyBlock }

export type AgentPlan = {
  agentName: string
  overview: PlanOverviewStep[]
  impact: { stats: PlanImpactStat[]; narrative: string }
  agent: { description: string; policy: PlanPolicyNode[]; tools: PlanToolRow[] }
  thinking: PlanThinkingStep[]
}

// The one action in this plan that already exists in the catalogue, so its
// reference is a link rather than a promise (see tools-data.ts).
export const ACCOUNT_PROFILE_ACTION_ID = 'get-account-profile'

const t = (text: string): PlanSpan => ({ kind: 'text', text })
const action = (label: string, actionId?: string): PlanSpan => ({ kind: 'ref', refKind: 'action', label, actionId })
const v = (label: string): PlanSpan => ({ kind: 'ref', refKind: 'variable', label })

const FORM_BLOCK: PlanPolicyBlock = {
  stepType: 'form',
  title: 'Form',
  kindLabel: 'Reason for cancellation',
  badgeLabel: 'Forms',
  heading: 'Cancellation reason',
  prompt: 'Please fill out the fields to select your cancellation reason.',
  fields: ['$Email', '$BillingZipCode', '$SelectedReason'],
  canvasTitle: 'Cancellation reason',
}

const OPTIONS_BLOCK: PlanPolicyBlock = {
  stepType: 'options',
  title: '30-Day Free - Accept or Decline',
  kindLabel: 'Option',
  badgeLabel: 'Options',
  prompt: 'Do you want a 30 day free trial?',
  answers: ['Yes', 'No'],
  canvasTitle: '30-Day Free - Accept or Decline',
}

export const AGENT_PLAN: AgentPlan = {
  agentName: 'Service Cancellation',
  overview: [
    {
      id: 'o1',
      ordinal: '01',
      title: 'Identify cancellation intent',
      description: 'Detects when a customer truly wants to cancel, not just vent or explore options.',
      metrics: ['Deflection rate', 'Resolution time'],
    },
    {
      id: 'o2',
      ordinal: '02',
      title: 'Personalized retention offer',
      description: 'Surfaces the right discount or pause option based on the customer’s account tier.',
      metrics: ['Save rate', 'Deflection rate'],
    },
    {
      id: 'o3',
      ordinal: '03',
      title: 'Process confirmed cancellations',
      description: 'Completes the cancellation end-to-end through your existing API, no human needed.',
      metrics: ['Resolution time', 'Agent hours saved'],
    },
    {
      id: 'o4',
      ordinal: '04',
      title: 'Escalate VIP accounts and edge cases',
      description: 'Routes high-value accounts and complex situations to a human agent, instantly.',
      metrics: ['Deflection rate', 'Save rate'],
    },
  ],
  impact: {
    stats: [
      { caption: 'Cancellation-related tickets', value: '23', unit: '%', note: 'today’s current rate' },
      { caption: 'Projected deflection', value: '~68', unit: '%', note: 'based on similar agents' },
      { caption: 'Estimated resolution time', value: '~4', unit: 'min', note: 'vs 14 min human avg' },
    ],
    narrative:
      'Deflecting ~540 of 800 monthly cancellation tickets frees roughly 90 hours of agent time monthly. A structured retention offer at the right moment also converts better than ad-hoc human responses — even a 5% save rate on cancellations has direct revenue impact.',
  },
  agent: {
    description:
      'Talk to customers who want to cancel, figure out why, and make one offer to keep them (discount or pause). If they still cancel, log the reason and confirm. VIPs go straight to a human.',
    policy: [
      {
        kind: 'run',
        id: 'r1',
        segments: [
          { kind: 'prose', id: 'pr1', text: 'Reveal form below to determine customer’s cancellation reasons.' },
        ],
      },
      { kind: 'block', id: 'blk-form', block: FORM_BLOCK },
      {
        kind: 'run',
        id: 'r2',
        segments: [
          { kind: 'prose', id: 'pr2', text: 'Trigger ' },
          { kind: 'chip', id: 'pc1', variant: 'routing', label: 'Retention Routing' },
          { kind: 'prose', id: 'pr3', text: '.' },
        ],
      },
      {
        kind: 'run',
        id: 'r3',
        segments: [
          {
            kind: 'prose',
            id: 'pr4',
            text:
              'Based on retention classification, explain to the customer that their problem is solvable and offer 30 days free while the team works on resolving it.\nAsk if they want to take the offer.\nCollect their decision via ',
          },
          { kind: 'chip', id: 'pc2', variant: 'form', label: '30-Day Free - Accept or Decline' },
          { kind: 'prose', id: 'pr5', text: '.' },
        ],
      },
      { kind: 'block', id: 'blk-options', block: OPTIONS_BLOCK },
      {
        kind: 'run',
        id: 'r4',
        segments: [
          { kind: 'prose', id: 'pr6', text: 'If the customer accepts, fire event ' },
          { kind: 'chip', id: 'pc3', variant: 'event', label: 'Retention Saved' },
          { kind: 'prose', id: 'pr7', text: ' and trigger ' },
          { kind: 'chip', id: 'pc4', variant: 'action', label: 'Apply 30-Day Free' },
          { kind: 'prose', id: 'pr8', text: ' and ' },
          { kind: 'chip', id: 'pc5', variant: 'action', label: 'Schedule Day-30 Check-in' },
          { kind: 'prose', id: 'pr9', text: '.' },
        ],
      },
      {
        kind: 'run',
        id: 'r5',
        segments: [
          { kind: 'prose', id: 'pr10', text: 'If the customer declines, trigger ' },
          { kind: 'chip', id: 'pc6', variant: 'action', label: 'Process Cancellation' },
          { kind: 'prose', id: 'pr11', text: '.' },
        ],
      },
      {
        kind: 'run',
        id: 'r6',
        segments: [
          { kind: 'prose', id: 'pr12', text: 'At close, trigger ' },
          { kind: 'chip', id: 'pc7', variant: 'form', label: 'CSAT Survey' },
          { kind: 'prose', id: 'pr13', text: '.' },
        ],
      },
    ],
    tools: [
      {
        kind: 'action',
        name: 'getAccountProfile (Browser agent)',
        description: 'Injected from auth session · fetches tier, tenure, VIP flag, payment status',
        actionId: ACCOUNT_PROFILE_ACTION_ID,
      },
      {
        kind: 'action',
        name: 'getRetentionOffer',
        description: 'Drives offer type: discount (pro/enterprise) · pause (starter)',
      },
      {
        kind: 'action',
        name: 'applyRetentionOffer (Human in the loop)',
        description: 'Writes accepted offer to account record',
      },
      {
        kind: 'variable',
        name: '$customer_id',
        description: 'Injected from session. Used to fetch account profile on start.',
      },
      { kind: 'event', name: 'Retention Saved', description: 'Accepted retention offer' },
    ],
  },
  thinking: [
    {
      id: 'th1',
      label: 'Step 1',
      title: 'Load context before greeting',
      body: [
        t('Before the customer sends a message, the agent silently calls '),
        action('getAccountProfile', ACCOUNT_PROFILE_ACTION_ID),
        t(' using '),
        v('$customer_id'),
        t(' from auth. It sets '),
        v('$account_tier'),
        t(', '),
        v('$tenure_days'),
        t(', and '),
        v('$is_vip'),
        t('. If '),
        v('$is_vip'),
        t(' is true, it skips everything and routes to '),
        action('escalateToAgent'),
        t(' immediately — no greeting, no retention attempt.'),
      ],
    },
    {
      id: 'th2',
      label: 'Step 2',
      title: 'Classify intent on first message',
      body: [
        t('The intent classifier evaluates the first message and sets '),
        v('$intent_class'),
        t('. If the class isn’t '),
        v('$cancel_confirmed'),
        t(', the agent redirects — billing issues get a handoff note, plan changes route to the plan agent. Only confirmed cancellation intent continues.'),
      ],
    },
    {
      id: 'th3',
      label: 'Step 3',
      title: 'Check eligibility and present one retention offer',
      body: [
        t('The offer eligibility tool reads '),
        v('$account_tier'),
        t(' and '),
        v('$tenure_days'),
        t(' to rank available offers. It calls '),
        action('getRetentionOffer'),
        t(' and presents the top offer in a single, non-pushy message. '),
        v('$offer_presented'),
        t(' is set to true immediately — even if the customer ignores it, no second offer is ever made.'),
      ],
    },
    {
      id: 'th4',
      label: 'Step 4',
      title: 'Branch on customer response',
      body: [
        t('Two paths. If accepted: call '),
        action('applyRetentionOffer'),
        t(' and confirm — conversation ends positively. If declined: acknowledge without pushback and move to reason collection. The sentiment monitor is active on every single turn — if '),
        v('$sentiment_flag'),
        t(' trips at any point, escalation fires immediately regardless of where in the flow the agent is.'),
      ],
    },
    {
      id: 'th5',
      label: 'Step 5',
      title: 'Extract reason and process cancellation',
      body: [
        t('The reason extractor prompts the customer with a simple question and maps their response to a '),
        v('$reason_code'),
        t('. This is mandatory — '),
        action('processCancellation'),
        t(' cannot be called without it. The API returns a '),
        v('$cancellation_id'),
        t(' and '),
        v('$effective_date'),
        t(' which the agent surfaces directly in the confirmation message.'),
      ],
    },
    {
      id: 'th6',
      label: 'Step 6',
      title: 'Close and write to analytics',
      body: [
        t('The agent closes warmly with no upsell or survey unless CSAT collection is enabled by the admin. All context variables — '),
        v('$intent_class'),
        t(', '),
        v('$reason_code'),
        t(', '),
        v('$offer_presented'),
        t(' — are written to the analytics store. The conversation is marked resolved.'),
      ],
    },
  ],
}

// Editable-field ids. Derived from the authored ids rather than an index, so
// inserting a step can never silently move somebody's edit onto another field.
export const overviewTitleField = (step: PlanOverviewStep): string => `${step.id}.title`
export const overviewDescriptionField = (step: PlanOverviewStep): string => `${step.id}.description`
export const blockPromptField = (nodeId: string): string => `${nodeId}.prompt`
export const blockAnswerField = (nodeId: string, index: number): string => `${nodeId}.answer.${index}`

export function resolveEdit(edits: Record<string, string>, fieldId: string, original: string): string {
  return edits[fieldId] ?? original
}

// Deterministic keyword matchers in the shape of home/generate-layout's
// focusesFromPrompt — a keyword table, not a model. There is exactly one canned
// plan, so these stay narrow on purpose: a prompt that merely mentions agents,
// or asks a question about cancellations, must NOT open a cancellation plan.
const ACTION_WORDS = /\b(build|create|draft|design|set up|make)\b/
const SUBJECT_WORDS = /\b(agent|autoflow)\b/
const CANCELLATION_WORDS = /\bcancel(?:lation|lations|ling|s)?\b/
const AUTOMATION_WORDS = /\b(automate|automation|deflect|deflection|handle|cover|coverage)\b/

export function wantsAgentPlan(prompt: string): boolean {
  const text = prompt.trim().toLowerCase()
  if (!text) return false
  if (ACTION_WORDS.test(text) && SUBJECT_WORDS.test(text)) return true
  return CANCELLATION_WORDS.test(text) && AUTOMATION_WORDS.test(text)
}

// Whether a knowledge-gap topic is the one this plan actually answers. Separate
// from wantsAgentPlan because a topic is a noun phrase with no verb in it.
export function isAgentPlanTopic(topic: string): boolean {
  return CANCELLATION_WORDS.test(topic.trim().toLowerCase())
}
