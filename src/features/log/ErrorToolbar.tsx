// Inert toolbar for the Error tab: a "Conversation ID" field selector adjoined
// to a keyword search, a "Filter by" dropdown, a "Show muted alerts" button,
// then right-aligned "Alert management".
import { BellOff, ChevronDown, ListFilter, Search } from 'lucide-react'

export function ErrorToolbar() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-[20px] border border-flora-divider bg-white">
          <button
            type="button"
            className="flex items-center gap-1 border-r border-flora-divider px-3 py-1.5 text-[12px] font-medium text-black"
          >
            Conversation ID
            <ChevronDown size={14} className="text-ink-muted" aria-hidden />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5">
            <Search size={16} className="text-ink-muted" aria-hidden />
            <input
              type="text"
              placeholder="Enter keyword"
              className="w-40 bg-transparent text-[12px] text-ink outline-none placeholder:text-grey-500"
            />
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-[20px] border border-flora-divider bg-white px-3 py-1.5 text-[12px] font-medium text-black"
        >
          <ListFilter size={15} className="text-ink-muted" aria-hidden />
          Filter by
          <ChevronDown size={14} className="text-ink-muted" aria-hidden />
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-[20px] border border-flora-divider bg-white px-3 py-1.5 text-[12px] font-medium text-black"
        >
          <BellOff size={15} className="text-ink-muted" aria-hidden />
          Show muted alerts
        </button>
      </div>
      <button
        type="button"
        className="rounded-[20px] border border-flora-divider bg-white px-4 py-1.5 text-[12px] font-medium text-ink"
      >
        Alert management
      </button>
    </div>
  )
}
