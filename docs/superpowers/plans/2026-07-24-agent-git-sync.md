# Agent Git Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Git sync" column to the Agent Builder "All agents" table so users can sync each agent's full definition (Autoflow policy, tool calls, global context variables, metadata) to their org's git repository — all as frontend-only mock UI.

**Architecture:** A new `localStorage`-backed `git-sync-store.ts` holds per-org+channel repo connections and per-agent sync state, plus a pure `serializeAgentFiles` that turns a `StoredAgent` into four mock repo files. Three presentational components consume it: an interactive `GitSyncCell` (new trailing column in `AgentsTable`), a `ConnectRepoDialog` modal, and a `GitSyncPanel` right slide-over showing a repo-style file tree + read-only YAML/JSON preview. `AgentBuilderScreen` wires them together, reading the current org via `useOrgs()`.

**Tech Stack:** React 19, React Router v7, TypeScript (strict), Tailwind v4, Vitest + React Testing Library (jsdom), lucide-react icons.

## Global Constraints

- **No backend / no network.** All git operations are mocked; no GitHub API, OAuth, or fetch.
- **No `Date.now()` / `Math.random()` / real timers** — nondeterministic or unavailable here. Use authored display strings for timestamps and deterministic transitions (see `agent-store.ts`, `org-context.tsx`).
- **TypeScript strict mode** — keep all new code fully typed. TypeScript is pinned to 5.9; do not rely on TS7 features.
- **Path alias:** `@` → `src/`. Do NOT add `baseUrl` to `tsconfig.json`.
- **Imports** from `react-router` (never `react-router-dom`).
- **Styling:** semantic token classes (`text-ink`, `text-ink-muted`, `border-surface-border`, `bg-nav-active`) or exposed Garden palette classes; inline hex is acceptable for one-off colors following the existing `AgentsTable.tsx` pattern (green `#0f8a5f`, ink `#2f3130`). Do NOT add `font-['SF_Pro_*']` classes.
- **localStorage** access must be guarded (`window.localStorage?.`) and wrapped in try/catch, per `agent-store.ts`.
- **Test command:** `npx vitest run <path>` (or `pnpm test`). Per the known worktree-crawl caveat, if running the whole suite use `npx vitest run --exclude '**/.claude/**'`.
- **Reference spec:** `docs/superpowers/specs/2026-07-24-agent-git-sync-design.md`.

---

## File Structure

**New:**
- `src/features/ai-agents/git-sync-store.ts` — types, pure reducers/helpers, `serializeAgentFiles`, and the `useGitSyncStore()` hook.
- `src/features/ai-agents/git-sync-store.test.ts` — pure unit tests (no jsdom).
- `src/features/ai-agents/GitSyncCell.tsx` — the interactive table cell.
- `src/features/ai-agents/ConnectRepoDialog.tsx` — connect-repo modal.
- `src/features/ai-agents/GitSyncPanel.tsx` — detail slide-over (file tree + preview).
- `src/features/ai-agents/GitSyncCell.test.tsx` — component tests for the cell.
- `src/features/ai-agents/GitSyncPanel.test.tsx` — component tests for the panel.

**Modified:**
- `src/features/ai-agents/AgentsTable.tsx` — add optional `gitSync` prop + trailing "Git sync" column.
- `src/features/ai-agents/AgentBuilderScreen.tsx` — instantiate the store, resolve org id, render banner + dialog + panel, thread `gitSync` into the table.

---

## Task 1: Git sync store — types, connection & sync reducers, hook

**Files:**
- Create: `src/features/ai-agents/git-sync-store.ts`
- Test: `src/features/ai-agents/git-sync-store.test.ts`

**Interfaces:**
- Consumes: `ChannelKey` from `./agent-builder-data`; `StoredAgent` from `./agent-store` (used in Task 2, imported now for the file it lives in).
- Produces:
  - `type SyncStatus = 'synced' | 'out-of-sync' | 'not-synced' | 'syncing'`
  - `type RepoConnection = { repoUrl: string; branch: string; basePath: string; connectedAt: string }`
  - `type AgentSyncState = { status: SyncStatus; lastSyncedAt?: string }`
  - `connectionKey(orgId: string, channel: ChannelKey): string`
  - `useGitSyncStore()` returning `{ getConnection(orgId, channel), connectRepo(orgId, channel, repo), disconnectRepo(orgId, channel), getSyncState(agentId), syncAgent(agentId) }`
  - constants `SYNCED_AT_LABEL` (the fixed authored timestamp string) — reused by tests.

- [ ] **Step 1: Write the failing test**

Create `src/features/ai-agents/git-sync-store.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { connectionKey } from './git-sync-store'

describe('git-sync-store keys', () => {
  it('builds a connection key from org id and channel', () => {
    expect(connectionKey('spacex', 'widget')).toBe('spacex:widget')
    expect(connectionKey('tesla', 'voice')).toBe('tesla:voice')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/ai-agents/git-sync-store.test.ts`
Expected: FAIL — `connectionKey` is not exported / module missing.

- [ ] **Step 3: Write the store module**

Create `src/features/ai-agents/git-sync-store.ts`:

```ts
// Mock git-sync layer for the Agent Builder. Holds per-org+channel repo
// connections and per-agent sync state, persisted to localStorage. No backend:
// syncing resolves deterministically (no timers / Date.now), matching the
// deterministic-id conventions in agent-store.ts and org-context.tsx.
import { useCallback, useMemo, useState } from 'react'
import type { ChannelKey } from './agent-builder-data'

export type SyncStatus = 'synced' | 'out-of-sync' | 'not-synced' | 'syncing'

// A connected repository, one per org+channel.
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

export function connectionKey(orgId: string, channel: ChannelKey): string {
  return `${orgId}:${channel}`
}

type StoreShape = {
  connections: Record<string, RepoConnection>
  syncStates: Record<string, AgentSyncState>
}

// Seed a couple of illustrative per-agent states so the column shows more than
// one status on first load (mirrors how agent-store seeds w3 with a rich policy).
function seedStore(): StoreShape {
  return {
    connections: {},
    syncStates: {
      w1: { status: 'synced', lastSyncedAt: SYNCED_AT_LABEL },
      w2: { status: 'out-of-sync' },
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

  return useMemo(() => ({
    getConnection: (orgId: string, channel: ChannelKey): RepoConnection | undefined =>
      store.connections[connectionKey(orgId, channel)],
    connectRepo: (orgId: string, channel: ChannelKey, repo: Omit<RepoConnection, 'connectedAt'>) =>
      persist({
        ...store,
        connections: {
          ...store.connections,
          [connectionKey(orgId, channel)]: { ...repo, connectedAt: CONNECTED_AT_LABEL },
        },
      }),
    disconnectRepo: (orgId: string, channel: ChannelKey) => {
      const connections = { ...store.connections }
      delete connections[connectionKey(orgId, channel)]
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
  }), [store, persist])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/ai-agents/git-sync-store.test.ts`
Expected: PASS.

- [ ] **Step 5: Add hook behavior tests**

Append to `src/features/ai-agents/git-sync-store.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react'
import { useGitSyncStore } from './git-sync-store'

describe('useGitSyncStore', () => {
  it('connects and reads a repo keyed by org + channel', () => {
    const { result } = renderHook(() => useGitSyncStore())
    expect(result.current.getConnection('spacex', 'widget')).toBeUndefined()
    act(() => result.current.connectRepo('spacex', 'widget', {
      repoUrl: 'github.com/acme/agents', branch: 'main', basePath: 'agents',
    }))
    expect(result.current.getConnection('spacex', 'widget')).toMatchObject({
      repoUrl: 'github.com/acme/agents', branch: 'main', basePath: 'agents',
    })
    // Different channel is isolated.
    expect(result.current.getConnection('spacex', 'voice')).toBeUndefined()
  })

  it('disconnects a repo', () => {
    const { result } = renderHook(() => useGitSyncStore())
    act(() => result.current.connectRepo('tesla', 'widget', {
      repoUrl: 'r', branch: 'main', basePath: 'agents',
    }))
    act(() => result.current.disconnectRepo('tesla', 'widget'))
    expect(result.current.getConnection('tesla', 'widget')).toBeUndefined()
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
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/features/ai-agents/git-sync-store.test.ts`
Expected: PASS (all cases).

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/features/ai-agents/git-sync-store.ts src/features/ai-agents/git-sync-store.test.ts
git commit -m "feat(ai-agents): add git-sync store (connections + per-agent sync state)"
```

---

## Task 2: `serializeAgentFiles` — StoredAgent → four mock repo files

**Files:**
- Modify: `src/features/ai-agents/git-sync-store.ts`
- Test: `src/features/ai-agents/git-sync-store.test.ts`

**Interfaces:**
- Consumes: `StoredAgent`, `PolicyDoc`, `CanvasBlock` from `./agent-store`.
- Produces:
  - `type SyncedFile = { path: string; label: string; language: 'yaml' | 'json'; content: string }`
  - `serializeAgentFiles(agent: StoredAgent, basePath: string): SyncedFile[]` — returns exactly four files in order: `policy.yaml`, `tools.yaml`, `context.yaml`, `agent.json`.

- [ ] **Step 1: Write the failing test**

Append to `src/features/ai-agents/git-sync-store.test.ts`:

```ts
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
    // w3 seeds one condition block titled "Untitled classic block 01".
    expect(tools.content).toContain('Untitled classic block 01')
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/ai-agents/git-sync-store.test.ts`
Expected: FAIL — `serializeAgentFiles` not exported.

- [ ] **Step 3: Implement `serializeAgentFiles`**

Add to `src/features/ai-agents/git-sync-store.ts` (imports at top, function near the bottom before the hook or after it):

```ts
import type { StoredAgent, PolicyDoc, CanvasBlock } from './agent-store'

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
  const phrases = agent.trainingPhrases.length
    ? agent.trainingPhrases.map((p) => `  - ${JSON.stringify(p)}`).join('\n')
    : '  [] # none'
  const tags = agent.tags.length
    ? agent.tags.map((t) => `  - ${JSON.stringify(t)}`).join('\n')
    : '  [] # none'
  return [
    `channel: ${agent.channel}`,
    `universalBrand: ${agent.universalBrand}`,
    `triggeredWhen: ${JSON.stringify(agent.triggeredWhen)}`,
    'tags:',
    tags,
    'trainingPhrases:',
    phrases,
  ].join('\n') + '\n'
}

function metadataToJson(agent: StoredAgent): string {
  return JSON.stringify({
    id: agent.id,
    name: agent.name,
    type: agent.type,
    on: agent.on,
    isSubagent: agent.isSubagent,
    conversations: agent.conversations,
    deflections: agent.deflections,
    deflectionRate: agent.deflectionRate,
    csat: agent.csat,
    tags: agent.tags,
  }, null, 2) + '\n'
}

export function serializeAgentFiles(agent: StoredAgent, basePath: string): SyncedFile[] {
  const dir = `${basePath}/${agent.id}`
  return [
    { path: `${dir}/policy.yaml`, label: 'policy.yaml', language: 'yaml', content: policyToYaml(agent.policy) },
    { path: `${dir}/tools.yaml`, label: 'tools.yaml', language: 'yaml', content: blocksToYaml(agent.blocks) },
    { path: `${dir}/context.yaml`, label: 'context.yaml', language: 'yaml', content: contextToYaml(agent) },
    { path: `${dir}/agent.json`, label: 'agent.json', language: 'json', content: metadataToJson(agent) },
  ]
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/ai-agents/git-sync-store.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/ai-agents/git-sync-store.ts src/features/ai-agents/git-sync-store.test.ts
git commit -m "feat(ai-agents): serialize agent into mock repo files (policy/tools/context/metadata)"
```

---

## Task 3: `GitSyncCell` component + `AgentsTable` column

**Files:**
- Create: `src/features/ai-agents/GitSyncCell.tsx`
- Modify: `src/features/ai-agents/AgentsTable.tsx`
- Test: `src/features/ai-agents/GitSyncCell.test.tsx`

**Interfaces:**
- Consumes: `AgentSyncState` from `./git-sync-store`; `Agent` from `./agent-builder-data`.
- Produces:
  - `GitSyncCell` component with props `{ agent: Agent; connected: boolean; state: AgentSyncState; onSync: (id: string) => void; onOpenPanel: (id: string) => void; onConnectRepo: () => void }`.
  - `AgentsTable` gains an optional prop:
    ```ts
    gitSync?: {
      getState: (agentId: string) => AgentSyncState
      connected: boolean
      onSync: (agentId: string) => void
      onOpenPanel: (agentId: string) => void
      onConnectRepo: () => void
    }
    ```
    When absent, the column is not rendered.

- [ ] **Step 1: Write the failing cell test**

Create `src/features/ai-agents/GitSyncCell.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GitSyncCell } from './GitSyncCell'
import type { Agent } from './agent-builder-data'

const agent: Agent = {
  id: 'w1', name: 'Knowledge Retrieval', on: true, isSubagent: false,
  type: 'Knowledge Retrieval', conversations: 3000, deflections: 2500,
  deflectionRate: '95%', csat: 3, tags: ['member_center'],
}

describe('GitSyncCell', () => {
  it('shows a Connect repo affordance when not connected', async () => {
    const user = userEvent.setup()
    const onConnectRepo = vi.fn()
    render(<GitSyncCell agent={agent} connected={false} state={{ status: 'not-synced' }}
      onSync={() => {}} onOpenPanel={() => {}} onConnectRepo={onConnectRepo} />)
    await user.click(screen.getByRole('button', { name: /connect repo/i }))
    expect(onConnectRepo).toHaveBeenCalled()
  })

  it('shows a status chip and a Sync button when connected', async () => {
    const user = userEvent.setup()
    const onSync = vi.fn()
    render(<GitSyncCell agent={agent} connected state={{ status: 'out-of-sync' }}
      onSync={onSync} onOpenPanel={() => {}} onConnectRepo={() => {}} />)
    expect(screen.getByText(/out of sync/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^sync/i }))
    expect(onSync).toHaveBeenCalledWith('w1')
  })

  it('opens the panel when the status chip is clicked', async () => {
    const user = userEvent.setup()
    const onOpenPanel = vi.fn()
    render(<GitSyncCell agent={agent} connected state={{ status: 'synced', lastSyncedAt: 'x' }}
      onSync={() => {}} onOpenPanel={onOpenPanel} onConnectRepo={() => {}} />)
    await user.click(screen.getByRole('button', { name: /view git sync details/i }))
    expect(onOpenPanel).toHaveBeenCalledWith('w1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/ai-agents/GitSyncCell.test.tsx`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `GitSyncCell`**

Create `src/features/ai-agents/GitSyncCell.tsx`:

```tsx
// Interactive "Git sync" cell for the agents table. When no repo is connected
// for the current org+channel it shows a muted "Connect repo" prompt; when
// connected it shows a status chip (click → detail panel) + an inline Sync
// button. All handlers stopPropagation so the row's navigate-to-editor click
// does not also fire.
import { GitBranch, RefreshCw } from 'lucide-react'
import type { Agent } from './agent-builder-data'
import type { AgentSyncState, SyncStatus } from './git-sync-store'

const CHIP: Record<SyncStatus, { label: string; bg: string; fg: string }> = {
  'synced': { label: 'Synced', bg: '#e7f5ee', fg: '#0f8a5f' },
  'out-of-sync': { label: 'Out of sync', bg: '#fdf3e3', fg: '#b7791f' },
  'not-synced': { label: 'Not synced', bg: '#f0eeec', fg: '#8b8e89' },
  'syncing': { label: 'Syncing…', bg: '#eef2fb', fg: '#3b5bdb' },
}

export function GitSyncCell({
  agent, connected, state, onSync, onOpenPanel, onConnectRepo,
}: {
  agent: Agent
  connected: boolean
  state: AgentSyncState
  onSync: (id: string) => void
  onOpenPanel: (id: string) => void
  onConnectRepo: () => void
}) {
  if (!connected) {
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onConnectRepo() }}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-surface-border px-2 py-1 text-[12px] text-ink-muted"
      >
        <GitBranch size={12} aria-hidden />
        Connect repo
      </button>
    )
  }

  const chip = CHIP[state.status]
  const syncing = state.status === 'syncing'
  const syncLabel = state.status === 'synced' ? 'Re-sync' : 'Sync'
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`View git sync details for ${agent.name}`}
        onClick={(e) => { e.stopPropagation(); onOpenPanel(agent.id) }}
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium"
        style={{ backgroundColor: chip.bg, color: chip.fg }}
      >
        {chip.label}
      </button>
      <button
        type="button"
        aria-label={`${syncLabel} ${agent.name}`}
        disabled={syncing}
        onClick={(e) => { e.stopPropagation(); onSync(agent.id) }}
        className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2 py-1 text-[12px] text-ink disabled:cursor-not-allowed disabled:text-ink-muted"
      >
        <RefreshCw size={11} aria-hidden />
        {syncLabel}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run cell test to verify it passes**

Run: `npx vitest run src/features/ai-agents/GitSyncCell.test.tsx`
Expected: PASS.

- [ ] **Step 5: Wire the column into `AgentsTable`**

In `src/features/ai-agents/AgentsTable.tsx`:

a) Add imports at the top (after the existing `Agent` import):

```tsx
import { GitSyncCell } from './GitSyncCell'
import type { AgentSyncState } from './git-sync-store'
```

b) Add the `gitSync` prop to the component signature. Change:

```tsx
export function AgentsTable({
  agents, isOn, onToggle, onRowClick, selectedIds, onToggleSelect, onToggleAll,
}: {
  agents: Agent[]
  isOn: (a: Agent) => boolean
  onToggle: (id: string) => void
  onRowClick?: (id: string) => void
  selectedIds?: ReadonlySet<string>
  onToggleSelect?: (id: string) => void
  onToggleAll?: () => void
}) {
```

to:

```tsx
export function AgentsTable({
  agents, isOn, onToggle, onRowClick, selectedIds, onToggleSelect, onToggleAll, gitSync,
}: {
  agents: Agent[]
  isOn: (a: Agent) => boolean
  onToggle: (id: string) => void
  onRowClick?: (id: string) => void
  selectedIds?: ReadonlySet<string>
  onToggleSelect?: (id: string) => void
  onToggleAll?: () => void
  gitSync?: {
    getState: (agentId: string) => AgentSyncState
    connected: boolean
    onSync: (agentId: string) => void
    onOpenPanel: (agentId: string) => void
    onConnectRepo: () => void
  }
}) {
```

c) Add the header cell. After the `{COLS.map(...)}` `<th>` block (which ends `</th>\n            ))}`), add before `</tr>`:

```tsx
            {gitSync && (
              <th className="px-3 py-3 text-left text-[12px] font-medium text-ink-muted">Git sync</th>
            )}
```

d) Add the body cell. After the Tags `<td>` (the one containing the `a.tags.map`), before the closing `</tr>`:

```tsx
              {gitSync && (
                <td className="px-3 py-4 align-middle" onClick={(e) => e.stopPropagation()}>
                  <GitSyncCell
                    agent={a}
                    connected={gitSync.connected}
                    state={gitSync.getState(a.id)}
                    onSync={gitSync.onSync}
                    onOpenPanel={gitSync.onOpenPanel}
                    onConnectRepo={gitSync.onConnectRepo}
                  />
                </td>
              )}
```

- [ ] **Step 6: Add a table-integration test**

Append to `src/features/ai-agents/GitSyncCell.test.tsx`:

```tsx
import { AgentsTable } from './AgentsTable'

const agents: Agent[] = [agent]

describe('AgentsTable git sync column', () => {
  it('does not render the column when gitSync is absent', () => {
    render(<AgentsTable agents={agents} isOn={() => true} onToggle={() => {}} />)
    expect(screen.queryByText('Git sync')).not.toBeInTheDocument()
  })

  it('renders the column and isolates Sync clicks from row navigation', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    const onSync = vi.fn()
    render(<AgentsTable
      agents={agents} isOn={() => true} onToggle={() => {}} onRowClick={onRowClick}
      gitSync={{
        getState: () => ({ status: 'not-synced' }),
        connected: true, onSync, onOpenPanel: () => {}, onConnectRepo: () => {},
      }}
    />)
    expect(screen.getByText('Git sync')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sync Knowledge Retrieval' }))
    expect(onSync).toHaveBeenCalledWith('w1')
    expect(onRowClick).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 7: Run the cell + table tests, plus the existing AgentsTable test**

Run: `npx vitest run src/features/ai-agents/GitSyncCell.test.tsx src/features/ai-agents/AgentsTable.test.tsx`
Expected: PASS (new column tests pass; existing row-click tests still pass since `gitSync` is optional).

- [ ] **Step 8: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/features/ai-agents/GitSyncCell.tsx src/features/ai-agents/GitSyncCell.test.tsx src/features/ai-agents/AgentsTable.tsx
git commit -m "feat(ai-agents): add Git sync column + cell to agents table"
```

---

## Task 4: `ConnectRepoDialog` modal

**Files:**
- Create: `src/features/ai-agents/ConnectRepoDialog.tsx`
- Test: reused in Task 6 (`AgentBuilderScreen.git-sync.test.tsx`); a focused test here.
- Test: `src/features/ai-agents/ConnectRepoDialog.test.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `ConnectRepoDialog` with props `{ orgName: string; channelLabel: string; onCancel: () => void; onConnect: (repo: { repoUrl: string; branch: string; basePath: string }) => void }`.

- [ ] **Step 1: Write the failing test**

Create `src/features/ai-agents/ConnectRepoDialog.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConnectRepoDialog } from './ConnectRepoDialog'

describe('ConnectRepoDialog', () => {
  it('disables Connect until a repository URL is entered', async () => {
    const user = userEvent.setup()
    const onConnect = vi.fn()
    render(<ConnectRepoDialog orgName="SpaceX" channelLabel="Widget" onCancel={() => {}} onConnect={onConnect} />)
    const connect = screen.getByRole('button', { name: 'Connect repository' })
    expect(connect).toBeDisabled()
    await user.type(screen.getByLabelText('Repository URL'), 'github.com/acme/agents')
    expect(connect).toBeEnabled()
    await user.click(connect)
    expect(onConnect).toHaveBeenCalledWith({
      repoUrl: 'github.com/acme/agents', branch: 'main', basePath: 'agents',
    })
  })

  it('calls onCancel from the Cancel button', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConnectRepoDialog orgName="SpaceX" channelLabel="Widget" onCancel={onCancel} onConnect={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/ai-agents/ConnectRepoDialog.test.tsx`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `ConnectRepoDialog`**

Create `src/features/ai-agents/ConnectRepoDialog.tsx`:

```tsx
// Centered modal to connect a git repository for the current org + channel.
// Presentational — the parent owns the actual connectRepo call. Matches the
// hand-rolled overlay convention used by ConfirmDeleteDialog / CreateAgentPanel.
import { useState } from 'react'
import { GitBranch } from 'lucide-react'

export function ConnectRepoDialog({
  orgName, channelLabel, onCancel, onConnect,
}: {
  orgName: string
  channelLabel: string
  onCancel: () => void
  onConnect: (repo: { repoUrl: string; branch: string; basePath: string }) => void
}) {
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const [basePath, setBasePath] = useState('agents')
  const canConnect = repoUrl.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Connect repository" className="relative w-[460px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: '#e7f5ee', color: '#0f8a5f' }}>
            <GitBranch size={18} aria-hidden />
          </span>
          <div>
            <h2 className="text-[17px] font-semibold text-ink">Connect repository</h2>
            <p className="mt-1 text-[14px] text-ink-muted">
              Sync {channelLabel} agents for {orgName} to a git repository. Agent policies, tool calls, context variables, and metadata are written as files.
            </p>
          </div>
        </div>

        <label htmlFor="repo-url" className="mb-1.5 block text-[13px] font-medium text-ink">Repository URL</label>
        <input
          id="repo-url" aria-label="Repository URL" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="github.com/your-org/agents"
          className="mb-4 w-full rounded-lg border border-surface-border px-3 py-2.5 text-[14px] text-ink outline-none placeholder:text-ink-muted"
        />

        <div className="mb-6 flex gap-3">
          <div className="flex-1">
            <label htmlFor="repo-branch" className="mb-1.5 block text-[13px] font-medium text-ink">Branch</label>
            <input
              id="repo-branch" aria-label="Branch" value={branch} onChange={(e) => setBranch(e.target.value)}
              className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-[14px] text-ink outline-none"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="repo-path" className="mb-1.5 block text-[13px] font-medium text-ink">Base path</label>
            <input
              id="repo-path" aria-label="Base path" value={basePath} onChange={(e) => setBasePath(e.target.value)}
              className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-[14px] text-ink outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-full border border-surface-border px-4 py-2 text-[13px] font-medium text-ink">
            Cancel
          </button>
          <button
            type="button" disabled={!canConnect}
            onClick={() => onConnect({ repoUrl: repoUrl.trim(), branch: branch.trim() || 'main', basePath: basePath.trim() || 'agents' })}
            className="rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#f0eeec] disabled:text-ink-muted"
          >
            Connect repository
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/ai-agents/ConnectRepoDialog.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/ai-agents/ConnectRepoDialog.tsx src/features/ai-agents/ConnectRepoDialog.test.tsx
git commit -m "feat(ai-agents): add connect-repo dialog"
```

---

## Task 5: `GitSyncPanel` slide-over (file tree + preview)

**Files:**
- Create: `src/features/ai-agents/GitSyncPanel.tsx`
- Test: `src/features/ai-agents/GitSyncPanel.test.tsx`

**Interfaces:**
- Consumes: `StoredAgent` from `./agent-store`; `RepoConnection`, `AgentSyncState`, `serializeAgentFiles`, `SyncedFile` from `./git-sync-store`.
- Produces: `GitSyncPanel` with props `{ agent: StoredAgent; connection: RepoConnection; state: AgentSyncState; onSync: (id: string) => void; onClose: () => void }`.

- [ ] **Step 1: Write the failing test**

Create `src/features/ai-agents/GitSyncPanel.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GitSyncPanel } from './GitSyncPanel'
import { seedAgents } from './agent-store'

function w3() {
  const a = seedAgents().find((x) => x.id === 'w3')
  if (!a) throw new Error('seed w3 missing')
  return a
}
const connection = { repoUrl: 'github.com/acme/agents', branch: 'main', basePath: 'agents', connectedAt: 'x' }

describe('GitSyncPanel', () => {
  it('lists the four synced files and previews policy.yaml by default', () => {
    render(<GitSyncPanel agent={w3()} connection={connection} state={{ status: 'synced' }} onSync={() => {}} onClose={() => {}} />)
    const tree = screen.getByRole('list', { name: 'Synced files' })
    expect(within(tree).getByText('policy.yaml')).toBeInTheDocument()
    expect(within(tree).getByText('tools.yaml')).toBeInTheDocument()
    expect(within(tree).getByText('context.yaml')).toBeInTheDocument()
    expect(within(tree).getByText('agent.json')).toBeInTheDocument()
    // Default preview is policy.yaml.
    expect(screen.getByTestId('git-sync-preview').textContent).toContain('title:')
  })

  it('switches the preview when another file is selected', async () => {
    const user = userEvent.setup()
    render(<GitSyncPanel agent={w3()} connection={connection} state={{ status: 'synced' }} onSync={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'agent.json' }))
    expect(screen.getByTestId('git-sync-preview').textContent).toContain('"id": "w3"')
  })

  it('calls onSync from the Sync now button', async () => {
    const user = userEvent.setup()
    const onSync = vi.fn()
    render(<GitSyncPanel agent={w3()} connection={connection} state={{ status: 'out-of-sync' }} onSync={onSync} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Sync now' }))
    expect(onSync).toHaveBeenCalledWith('w3')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/ai-agents/GitSyncPanel.test.tsx`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `GitSyncPanel`**

Create `src/features/ai-agents/GitSyncPanel.tsx`:

```tsx
// Right slide-over showing what git-syncs for one agent: a repo-style file tree
// (left) + a read-only YAML/JSON preview (right). Presentational — the parent
// owns the sync action. Matches the CreateAgentPanel overlay shell.
import { useMemo, useState } from 'react'
import { FileCode, FileJson, RefreshCw, X } from 'lucide-react'
import type { StoredAgent } from './agent-store'
import { serializeAgentFiles, type RepoConnection, type AgentSyncState } from './git-sync-store'

export function GitSyncPanel({
  agent, connection, state, onSync, onClose,
}: {
  agent: StoredAgent
  connection: RepoConnection
  state: AgentSyncState
  onSync: (id: string) => void
  onClose: () => void
}) {
  const files = useMemo(() => serializeAgentFiles(agent, connection.basePath), [agent, connection.basePath])
  const [selected, setSelected] = useState(0)
  const active = files[selected]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div role="dialog" aria-label={`Git sync for ${agent.name}`} className="relative flex h-full w-[720px] flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-surface-border px-6 py-4">
          <div>
            <h1 className="text-[18px] font-semibold text-ink">{agent.name}</h1>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              {connection.repoUrl} @ {connection.branch}
              {state.lastSyncedAt ? ` · last synced ${state.lastSyncedAt}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSync(agent.id)}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-[13px] font-semibold text-white"
            >
              <RefreshCw size={13} aria-hidden />
              Sync now
            </button>
            <button type="button" aria-label="Close" onClick={onClose} className="rounded-full border border-surface-border p-2 text-ink">
              <X size={18} aria-hidden />
            </button>
          </div>
        </div>

        {/* Body: file tree + preview */}
        <div className="flex min-h-0 flex-1">
          <ul aria-label="Synced files" className="w-56 shrink-0 overflow-y-auto border-r border-surface-border p-3">
            {files.map((f, i) => {
              const Icon = f.language === 'json' ? FileJson : FileCode
              const isActive = i === selected
              return (
                <li key={f.path}>
                  <button
                    type="button"
                    aria-label={f.label}
                    aria-current={isActive}
                    onClick={() => setSelected(i)}
                    className={`mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] ${isActive ? 'bg-nav-active text-ink' : 'text-ink-muted'}`}
                  >
                    <Icon size={14} aria-hidden />
                    {f.label}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="border-b border-surface-border px-4 py-2 text-[12px] text-ink-muted">{active.path}</div>
            <pre
              data-testid="git-sync-preview"
              className="flex-1 overflow-auto bg-[#f7f8f8] p-4 text-[12px] leading-relaxed text-ink"
            >
              <code>{active.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/ai-agents/GitSyncPanel.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/ai-agents/GitSyncPanel.tsx src/features/ai-agents/GitSyncPanel.test.tsx
git commit -m "feat(ai-agents): add git sync detail panel (file tree + preview)"
```

---

## Task 6: Wire everything into `AgentBuilderScreen`

**Files:**
- Modify: `src/features/ai-agents/AgentBuilderScreen.tsx`
- Test: `src/features/ai-agents/AgentBuilderScreen.git-sync.test.tsx`

**Interfaces:**
- Consumes: `useGitSyncStore` from `./git-sync-store`; `useOrgs` from `@/app/org-context`; `ConnectRepoDialog`, `GitSyncPanel`; the `gitSync` prop of `AgentsTable`.
- Produces: no new exports.

- [ ] **Step 1: Write the failing screen test**

Create `src/features/ai-agents/AgentBuilderScreen.git-sync.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { OrgProvider } from '@/app/org-context'
import { AgentBuilderScreen } from './AgentBuilderScreen'

function renderScreen() {
  return render(
    <OrgProvider>
      <MemoryRouter>
        <AgentBuilderScreen />
      </MemoryRouter>
    </OrgProvider>,
  )
}

describe('AgentBuilderScreen git sync', () => {
  it('shows a connect banner, then the connected repo after connecting', async () => {
    const user = userEvent.setup()
    renderScreen()

    // Banner present before connecting.
    expect(screen.getByText(/no repository connected/i)).toBeInTheDocument()

    // Open the dialog from the banner and connect.
    await user.click(screen.getByRole('button', { name: 'Connect repository' }))
    await user.type(screen.getByLabelText('Repository URL'), 'github.com/acme/agents')
    // The dialog's submit button shares the name; scope to the dialog.
    const dialog = screen.getByRole('dialog', { name: 'Connect repository' })
    await user.click(within(dialog).getByRole('button', { name: 'Connect repository' }))

    // Banner now shows the connected repo, and rows show a Sync control.
    expect(screen.getByText(/github\.com\/acme\/agents/)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^(sync|re-sync) /i }).length).toBeGreaterThan(0)
  })

  it('opens the detail panel from a row status chip once connected', async () => {
    const user = userEvent.setup()
    renderScreen()
    await user.click(screen.getByRole('button', { name: 'Connect repository' }))
    await user.type(screen.getByLabelText('Repository URL'), 'r')
    const dialog = screen.getByRole('dialog', { name: 'Connect repository' })
    await user.click(within(dialog).getByRole('button', { name: 'Connect repository' }))

    await user.click(screen.getByRole('button', { name: /view git sync details for Knowledge Retrieval/i }))
    expect(screen.getByRole('dialog', { name: /git sync for Knowledge Retrieval/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/ai-agents/AgentBuilderScreen.git-sync.test.tsx`
Expected: FAIL — banner text / wiring not present.

- [ ] **Step 3: Add imports to `AgentBuilderScreen.tsx`**

At the top of `src/features/ai-agents/AgentBuilderScreen.tsx`, add:

```tsx
import { useOrgs } from '@/app/org-context'
import { useGitSyncStore } from './git-sync-store'
import { ConnectRepoDialog } from './ConnectRepoDialog'
import { GitSyncPanel } from './GitSyncPanel'
import { GitBranch } from 'lucide-react'
```

(Merge `GitBranch` into the existing `lucide-react` import line instead of adding a second import if you prefer — either is fine.)

- [ ] **Step 4: Add store + org + local state**

Inside `AgentBuilderScreen`, after the existing `const store = useAgentStore()` and state hooks, add:

```tsx
  const git = useGitSyncStore()
  const { orgs, currentOrg } = useOrgs()
  const orgId = orgs.find((o) => o.name === currentOrg)?.id ?? currentOrg
  const connection = git.getConnection(orgId, channelKey)
  const [connectOpen, setConnectOpen] = useState(false)
  const [panelAgentId, setPanelAgentId] = useState<string | null>(null)
  const panelAgent = panelAgentId ? store.getAgent(panelAgentId) : undefined
```

- [ ] **Step 5: Render the connect banner**

Immediately before the `{/* Agents table */}` comment / `<AgentsTable ...>`, add:

```tsx
      {/* Git sync connection banner */}
      <div className="mb-3 flex items-center justify-between rounded-lg border border-surface-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-[13px]">
          <GitBranch size={14} className="text-ink-muted" aria-hidden />
          {connection ? (
            <span className="text-ink">
              Synced to <span className="font-medium">{connection.repoUrl}</span> @ {connection.branch}
            </span>
          ) : (
            <span className="text-ink-muted">
              No repository connected for {channel.label} · {currentOrg}
            </span>
          )}
        </div>
        {connection ? (
          <button
            type="button"
            onClick={() => git.disconnectRepo(orgId, channelKey)}
            className="rounded-full border border-surface-border px-3 py-1 text-[13px] font-medium text-ink"
          >
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConnectOpen(true)}
            className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-semibold text-white"
          >
            Connect repository
          </button>
        )}
      </div>
```

- [ ] **Step 6: Thread `gitSync` into the table**

Change the `<AgentsTable ... />` usage to add the `gitSync` prop:

```tsx
      <AgentsTable
        agents={visibleAgents}
        isOn={(a) => a.on}
        onToggle={(id) => store.toggleAgent(id)}
        onRowClick={(id) => navigate(`/ai-agents/${id}`)}
        selectedIds={selected}
        onToggleSelect={toggleSelect}
        onToggleAll={toggleAll}
        gitSync={{
          getState: git.getSyncState,
          connected: Boolean(connection),
          onSync: git.syncAgent,
          onOpenPanel: (id) => setPanelAgentId(id),
          onConnectRepo: () => setConnectOpen(true),
        }}
      />
```

- [ ] **Step 7: Render the dialog + panel**

After the `{creating && (...)}` block (near the end of the returned JSX, before the closing `</div>`), add:

```tsx
      {connectOpen && (
        <ConnectRepoDialog
          orgName={currentOrg}
          channelLabel={channel.label}
          onCancel={() => setConnectOpen(false)}
          onConnect={(repo) => {
            git.connectRepo(orgId, channelKey, repo)
            setConnectOpen(false)
          }}
        />
      )}

      {panelAgent && connection && (
        <GitSyncPanel
          agent={panelAgent}
          connection={connection}
          state={git.getSyncState(panelAgent.id)}
          onSync={git.syncAgent}
          onClose={() => setPanelAgentId(null)}
        />
      )}
```

- [ ] **Step 8: Run the screen test to verify it passes**

Run: `npx vitest run src/features/ai-agents/AgentBuilderScreen.git-sync.test.tsx`
Expected: PASS.

- [ ] **Step 9: Run the existing AgentBuilderScreen tests to check for regressions**

Run: `npx vitest run src/features/ai-agents/AgentBuilderScreen.test.tsx src/features/ai-agents/AgentBuilderScreen.create-flow.test.tsx`
Expected: PASS. If a test asserts an exact count of buttons/rows that the new banner/column affects, update that assertion to scope with `within(...)` or adjust the expected count — do not weaken behavioral assertions.

- [ ] **Step 10: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 11: Commit**

```bash
git add src/features/ai-agents/AgentBuilderScreen.tsx src/features/ai-agents/AgentBuilderScreen.git-sync.test.tsx
git commit -m "feat(ai-agents): wire git sync banner, connect dialog, and detail panel into Agent Builder"
```

---

## Task 7: Full-suite verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full ai-agents test suite**

Run: `npx vitest run src/features/ai-agents`
Expected: all PASS.

- [ ] **Step 2: Run the full test suite (with the worktree-crawl exclude)**

Run: `npx vitest run --exclude '**/.claude/**'`
Expected: all PASS.

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit && npx vite build`
Expected: typecheck clean; build succeeds.

- [ ] **Step 4: Manual smoke (optional but recommended)**

Run: `pnpm dev`, open `/ai-agents`. Verify: the "Git sync" column shows; before connecting each row shows "Connect repo"; clicking it (or the banner button) opens the dialog; after connecting, rows show status chips (w1 Synced, w2 Out of sync, others Not synced) + Sync buttons; clicking a chip opens the panel with the file tree + preview; "Sync now" flips the row to Synced. Switch channels (Voice/Web Call/Headless) and confirm each channel has its own connection state.

- [ ] **Step 5: Final commit (if any assertion fixes were needed in Task 6 Step 9)**

```bash
git add -A
git commit -m "test(ai-agents): stabilize agent builder assertions for git sync column"
```

---

## Self-Review Notes

- **Spec coverage:** column w/ status + inline action (Task 3) ✓; connect flow banner + dialog scoped per org+channel (Tasks 4, 6) ✓; file-tree + YAML/JSON preview panel (Task 5) ✓; store keyed `${orgId}:${channel}` + deterministic sync (Task 1) ✓; serialization of policy/tools/context/metadata (Task 2) ✓; seed states for visible variety (Task 1) ✓; event isolation from row navigation (Task 3) ✓.
- **`out-of-sync` / `syncing`:** `out-of-sync` comes only from seed (Task 1); `syncing` is rendered defensively (Task 3 `CHIP` map) but never produced by `syncAgent` — matches the spec's explicit note.
- **Org id resolution:** `useOrgs()` exposes `currentOrg` as a name; Task 6 resolves the id via `orgs.find(o => o.name === currentOrg)?.id`, with a name fallback — matches spec.
- **Type consistency:** `AgentSyncState`, `RepoConnection`, `SyncedFile`, `connectionKey`, `serializeAgentFiles`, and the `gitSync` prop bundle are defined once (Tasks 1–3) and consumed with identical signatures downstream.
