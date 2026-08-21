// Mock git-sync layer for the Agent Builder. Holds per-brand+channel repo
// connections and per-agent sync state, persisted to localStorage. No backend:
// syncing resolves deterministically (no timers / Date.now), matching the
// deterministic-id conventions in agent-store.ts and brand-context.tsx.
import { useCallback, useMemo, useState } from 'react'
import type { ChannelKey } from './agent-builder-data'
import type { StoredAgent, PolicyDoc, CanvasBlock } from './agent-store'

export type SyncStatus = 'synced' | 'out-of-sync' | 'not-synced' | 'syncing'

// A connected repository, one per brand+channel.
export type RepoConnection = {
  repoUrl: string
  branch: string
  basePath: string
  connectedAt: string // authored display string, not Date.now()
}

// Per-agent sync record. Absent agents default to { status: 'not-synced' }.
export type AgentSyncState = {
  status: SyncStatus
  lastSyncedAt?: string
}

// Fixed authored timestamps (no Date.now here — keeps state deterministic).
export const CONNECTED_AT_LABEL = 'Jul 24, 2026'
export const SYNCED_AT_LABEL = 'Jul 24, 2026, 10:30 AM'

export function connectionKey(brandKey: string, channel: ChannelKey): string {
  return `${brandKey}:${channel}`
}

type StoreShape = {
  connections: Record<string, RepoConnection>
  syncStates: Record<string, AgentSyncState>
}

const CHANNEL_KEYS: ChannelKey[] = ['widget', 'voice', 'webcall', 'headless', 'email']

// Seed a repo connection for every channel of two of the seeded brands, so the
// Agent Builder opens in the connected state out of the box (a mock of what a
// hooked-up brand looks like). 'all-brands' is seeded too: the top bar starts on
// All brands, which is a real scope key here, and an unseeded one would make the
// screen open disconnected. The ids below deliberately name a *subset* of
// brand-context's seeds — Uber Freight and Uber Health start disconnected, as do
// brands created at runtime, so the per-row "Connect repo" flow stays reachable.
// That is why this list is literal rather than imported from brand-context.
function seedConnections(): Record<string, RepoConnection> {
  const out: Record<string, RepoConnection> = {}
  const seeds: [brandKey: string, repoUrl: string][] = [
    ['all-brands', 'github.com/uber/agents'],
    ['uber', 'github.com/uber/agents'],
    ['uber-eats', 'github.com/uber-eats/agents'],
  ]
  for (const [brandKey, repoUrl] of seeds) {
    for (const ch of CHANNEL_KEYS) {
      out[connectionKey(brandKey, ch)] = {
        repoUrl,
        branch: 'main',
        basePath: 'agents',
        connectedAt: CONNECTED_AT_LABEL,
      }
    }
  }
  return out
}

// Seed a mix of per-agent states so the connected column shows every status on
// first load (agents left out default to 'not-synced').
//
// Note the intentional scope mismatch (mock scope): `connections` are keyed per
// brand+channel, but `syncStates` are keyed by bare agent id — because agents in
// this app are not brand-scoped (the agent store seeds from the frozen CHANNELS
// list and filters only by channel). So a synced/seed state is shared across
// brands. Fine for the mock; if agents ever become brand-scoped, key syncStates by
// `${connectionKey(brandKey, channel)}:${agentId}` and thread brand+channel through
// getSyncState/syncAgent.
function seedStore(): StoreShape {
  return {
    connections: seedConnections(),
    syncStates: {
      w1: { status: 'synced', lastSyncedAt: SYNCED_AT_LABEL },
      w2: { status: 'out-of-sync' },
      // w3 → not-synced (default)
      v1: { status: 'synced', lastSyncedAt: SYNCED_AT_LABEL },
      v2: { status: 'out-of-sync' },
      c1: { status: 'synced', lastSyncedAt: SYNCED_AT_LABEL },
      h1: { status: 'synced', lastSyncedAt: SYNCED_AT_LABEL },
      h2: { status: 'out-of-sync' },
      // h3 → not-synced (default)
      h4: { status: 'synced', lastSyncedAt: SYNCED_AT_LABEL },
    },
  }
}

const STORAGE_KEY = 'git-sync-store-v1'

// Clear persisted sync state once per full page load (module body runs once per
// browser refresh, not per SPA navigation) so a hard refresh starts clean —
// same one-time reset pattern agent-store.ts uses.
try {
  window.localStorage?.removeItem(STORAGE_KEY)
} catch {
  /* ignore missing/unavailable storage */
}

function loadStore(): StoreShape {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoreShape
      if (parsed && typeof parsed === 'object' && parsed.connections && parsed.syncStates) {
        return parsed
      }
    }
  } catch {
    /* ignore missing/malformed storage */
  }
  return seedStore()
}

export function useGitSyncStore() {
  const [store, setStore] = useState<StoreShape>(() => loadStore())

  const persist = useCallback((next: StoreShape) => {
    setStore(next)
    try {
      window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore quota/availability errors */
    }
  }, [])

  return useMemo(
    () => ({
      getConnection: (brandKey: string, channel: ChannelKey): RepoConnection | undefined =>
        store.connections[connectionKey(brandKey, channel)],
      connectRepo: (
        brandKey: string,
        channel: ChannelKey,
        repo: Omit<RepoConnection, 'connectedAt'>,
      ) =>
        persist({
          ...store,
          connections: {
            ...store.connections,
            [connectionKey(brandKey, channel)]: { ...repo, connectedAt: CONNECTED_AT_LABEL },
          },
        }),
      disconnectRepo: (brandKey: string, channel: ChannelKey) => {
        const connections = { ...store.connections }
        delete connections[connectionKey(brandKey, channel)]
        persist({ ...store, connections })
      },
      getSyncState: (agentId: string): AgentSyncState =>
        store.syncStates[agentId] ?? { status: 'not-synced' },
      syncAgent: (agentId: string) =>
        persist({
          ...store,
          syncStates: {
            ...store.syncStates,
            [agentId]: { status: 'synced', lastSyncedAt: SYNCED_AT_LABEL },
          },
        }),
    }),
    [store, persist],
  )
}

export type SyncedFile = {
  path: string
  label: string
  language: 'yaml' | 'json'
  content: string
}

// Flatten a PolicyDoc into readable YAML: the title, then the prose joined into
// a description, then each chip as a structured "- variant: label" step.
function policyToYaml(policy: PolicyDoc): string {
  const prose = policy.segments
    .filter((s): s is Extract<typeof s, { kind: 'prose' }> => s.kind === 'prose')
    .map((s) => s.text)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
  const steps = policy.segments
    .filter((s): s is Extract<typeof s, { kind: 'chip' }> => s.kind === 'chip')
    .map((c) => `  - ${c.variant}: ${JSON.stringify(c.label)}`)
  const lines = [
    `title: ${JSON.stringify(policy.title)}`,
    `description: ${JSON.stringify(prose)}`,
    'steps:',
    ...(steps.length ? steps : ['  [] # No policy steps configured']),
  ]
  return lines.join('\n') + '\n'
}

// Serialize canvas blocks as tool calls. Condition blocks include their rows.
function blocksToYaml(blocks: CanvasBlock[]): string {
  if (blocks.length === 0) return 'tools: []\n# No tool calls configured\n'
  const lines: string[] = ['tools:']
  for (const b of blocks) {
    lines.push(`  - type: ${b.stepType}`)
    lines.push(`    title: ${JSON.stringify(b.title)}`)
    if (b.header) lines.push(`    header: ${JSON.stringify(b.header)}`)
    if (b.subtitle) lines.push(`    subtitle: ${JSON.stringify(b.subtitle)}`)
    if (b.rows && b.rows.length) {
      lines.push('    rows:')
      for (const r of b.rows) lines.push(`      - ${JSON.stringify(r.label)}`)
    }
  }
  return lines.join('\n') + '\n'
}

// Global context variables. StoredAgent has no literal context-vars field, so
// derive an illustrative set from the fields the agent already carries. Mock.
function contextToYaml(agent: StoredAgent): string {
  const phrases = agent.triggerPhrases.length
    ? agent.triggerPhrases.map((p) => `  - ${JSON.stringify(p)}`).join('\n')
    : '  [] # none'
  const tags = agent.tags.length
    ? agent.tags.map((t) => `  - ${JSON.stringify(t)}`).join('\n')
    : '  [] # none'
  return (
    [
      `channel: ${agent.channel}`,
      `allSegments: ${agent.allSegments}`,
      `customerRequest: ${JSON.stringify(agent.customerRequest)}`,
      'tags:',
      tags,
      'triggerPhrases:',
      phrases,
    ].join('\n') + '\n'
  )
}

function metadataToJson(agent: StoredAgent): string {
  return (
    JSON.stringify(
      {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        on: agent.on,
        isSubflow: agent.isSubflow,
        conversations: agent.conversations,
        resolutions: agent.resolutions,
        resolutionRate: agent.resolutionRate,
        csat: agent.csat,
        tags: agent.tags,
      },
      null,
      2,
    ) + '\n'
  )
}

export function serializeAgentFiles(agent: StoredAgent, basePath: string): SyncedFile[] {
  const dir = `${basePath}/${agent.id}`
  return [
    {
      path: `${dir}/policy.yaml`,
      label: 'policy.yaml',
      language: 'yaml',
      content: policyToYaml(agent.policy),
    },
    {
      path: `${dir}/tools.yaml`,
      label: 'tools.yaml',
      language: 'yaml',
      content: blocksToYaml(agent.blocks),
    },
    {
      path: `${dir}/context.yaml`,
      label: 'context.yaml',
      language: 'yaml',
      content: contextToYaml(agent),
    },
    {
      path: `${dir}/agent.json`,
      label: 'agent.json',
      language: 'json',
      content: metadataToJson(agent),
    },
  ]
}
