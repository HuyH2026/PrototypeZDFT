import { describe, expect, it } from 'vitest'
import type { AiAttachment, AiConversationSeed } from './ai-context-registry'
import { AI_CONTEXTS, getAiContext, routeToScope } from './ai-context-registry'

describe('ai-context-registry', () => {
  it('returns the default context when no scope is given', () => {
    expect(getAiContext()).toBe(AI_CONTEXTS.default)
  })

  it('returns the scoped context for a known scope', () => {
    expect(getAiContext('brand-setup')).toBe(AI_CONTEXTS['brand-setup'])
    expect(AI_CONTEXTS['brand-setup'].prompt).toBeTruthy()
  })

  it('falls back to default for an unknown scope', () => {
    // @ts-expect-error intentional unknown scope
    expect(getAiContext('does-not-exist')).toBe(AI_CONTEXTS.default)
  })

  it('every context carries a non-empty greeting', () => {
    for (const ctx of Object.values(AI_CONTEXTS)) {
      expect(ctx.greeting.length).toBeGreaterThan(0)
    }
  })
})

describe('routeToScope', () => {
  it.each([
    ['/', 'home'],
    ['/insights', 'insights'],
    ['/insights/agent-overview', 'ai-performances'],
    ['/insights/automations', 'orchestrator'],
    ['/insights/automations/42', 'orchestrator'],
    // Topics is the CX Journey screen's home now, so it carries that scope.
    ['/insights/topics', 'cx-journey'],
    ['/agent-builder', 'agent-builder'],
    ['/agent-builder/use-cases', 'agent-builder'],
    ['/agent-builder/configuration', 'configuration'],
    ['/agent-builder/ai-qa', 'qa'],
    ['/agent-builder/actions', 'tools'],
    ['/agent-builder/actions/abc', 'tools'],
    ['/agent-builder/some-agent-id', 'agent-builder'],
    ['/experiment', 'ab-test'],
    ['/experiment/ab-test', 'ab-test'],
    ['/settings/logs', 'log'],
    ['/agent-setup', 'manage-agents'],
    ['/agent-setup/new', 'brand-setup'],
  ] as const)('maps %s → %s', (path, scope) => {
    expect(routeToScope(path)).toBe(scope)
  })

  it('falls back to default for unbuilt/unknown routes', () => {
    expect(routeToScope('/agent-builder/knowledge')).toBe('agent-builder')
    expect(routeToScope('/settings')).toBe('default')
    expect(routeToScope('/settings/security')).toBe('default')
    expect(routeToScope('')).toBe('default')
  })

  it('does not let root "/" swallow other paths', () => {
    expect(routeToScope('/agent-builder/actions')).not.toBe('home')
  })

  // The pre-consolidation paths are served only by the redirect layer, which
  // resolves before any assistant trigger reads the location.
  it('no longer maps the old paths to a scope', () => {
    expect(routeToScope('/tools')).toBe('default')
    expect(routeToScope('/orchestrator')).toBe('default')
    expect(routeToScope('/log')).toBe('default')
    expect(routeToScope('/organization')).toBe('default')
  })

  // Both plan flows are trigger-only: no URL may imply one, or navigating would
  // silently start a scripted conversation.
  it('never derives a plan-flow scope from a route', () => {
    for (const path of [
      '/',
      '/insights',
      '/insights/agent-overview',
      '/agent-builder',
      '/agent-builder/use-cases',
      '/agent-setup',
      '/experiment',
      '/settings/logs',
    ]) {
      expect(routeToScope(path)).not.toBe('self-improving')
      expect(routeToScope(path)).not.toBe('build-agent')
    }
  })
})

describe('AiAttachment union and AiConversationSeed.responses', () => {
  it('accepts a list attachment', () => {
    const att: AiAttachment = { type: 'list', title: 'What we found', items: ['a', 'b'], footnote: 'Evidence: 3' }
    expect(att.type).toBe('list')
  })

  it('accepts a breakdown attachment', () => {
    const att: AiAttachment = { type: 'breakdown', title: 'By intent', rows: [{ label: 'Billing', value: '61%' }] }
    expect(att.type).toBe('breakdown')
  })

  it('accepts an actions attachment', () => {
    const att: AiAttachment = {
      type: 'actions',
      title: 'Recommended fixes',
      items: [{ text: 'Update the cancellation answer', tag: 'High impact' }],
    }
    expect(att.type).toBe('actions')
  })

  it('accepts an optional responses map on a conversation seed', () => {
    const seed: AiConversationSeed = {
      title: 'Test',
      messages: [{ id: 'seed-assistant', role: 'assistant', text: 'hi', recommendations: ['Next'] }],
      responses: { Next: { text: 'reply', recommendations: ['More'] } },
    }
    expect(seed.responses?.Next.text).toBe('reply')
  })

  it('a seed with no responses is still valid (backward compatible)', () => {
    const seed: AiConversationSeed = { title: 'Test', messages: [] }
    expect(seed.responses).toBeUndefined()
  })

  it('accepts an improvement-active attachment', () => {
    const att: AiAttachment = {
      type: 'improvement-active',
      agentName: 'Password Reset',
      agentId: 'w8',
      status: 'Week 1 of 4 · 4 auto-fixes live · 2 changes awaiting approval',
      viewLabel: 'View plan',
      openLabel: 'Open in Agent Builder',
    }
    expect(att.type).toBe('improvement-active')
  })
})
