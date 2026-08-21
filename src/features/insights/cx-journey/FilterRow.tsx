// src/features/insights/cx-journey/FilterRow.tsx
// Presentational filter controls shared by the flow and trends sections. The
// date range, audience dropdown, and channel-breakdown toggle are static (no
// backend); only the granularity toggle passed via `children` is interactive.
import { Calendar, ChevronDown } from 'lucide-react'

type FilterRowProps = {
  title: string
  audience?: string
  children?: React.ReactNode
}

function Pill({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3 py-1.5 text-[13px] text-ink"
    >
      {icon}
      <span>{label}</span>
      <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
    </button>
  )
}

export function FilterRow({ title, audience = 'All (AI + Human)', children }: FilterRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      <div className="flex flex-wrap items-center gap-2">
        <Pill icon={<Calendar className="h-3.5 w-3.5 text-ink-muted" />} label="Nov 7, 2025 – Dec 6, 2025" />
        <Pill label={audience} />
        <label className="flex items-center gap-1.5 text-[13px] text-ink-muted">
          <span className="inline-block h-3.5 w-3.5 rounded-full border border-surface-border" />
          Channel breakdown
        </label>
        {children}
      </div>
    </div>
  )
}
