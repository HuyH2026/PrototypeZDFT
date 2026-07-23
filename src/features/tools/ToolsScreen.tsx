// Tool Builder surface: title + inert gear, a tab strip (Available /
// Recommended / Authentication / History), and the active tab body. Tab
// switching is the only live interaction (local state); the Available tab shows
// the toolbar + table, the other three show titled empty regions (no fabricated
// data). No backend.
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Settings } from 'lucide-react'
import { TOOL_TABS, type ToolTab } from './tools-data'
import { ToolsToolbar } from './ToolsToolbar'
import { ToolsTable } from './ToolsTable'
import { ToolsHistoryTable } from './ToolsHistoryTable'

export function ToolsScreen() {
  const [tab, setTab] = useState<ToolTab>('Available')
  const navigate = useNavigate()

  return (
    <div
      data-testid="screen-tools"
      className="h-full overflow-y-auto rounded-[26px] bg-white"
    >
      {/* Sticky header: stays pinned to the top of the scroll area with a
          frosted backdrop so content scrolls softly beneath it (matches
          CX Journey). */}
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[26px] bg-white/80 px-8 pb-4 pt-6 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <h1 className="pb-3 text-[20px] font-semibold text-ink">Tool Builder</h1>
          {TOOL_TABS.map((t) => {
            const active = t === tab
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t)}
                className={
                  active
                    ? '-mb-px border-b-2 border-ink pb-3 text-[14px] font-medium text-ink'
                    : 'pb-3 text-[14px] text-ink-muted'
                }
              >
                {t}
              </button>
            )
          })}
        </div>
        <button type="button" aria-label="Tool settings" className="pb-3 text-ink-muted">
          <Settings size={20} aria-hidden />
        </button>
      </div>

      {/* Body */}
      <div className="px-8 pb-8">
        {tab === 'Available' ? (
          <div className="flex flex-col gap-4">
            <ToolsToolbar />
            <ToolsTable onOpen={(id) => navigate(`/tools/${id}`)} />
          </div>
        ) : tab === 'History' ? (
          <ToolsHistoryTable />
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
