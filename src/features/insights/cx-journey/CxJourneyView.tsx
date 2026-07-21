// CX Journey → Overview: one long scrollable mock page. The Overview/Topics/
// Automations strip is decorative (no routing); only the trends granularity
// toggle is interactive.
import { useState } from 'react'
import { AgentsBreakdownTable } from './AgentsBreakdownTable'
import { ConversationFlowSection } from './ConversationFlowSection'
import { type Granularity } from './cx-journey-data'
import { TrendsSection } from './TrendsSection'

const TABS = ['Overview', 'Topics', 'Automations']

export function CxJourneyView() {
  const [granularity, setGranularity] = useState<Granularity>('weekly')
  return (
    <div data-testid="view-cx-journey" className="h-full overflow-y-auto px-8 py-6">
      <div className="mb-6 flex items-center gap-6 border-b border-surface-border">
        <h1 className="pb-3 text-[20px] font-semibold text-ink">CX Journey</h1>
        {TABS.map((tab, i) => (
          <span
            key={tab}
            className={
              i === 0
                ? '-mb-px border-b-2 border-ink pb-3 text-[14px] font-medium text-ink'
                : 'pb-3 text-[14px] text-ink-muted'
            }
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-12">
        <ConversationFlowSection />
        <AgentsBreakdownTable />
        <TrendsSection granularity={granularity} onGranularityChange={setGranularity} />
      </div>
    </div>
  )
}
