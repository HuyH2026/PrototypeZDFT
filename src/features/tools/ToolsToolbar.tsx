// Shared catalog/history toolbar. Search is local-only; the filter/import/create
// controls are presentational because this prototype has no backend.
import { ChevronDown, ListFilter, Search } from 'lucide-react'

export function ToolsToolbar({
  query = '',
  onQueryChange,
  showActions = true,
}: {
  query?: string
  onQueryChange?: (query: string) => void
  showActions?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-[20px] border border-flora-divider bg-white px-3 py-1.5">
          <Search size={16} className="text-ink-muted" aria-hidden />
          <input
            type="text"
            aria-label="Search actions"
            placeholder="Search"
            value={query}
            onChange={(event) => onQueryChange?.(event.target.value)}
            className="w-32 bg-transparent text-[12px] text-ink outline-none placeholder:text-grey-500"
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-[20px] border border-flora-divider bg-white px-3 py-1.5 text-[12px] font-medium text-black"
        >
          <ListFilter size={15} className="text-ink-muted" aria-hidden />
          Filter by
          <ChevronDown size={14} className="text-ink-muted" aria-hidden />
        </button>
      </div>
      {showActions ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-grey-500 px-3 py-1.5 text-[11px] font-semibold text-ink"
          >
            Import action
          </button>
          <button
            type="button"
            className="rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-white"
          >
            Create new
          </button>
        </div>
      ) : null}
    </div>
  )
}
