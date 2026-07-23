// Tool Detail screen: opened from a row in the Tool Builder Available table.
// Only the back arrow and the request-tab strip (inside ToolRequestCard) are
// live; header actions (Duplicate/Versions/Publish/chevron) and the
// "Untitled" tab strip are presentational. No backend.
import { useParams, useNavigate, Navigate } from 'react-router'
import { ArrowLeft, ChevronDown, Plus } from 'lucide-react'
import { TOOL_ACTIONS } from './tools-data'
import { StateBadge } from './ToolsTable'
import { ToolRequestCard } from './ToolRequestCard'
import { ToolResponseCard } from './ToolResponseCard'

export function ToolDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tool = TOOL_ACTIONS.find((t) => t.id === id)

  if (!tool) return <Navigate to="/tools" replace />

  return (
    <div data-testid="screen-tool-detail" className="h-full overflow-y-auto rounded-[26px] bg-white px-10 py-4">
      <div className="flex items-center gap-4">
        <button type="button" aria-label="Back to Tool Builder" onClick={() => navigate('/tools')}>
          <ArrowLeft size={18} className="text-ink" aria-hidden />
        </button>
        <h1 className="text-[22px] text-ink">{tool.name}</h1>
        <StateBadge state={tool.state} />
        <button type="button" aria-label="Tool status options" className="text-ink-muted">
          <ChevronDown size={16} aria-hidden />
        </button>
        <div className="ml-auto flex items-center gap-3">
          <button type="button" className="text-[12px] font-semibold text-black">
            Duplicate
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-surface-border px-3 py-1.5 text-[12px] font-semibold text-black"
          >
            Versions
            <ChevronDown size={14} className="text-ink-muted" aria-hidden />
          </button>
          <button type="button" className="rounded-full bg-ink px-4 py-1.5 text-[12px] font-semibold text-white">
            Publish
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-b border-surface-border">
        <div className="-mb-px flex items-center gap-2 border-b border-ink px-3 py-2 text-[12px] text-ink">
          Untitled
        </div>
        <button type="button" aria-label="Add tab" className="px-2 py-2 text-ink-muted">
          <Plus size={14} aria-hidden />
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <ToolRequestCard />
        <ToolResponseCard />
      </div>
    </div>
  )
}
