// The row above every Agent Overview table: an inert search box, the date pill,
// All filters, a slot for the tab's own checkboxes, and the trailing icon
// actions. Everything except the children is decorative — there is no backend to
// search, filter or export against.
import { Columns3, Download, Menu, Search } from 'lucide-react'
import { DatePill } from './SectionHeader'

export function MetricToolbar({
  searchLabel,
  dateRange,
  children,
}: {
  searchLabel: string
  dateRange: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 rounded-lg border border-surface-border px-3 py-1.5 text-[13px] text-ink-muted">
        <Search className="h-3.5 w-3.5" />
        {searchLabel}
      </div>
      <DatePill label={dateRange} />
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-full border border-surface-border px-3 py-1.5 text-[13px] font-medium text-[#01567A]"
      >
        All filters
      </button>
      {children}
      <div className="ml-auto flex items-center gap-3 text-[#01567A]">
        <button type="button" aria-label="Download"><Download className="h-4 w-4" /></button>
        <button type="button" aria-label="List view"><Menu className="h-4 w-4" /></button>
        <button type="button" aria-label="Columns"><Columns3 className="h-4 w-4" /></button>
      </div>
    </div>
  )
}

export function ToolbarCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#01567A]"
      />
      {label}
    </label>
  )
}
