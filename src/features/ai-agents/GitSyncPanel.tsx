// Right slide-over showing what git-syncs for one agent: a repo-style file tree
// (left) + a read-only YAML/JSON preview (right). Presentational — the parent
// owns the sync action. Matches the CreateAgentPanel overlay shell.
import { useMemo, useState } from 'react'
import { FileCode, FileJson, RefreshCw, X } from 'lucide-react'
import type { StoredAgent } from './agent-store'
import { serializeAgentFiles, type RepoConnection, type AgentSyncState } from './git-sync-store'

export function GitSyncPanel({
  agent, connection, state, onSync, onDisconnect, onClose,
}: {
  agent: StoredAgent
  connection: RepoConnection
  state: AgentSyncState
  onSync: (id: string) => void
  onDisconnect: () => void
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
          {/* shrink-0 + nowrap: the repo/last-synced line beside this is long
              enough to squeeze the pills, and "Sync now" wrapped to two lines. */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onSync(agent.id)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-4 py-1.5 text-[13px] font-semibold text-white"
            >
              <RefreshCw size={13} aria-hidden />
              Sync now
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              className="whitespace-nowrap rounded-full border border-surface-border px-3 py-1.5 text-[13px] font-medium text-ink"
            >
              Disconnect
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
                    className={`mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] ${isActive ? 'bg-nav-active text-white' : 'text-ink-muted'}`}
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
