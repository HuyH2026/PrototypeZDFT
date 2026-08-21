// The header row above a channel-scoped card grid: section title, date range, an
// optional channel pill group, and the Collapse cards affordance pushed right.
// Shared by the Conversations, Knowledge, Use cases and Topics tabs; Topics
// passes no channels, so its pill group is omitted.
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ChannelKey, ChannelTab } from './channel-tabs'

export function ChannelCardsHeader({
  title,
  dateRange,
  channels,
  channel,
  onChannelChange,
  collapsed,
  onToggleCollapsed,
}: {
  title: string
  dateRange: string
  channels?: ChannelTab[]
  channel?: ChannelKey
  onChannelChange?: (next: ChannelKey) => void
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-baseline gap-3">
        <h2 className="text-[20px] font-semibold text-ink">{title}</h2>
        <span className="text-[15px] text-ink-muted">{dateRange}</span>
      </div>
      {channels?.length ? (
        <div className="flex items-center gap-1 rounded-full border border-surface-border p-0.5">
          {channels.map((t) => {
            const active = t.id === channel
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChannelChange?.(t.id)}
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
      ) : null}
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-expanded={!collapsed}
        className="ml-auto flex items-center gap-1 text-[13px] text-ink-muted"
      >
        {collapsed ? 'Expand cards' : 'Collapse cards'}
        {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>
    </div>
  )
}
