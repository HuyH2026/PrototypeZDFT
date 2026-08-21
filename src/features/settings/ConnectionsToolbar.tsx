// Inert toolbar for the Connections tab: a search field and the primary
// "Connect new integration" action. No backend.
import { Search } from 'lucide-react'

export function ConnectionsToolbar() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex w-[220px] items-center gap-2 rounded-[20px] border border-surface-border bg-white px-3 py-2">
        <Search size={15} className="text-ink-muted" aria-hidden />
        <input
          type="text"
          placeholder="Search"
          aria-label="Search integrations"
          className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-grey-500"
        />
      </div>
      <button
        type="button"
        className="flex shrink-0 items-center rounded-[18px] bg-ink px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-grey-1100"
      >
        Connect new integration
      </button>
    </div>
  )
}
