import { Info } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { C2, C3, C5, C7 } from './ai-performances-data'
import { FilterPill } from './SectionHeader'
import { Card } from '@/components/flora/Card'
import { useChartMotion } from '@/lib/chart-motion'

type TrendSeries = {
  key: string
  label?: string
  color: string
}

type TrendCard = {
  title: string
  info?: boolean
  unit: 'count' | 'percent' | 'rating'
  series: TrendSeries[]
  data: Array<Record<string, string | number>>
}

const BUCKETS = ['May 2', 'May 11', 'May 18', 'May 25']

function rows(values: number[][]): Array<Record<string, string | number>> {
  return BUCKETS.map((bucket, index) => {
    const row: Record<string, string | number> = { bucket }
    values.forEach((series, seriesIndex) => {
      row[`value${seriesIndex}`] = series[index]
    })
    return row
  })
}

const TREND_CARDS: TrendCard[] = [
  {
    title: 'Conversations',
    unit: 'count',
    series: [
      { key: 'value0', label: 'Resolutions', color: C7 },
      { key: 'value1', label: 'Non-resolutions', color: C2 },
    ],
    data: rows([
      [2400, 2200, 1600, 2100],
      [500, 700, 500, 450],
    ]),
  },
  {
    title: 'Resolution rate',
    unit: 'percent',
    series: [
      { key: 'value0', label: 'Verified', color: '#285d55' },
      { key: 'value1', label: 'Contained', color: '#72a69d' },
    ],
    data: rows([
      [18, 22, 16, 21],
      [8, 8, 7, 6],
    ]),
  },
  {
    title: 'Knowledge article surfaced',
    info: true,
    unit: 'count',
    series: [{ key: 'value0', color: C5 }],
    data: rows([[480, 580, 320, 430]]),
  },
  {
    title: 'Avg. CSAT',
    info: true,
    unit: 'rating',
    series: [{ key: 'value0', color: C5 }],
    data: rows([[3.5, 4, 2.7, 3.3]]),
  },
  {
    title: 'Positive sentiment',
    info: true,
    unit: 'percent',
    series: [{ key: 'value0', color: C5 }],
    data: rows([[68, 78, 52, 64]]),
  },
  {
    title: 'Quick feedback',
    info: true,
    unit: 'count',
    series: [
      { key: 'value0', label: 'Positive', color: '#4f8178' },
      { key: 'value1', label: 'Negative', color: C2 },
    ],
    data: rows([
      [1900, 1650, 1550, 2150],
      [700, 650, 650, 450],
    ]),
  },
  {
    title: 'Relevance',
    info: true,
    unit: 'count',
    series: [
      { key: 'value0', label: 'Relevant', color: C3 },
      { key: 'value1', label: 'Somewhat relevant', color: '#7ba5ea' },
      { key: 'value2', label: 'Irrelevant', color: C2 },
    ],
    data: rows([
      [2100, 1700, 1600, 2200],
      [600, 700, 700, 450],
      [250, 180, 220, 180],
    ]),
  },
  {
    title: 'User engagement',
    info: true,
    unit: 'count',
    series: [
      { key: 'value0', label: 'Yes', color: C3 },
      { key: 'value1', label: 'No', color: C2 },
    ],
    data: rows([
      [2050, 1550, 1450, 2100],
      [350, 200, 250, 250],
    ]),
  },
]

function formatTick(unit: TrendCard['unit'], value: number) {
  if (unit === 'percent') return `${value}%`
  if (unit === 'rating') return value.toFixed(0)
  return value >= 1000 ? `${Math.round(value / 1000)}K` : String(value)
}

function Legend({ series }: { series: TrendSeries[] }) {
  if (!series.some((item) => item.label)) return null
  return (
    <div className="mb-2 flex min-h-4 flex-wrap gap-x-3 gap-y-1 text-[10px] text-ink-muted">
      {series.map((item) => (
        <span key={item.key} className="flex items-center gap-1">
          <span className="size-2 rounded-[2px]" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function TrendCardView({ chart }: { chart: TrendCard }) {
  const motion = useChartMotion()
  return (
    <Card className="min-w-0 p-4">
      <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-ink">
        {chart.title}
        {chart.info ? <Info className="size-3.5 text-ink-muted" /> : null}
      </h3>
      <Legend series={chart.series} />
      <div className="h-[160px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={chart.data} barSize={18} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#ececef" />
            <XAxis
              dataKey="bucket"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#8b8e89' }}
            />
            <YAxis
              width={34}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#8b8e89' }}
              tickFormatter={(value) => formatTick(chart.unit, value as number)}
            />
            {chart.series.map((series, index) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                stackId={chart.series.length > 1 ? 'total' : undefined}
                fill={series.color}
                radius={index === chart.series.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                {...motion}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function ConversationTrends() {
  return (
    <section data-testid="conversation-trends" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-[18px] font-medium text-ink">Conversation trends</h2>
        <FilterPill label="Weekly" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TREND_CARDS.map((chart) => (
          <TrendCardView key={chart.title} chart={chart} />
        ))}
      </div>
    </section>
  )
}
