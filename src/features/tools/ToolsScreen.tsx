// Serves /agent-builder/actions ("Actions"). The folder keeps its original name:
// renaming it would churn every import for no user-visible gain.
// Tool Builder surface: title + inert gear, a tab strip (Available /
// Recommended / Authentication / History), and the active tab body. Tab
// switching is the only live interaction (local state); the Available tab shows
// the toolbar + table, the other three show titled empty regions (no fabricated
// data). No backend.
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Settings } from 'lucide-react'
import { TOOL_ACTIONS, TOOL_RUNS, TOOL_TABS, type ToolTab } from './tools-data'
import { ToolsToolbar } from './ToolsToolbar'
import { ToolsTable } from './ToolsTable'
import { ToolsHistoryTable } from './ToolsHistoryTable'
import { ActionsMetrics } from './ActionsMetrics'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'
import { PageHeader } from '@/components/flora/PageHeader'

export function ToolsScreen() {
  const [tab, setTab] = useState<ToolTab>('Available')
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const normalizedQuery = query.trim().toLowerCase()
  const actions = normalizedQuery
    ? TOOL_ACTIONS.filter((action) =>
        `${action.name} ${action.description} ${action.type} ${action.useCase ?? ''}`
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : TOOL_ACTIONS
  const runs = normalizedQuery
    ? TOOL_RUNS.filter((run) =>
        `${run.name} ${run.description} ${run.type} ${run.channel} ${run.status}`
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : TOOL_RUNS

  return (
    <div data-testid="screen-tools" className="h-full overflow-y-auto rounded-[26px] bg-white">
      <PageHeader
        title="Actions"
        tabs={TOOL_TABS}
        activeTab={tab}
        onTabChange={setTab}
        tablistLabel="Action views"
        actions={
          // The sparkle sits last, in the far-right corner — the one spot it
          // occupies on every other section page, where it is the header's only
          // action. Page-specific actions come before it.
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Tool settings" className="text-ink-muted">
              <Settings size={20} aria-hidden />
            </button>
            <AiTriggerButton label="Ask AI about this page" />
          </div>
        }
      />

      {/* Body */}
      <div className="px-16 pb-16">
        {tab === 'Available' ? (
          <div className="flex flex-col gap-4">
            <ActionsMetrics />
            <ToolsToolbar query={query} onQueryChange={setQuery} />
            <ToolsTable
              actions={actions}
              onOpen={(id) => navigate(`/agent-builder/actions/${id}`)}
            />
          </div>
        ) : tab === 'History' ? (
          <div className="flex flex-col gap-4">
            <ToolsToolbar query={query} onQueryChange={setQuery} showActions={false} />
            <ToolsHistoryTable runs={runs} />
          </div>
        ) : (
          <div
            data-testid={`tools-tab-${tab}`}
            className="flex h-64 items-center justify-center text-[14px] text-ink-muted"
          >
            {tab}
          </div>
        )}
      </div>
    </div>
  )
}
