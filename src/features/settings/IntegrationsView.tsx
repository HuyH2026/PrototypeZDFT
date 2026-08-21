// Serves /settings/integrations ("Integrations").
// Title row + a tab strip on its own divider (Connections / Document index /
// Collections) and the active tab body. The active tab is URL-addressable so
// other screens can link directly to a specific integration view. No backend.
import { useSearchParams } from 'react-router'
import { INTEGRATIONS_TABS, type IntegrationsTab } from './integrations-data'
import { ConnectionsToolbar } from './ConnectionsToolbar'
import { ConnectionsTable } from './ConnectionsTable'
import { DocumentIndexToolbar } from './DocumentIndexToolbar'
import { DocumentIndexTable } from './DocumentIndexTable'
import { CollectionsView } from './CollectionsView'
import { PageHeader } from '@/components/flora/PageHeader'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'

export function IntegrationsView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab: IntegrationsTab =
    tabParam === 'document-index'
      ? 'Document index'
      : tabParam === 'collections'
        ? 'Collections'
        : 'Connections'

  const setTab = (nextTab: IntegrationsTab) => {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (nextTab === 'Connections') {
      nextSearchParams.delete('tab')
    } else {
      nextSearchParams.set('tab', nextTab === 'Document index' ? 'document-index' : 'collections')
    }

    setSearchParams(nextSearchParams, { replace: true })
  }

  return (
    <div
      data-testid="screen-integrations"
      className="h-full overflow-y-auto rounded-[26px] bg-white"
    >
      <PageHeader
        title="Integrations"
        tabs={INTEGRATIONS_TABS}
        activeTab={tab}
        onTabChange={setTab}
        tablistLabel="Integration views"
        actions={<AiTriggerButton label="Ask AI about this page" />}
      />

      <div className="px-16 pb-16">
        {tab === 'Connections' ? (
          <div className="flex flex-col gap-5">
            <ConnectionsToolbar />
            <ConnectionsTable />
          </div>
        ) : tab === 'Document index' ? (
          <div className="flex flex-col gap-4">
            <DocumentIndexToolbar />
            <DocumentIndexTable />
          </div>
        ) : (
          <CollectionsView />
        )}
      </div>
    </div>
  )
}
