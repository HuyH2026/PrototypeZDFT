import { describe, expect, it } from 'vitest'
import {
  AGENT_PLAN,
  SECTION_LABEL,
  blockAnswerField,
  blockPromptField,
  isAgentPlanTopic,
  overviewDescriptionField,
  overviewTitleField,
  resolveEdit,
  wantsAgentPlan,
} from './agent-plan-data'

describe('AGENT_PLAN', () => {
  it('is the Service Cancellation plan with four overview steps in order', () => {
    expect(AGENT_PLAN.agentName).toBe('Service Cancellation')
    expect(AGENT_PLAN.overview.map((s) => s.ordinal)).toEqual(['01', '02', '03', '04'])
    expect(AGENT_PLAN.overview[0].title).toBe('Identify cancellation intent')
    expect(AGENT_PLAN.overview[3].title).toBe('Escalate VIP accounts and edge cases')
  })

  it('gives every overview step at least one metric chip', () => {
    for (const step of AGENT_PLAN.overview) expect(step.metrics.length).toBeGreaterThan(0)
  })

  it('carries the three impact stats with their notes, and a narrative', () => {
    expect(AGENT_PLAN.impact.stats.map((s) => s.value + s.unit)).toEqual(['23%', '~68%', '~4min'])
    expect(AGENT_PLAN.impact.stats[2].note).toBe('vs 14 min human avg')
    expect(AGENT_PLAN.impact.narrative).toContain('~540 of 800 monthly cancellation tickets')
  })

  it('renders the structured policy as runs around two block cards, in frame order', () => {
    expect(AGENT_PLAN.agent.policy.map((n) => n.kind)).toEqual([
      'run', 'block', 'run', 'run', 'block', 'run', 'run', 'run',
    ])
    const blocks = AGENT_PLAN.agent.policy.flatMap((n) => (n.kind === 'block' ? [n.block] : []))
    expect(blocks.map((b) => b.stepType)).toEqual(['form', 'options'])
    expect(blocks[0].fields).toEqual(['$Email', '$BillingZipCode', '$SelectedReason'])
    expect(blocks[1].answers).toEqual(['Yes', 'No'])
    expect(blocks[1].prompt).toBe('Do you want a 30 day free trial?')
  })

  it('keeps every policy segment id unique, since they are React keys once concatenated', () => {
    const ids = AGENT_PLAN.agent.policy.flatMap((n) =>
      n.kind === 'run' ? n.segments.map((s) => s.id) : [n.id],
    )
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('names the policy chips the editor already uses for this policy', () => {
    // flatMap with a guard, not filter().map(): TypeScript does not carry a
    // filter's narrowing into the map, and these tests are typechecked.
    const chips = AGENT_PLAN.agent.policy.flatMap((n) =>
      n.kind === 'run' ? n.segments.flatMap((s) => (s.kind === 'chip' ? [s.label] : [])) : [],
    )
    expect(chips).toEqual([
      'Retention Routing',
      '30-Day Free - Accept or Decline',
      'Retention Saved',
      'Apply 30-Day Free',
      'Schedule Day-30 Check-in',
      'Process Cancellation',
      'CSAT Survey',
    ])
  })

  it('links exactly one tool row to the real actions catalogue and leaves the rest to be created', () => {
    const linked = AGENT_PLAN.agent.tools.filter((t) => t.actionId)
    expect(linked).toHaveLength(1)
    expect(linked[0]).toMatchObject({ name: 'getAccountProfile (Browser agent)', actionId: 'get-account-profile' })
    expect(AGENT_PLAN.agent.tools.map((t) => t.kind)).toEqual([
      'action', 'action', 'action', 'variable', 'event',
    ])
  })

  it('carries six thinking steps whose bodies mix text and references', () => {
    expect(AGENT_PLAN.thinking.map((s) => s.label)).toEqual([
      'Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5', 'Step 6',
    ])
    expect(AGENT_PLAN.thinking[0].title).toBe('Load context before greeting')
    const refs = AGENT_PLAN.thinking[0].body.flatMap((s) => (s.kind === 'ref' ? [s] : []))
    expect(refs.map((r) => r.label)).toContain('$is_vip')
    expect(refs.some((r) => r.refKind === 'action' && r.label === 'getAccountProfile')).toBe(true)
  })

  it('labels every section for the approval hint', () => {
    expect(SECTION_LABEL).toEqual({
      overview: 'Plan overview',
      impact: 'Impact',
      agent: 'Agent',
      thinking: 'AI thinking',
    })
  })
})

describe('field ids and resolveEdit', () => {
  it('derives stable, distinct ids per editable field', () => {
    const step = AGENT_PLAN.overview[0]
    expect(overviewTitleField(step)).toBe('o1.title')
    expect(overviewDescriptionField(step)).toBe('o1.description')
    expect(blockPromptField('blk-options')).toBe('blk-options.prompt')
    expect(blockAnswerField('blk-options', 1)).toBe('blk-options.answer.1')
  })

  it('returns the edit when there is one and the original otherwise', () => {
    expect(resolveEdit({}, 'o1.title', 'Original')).toBe('Original')
    expect(resolveEdit({ 'o1.title': 'Edited' }, 'o1.title', 'Original')).toBe('Edited')
  })
})

describe('wantsAgentPlan', () => {
  it.each([
    'Build me an agent for cancellations',
    'create an autoflow for refunds',
    'Draft a new agent for this channel',
    'Design an agent that handles cancellations',
    'automate cancellations end to end',
  ])('matches %s', (prompt) => {
    expect(wantsAgentPlan(prompt)).toBe(true)
  })

  it.each([
    '',
    'Summarize what changed across my agents today',
    'What needs approval?',
    'why are cancellations up this week?',
    'Show cost trend',
    'Yes, build me a plan.',
  ])('does not match %s', (prompt) => {
    expect(wantsAgentPlan(prompt)).toBe(false)
  })
})

describe('isAgentPlanTopic', () => {
  it('matches a cancellation-shaped knowledge gap and nothing else', () => {
    expect(isAgentPlanTopic('Service cancellations')).toBe(true)
    expect(isAgentPlanTopic('Cancellation policy')).toBe(true)
    expect(isAgentPlanTopic('Refund eligibility windows')).toBe(false)
    expect(isAgentPlanTopic('Enterprise SSO setup')).toBe(false)
  })
})
