// src/features/insights/cx-journey/TrendChartCard.tsx
import { Info } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { BLUE, RED, type ChartUnit, type Granularity, type TrendChart } from './cx-journey-data'

function formatTick(unit: ChartUnit, v: number): string {
  switch (unit) {
    case 'percent':
      return `${v}%`
    case 'currency':
      return v >= 1e6 ? `$${v / 1e6}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}k` : `$${v}`
    case 'minutes':
      return `${v}min`
    case 'hours':
      return `${v}hr`
    case 'count':
      return v >= 1e6 ? `${v / 1e6}M` : v >= 1e3 ? `${Math.round(v / 1e3)}K` : `${v}`
  }
}

export function TrendChartCard({ chart, granularity }: { chart: TrendChart; granularity: Granularity }) {
  const data = chart.data[granularity]
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <p className="text-[13px] font-semibold text-ink">{chart.title}</p>
        {chart.hasInfo ? <Info className="h-3.5 w-3.5 text-ink-muted" /> : null}
      </div>
      {chart.stacked ? (
        <div className="mb-2 flex items-center gap-4 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: BLUE }} /> Eligible
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: RED }} /> Not eligible
          </span>
        </div>
      ) : null}
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }} barSize={18}>
            <CartesianGrid vertical={false} stroke="#ececef" />
            <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8b8e89' }} />
            <YAxis
              width={44}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#8b8e89' }}
              tickFormatter={(v) => formatTick(chart.unit, v as number)}
            />
            <Bar dataKey="value" stackId="a" fill={BLUE} radius={chart.stacked ? [0, 0, 0, 0] : [3, 3, 0, 0]} />
            {chart.stacked ? <Bar dataKey="value2" stackId="a" fill={RED} radius={[3, 3, 0, 0]} /> : null}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
