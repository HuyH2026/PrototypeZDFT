// Insights → Agent Overview. A scrollable dashboard with an optional channel
// breakdown, performance and custom insights, conversation trends, and a
// channel comparison. All data is mocked (see ./ai-performances-data).
import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { ConversationComparison } from './ai-performances/ConversationComparison'
import { ConversationTrends } from './ai-performances/ConversationTrends'
import { ConversationsView } from './ai-performances/conversations/ConversationsView'
import { CustomInsights } from './ai-performances/CustomInsights'
import { KnowledgeView } from './ai-performances/knowledge/KnowledgeView'
import { AoTopicsView } from './ai-performances/topics/AoTopicsView'
import { UseCasesView } from './ai-performances/use-cases/UseCasesView'
import { FlowSankey } from './ai-performances/FlowSankey'
import { PerformanceInsights } from './ai-performances/PerformanceInsights'
import { DatePill, FilterPill, SectionHeader } from './ai-performances/SectionHeader'
import { StatCards } from './ai-performances/StatCards'
import { PageHeader } from '@/components/flora/PageHeader'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'

type PageTab = 'Overview' | 'Conversations' | 'Knowledge' | 'Use cases' | 'Topics'
const PAGE_TABS: PageTab[] = ['Overview', 'Conversations', 'Knowledge', 'Use cases', 'Topics']

// Which sections are collapsed. Keyed by section id; a section is expanded when
// absent from the set.
type SectionId = 'overview' | 'custom'

export function AiPerformancesView() {
  const [tab, setTab] = useState<PageTab>('Overview')
  const [collapsed, setCollapsed] = useState<Set<SectionId>>(new Set())
  const [channelBreakdown, setChannelBreakdown] = useState(true)

  const isCollapsed = (id: SectionId) => collapsed.has(id)
  const toggle = (id: SectionId) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const selectTab = (t: PageTab) => {
    setTab(t)
  }

  return (
    <div data-testid="view-ai-performances" className="h-full overflow-y-auto">
      <PageHeader
        title="Agent Overview"
        tabs={PAGE_TABS}
        activeTab={tab}
        onTabChange={selectTab}
        tablistLabel="Agent Overview views"
        // One progressive AI entry, as the Agent Builder header has: start in the
        // contextual panel and expand into the Studio only when needed. The
        // agent-health survey used to sit beside it, but two sparkles in one
        // header read as two assistants; it is reached from Home's agent-health
        // card and from the Studio's own sidebar, one click from the panel's
        // expand control.
        actions={<AiTriggerButton label="Ask AI about this page" />}
      />

      {/* Keyed by tab so switching replays the fade rather than swapping the
          panel's contents in place. */}
      <div key={tab} className="animate-fade-in flex flex-col gap-8 px-16 pb-16">
        {tab === 'Overview' && (
          <>
            <section className="flex flex-col gap-5">
              <SectionHeader
                title="Overview"
                collapsed={isCollapsed('overview')}
                onToggle={() => toggle('overview')}
                filters={
                  <div className="ml-4 flex items-center gap-2">
                    <DatePill />
                    <FilterPill
                      icon={<SlidersHorizontal className="h-3.5 w-3.5 text-ink-muted" />}
                      label="All filters"
                    />
                    <label className="flex cursor-pointer items-center gap-1.5 text-[13px] text-ink">
                      <input
                        type="checkbox"
                        checked={channelBreakdown}
                        onChange={(event) => setChannelBreakdown(event.target.checked)}
                        className="size-4 rounded accent-[#01567A]"
                      />
                      Channel breakdown
                    </label>
                  </div>
                }
              />
              {!isCollapsed('overview') && (
                <div className="animate-fade-in flex flex-col gap-5">
                  <FlowSankey channelBreakdown={channelBreakdown} />
                  <StatCards channelBreakdown={channelBreakdown} />
                </div>
              )}
            </section>

            <PerformanceInsights />

            <section className="flex flex-col gap-5">
              <SectionHeader
                title="Custom insights"
                collapsed={isCollapsed('custom')}
                onToggle={() => toggle('custom')}
                action={
                  <button
                    type="button"
                    className="rounded-full bg-nav-active px-4 py-1.5 text-[13px] font-medium text-white"
                  >
                    Create
                  </button>
                }
              />
              {!isCollapsed('custom') && (
                <div className="animate-fade-in">
                  <CustomInsights />
                </div>
              )}
            </section>

            <ConversationTrends />
            <ConversationComparison />
          </>
        )}
        {tab === 'Conversations' && <ConversationsView />}
        {tab === 'Knowledge' && <KnowledgeView />}
        {tab === 'Use cases' && <UseCasesView />}
        {tab === 'Topics' && <AoTopicsView />}
      </div>
    </div>
  )
}
