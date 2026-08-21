import { describe, expect, it } from 'vitest'
import { AGENT_PLAN, blockAnswerField, blockPromptField, overviewDescriptionField } from './agent-plan-data'
import { buildAgentFromPlan } from './agent-plan-approval'
import { POLICY_TITLE } from '@/features/ai-agents/agent-store'

describe('buildAgentFromPlan', () => {
  it('names the agent and puts it on the widget channel', () => {
    const { fields } = buildAgentFromPlan(AGENT_PLAN, {})
    expect(fields.name).toBe('Service Cancellation')
    expect(fields.channel).toBe('widget')
    expect(fields.allSegments).toBe(true)
    expect(fields.tags).toEqual(['Cancellation', 'Retention'])
    expect(fields.triggerPhrases.length).toBeGreaterThan(0)
  })

  it('concatenates every run into one policy doc, in order, keeping the chips', () => {
    const { policy } = buildAgentFromPlan(AGENT_PLAN, {})
    expect(policy.title).toBe(POLICY_TITLE)
    expect(policy.segments[0]).toMatchObject({ kind: 'prose', text: "Reveal form below to determine customer’s cancellation reasons." })
    const chips = policy.segments.filter((s) => s.kind === 'chip')
    expect(chips).toHaveLength(7)
    expect(chips[0]).toMatchObject({ variant: 'routing', label: 'Retention Routing' })
    expect(chips.at(-1)).toMatchObject({ variant: 'form', label: 'CSAT Survey' })
    // No block content leaks into the prose.
    expect(policy.segments.some((s) => s.kind === 'prose' && s.text.includes('30 day free trial'))).toBe(false)
  })

  it('turns each block node into a collapsed canvas block of the right step type', () => {
    const { blocks } = buildAgentFromPlan(AGENT_PLAN, {})
    expect(blocks.map((b) => b.stepType)).toEqual(['form', 'options'])
    expect(blocks.map((b) => b.title)).toEqual(['Cancellation reason', '30-Day Free - Accept or Decline'])
    expect(blocks.every((b) => b.collapsed)).toBe(true)
    expect(new Set(blocks.map((b) => b.id)).size).toBe(2)
  })

  it('carries the options prompt and answers onto the created block', () => {
    const { blocks } = buildAgentFromPlan(AGENT_PLAN, {})
    const options = blocks[1]
    expect(options.subtitle).toBe('Do you want a 30 day free trial?')
    expect(options.rows?.map((r) => r.label)).toEqual(['Yes', 'No'])
  })

  it('applies an edited step description to customerRequest', () => {
    const field = overviewDescriptionField(AGENT_PLAN.overview[0])
    const { fields } = buildAgentFromPlan(AGENT_PLAN, { [field]: 'Fires when someone says they want out.' })
    expect(fields.customerRequest).toBe('Fires when someone says they want out.')
  })

  it('falls back to the authored description when there is no edit', () => {
    const { fields } = buildAgentFromPlan(AGENT_PLAN, {})
    expect(fields.customerRequest).toBe(AGENT_PLAN.overview[0].description)
  })

  it('applies edited options text to the created block', () => {
    const edits = {
      [blockPromptField('blk-options')]: 'Want 30 days on us?',
      [blockAnswerField('blk-options', 1)]: 'No thanks',
    }
    const { blocks } = buildAgentFromPlan(AGENT_PLAN, edits)
    expect(blocks[1].subtitle).toBe('Want 30 days on us?')
    expect(blocks[1].rows?.map((r) => r.label)).toEqual(['Yes', 'No thanks'])
  })

  it('is pure — the plan is not mutated', () => {
    const before = JSON.stringify(AGENT_PLAN)
    buildAgentFromPlan(AGENT_PLAN, { 'blk-options.prompt': 'x' })
    expect(JSON.stringify(AGENT_PLAN)).toBe(before)
  })
})
