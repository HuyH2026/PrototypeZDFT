// Inert filter row for the Document index tab: a search-field selector, the
// search box, a source-type select, an integration select (unset, so it shows
// its placeholder), and right-aligned columns/rows icon buttons. Styled after
// AuditToolbar, but square-cornered to match the design's denser filter row.
// No backend — every control is presentational.
import { ChevronDown, Columns3, List, Search } from 'lucide-react'
import { DOC_SEARCH_FIELDS, DOC_SOURCE_TYPES } from './integrations-data'

// Bordered select-alike: a label and a chevron. Inert, so a real <select> would
// only promise interactivity the screen does not have.
function Select({
  label,
  placeholder = false,
  className,
}: {
  label: string
  placeholder?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`flex min-w-0 items-center justify-between gap-2 rounded-[18px] border border-surface-border bg-white px-3 py-2 text-[13px] ${
        placeholder ? 'text-grey-500' : 'text-ink'
      } ${className ?? ''}`}
    >
      <span className="truncate">{label}</span>
      <ChevronDown size={15} className="shrink-0 text-ink-muted" aria-hidden />
    </button>
  )
}

export function DocumentIndexToolbar() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        {/* Which column the search applies to. */}
        <Select label={DOC_SEARCH_FIELDS[0]} className="w-[86px] shrink-0" />
        <div className="flex w-[190px] min-w-0 items-center gap-2 rounded-[18px] border border-surface-border bg-white px-3 py-2">
          <Search size={15} className="shrink-0 text-ink-muted" aria-hidden />
          <input
            type="text"
            placeholder="Search"
            aria-label="Search documents"
            className="w-full min-w-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-grey-500"
          />
        </div>
        <Select label={DOC_SOURCE_TYPES[0]} className="w-[94px] shrink-0" />
        {/* Unset in the design, so it reads as a placeholder rather than a value. */}
        <Select label="Select integration" placeholder className="w-[160px] shrink-0" />
      </div>
      <div className="flex shrink-0 items-center gap-3 text-ink-muted">
        <button type="button" aria-label="Row density">
          <List size={18} aria-hidden />
        </button>
        <button type="button" aria-label="Choose columns">
          <Columns3 size={18} aria-hidden />
        </button>
      </div>
    </div>
  )
}
