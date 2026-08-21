// Centered modal to connect a git repository for the current brand + channel.
// Presentational — the parent owns the actual connectRepo call. Matches the
// hand-rolled overlay convention used by ConfirmDeleteDialog / CreateAgentPanel.
import { useState } from 'react'
import { GitBranch } from 'lucide-react'

export function ConnectRepoDialog({
  brandName, channelLabel, onCancel, onConnect,
}: {
  brandName: string
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
              Sync {channelLabel} agents for {brandName} to a git repository. Agent policies, tool calls, context variables, and metadata are written as files.
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
