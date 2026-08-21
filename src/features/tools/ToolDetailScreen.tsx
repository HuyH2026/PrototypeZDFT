// Tool Detail screen: opened from a row in the Tool Builder Available table.
// The request-tab strip is local-only; all endpoint data is deterministic mock
// content from the Actions refresh design. No backend.
import { useParams, useNavigate, Navigate } from 'react-router'
import { ArrowLeft, MoreVertical, Plus, X } from 'lucide-react'
import { findToolAction } from './tools-data'
import { StateBadge } from './ToolsTable'
import { ToolRequestCard } from './ToolRequestCard'
import { ToolResponseCard } from './ToolResponseCard'

export function ToolDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tool = findToolAction(id)

  if (!tool) return <Navigate to="/agent-builder/actions" replace />

  return (
    <div
      data-testid="screen-tool-detail"
      className="h-full overflow-y-auto rounded-[26px] bg-white px-8 py-5"
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Back to Actions"
          onClick={() => navigate('/agent-builder/actions')}
        >
          <ArrowLeft size={18} className="text-ink" aria-hidden />
        </button>
        <h1 className="text-[20px] font-medium text-ink">{tool.detailTitle ?? tool.name}</h1>
        <StateBadge state={tool.state} />
        <button type="button" aria-label="Tool status options" className="text-ink-muted">
          <MoreVertical size={17} aria-hidden />
        </button>
        <div className="ml-auto">
          <button
            type="button"
            className="rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-white"
          >
            Duplicate
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-b border-surface-border">
        <div className="-mb-px flex items-center gap-2 border-b border-ink px-3 py-3 text-[12px] text-ink">
          <span className="font-medium text-blue-700">{tool.method ?? 'GET'}</span>
          {tool.detailTitle ?? tool.name}
          <X size={13} className="text-ink-muted" aria-hidden />
        </div>
        <button type="button" aria-label="Add tab" className="px-2 py-2 text-ink-muted">
          <Plus size={14} aria-hidden />
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <ToolRequestCard tool={tool} />
        <ToolResponseCard />
      </div>
    </div>
  )
}
