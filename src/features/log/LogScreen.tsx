// Serves /settings/logs ("Logs").
// Log surface: title + a tab strip (Change Logs / Error Logs) and the active tab body. Tab
// switching is the only live interaction (local state), mirroring ToolsScreen.
// No backend.
import { useState } from 'react'
import { LOG_TABS, type LogTab } from './log-data'
import { AuditView } from './AuditView'
import { ErrorView } from './ErrorView'
import { ApiErrorsView } from './ApiErrorsView'
import { PageHeader } from '@/components/flora/PageHeader'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'

export function LogScreen() {
  const [tab, setTab] = useState<LogTab>('Change Logs')

  return (
    <div data-testid="screen-log" className="h-full overflow-y-auto rounded-[26px] bg-white">
      <PageHeader
        title="Logs"
        tabs={LOG_TABS}
        activeTab={tab}
        onTabChange={setTab}
        tablistLabel="Log views"
        actions={<AiTriggerButton label="Ask AI about this page" />}
      />

      <div className="px-16 pb-16">
        {tab === 'Change Logs' ? <AuditView /> : tab === 'Error Logs' ? <ErrorView /> : <ApiErrorsView />}
      </div>
    </div>
  )
}
