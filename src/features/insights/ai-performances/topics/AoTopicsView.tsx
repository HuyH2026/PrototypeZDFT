// Insights → Agent Overview → Topics. Six cards, the frame's classification note,
// a toolbar, and the expandable category table. No channel pill group — this tab
// is not channel-scoped. All data is mocked (see ./ao-topics-data).
import { type CSSProperties, useState } from 'react'
import { InsightCard } from '../cards/InsightCard'
import { ChannelCardsHeader } from '../ChannelCardsHeader'
import { MetricToolbar, ToolbarCheckbox } from '../MetricToolbar'
import {
  AO_TOPIC_CARDS,
  AO_TOPIC_GROUPS,
  AO_TOPICS_DATE_RANGE,
  AO_TOPICS_NOTE,
} from './ao-topics-data'
import { AoTopicsTable } from './AoTopicsTable'
import { useInView } from '@/lib/use-in-view'

export function AoTopicsView() {
  const [cardsCollapsed, setCardsCollapsed] = useState(false)
  // Checked by default, matching the frame's grouped rows.
  const [grouped, setGrouped] = useState(true)
  const [gapsOnly, setGapsOnly] = useState(false)
  const { ref, inView } = useInView()

  return (
    <div data-testid="view-ao-topics" className="flex flex-col gap-6">
      <ChannelCardsHeader
        title="Topics"
        dateRange={AO_TOPICS_DATE_RANGE}
        collapsed={cardsCollapsed}
        onToggleCollapsed={() => setCardsCollapsed((v) => !v)}
      />

      {!cardsCollapsed && (
        <div ref={ref} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {AO_TOPIC_CARDS.map((card, i) => (
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

      <p className="max-w-[720px] text-[13px] leading-relaxed text-ink-muted">{AO_TOPICS_NOTE}</p>

      <div className="flex flex-col gap-4">
        <MetricToolbar searchLabel="Search topics" dateRange={AO_TOPICS_DATE_RANGE}>
          <ToolbarCheckbox label="Group Topics" checked={grouped} onChange={setGrouped} />
          <ToolbarCheckbox label="Gaps only" checked={gapsOnly} onChange={setGapsOnly} />
        </MetricToolbar>
        <AoTopicsTable groups={AO_TOPIC_GROUPS} grouped={grouped} gapsOnly={gapsOnly} />
      </div>
    </div>
  )
}
