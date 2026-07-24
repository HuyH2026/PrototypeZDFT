# Agent Git Sync — Design

**Date:** 2026-07-24
**Feature area:** AI Agents → Agent Builder (`src/features/ai-agents/`)
**Status:** Approved for planning

## Summary

Add a **"Git sync"** column to the Agent Builder "All agents" table. The idea:
instead of authoring agents only through the dashboard, a user can sync an
agent's full definition — Autoflow policy, tool calls, global context variables,
and metadata — to their organization's git repository.

Everything is **frontend-only mock UI**, consistent with the rest of the repo
(no backend; a `localStorage`-backed store like `agent-store.ts`; custom Tailwind
tables; presentational slide-over panels). The feature has three surfaces plus one
new state layer:

1. **Git sync column** — a per-row status chip + inline "Sync" action in the table.
2. **Connect-repo flow** — a banner on the Agent Builder screen + a connect dialog,
   because a repo must be connected (per org **and** channel) before syncing.
3. **Git sync detail panel** — a right slide-over showing a repo-style file tree and
   a read-only YAML/JSON preview of what git-syncs for one agent.

## Decisions (from brainstorming)

- **Column content:** status chip **plus** an inline action per row (Status + inline action).
- **Scope of task:** column + connect flow + full sync detail panel.
- **Panel presentation:** repo-style file tree + read-only YAML/JSON preview.
- **Connection scope:** per **org + channel**. State lives in a new git-sync store,
  keyed by `${orgId}:${channel}`.
- **Sync timing:** resolved deterministically (no real timers / no `Date.now()` /
  no `Math.random()`, which are nondeterministic or unavailable here — see
  `agent-store.ts` and `org-context.tsx` for the existing deterministic-id pattern).

## State layer — `git-sync-store.ts`

New file `src/features/ai-agents/git-sync-store.ts`, mirroring `agent-store.ts`
conventions (pure reducers unit-tested without jsdom; a React hook wiring them to
state + guarded `localStorage`). Persisted under key `git-sync-store-v1`. On full
page load, clear persisted state once (same one-time `removeItem` pattern
`agent-store.ts` uses) so a hard refresh starts clean.

### Types

```ts
export type SyncStatus = 'synced' | 'out-of-sync' | 'not-synced' | 'syncing'

// A connected repository, one per org+channel.
export type RepoConnection = {
  repoUrl: string    // e.g. "github.com/acme/support-agents"
  branch: string     // e.g. "main"
  basePath: string   // e.g. "agents" (folder under repo root)
  connectedAt: string // authored display string, e.g. "Jul 24, 2026" (not Date.now())
}

// Per-agent sync record.
export type AgentSyncState = {
  status: SyncStatus
  lastSyncedAt?: string // authored display string
}
```

### Store shape

- `connections: Record<string, RepoConnection>` keyed by `connectionKey(orgId, channel)`
  where `connectionKey = (orgId, channel) => \`${orgId}:${channel}\``.
- `syncStates: Record<string, AgentSyncState>` keyed by agent id.

### Hook API — `useGitSyncStore()`

```ts
{
  getConnection(orgId: string, channel: ChannelKey): RepoConnection | undefined
  connectRepo(orgId: string, channel: ChannelKey, repo: Omit<RepoConnection,'connectedAt'>): void
  disconnectRepo(orgId: string, channel: ChannelKey): void
  getSyncState(agentId: string): AgentSyncState        // defaults to { status: 'not-synced' } when absent
  syncAgent(agentId: string): void                     // set status 'synced' + stamp lastSyncedAt
}
```

**Sync resolution (deterministic).** `syncAgent` sets the agent's status directly to
`'synced'` and stamps a fixed authored `lastSyncedAt` string. We do **not** simulate
an async `syncing → synced` transition with a timer — real timers are avoided in this
codebase and would make tests nondeterministic. The `'syncing'` status remains a
supported value the chip can render (so future work could animate it), but the mock
`syncAgent` transitions straight to `'synced'`. A newly-connected repo leaves each
agent at its default `'not-synced'`; once synced, an agent shows `'synced'`.
(There is no dashboard-edit tracking that would flip a synced agent back to
`'out-of-sync'` in this scope — `'out-of-sync'` is a renderable status used only for
a small number of **seeded** demo rows so the column visibly shows more than one
state. See "Seed states" below.)

### Seed states

To make the column visually meaningful on first load (matching how `agent-store.ts`
seeds `w3` with a rich policy), seed a couple of `syncStates` entries for existing
widget agents: e.g. `w1 → 'synced'`, `w2 → 'out-of-sync'`, others default to
`'not-synced'`. These are illustrative only.

## UI piece 1 — Git sync column (`GitSyncCell.tsx`)

New file `src/features/ai-agents/GitSyncCell.tsx`. Rendered as a new column in
`AgentsTable`.

**Placement in the table.** `AgentsTable` currently hardcodes three leading columns
(select · Agents · Activate) then maps `COLS = ['Type', 'Conversations', 'Deflections',
'Deflection rate', 'Avg. CSAT', 'Tags']`. Because the Git sync cell needs interaction
(chip + button + click-to-open-panel), it is added as an **explicit trailing column**
(header `"Git sync"` after the `COLS.map`, and a matching trailing `<td>` in the row
map) rather than folded into the `COLS` string array. This keeps the simple text
columns declarative and isolates the interactive cell.

**Cell states:**

- **No connection** for the current org+channel → muted text/button `"Connect repo"`.
  Clicking it opens the Connect-repo dialog (same one the banner opens). This makes
  the column self-explanatory even before a repo is connected.
- **Connected** → a status chip + an inline **"Sync"** button:
  - `synced` → green chip "Synced" (+ optional `lastSyncedAt` caption). Sync button
    becomes a subtle "Re-sync".
  - `out-of-sync` → amber chip "Out of sync" + prominent "Sync" button.
  - `not-synced` → grey chip "Not synced" + "Sync" button.
  - `syncing` → chip "Syncing…" (button disabled). (Not reached by the mock
    `syncAgent`, but rendered defensively.)

**Chip colors:** reuse existing palette conventions — green `#0f8a5f` (same green as
the Activate toggle / accent), amber and grey via existing token/`ink-muted`
patterns. No new design tokens required; follow the inline-hex-where-no-token pattern
already established in `AgentsTable.tsx`.

**Event isolation.** The row `<tr>` has an `onRowClick` that navigates to the editor.
The Git sync `<td>` must `stopPropagation` on its interactive elements (the same
pattern the Activate toggle and checkbox cells already use) so clicking Sync / opening
the panel does not also navigate to `/ai-agents/:id`. Clicking the **chip** opens the
detail panel (piece 3).

**Props.** `AgentsTable` gains optional props so the column only renders when the
parent supplies them (keeps the component reusable and existing tests unaffected):

```ts
gitSync?: {
  getState: (agentId: string) => AgentSyncState
  connected: boolean
  onSync: (agentId: string) => void
  onOpenPanel: (agentId: string) => void
  onConnectRepo: () => void
}
```

When `gitSync` is undefined the column is not rendered at all.

## UI piece 2 — Connect-repo flow

**Banner on `AgentBuilderScreen`.** When `getConnection(currentOrgId, channelKey)` is
undefined, render a slim banner above the table (below the toolbar):
`"No repository connected for {channel.label} · {orgName}"` + a **"Connect repository"**
button. When a connection exists, replace the banner with a compact connected-state
row: `"Synced to {repoUrl} @ {branch}"` + a "Manage" / "Disconnect" affordance.

`AgentBuilderScreen` obtains the current org id via `useOrgs()`. Note `useOrgs()`
exposes `currentOrg` as a **name** string and `orgs` as the list; resolve the id via
`orgs.find(o => o.name === currentOrg)?.id`. If unresolved, fall back to using the
name as the key (defensive; should not happen).

**Dialog (`ConnectRepoDialog.tsx`).** New file. A modal (same overlay pattern as
`ConfirmDeleteDialog` / the slide-over overlay in `CreateAgentPanel`) with fields:

- Repository URL (text) — required.
- Branch (text) — defaults to `main`.
- Base path (text) — defaults to `agents`.

Submit is disabled until Repository URL is non-empty. On submit → `connectRepo(orgId,
channel, { repoUrl, branch, basePath })` and close. The dialog is opened from both the
banner button and the per-row "Connect repo" affordance.

## UI piece 3 — Git sync detail panel (`GitSyncPanel.tsx`)

New file `src/features/ai-agents/GitSyncPanel.tsx`. A right slide-over (same shell as
`CreateAgentPanel`: `fixed inset-0 z-50 flex justify-end`, dark overlay that closes on
click, `w-[…]` white panel, `role="dialog"`). Opened for a single agent from the chip
in the Git sync cell.

**Layout:** two panes.

- **Left — file tree.** A repo-style listing for the agent, rooted at the connection's
  `basePath`:
  - `{basePath}/{agentId}/policy.yaml` — the Autoflow policy.
  - `{basePath}/{agentId}/tools.yaml` — tool calls (derived from canvas blocks).
  - `{basePath}/{agentId}/context.yaml` — global context variables.
  - `{basePath}/{agentId}/agent.json` — metadata.
  Each file is a clickable row; the selected file is highlighted. `policy.yaml`
  selected by default.
- **Right — read-only preview.** A monospace, read-only `<pre>` block showing the
  serialized content of the selected file, generated from the agent's `StoredAgent`
  record.

**Header:** file path breadcrumb / agent name + repo `@ branch`, a status chip, a
**"Sync now"** button (calls `onSync(agentId)`), and a close button.

### Serialization (`serializeAgentFiles` in `git-sync-store.ts` or a sibling module)

A pure function `serializeAgentFiles(agent: StoredAgent): { path: string; label: string; language: 'yaml'|'json'; content: string }[]`.
Produces mock-but-plausible file contents from the agent's existing fields. It builds
YAML/JSON as plain strings (no YAML library dependency — a small hand-rolled
serializer is sufficient and keeps the mock self-contained). Mapping:

- **policy.yaml** ← `agent.policy` (`PolicyDoc`): `title` + the `segments` flattened.
  Prose segments become the sentence text; chip segments render as
  `- ${variant}: ${label}` list entries so the policy reads as structured Autoflow steps.
- **tools.yaml** ← `agent.blocks` (`CanvasBlock[]`): each block serialized as a tool
  call — `stepType`, `title`, and (for condition blocks) `header`/`subtitle`/`rows`.
  Empty list → `tools: []` with a comment `# No tool calls configured`.
- **context.yaml** ← global context variables. The `StoredAgent` model has no explicit
  "context variables" field, so derive a small illustrative set from existing fields:
  `channel`, `universalBrand`, `tags`, `triggeredWhen`, and `trainingPhrases`. These
  are the closest existing "global context" the agent carries. Document in a code
  comment that this is a mock mapping.
- **agent.json** ← metadata: `id`, `name`, `type`, `on`, `isSubagent`, `conversations`,
  `deflections`, `deflectionRate`, `csat`, `tags`. Serialized via `JSON.stringify(…, null, 2)`.

Serialization is deterministic and side-effect free → unit-testable without jsdom.

## Wiring — `AgentBuilderScreen`

- Instantiate `useGitSyncStore()` and `useOrgs()`.
- Resolve `orgId` from `currentOrg` + `orgs`.
- `const connection = store.getConnection(orgId, channelKey)`.
- Render the connect banner (connected/disconnected variants) above the table.
- Local state: `panelAgentId: string | null` (open detail panel), `connectOpen: boolean`.
- Pass the `gitSync` prop bundle into `AgentsTable`:
  - `getState: git.getSyncState`
  - `connected: Boolean(connection)`
  - `onSync: git.syncAgent`
  - `onOpenPanel: (id) => setPanelAgentId(id)`
  - `onConnectRepo: () => setConnectOpen(true)`
- Render `<ConnectRepoDialog>` when `connectOpen`, `<GitSyncPanel>` when `panelAgentId`
  (resolve the agent via `store.getAgent(panelAgentId)` from the **agent** store).

The Git sync column shows on the "All agents" tab (and naturally on the other tabs too,
since it's part of `AgentsTable`; no tab-specific gating needed).

## Files

**New:**
- `src/features/ai-agents/git-sync-store.ts` — state layer + `serializeAgentFiles`.
- `src/features/ai-agents/GitSyncCell.tsx` — the column cell.
- `src/features/ai-agents/ConnectRepoDialog.tsx` — connect modal.
- `src/features/ai-agents/GitSyncPanel.tsx` — detail slide-over.
- `src/features/ai-agents/git-sync-store.test.ts` — reducer/serializer unit tests.

**Modified:**
- `src/features/ai-agents/AgentsTable.tsx` — add optional `gitSync` prop + trailing
  "Git sync" column (header + cell).
- `src/features/ai-agents/AgentBuilderScreen.tsx` — wire store, banner, dialog, panel.

## Testing

Following repo conventions (Vitest + RTL; pure reducers tested without jsdom; behavior
assertions scoped with `within(...)`):

- **`git-sync-store.test.ts` (pure):**
  - `connectRepo` / `getConnection` round-trip keyed by org+channel; different
    channels/orgs are isolated.
  - `syncAgent` sets status `'synced'` and stamps `lastSyncedAt`.
  - `getSyncState` returns `'not-synced'` default for unknown agent.
  - `serializeAgentFiles` returns four files with expected paths, and policy chips /
    blocks / metadata appear in the right file contents.
- **Component (jsdom):**
  - Column hidden when `gitSync` prop absent; shown when present.
  - "Connect repo" affordance shows when `connected` is false; chip + Sync show when true.
  - Clicking Sync calls `onSync` and does **not** trigger `onRowClick` (event isolation).
  - Clicking the chip calls `onOpenPanel`.
  - `AgentBuilderScreen`: banner shows "no repository connected" initially; after
    connecting via the dialog, banner shows the connected repo and rows show chips.

Run: `pnpm test` (or `npx vitest run --exclude '**/.claude/**'` per the known
worktree-crawl caveat).

## Out of scope / non-goals

- No real git operations, GitHub API, OAuth, or network calls.
- No conflict resolution, diff-against-remote, pull, or commit history.
- No editing of file contents in the panel (read-only preview).
- No per-org+channel *different* repos enforcement beyond keying (a user could connect
  the same repo to multiple channels — that's fine for the mock).
- CLAUDE.md's stale claim that AI Agents is "Coming soon" is not corrected here (it is a
  docs issue; can be handled separately).
