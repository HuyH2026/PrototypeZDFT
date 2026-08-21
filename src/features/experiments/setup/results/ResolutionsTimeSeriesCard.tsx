// The "Resolutions time series chart" card: a tab strip (Conversations /
// Resolutions / Sentiment / CSAT / Duration / AI QA — only "Resolutions" is
// wired), a line/bar toggle, a weekly-range filter (inert), and a 3-series
// comparison chart with a tooltip on hover. Frontend-only.
import { useState } from 'react'
import { BarChart3, ChevronDown, LineChart as LineChartIcon } from 'lucide-react'
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BAR_COLORS, RESOLUTIONS_TABS, type ResolutionsPoint } from './results-data'
import { Card } from '@/components/flora/Card'
import { cn } from '@/lib/cn'

const SERIES = ['Control', 'Variant A', 'Variant B'] as const

const RANGE_BY_BUCKET: Record<string, string> = {
  '10/3': 'Oct 3, 2025 - Oct 10, 2025',
  '10/10': 'Oct 10, 2025 - Oct 17, 2025',
  '10/17': 'Oct 17, 2025 - Oct 24, 2025',
  '10/24': 'Oct 24, 2025 - Nov 1, 2025',
  '11/1': 'Nov 1, 2025 - Nov 8, 2025',
}

function changeFromControl(value: number, control: number) {
  if (control === 0) return null
  const change = ((value - control) / control) * 100
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
}

function ResolutionTooltip({ point }: { point: ResolutionsPoint }) {
  const control = point.Control
  return (
    <div
      role="status"
      aria-label={`Resolution rates for ${RANGE_BY_BUCKET[point.bucket] ?? point.bucket}`}
      className="min-w-[190px] rounded-xl border border-surface-border bg-white px-3 py-2 shadow-menu"
    >
      <p className="text-[11px] text-ink-muted">
        {RANGE_BY_BUCKET[point.bucket] ?? point.bucket}
      </p>
      <div className="mt-1.5 space-y-1.5">
        {SERIES.map((name) => {
          const value = point[name]
          const change = name === 'Control' ? null : changeFromControl(value, control)
          const improved = value >= control
          return (
            <div key={name}>
              <p className="flex items-center justify-between gap-5 text-[12px] text-ink">
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="inline-block size-2.5 rounded-full"
                    style={{ background: BAR_COLORS[name] }}
                  />
                  {name}
                </span>
                <strong className="font-semibold">{value}%</strong>
              </p>
              {change ? (
                <p
                  className="mt-0.5 flex items-center justify-between gap-5 pl-4 text-[11px] text-ink-muted"
                >
                  <span>vs Control</span>
                  <span style={{ color: improved ? '#048c80' : '#c9462c' }}>{change}</span>
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ResolutionsTimeSeriesCard({ series }: { series: ResolutionsPoint[] }) {
  const [tab, setTab] = useState<(typeof RESOLUTIONS_TABS)[number]>('Resolutions')
  const [mode, setMode] = useState<'line' | 'bar'>('line')

  return (
    <Card flat className="p-5">
      <div className="flex items-center gap-3">
        <p className="flex-1 text-[13px] font-semibold text-ink">Resolutions time series chart</p>

        <div role="tablist" className="flex items-center rounded-full bg-[#fbfbfb] p-0.5">
          {RESOLUTIONS_TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === tab}
              onClick={() => setTab(t)}
              className={
                'rounded-full px-3.5 py-1.5 text-[11px] ' +
                (t === tab ? 'bg-white font-medium text-ink shadow-sm' : 'text-ink-muted')
              }
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex rounded-full border border-surface-border p-0.5">
          {(
            [
              ['bar', 'Bar view', BarChart3],
              ['line', 'Line view', LineChartIcon],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              aria-label={label}
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={cn(
                'rounded-full p-1.5 transition-colors duration-instant ease-soft',
                mode === value
                  ? 'bg-app-backdrop text-ink'
                  : 'text-ink-muted hover:bg-control-hover',
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </button>
          ))}
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-surface-border px-3 py-1.5 text-[12px] text-ink"
        >
          Weekly
          <ChevronDown size={14} className="text-ink-muted" aria-hidden />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4 text-[11px] text-ink">
        {SERIES.map((name) => (
          <span key={name} className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full" style={{ background: BAR_COLORS[name] }} />
            {name}
          </span>
        ))}
      </div>

      <div data-testid="resolutions-time-series-chart" className="mt-2 h-[260px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ComposedChart
            key={mode}
            accessibilityLayer
            data={series}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            barGap={2}
            barCategoryGap="34%"
          >
            <defs>
              <linearGradient id="resolution-variant-b-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BAR_COLORS['Variant B']} stopOpacity={0.16} />
                <stop offset="100%" stopColor={BAR_COLORS['Variant B']} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#ececef" />
            <XAxis
              dataKey="bucket"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#8b8e89' }}
              padding={mode === 'line' ? { left: 16, right: 16 } : { left: 0, right: 0 }}
            />
            <YAxis
              width={44}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#8b8e89' }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              cursor={{ stroke: '#dcdcd8', strokeWidth: 1 }}
              isAnimationActive={false}
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as ResolutionsPoint | undefined
                return active && point ? <ResolutionTooltip point={point} /> : null
              }}
            />
            {mode === 'line' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="Variant B"
                  stroke={BAR_COLORS['Variant B']}
                  strokeWidth={2}
                  fill="url(#resolution-variant-b-fill)"
                  dot={{ r: 3, fill: BAR_COLORS['Variant B'], strokeWidth: 0 }}
                  activeDot={{
                    r: 5,
                    fill: BAR_COLORS['Variant B'],
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="Control"
                  stroke={BAR_COLORS.Control}
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="Variant A"
                  stroke={BAR_COLORS['Variant A']}
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              </>
            ) : (
              SERIES.map((name) => (
                <Bar
                  key={name}
                  dataKey={name}
                  fill={BAR_COLORS[name]}
                  fillOpacity={name === 'Variant B' ? 1 : 0.68}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                  isAnimationActive={false}
                />
              ))
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
