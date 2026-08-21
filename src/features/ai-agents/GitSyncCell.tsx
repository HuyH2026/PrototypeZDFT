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
      {/* Icon-only: this is the ninth column of an already-wide table, and the
          chip beside it carries the meaning. The label lives on aria-label and
          title so it stays reachable by name and on hover. */}
      <button
        type="button"
        aria-label={`${syncLabel} ${agent.name}`}
        title={syncLabel}
        disabled={syncing}
        onClick={(e) => { e.stopPropagation(); onSync(agent.id) }}
        className="inline-flex items-center rounded-md border border-surface-border p-1.5 text-ink disabled:cursor-not-allowed disabled:text-ink-muted"
      >
        <RefreshCw size={12} aria-hidden />
      </button>
    </div>
  )
}
