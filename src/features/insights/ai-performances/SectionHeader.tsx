// Presentational section header shared across the AI Performances overview.
// Renders a title, optional inline filter pills, a "Collapse" affordance, and
// (optionally) a trailing action slot. All controls are static except the
// collapse toggle, which is driven by the parent.
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'

export function FilterPill({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-full border border-surface-border bg-white px-3 py-1.5 text-[13px] text-ink"
    >
      {icon}
      <span>{label}</span>
      <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
    </button>
  )
}

export function DatePill({ label = 'May 2, 2025 – Jun 1, 2025' }: { label?: string }) {
  return <FilterPill icon={<Calendar className="h-3.5 w-3.5 text-ink-muted" />} label={label} />
}

export function SectionHeader({
  title,
  collapsed,
  onToggle,
  filters,
  action,
}: {
  title: string
  collapsed: boolean
  onToggle: () => void
  filters?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="text-[18px] font-medium text-ink">{title}</h2>
      {filters}
      <div className="ml-auto flex items-center gap-3">
        {action}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          className="flex items-center gap-1 text-[13px] text-ink-muted"
        >
          {collapsed ? 'Expand' : 'Collapse'}
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
