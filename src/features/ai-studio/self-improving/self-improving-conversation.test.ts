import { describe, expect, it } from 'vitest'
import { PASSWORD_RESET_PLAN } from './self-improving-data'
import { activePlanFromImprovementPlan } from './self-improving-approval'
import {
  improvementActiveMessage,
  SELF_IMPROVING_CONVERSATION,
} from './self-improving-conversation'

describe('SELF_IMPROVING_CONVERSATION', () => {
  it('runs two exchanges and ends on the artifact card', () => {
    const messages = SELF_IMPROVING_CONVERSATION.messages
    expect(messages.map((message) => message.role)).toEqual([
      'user',
      'assistant',
      'user',
      'assistant',
    ])
    const last = messages[3]
    expect(last.attachments).toEqual([
      {
        type: 'plan',
        title: 'Self-improving Agent plan for Password Reset',
        subtitle: 'Self-improving plan',
        actionLabel: 'Review plan',
      },
    ])
  })

  it('opens on the survey question', () => {
    expect(SELF_IMPROVING_CONVERSATION.messages[0].text).toBe(
      'I wanted to check in on how our AI agents are doing. Are any of them struggling?',
    )
  })

  it('names all six failing signals in the diagnosis', () => {
    const diagnosis = SELF_IMPROVING_CONVERSATION.messages[1].text
    for (const line of [
      'Health score → Critical',
      'Deflection rate → 34%',
      'CSAT → 1.3',
      'Sentiment → Negative',
      'Handle time → 8+ min',
      'Fallback rate → 58%',
    ]) {
      expect(diagnosis).toContain(line)
    }
    expect(diagnosis).toContain('something structural appears to have broken')
  })

  it('gives both assistant turns checkable reasoning', () => {
    expect(SELF_IMPROVING_CONVERSATION.messages[1].thinking?.length).toBeGreaterThan(0)
    expect(SELF_IMPROVING_CONVERSATION.messages[3].thinking?.length).toBeGreaterThan(0)
  })

  it('quotes the recovery estimate the frame gives', () => {
    expect(SELF_IMPROVING_CONVERSATION.messages[3].text).toContain(
      'expected recovery to a health score of 70+ is 3–4 weeks',
    )
  })
})

describe('improvementActiveMessage', () => {
  const active = activePlanFromImprovementPlan(PASSWORD_RESET_PLAN)

  it('reports the plan the store now holds', () => {
    const message = improvementActiveMessage(active)
    expect(message.role).toBe('assistant')
    expect(message.attachments).toEqual([
      {
        type: 'improvement-active',
        agentName: 'Password Reset',
        agentId: 'w8',
        status: 'Week 1 of 4 · 4 auto-fixes live · 2 changes awaiting approval',
        viewLabel: 'View plan',
        openLabel: 'Open in Agent Builder',
      },
    ])
  })

  it('names the running stage in its prose', () => {
    expect(improvementActiveMessage(active).text).toContain('Week 1 — Immediate auto-fixes')
  })

  it('is stable for the same agent, so the transcript cannot key two cards alike', () => {
    expect(improvementActiveMessage(active).id).toBe('improvement-active-w8')
  })
})
