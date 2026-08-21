import { useEffect, useRef, useState } from 'react'
import { BarChart2, ChevronDown, Info, LineChart as LineIcon } from 'lucide-react'
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  channelSeries,
  COMPARE_SERIES,
  COMPARE_X,
  NEG,
  POS,
  type CompareSeries,
} from './ai-performances-data'
import { Card } from '@/components/flora/Card'
import { cn } from '@/lib/cn'
import { PIE_CHART_INNER_RADIUS_RATIO } from '@/lib/pie-chart'

const CHANNELS = ['Widget', 'Email', 'Voice', 'Headless']
const CURRENT_PATTERN = '#697075'
const PREVIOUS_PATTERN = '#b8bdc1'
const PREVIOUS_LINE = '#b7b7b3'
const CURRENT_PERIOD = 'May 2 – Jun 1, 2025'
const PREVIOUS_PERIOD = 'Apr 2 – May 1, 2025'
const DEFAULT_METRIC_KEY = COMPARE_SERIES[0].key

type Axis = CompareSeries['axis']

const FORMAT: Record<Axis, (value: number) => string> = {
  conv: (value) => Math.round(value).toLocaleString(),
  rate: (value) => `${Math.round(value)}%`,
  csat: (value) => value.toFixed(1),
}

const DOMAIN: Record<Axis, [number, number | 'auto']> = {
  conv: [0, 'auto'],
  rate: [0, 100],
  csat: [0, 5],
}

type BreakdownRow = {
  label: string
  current: number
  previous: number
}

type BreakdownCard = {
  title: string
  centerValue: string
  centerLabel: string
  delta: string
  slices: Array<{ name: string; value: number; color: string }>
  rows: BreakdownRow[]
  total?: { label: string; value: string; delta?: string }
}

const BREAKDOWN_CARDS: BreakdownCard[] = [
  {
    title: 'Resolutions',
    centerValue: '65%',
    centerLabel: 'verified',
    delta: '-7%',
    slices: [
      { name: 'Verified', value: 65, color: '#285d55' },
      { name: 'Contained', value: 35, color: '#72a69d' },
    ],
    rows: [
      { label: 'Verified', current: 424, previous: 386 },
      { label: 'Contained', current: 554, previous: 222 },
    ],
  },
  {
    title: 'CSAT',
    centerValue: '3.5',
    centerLabel: 'avg. CSAT',
    delta: '-7%',
    slices: [
      { name: 'Rated', value: 70, color: '#2e5361' },
      { name: 'Remaining', value: 30, color: '#77b6d0' },
    ],
    total: { label: 'Total responses', value: '2,928', delta: '-12.4%' },
    rows: [
      { label: '5–Excellent', current: 424, previous: 222 },
      { label: '4–Good', current: 554, previous: 222 },
      { label: '3–Okay', current: 654, previous: 328 },
      { label: '2–Bad', current: 277, previous: 419 },
      { label: '1–Terrible', current: 155, previous: 222 },
    ],
  },
  {
    title: 'Relevance',
    centerValue: '75%',
    centerLabel: 'relevant',
    delta: '-7%',
    slices: [
      { name: 'Relevant', value: 75, color: '#426bc1' },
      { name: 'Somewhat relevant', value: 18, color: '#7ba5ea' },
      { name: 'Irrelevant', value: 7, color: '#d65c2e' },
    ],
    rows: [
      { label: 'Relevant', current: 424, previous: 386 },
      { label: 'Somewhat relevant', current: 554, previous: 222 },
      { label: 'Irrelevant', current: 36, previous: 89 },
    ],
  },
  {
    title: 'Quick feedback',
    centerValue: '39%',
    centerLabel: 'positive',
    delta: '-7%',
    slices: [
      { name: 'Positive', value: 39, color: '#4f8178' },
      { name: 'Negative', value: 61, color: '#c74b1f' },
    ],
    total: { label: 'Total responses', value: '128', delta: '-12.4%' },
    rows: [
      { label: 'Not answered', current: 1128, previous: 0 },
      { label: 'Positive', current: 28, previous: 66 },
      { label: 'Negative', current: 100, previous: 89 },
    ],
  },
  {
    title: 'Engagement',
    centerValue: '75%',
    centerLabel: 'engaged',
    delta: '-7%',
    slices: [
      { name: 'Engaged', value: 75, color: '#426bc1' },
      { name: 'Disengaged', value: 25, color: '#d65c2e' },
    ],
    rows: [
      { label: 'Engaged', current: 424, previous: 222 },
      { label: 'Disengaged', current: 554, previous: 222 },
    ],
  },
]

function useMeasured() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, size }
}

function DonutSummary({ card }: { card: BreakdownCard }) {
  const { ref, size } = useMeasured()
  const outer = Math.max(0, Math.min(size.width, size.height) / 2 - 4)
  return (
    <div ref={ref} className="relative h-[150px] min-w-[150px] flex-1">
      {outer > 0 ? (
        <PieChart width={size.width} height={size.height}>
          <Pie
            data={card.slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={outer * PIE_CHART_INNER_RADIUS_RATIO}
            outerRadius={outer}
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {card.slices.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
        </PieChart>
      ) : null}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-semibold leading-none text-ink">{card.centerValue}</span>
        <span className="mt-1 text-[12px] text-ink-muted">{card.centerLabel}</span>
        <span className="mt-1 text-[11px]" style={{ color: NEG }}>
          {card.delta}
        </span>
      </div>
    </div>
  )
}

function ComparisonBars({ card }: { card: BreakdownCard }) {
  const max = Math.max(...card.rows.flatMap((row) => [row.current, row.previous]), 1)
  return (
    <div className="min-w-[220px] flex-[1.4]">
      {card.total ? (
        <div className="mb-3 flex items-baseline gap-2 text-[12px] text-ink">
          <span>{card.total.label}</span>
          <strong className="font-semibold">{card.total.value}</strong>
          {card.total.delta ? <span style={{ color: NEG }}>{card.total.delta}</span> : null}
        </div>
      ) : null}
      <div className="space-y-3">
        {card.rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[92px_1fr] items-center gap-2 text-[11px]">
            <span className="leading-tight text-ink">{row.label}</span>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2.5 rounded-r-sm"
                  style={{
                    width: `${Math.max(3, (row.current / max) * 100)}%`,
                    background: card.slices[0].color,
                  }}
                />
                <span className="text-ink-muted">{row.current.toLocaleString()}</span>
              </div>
              {row.previous > 0 ? (
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 rounded-r-sm"
                    style={{
                      width: `${Math.max(3, (row.previous / max) * 100)}%`,
                      background: `repeating-linear-gradient(135deg, ${card.slices[0].color} 0 1px, transparent 1px 4px)`,
                    }}
                  />
                  <span className="text-ink-muted">{row.previous.toLocaleString()}</span>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Grid rows stretch every card to the tallest in the row, and the cards carry
// wildly different row counts (Resolutions has two, CSAT five). So the body
// takes the slack and centres its donut, and the legend is pinned to the bottom
// edge — that way each pair's legends land on the same line instead of one card
// trailing a block of white space.
function BreakdownCardView({ card }: { card: BreakdownCard }) {
  return (
    <Card className="flex min-w-0 flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-1.5 text-[14px] font-medium text-ink">
          {card.title} <Info className="size-3.5 text-ink-muted" />
        </h3>
        <span className="text-[10px] text-ink-muted">May 2, 2026 – Jun 1, 2026</span>
      </div>
      <div className="mt-4 flex min-w-0 flex-1 flex-wrap items-center gap-5">
        <DonutSummary card={card} />
        <ComparisonBars card={card} />
      </div>
      <div className="mt-4 flex gap-4 border-t border-surface-border pt-3 text-[10px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[2px]" style={{ background: CURRENT_PATTERN }} />
          Current period
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-[2px]"
            style={{
              background: `repeating-linear-gradient(135deg, ${PREVIOUS_PATTERN} 0 1px, transparent 1px 3px)`,
            }}
          />
          Previous period
        </span>
      </div>
    </Card>
  )
}

function project(series: CompareSeries, value: number) {
  if (series.axis === 'conv') return value
  if (series.axis === 'csat') return value * 80
  return value * 4
}

function summarize(series: CompareSeries, values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0)
  return series.axis === 'conv' ? total : total / values.length
}

function changeLabel(axis: Axis, from: number, to: number) {
  const sign = to >= from ? '+' : '−'
  if (axis === 'conv') {
    const percent = from === 0 ? 0 : ((to - from) / from) * 100
    return `${sign}${Math.abs(percent).toFixed(1)}%`
  }
  const difference = Math.abs(to - from)
  return axis === 'csat'
    ? `${sign}${difference.toFixed(1)}`
    : `${sign}${Math.round(difference)} pts`
}

function DeltaChip({ axis, from, to }: { axis: Axis; from: number; to: number }) {
  const improved = to >= from
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[12px] font-medium"
      style={{ color: improved ? POS : NEG, background: improved ? '#e9f4ec' : '#fbeeec' }}
    >
      {changeLabel(axis, from, to)}
    </span>
  )
}

function LegendSwatch({ color, dashed }: { color: string; dashed?: boolean }) {
  return dashed ? (
    <span aria-hidden className="flex h-2.5 w-4 items-center">
      <span className="h-0 w-full border-t-2 border-dashed" style={{ borderColor: color }} />
    </span>
  ) : (
    <span
      aria-hidden
      className="inline-block size-2.5 rounded-full"
      style={{ background: color }}
    />
  )
}

function CompareTooltip({
  bucket,
  metrics,
  showComparison,
}: {
  bucket: string
  metrics: CompareSeries[]
  showComparison: boolean
}) {
  const index = COMPARE_X.indexOf(bucket)
  if (index < 0) return null
  return (
    <div className="min-w-[180px] rounded-xl border border-surface-border bg-white px-3 py-2 shadow-menu">
      <p className="text-[11px] text-ink-muted">{bucket}</p>
      <div className="mt-1.5 space-y-1.5">
        {metrics.map((metric) => {
          const format = FORMAT[metric.axis]
          return (
            <div key={metric.key}>
              <p className="flex items-center justify-between gap-4 text-[12px] text-ink">
                <span className="flex items-center gap-1.5">
                  <LegendSwatch color={metric.color} />
                  {metric.label}
                </span>
                <strong className="font-semibold">{format(metric.data[index])}</strong>
              </p>
              {showComparison ? (
                <p className="mt-0.5 flex items-center justify-between gap-4 pl-4 text-[11px] text-ink-muted">
                  <span>Previous</span>
                  <span>{format(metric.compare[index])}</span>
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ConversationComparison() {
  const [channel, setChannel] = useState('Widget')
  const [showComparison, setShowComparison] = useState(true)
  const [mode, setMode] = useState<'line' | 'bar'>('line')
  const [selectedMetricKeys, setSelectedMetricKeys] = useState<string[]>([DEFAULT_METRIC_KEY])
  const [primaryMetricKey, setPrimaryMetricKey] = useState(DEFAULT_METRIC_KEY)
  const selectedSeries = COMPARE_SERIES.filter((series) =>
    selectedMetricKeys.includes(series.key),
  ).map((series) => channelSeries(series, channel))
  const focusedMetric = selectedSeries.length === 1 ? selectedSeries[0] : null
  const primaryMetric =
    selectedSeries.find((series) => series.key === primaryMetricKey) ?? selectedSeries[0]
  const data = COMPARE_X.map((bucket, index) => {
    const point: Record<string, string | number> = { bucket }
    selectedSeries.forEach((series) => {
      point[series.key] = focusedMetric ? series.data[index] : project(series, series.data[index])
      point[`${series.key}-previous`] = focusedMetric
        ? series.compare[index]
        : project(series, series.compare[index])
    })
    return point
  })
  const toggleMetric = (key: string) => {
    if (selectedMetricKeys.includes(key)) {
      if (selectedMetricKeys.length === 1) return
      const remaining = selectedMetricKeys.filter((item) => item !== key)
      setSelectedMetricKeys(remaining)
      if (primaryMetricKey === key) setPrimaryMetricKey(remaining[remaining.length - 1])
      return
    }
    const next = new Set([...selectedMetricKeys, key])
    setSelectedMetricKeys(
      COMPARE_SERIES.filter((series) => next.has(series.key)).map((series) => series.key),
    )
    setPrimaryMetricKey(key)
  }
  const currentSummary = focusedMetric ? summarize(focusedMetric, focusedMetric.data) : null
  const previousSummary = focusedMetric ? summarize(focusedMetric, focusedMetric.compare) : null

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-[18px] font-medium text-ink">Conversation comparison</h2>
        <div role="group" aria-label="Channel" className="flex rounded-full bg-app-backdrop p-0.5">
          {CHANNELS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={channel === item}
              onClick={() => setChannel(item)}
              className={cn(
                'rounded-full px-4 py-1.5 text-[12px] transition-colors duration-instant ease-soft',
                channel === item
                  ? 'bg-white font-medium text-ink shadow-xs-flora'
                  : 'text-ink-muted',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h3 className="text-[15px] font-medium text-ink">
            {primaryMetric.label}
            {selectedSeries.length > 1 ? ` +${selectedSeries.length - 1}` : ''}{' '}
            <span className="ml-1 text-[13px] font-normal text-ink-muted">· {channel}</span>
          </h3>
          <div className="ml-auto flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
            <span>Compare to {PREVIOUS_PERIOD}</span>
            {/* `label`/`button` carry a 16px/500 default from the base layer, which beats an
                inherited size — so every control here states its own text-[11px]. */}
            <label className="flex items-center gap-1.5 text-[11px] font-normal text-ink">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(event) => setShowComparison(event.target.checked)}
                className="size-3.5 accent-[#01567A]"
              />
              Show comparison
            </label>
            <div className="flex rounded-full border border-surface-border p-0.5">
              {(
                [
                  ['bar', 'Bar view', BarChart2],
                  ['line', 'Line view', LineIcon],
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
                  <Icon className="size-3.5" />
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full border border-surface-border px-2.5 py-1.5 text-[11px] font-medium text-ink"
            >
              Weekly <ChevronDown className="size-3.5" />
            </button>
          </div>
        </div>

        <div
          role="group"
          aria-label="Metric visibility"
          className="mt-4 rounded-xl border border-surface-border bg-app-backdrop/55 p-3"
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
              Metrics
            </span>
            <div className="ml-auto flex items-center gap-3 text-[11px]">
              <button
                type="button"
                aria-label="Select all metrics"
                onClick={() => setSelectedMetricKeys(COMPARE_SERIES.map((series) => series.key))}
                className="text-[11px] font-medium text-accent-blue hover:underline"
              >
                Select all
              </button>
              <button
                type="button"
                aria-label="Clear metrics"
                onClick={() => {
                  setSelectedMetricKeys([DEFAULT_METRIC_KEY])
                  setPrimaryMetricKey(DEFAULT_METRIC_KEY)
                }}
                className="text-[11px] font-medium text-ink-muted hover:text-ink"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMPARE_SERIES.map((series) => {
              const selected = selectedMetricKeys.includes(series.key)
              const primary = series.key === primaryMetric.key
              return (
                <label
                  key={series.key}
                  data-primary={primary ? 'true' : undefined}
                  className={cn(
                    'flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors duration-instant ease-soft',
                    primary
                      ? 'border-[#01567A]/25 bg-white font-medium text-ink shadow-xs-flora ring-1 ring-[#01567A]/10'
                      : selected
                        ? 'border-transparent bg-white font-medium text-ink shadow-xs-flora'
                        : 'border-surface-border bg-transparent text-ink-muted hover:bg-white',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleMetric(series.key)}
                    className="sr-only"
                  />
                  <LegendSwatch color={selected ? series.color : PREVIOUS_LINE} />
                  {series.label}
                </label>
              )
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          {focusedMetric && currentSummary !== null && previousSummary !== null ? (
            <div>
              <p className="flex items-baseline gap-2">
                <span className="text-[28px] font-semibold leading-none text-ink">
                  {FORMAT[focusedMetric.axis](currentSummary)}
                </span>
                {showComparison ? (
                  <DeltaChip axis={focusedMetric.axis} from={previousSummary} to={currentSummary} />
                ) : null}
              </p>
              <p className="mt-1.5 text-[12px] text-ink-muted">
                {focusedMetric.axis === 'conv' ? 'Total' : 'Average'} for {CURRENT_PERIOD}
                {showComparison
                  ? ` · ${FORMAT[focusedMetric.axis](previousSummary)} in the previous period`
                  : ''}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[14px] font-medium text-ink">
                {selectedSeries.length} metrics selected
              </p>
              <p className="mt-1 text-[12px] text-ink-muted">
                Values are scaled for trend comparison. Hover for actual values.
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-ink-muted">
            <span className="flex items-center gap-1.5">
              <LegendSwatch color={primaryMetric.color ?? CURRENT_PATTERN} />
              {CURRENT_PERIOD}
            </span>
            {showComparison ? (
              <span className="flex items-center gap-1.5">
                <LegendSwatch color={PREVIOUS_LINE} dashed />
                {PREVIOUS_PERIOD}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 h-[260px] min-w-0" data-testid="comparison-chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <ComposedChart
              key={`${mode}-${selectedMetricKeys.join('-')}`}
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              barGap={2}
              barCategoryGap="34%"
            >
              <defs>
                {selectedSeries.map((series) => (
                  <linearGradient
                    key={series.key}
                    id={`compare-fill-${series.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={series.color} stopOpacity={0.16} />
                    <stop offset="100%" stopColor={series.color} stopOpacity={0.01} />
                  </linearGradient>
                ))}
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
                domain={focusedMetric ? DOMAIN[focusedMetric.axis] : [0, 400]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#8b8e89' }}
                tickFormatter={focusedMetric ? FORMAT[focusedMetric.axis] : undefined}
              />
              <Tooltip
                cursor={{ stroke: '#dcdcd8', strokeWidth: 1 }}
                content={({ active, label }) =>
                  active && typeof label === 'string' ? (
                    <CompareTooltip
                      bucket={label}
                      metrics={selectedSeries}
                      showComparison={showComparison}
                    />
                  ) : null
                }
              />
              {mode === 'line'
                ? selectedSeries.flatMap((series) => [
                    ...(showComparison
                      ? [
                          <Line
                            key={`${series.key}-previous`}
                            type="monotone"
                            dataKey={`${series.key}-previous`}
                            stroke={focusedMetric ? PREVIOUS_LINE : series.color}
                            strokeWidth={1.4}
                            strokeOpacity={focusedMetric ? 1 : 0.32}
                            strokeDasharray="4 4"
                            dot={false}
                            isAnimationActive={false}
                          />,
                        ]
                      : []),
                    series.key === primaryMetric.key ? (
                      <Area
                        key={series.key}
                        type="monotone"
                        dataKey={series.key}
                        stroke={series.color}
                        strokeWidth={2}
                        fill={`url(#compare-fill-${series.key})`}
                        dot={{ r: 3, fill: series.color, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: series.color, stroke: '#ffffff', strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                    ) : (
                      <Line
                        key={series.key}
                        type="monotone"
                        dataKey={series.key}
                        stroke={series.color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    ),
                  ])
                : selectedSeries.flatMap((series) => [
                    ...(showComparison
                      ? [
                          <Bar
                            key={`${series.key}-previous`}
                            dataKey={`${series.key}-previous`}
                            fill={focusedMetric ? PREVIOUS_LINE : series.color}
                            fillOpacity={0.45}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={22}
                            isAnimationActive={false}
                          />,
                        ]
                      : []),
                    <Bar
                      key={series.key}
                      dataKey={series.key}
                      fill={series.color}
                      fillOpacity={series.key === primaryMetric.key ? 1 : 0.68}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={22}
                      isAnimationActive={false}
                    />,
                  ])}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div data-testid="comparison-detail-cards" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {BREAKDOWN_CARDS.map((card) => (
          <BreakdownCardView key={card.title} card={card} />
        ))}
      </div>
    </section>
  )
}
