// Error Logs overview: total new errors plus the three severity counts from the
// reference frame.
import { Info } from 'lucide-react'
import { SeverityBadge } from './SeverityBadge'
import type { Severity } from './log-data'

const METRICS: Array<{ label: 'New errors' | Severity; value: string }> = [
  { label: 'New errors', value: '5,492' },
  { label: 'High', value: '245' },
  { label: 'Medium', value: '5,000' },
  { label: 'Low', value: '198' },
]

function Card({ label, value }: (typeof METRICS)[number]) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-5 rounded-[20px] border border-surface-border px-5 py-5">
      {label === 'New errors' ? (
        <span className="flex items-center gap-1.5 text-[14px] font-medium text-ink">
          New errors
          <Info size={14} className="text-ink-muted" aria-hidden />
        </span>
      ) : (
        <span>
          <SeverityBadge severity={label} />
        </span>
      )}
      <span className="text-[30px] font-semibold leading-none text-ink">{value}</span>
    </div>
  )
}

export function ErrorOverview() {
  return (
    <div className="flex items-stretch gap-4">
      {METRICS.map((metric) => (
        <Card key={metric.label} {...metric} />
      ))}
    </div>
  )
}
