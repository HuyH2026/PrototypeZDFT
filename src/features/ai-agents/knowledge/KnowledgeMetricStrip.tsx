// The four-card summary strip in Content snippets — Figma frame 1:3510.
// Presentational only; all values are mocked in knowledge-data.ts.
import { TrendingDown, TrendingUp } from 'lucide-react'
import { type KnowledgeMetric } from './knowledge-data'

const UP = { color: '#048c80', backgroundColor: '#e6f4f2' }
const DOWN = { color: '#c63f46', backgroundColor: '#fbf3f3' }

function DeltaPill({ delta }: { delta: NonNullable<KnowledgeMetric['delta']> }) {
  const up = delta.trend === 'up'
  const Arrow = up ? TrendingUp : TrendingDown

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[12px] leading-[18px] font-medium"
      style={up ? UP : DOWN}
    >
      {delta.amount}
      <Arrow size={16} aria-hidden />
    </span>
  )
}

export function KnowledgeMetricStrip({ metrics }: { metrics: KnowledgeMetric[] }) {
  return (
    <div className="@container">
      <div data-testid="knowledge-metrics" className="grid grid-cols-2 gap-4 @[720px]:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            data-testid={`knowledge-metric-${metric.key}`}
            className="flex min-h-[118px] flex-col justify-between rounded-[20px] border border-surface-border bg-white p-[21px]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0 text-[14px] leading-5 font-semibold text-ink">
                {metric.label}
              </span>
              {metric.delta ? <DeltaPill delta={metric.delta} /> : null}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[26px] leading-8 font-semibold text-ink">{metric.value}</span>
              {metric.sub ? (
                <span className="text-[18px] leading-6 font-medium text-ink-muted">
                  {metric.sub}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
