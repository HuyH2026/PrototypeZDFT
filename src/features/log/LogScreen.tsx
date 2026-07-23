// Log surface: title + a tab strip (Audit / Error) and the active tab body. Tab
// switching is the only live interaction (local state), mirroring ToolsScreen.
// No backend.
import { useState } from 'react'
import { LOG_TABS, type LogTab } from './log-data'
import { AuditView } from './AuditView'
import { ErrorView } from './ErrorView'

export function LogScreen() {
  const [tab, setTab] = useState<LogTab>('Audit')

  return (
    <div
      data-testid="screen-log"
      className="h-full overflow-y-auto rounded-[26px] bg-white"
    >
      {/* Sticky header: stays pinned to the top of the scroll area with a
          frosted backdrop so content scrolls softly beneath it (matches
          CX Journey). */}
      <div className="sticky top-0 z-10 flex items-center gap-6 rounded-t-[26px] bg-white/80 px-8 pb-4 pt-6 backdrop-blur-md">
        <h1 className="pb-3 text-[20px] font-semibold text-ink">Log</h1>
        {LOG_TABS.map((t) => {
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

      <div className="px-8 pb-8">{tab === 'Audit' ? <AuditView /> : <ErrorView />}</div>
    </div>
  )
}
