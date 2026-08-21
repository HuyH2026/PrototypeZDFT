// Insights → Agent Overview → Use cases. Channel-scoped cards over a toolbar and
// the eight-column table. All data is mocked (see ./use-cases-data).
import { type CSSProperties, useState } from 'react'
import { InsightCard } from '../cards/InsightCard'
import { CHANNEL_TABS, type ChannelKey } from '../channel-tabs'
import { ChannelCardsHeader } from '../ChannelCardsHeader'
import { MetricToolbar, ToolbarCheckbox } from '../MetricToolbar'
import { USE_CASE_CHANNELS } from './use-cases-data'
import { UseCasesTable } from './UseCasesTable'
import { useInView } from '@/lib/use-in-view'

export function UseCasesView() {
  const [channel, setChannel] = useState<ChannelKey>('widget')
  const [cardsCollapsed, setCardsCollapsed] = useState(false)
  const [showChange, setShowChange] = useState(false)
  const data = USE_CASE_CHANNELS[channel]
  const { ref, inView } = useInView()

  return (
    <div data-testid="view-ao-use-cases" className="flex flex-col gap-6">
      <ChannelCardsHeader
        title="Use cases"
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
              className={inView ? 'animate-rise-in' : 'opacity-0'}
            >
              <InsightCard card={card} />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <MetricToolbar searchLabel="Search use cases" dateRange={data.dateRange}>
          <ToolbarCheckbox label="Show % change" checked={showChange} onChange={setShowChange} />
        </MetricToolbar>
        <UseCasesTable rows={data.rows} showChange={showChange} />
      </div>
    </div>
  )
}
