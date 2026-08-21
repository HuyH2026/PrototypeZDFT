import { useState } from 'react'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'
import { PageHeader } from '@/components/flora/PageHeader'
import { KnowledgeGapsView } from './KnowledgeGapsView'
import { UseCaseGapsView } from './UseCaseGapsView'
import { RealizedImpactView } from './RealizedImpactView'

export type AutomationsTab = 'Knowledge gaps' | 'Use case gaps' | 'Realized impact'

const TABS: AutomationsTab[] = ['Use case gaps', 'Knowledge gaps', 'Realized impact']

export function AutomationsScreen() {
  const [tab, setTab] = useState<AutomationsTab>('Use case gaps')

  return (
    <div data-testid="screen-automations" className="h-full overflow-y-auto">
      <PageHeader
        title="Automation opportunities"
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        tablistLabel="Automation insights"
        actions={<AiTriggerButton label="Ask AI about this page" />}
      />
      <div className="px-16 pb-16">
        {tab === 'Knowledge gaps' && <KnowledgeGapsView />}
        {tab === 'Use case gaps' && <UseCaseGapsView />}
        {tab === 'Realized impact' && <RealizedImpactView />}
      </div>
    </div>
  )
}
