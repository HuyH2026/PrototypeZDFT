// Insights → AI Performance → Conversations tab. Channel-scoped: a tab group
// switches the card set (each channel provides its own InsightCardData[]) and the
// table columns/rows. "Collapse cards" hides the grid; "Gaps only" filters the
// table. All data is mocked (see ./conversations-data).
import { useState } from 'react'
import { CHANNELS, CONV_CHANNEL_TABS, type ChannelKey, type ConvRow } from './conversations-data'
import { ChannelCardsHeader } from '../ChannelCardsHeader'
import { InsightCard, CreateInsightCardTile } from '../cards/InsightCard'
import { ConversationTable } from './ConversationTable'
import { ConversationDetailPanel } from './ConversationDetailPanel'

export function ConversationsView() {
  const [channel, setChannel] = useState<ChannelKey>('widget')
  const [cardsCollapsed, setCardsCollapsed] = useState(false)
  const [gapsOnly, setGapsOnly] = useState(false)
  const [errorsOnly, setErrorsOnly] = useState(false)
  const [selected, setSelected] = useState<ConvRow | null>(null)
  const data = CHANNELS[channel]

  // Errors only is Widget-only, so it resets with the channel: left set, it
  // would be a checked filter on a channel with no checkbox to clear it.
  // (Gaps only applies to every channel and deliberately survives the switch.)
  const selectChannel = (next: ChannelKey) => {
    setChannel(next)
    setErrorsOnly(false)
  }

  return (
    <div data-testid="view-conversations" className="flex flex-col gap-6">
      <ChannelCardsHeader
        title="Conversations"
        dateRange={data.dateRange}
        channels={CONV_CHANNEL_TABS}
        channel={channel}
        onChannelChange={selectChannel}
        collapsed={cardsCollapsed}
        onToggleCollapsed={() => setCardsCollapsed((v) => !v)}
      />

      {/* Card grid */}
      {!cardsCollapsed && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {data.cards.map((card) => (
            <InsightCard key={card.title} card={card} />
          ))}
          {channel !== 'headless' && <CreateInsightCardTile />}
        </div>
      )}

      {/* Table */}
      <ConversationTable
        columns={data.columns}
        rows={data.rows}
        dateRange={data.dateRange}
        gapsOnly={gapsOnly}
        onGapsOnlyChange={setGapsOnly}
        errorsOnly={errorsOnly}
        onErrorsOnlyChange={setErrorsOnly}
        onRowClick={setSelected}
      />

      {selected && (
        <ConversationDetailPanel detail={selected.detail} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
