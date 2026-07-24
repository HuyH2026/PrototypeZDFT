// Insights → AI Performance → Conversations tab. Channel-scoped: a tab group
// switches the card set (each channel provides its own ConvCard[]) and the
// table columns/rows. "Collapse cards" hides the grid; "Gaps only" filters the
// table. All data is mocked (see ./conversations-data).
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CHANNELS, CONV_CHANNEL_TABS, type ChannelKey, type ConvRow } from './conversations-data'
import { ConversationCard } from './ConversationCards'
import { ConversationTable } from './ConversationTable'
import { ConversationDetailPanel } from './ConversationDetailPanel'

export function ConversationsView() {
  const [channel, setChannel] = useState<ChannelKey>('headless')
  const [cardsCollapsed, setCardsCollapsed] = useState(false)
  const [gapsOnly, setGapsOnly] = useState(false)
  const [selected, setSelected] = useState<ConvRow | null>(null)
  const data = CHANNELS[channel]

  return (
    <div data-testid="view-conversations" className="flex flex-col gap-6">
      {/* Header: title + date range + channel tabs + collapse toggle */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-[20px] font-semibold text-ink">Conversations</h2>
          <span className="text-[15px] text-ink-muted">{data.dateRange}</span>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-surface-border p-0.5">
          {CONV_CHANNEL_TABS.map((t) => {
            const active = t.id === channel
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setChannel(t.id)}
                className={
                  active
                    ? 'rounded-full bg-app-backdrop px-4 py-1.5 text-[13px] font-medium text-ink'
                    : 'rounded-full px-4 py-1.5 text-[13px] text-ink-muted'
                }
              >
                {t.label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => setCardsCollapsed((v) => !v)}
          aria-expanded={!cardsCollapsed}
          className="ml-auto flex items-center gap-1 text-[13px] text-ink-muted"
        >
          {cardsCollapsed ? 'Expand cards' : 'Collapse cards'}
          {cardsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {/* Card grid */}
      {!cardsCollapsed && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {data.cards.map((card) => (
            <ConversationCard key={card.title} card={card} />
          ))}
        </div>
      )}

      {/* Table */}
      <ConversationTable
        columns={data.columns}
        rows={data.rows}
        gapsOnly={gapsOnly}
        onGapsOnlyChange={setGapsOnly}
        onRowClick={setSelected}
      />

      {selected && (
        <ConversationDetailPanel detail={selected.detail} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
