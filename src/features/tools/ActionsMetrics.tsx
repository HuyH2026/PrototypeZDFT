import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/cn'

// Actions, not Knowledge: these four read "Active content snippets" / "Times
// applied" in the frame this was built from, which are the Knowledge strip's
// captions. A catalogue of API calls is not measured in content snippets, so the
// first two name what the Actions screen actually holds. 23 active against the
// table's 113 total is consistent — only some rows are Live.
const METRICS = [
  { label: 'Active actions', value: '23' },
  { label: 'Times invoked', value: '8,000', trend: '12%', direction: 'up' as const },
  { label: 'Conversations', value: '2,500', trend: '6%', direction: 'down' as const },
  { label: 'Resolutions', value: '2,000', suffix: '85%', trend: '2.1%', direction: 'up' as const },
]

const PILL = 'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold'

export function ActionsMetrics() {
  return (
    <section aria-label="Action performance" className="grid grid-cols-4 gap-3">
      {METRICS.map((metric) => {
        const rising = metric.direction === 'up'
        return (
          <article
            key={metric.label}
            className="min-h-[98px] rounded-[20px] border border-surface-border bg-white px-5 py-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] font-semibold text-ink">{metric.label}</span>
              {/* Rendered even without a trend, just hidden: the pill is what sets
                  this row's height, so omitting it entirely pulled the trendless
                  card's value 7px above the three beside it. `invisible` keeps the
                  box and the baselines line up across the strip. */}
              <span
                aria-hidden={!metric.trend}
                className={cn(PILL, !metric.trend && 'invisible')}
                style={
                  metric.trend
                    ? {
                        backgroundColor: rising ? '#edf8f5' : '#fff2f1',
                        color: rising ? '#24786f' : '#b8544f',
                      }
                    : undefined
                }
              >
                {metric.trend ?? '0%'}
                {rising ? (
                  <TrendingUp size={13} aria-hidden />
                ) : (
                  <TrendingDown size={13} aria-hidden />
                )}
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <strong className="text-[22px] font-semibold leading-none text-ink">
                {metric.value}
              </strong>
              {metric.suffix ? (
                <span className="text-[14px] text-ink-muted">{metric.suffix}</span>
              ) : null}
            </div>
          </article>
        )
      })}
    </section>
  )
}
