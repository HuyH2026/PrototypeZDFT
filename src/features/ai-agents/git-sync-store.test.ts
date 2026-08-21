import { describe, expect, it } from 'vitest'
import { connectionKey } from './git-sync-store'

describe('git-sync-store keys', () => {
  it('builds a connection key from brand key and channel', () => {
    expect(connectionKey('uber', 'widget')).toBe('uber:widget')
    expect(connectionKey('uber-eats', 'voice')).toBe('uber-eats:voice')
  })
})

import { renderHook, act } from '@testing-library/react'
import { useGitSyncStore } from './git-sync-store'

describe('useGitSyncStore', () => {
  it('connects and reads a repo keyed by brand + channel', () => {
    const { result } = renderHook(() => useGitSyncStore())
    // A runtime-created brand (not seeded) starts disconnected.
    expect(result.current.getConnection('acme-1', 'widget')).toBeUndefined()
    act(() =>
      result.current.connectRepo('acme-1', 'widget', {
        repoUrl: 'github.com/acme/agents',
        branch: 'main',
        basePath: 'agents',
      }),
    )
    expect(result.current.getConnection('acme-1', 'widget')).toMatchObject({
      repoUrl: 'github.com/acme/agents',
      branch: 'main',
      basePath: 'agents',
    })
    // Different channel is isolated.
    expect(result.current.getConnection('acme-1', 'voice')).toBeUndefined()
  })

  it('seeds connections for the initial brands across every channel', () => {
    const { result } = renderHook(() => useGitSyncStore())
    expect(result.current.getConnection('uber', 'widget')).toMatchObject({
      repoUrl: 'github.com/uber/agents',
    })
    expect(result.current.getConnection('all-brands', 'headless')).toMatchObject({
      repoUrl: 'github.com/uber/agents',
    })
  })

  it('disconnects a repo', () => {
    const { result } = renderHook(() => useGitSyncStore())
    act(() =>
      result.current.connectRepo('uber-eats', 'widget', {
        repoUrl: 'r',
        branch: 'main',
        basePath: 'agents',
      }),
    )
    act(() => result.current.disconnectRepo('uber-eats', 'widget'))
    expect(result.current.getConnection('uber-eats', 'widget')).toBeUndefined()
  })

  it('defaults unknown agents to not-synced and syncs to synced', () => {
    const { result } = renderHook(() => useGitSyncStore())
    expect(result.current.getSyncState('unknown').status).toBe('not-synced')
    act(() => result.current.syncAgent('unknown'))
    const state = result.current.getSyncState('unknown')
    expect(state.status).toBe('synced')
    expect(state.lastSyncedAt).toBeTruthy()
  })

  it('seeds illustrative states for w1 and w2', () => {
    const { result } = renderHook(() => useGitSyncStore())
    expect(result.current.getSyncState('w1').status).toBe('synced')
    expect(result.current.getSyncState('w2').status).toBe('out-of-sync')
  })
})

import { serializeAgentFiles, type SyncedFile } from './git-sync-store'
import { seedAgents } from './agent-store'

function agentW3() {
  const a = seedAgents().find((x) => x.id === 'w3')
  if (!a) throw new Error('seed w3 missing')
  return a
}

describe('serializeAgentFiles', () => {
  it('produces four files with repo paths under basePath/agentId', () => {
    const files = serializeAgentFiles(agentW3(), 'agents')
    expect(files.map((f) => f.path)).toEqual([
      'agents/w3/policy.yaml',
      'agents/w3/tools.yaml',
      'agents/w3/context.yaml',
      'agents/w3/agent.json',
    ])
  })

  it('renders policy chips as structured entries in policy.yaml', () => {
    const files = serializeAgentFiles(agentW3(), 'agents')
    const policy = files.find((f) => f.path.endsWith('policy.yaml')) as SyncedFile
    // w3 seeds the Service cancellation policy, whose first chip is a form.
    expect(policy.language).toBe('yaml')
    expect(policy.content).toContain('Cancellation Diagnostic Survey')
  })

  it('serializes canvas blocks into tools.yaml', () => {
    const files = serializeAgentFiles(agentW3(), 'agents')
    const tools = files.find((f) => f.path.endsWith('tools.yaml')) as SyncedFile
    expect(tools.content).toContain('type: condition')
    expect(tools.content).toContain('title: "Untitled classic block 01"')
    expect(tools.content).toContain('subtitle: "Shipping status"')
    expect(tools.content).toContain('- "Otherwise…"')
  })

  it('derives context.yaml from channel/tags/etc and agent.json from metadata', () => {
    const files = serializeAgentFiles(agentW3(), 'agents')
    const ctx = files.find((f) => f.path.endsWith('context.yaml')) as SyncedFile
    expect(ctx.content).toContain('channel: widget')
    const meta = files.find((f) => f.path.endsWith('agent.json')) as SyncedFile
    expect(meta.language).toBe('json')
    const parsed = JSON.parse(meta.content)
    expect(parsed).toMatchObject({ id: 'w3', name: 'Service cancellation', type: 'With intent' })
  })

  it('notes empty tool lists explicitly', () => {
    const a = seedAgents().find((x) => x.id === 'w1')!
    const files = serializeAgentFiles(a, 'agents')
    const tools = files.find((f) => f.path.endsWith('tools.yaml')) as SyncedFile
    expect(tools.content).toContain('# No tool calls configured')
  })
})
