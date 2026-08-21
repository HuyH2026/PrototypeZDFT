import { describe, expect, it } from 'vitest'
import {
  ASK_FOR_CHANGES_PREFILL,
  ASK_FOR_CHANGES_REPLY,
  BUILD_AGENT_CONVERSATION,
  agentCreatedMessage,
} from './agent-plan-conversation'
import { BUILD_TRACE, BUILD_TRACE_STEP_MS } from './plan-build-trace'

describe('BUILD_AGENT_CONVERSATION', () => {
  it('opens with two exchanges, user first', () => {
    expect(BUILD_AGENT_CONVERSATION.messages.map((m) => m.role)).toEqual([
      'user', 'assistant', 'user', 'assistant',
    ])
    expect(BUILD_AGENT_CONVERSATION.messages[0].text).toBe(
      "Analyze my ticket data from the last 30 days and tell me what’s standing out",
    )
    expect(BUILD_AGENT_CONVERSATION.messages[2].text).toBe('Yes, build me a plan.')
  })

  it('states the coverage gap and asks permission, with the copy fix applied', () => {
    const diagnosis = BUILD_AGENT_CONVERSATION.messages[1].text
    expect(diagnosis).toContain('deflecting well at 71%')
    expect(diagnosis).toContain('handled entirely by human agents')
    expect(diagnosis).toContain('I can investigate and build a new AI plan for you.')
    expect(diagnosis).not.toContain('an AI new plan')
  })

  it('gives both assistant messages a thinking trail', () => {
    for (const index of [1, 3]) {
      expect(BUILD_AGENT_CONVERSATION.messages[index].thinking?.length).toBeGreaterThan(0)
    }
  })

  it('ends on the plan artifact card', () => {
    const last = BUILD_AGENT_CONVERSATION.messages[3]
    expect(last.text).toContain("I’ve built out a full proposal")
    expect(last.attachments).toEqual([
      { type: 'plan', title: 'Service cancellation', subtitle: 'New agent plan', actionLabel: 'Review plan' },
    ])
  })

  it('offers no recommendation chips — the artifact card is the only way on', () => {
    for (const message of BUILD_AGENT_CONVERSATION.messages) {
      expect(message.recommendations).toBeUndefined()
    }
  })
})

describe('ask for changes', () => {
  it('prefills an unfinished sentence for the user to complete', () => {
    expect(ASK_FOR_CHANGES_PREFILL).toBe('Change the retention offer to…')
    expect(ASK_FOR_CHANGES_REPLY).toContain('Updated the plan')
  })
})

describe('agentCreatedMessage', () => {
  it('carries the agent, its draft status and both routes', () => {
    const message = agentCreatedMessage('agent-9', 'Service Cancellation')
    expect(message.role).toBe('assistant')
    expect(message.attachments).toEqual([
      {
        type: 'agent-created',
        agentName: 'Service Cancellation',
        agentId: 'agent-9',
        status: 'Draft — not taking traffic',
        openLabel: 'Open in Agent Builder',
        testLabel: 'Run a test',
      },
    ])
  })
})

describe('BUILD_TRACE', () => {
  it('is four lines, 600ms apart', () => {
    expect(BUILD_TRACE).toHaveLength(4)
    expect(BUILD_TRACE_STEP_MS).toBe(600)
    expect(BUILD_TRACE[0]).toContain('Service Cancellation')
    expect(BUILD_TRACE[1]).toContain('3 actions')
    expect(BUILD_TRACE[2]).toContain('Cancellation reason')
    expect(BUILD_TRACE[3]).toContain('CSAT Survey')
  })
})
