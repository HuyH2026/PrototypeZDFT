// src/features/insights/cx-journey/TrendsSection.tsx
import { type Granularity, TREND_CHARTS } from './cx-journey-data'
import { FilterRow } from './FilterRow'
import { TrendChartCard } from './TrendChartCard'

const OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
]

function GranularityToggle({
  value,
  onChange,
}: {
  value: Granularity
  onChange: (g: Granularity) => void
}) {
  return (
    <div className="flex rounded-lg border border-surface-border bg-white p-0.5" role="tablist">
      {OPTIONS.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={
              active
                ? 'rounded-md bg-app-backdrop px-3 py-1 text-[13px] font-medium text-ink'
                : 'rounded-md px-3 py-1 text-[13px] text-ink-muted'
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function TrendsSection({
  granularity,
  onGranularityChange,
}: {
  granularity: Granularity
  onGranularityChange: (g: Granularity) => void
}) {
  return (
    <section className="flex flex-col gap-4">
      <FilterRow title="Trends (AI + Human)">
        <GranularityToggle value={granularity} onChange={onGranularityChange} />
      </FilterRow>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TREND_CHARTS.map((chart) => (
          <TrendChartCard key={chart.key} chart={chart} granularity={granularity} />
        ))}
      </div>
    </section>
  )
}
