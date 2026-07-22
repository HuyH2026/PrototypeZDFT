// The five-metric performance strip for the active channel. Each card shows a
// label + info dot, a colored delta pill (↗/↘, green when good else red), and a
// large value (CSAT rendered green via `accent`). Presentational only.
import { Info, TrendingDown, TrendingUp } from 'lucide-react'
import { type Metric } from './agent-builder-data'

const INK = '#2f3130'
const MUTED = '#8b8e89'
const GREEN = '#0f8a5f'
const RED = '#c8402f'

function DeltaPill({ metric }: { metric: Metric }) {
  const positive = metric.good
  const color = positive ? GREEN : RED
  const Arrow = metric.trend === 'up' ? TrendingUp : TrendingDown
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium"
      style={{ color, backgroundColor: positive ? 'rgba(15,138,95,0.10)' : 'rgba(200,64,47,0.10)' }}
    >
      {metric.delta}
      <Arrow size={13} aria-hidden />
    </span>
  )
}

export function MetricStrip({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {metrics.map((m) => (
        <div key={m.key} className="rounded-2xl border border-surface-border p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-semibold" style={{ color: INK }}>{m.label}</span>
              <Info size={13} style={{ color: MUTED }} aria-hidden />
            </div>
            <DeltaPill metric={m} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[30px] font-semibold leading-none" style={{ color: m.accent ? GREEN : INK }}>
              {m.value}
            </span>
            {m.sub ? <span className="text-[15px] font-medium" style={{ color: MUTED }}>{m.sub}</span> : null}
          </div>
        </div>
      ))}
    </div>
  )
}
