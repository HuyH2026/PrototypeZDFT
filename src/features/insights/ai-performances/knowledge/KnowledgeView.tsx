// Insights → Agent Overview → Knowledge. Channel-scoped cards above a
// Knowledge | Knowledge gap sub-tab strip; the cards, the channel scope and the
// date range are shared by both sub-tabs, so switching sub-tab changes only the
// toolbar and the table. All data is mocked (see ./knowledge-data).
import { type CSSProperties, useState } from 'react'
import { InsightCard } from '../cards/InsightCard'
import { CHANNEL_TABS, type ChannelKey } from '../channel-tabs'
import { ChannelCardsHeader } from '../ChannelCardsHeader'
import { MetricToolbar, ToolbarCheckbox } from '../MetricToolbar'
import { KNOWLEDGE_CHANNELS } from './knowledge-data'
import { KnowledgeGapTable, KnowledgeTable } from './KnowledgeTable'
import { useInView } from '@/lib/use-in-view'

const SUB_TABS = ['Knowledge', 'Knowledge gap'] as const
type SubTab = (typeof SUB_TABS)[number]

export function KnowledgeView() {
  const [channel, setChannel] = useState<ChannelKey>('widget')
  const [subTab, setSubTab] = useState<SubTab>('Knowledge')
  const [cardsCollapsed, setCardsCollapsed] = useState(false)
  const [showChange, setShowChange] = useState(false)
  const data = KNOWLEDGE_CHANNELS[channel]
  // The second card row sits at or below the fold, and the Agent Overview is a
  // long scroll — the reveal waits for it rather than playing to an empty room.
  const { ref, inView } = useInView()

  return (
    <div data-testid="view-ao-knowledge" className="flex flex-col gap-6">
      <ChannelCardsHeader
        title="Knowledge"
        dateRange={data.dateRange}
        channels={CHANNEL_TABS}
        channel={channel}
        onChannelChange={setChannel}
        collapsed={cardsCollapsed}
        onToggleCollapsed={() => setCardsCollapsed((v) => !v)}
      />

      {!cardsCollapsed && (
        <div ref={ref} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {data.cards.map((card, i) => (
            <div
              key={card.title}
              style={{ '--rise': i } as CSSProperties}
              // `opacity-0` until revealed, not simply "no animation": the
              // keyframe's own `from` state is what hides the card.
              className={inView ? 'animate-rise-in' : 'opacity-0'}
            >
              <InsightCard card={card} />
            </div>
          ))}
        </div>
      )}

      <div
        role="tablist"
        aria-label="Knowledge insight views"
        className="flex items-center gap-6 border-b border-surface-border"
      >
        {SUB_TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={t === subTab}
            onClick={() => setSubTab(t)}
            className={
              t === subTab
                ? '-mb-px border-b-2 border-ink px-1 pb-2 text-[14px] font-medium text-ink'
                : '-mb-px border-b-2 border-transparent px-1 pb-2 text-[14px] text-ink-muted'
            }
          >
            {t}
          </button>
        ))}
      </div>

      {subTab === 'Knowledge' ? (
        <div className="flex flex-col gap-4">
          <MetricToolbar searchLabel="Search article" dateRange={data.dateRange}>
            <ToolbarCheckbox label="Show % change" checked={showChange} onChange={setShowChange} />
          </MetricToolbar>
          <KnowledgeTable rows={data.rows} showChange={showChange} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <MetricToolbar searchLabel="Search missing topic" dateRange={data.dateRange} />
          <KnowledgeGapTable rows={data.gapRows} />
        </div>
      )}
    </div>
  )
}
