// Small area/line chart reused by the metric investigation workspace and the
// AI Studio conversation hand-off. Follows the TrendChartCard recharts
// pattern (ResponsiveContainer + themed axes). Presentational; series and
// color are supplied by the caller.
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useChartMotion } from '@/lib/chart-motion'

const DEFAULT_COLOR = '#2F69C7' // C3 blue, matching the mockup line

export function MetricChart({
  series,
  color = DEFAULT_COLOR,
}: {
  series: { x: string; value: number }[]
  color?: string
}) {
  const motion = useChartMotion()
  // Show only first / middle / last x ticks to match the "Jul 1 / Jul 14 / Jul 28"
  // sparseness in the design.
  const ends =
    series.length > 0 ? [series[0].x, series[Math.floor(series.length / 2)].x, series[series.length - 1].x] : []

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="metricChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#ececef" />
          <XAxis
            dataKey="x"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#8b8e89' }}
            ticks={ends}
            interval={0}
          />
          <YAxis
            width={32}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#8b8e89' }}
          />
          <Tooltip
            formatter={(value: number) => [value, 'Value']}
            labelFormatter={(x: string) => x}
            contentStyle={{ fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#metricChartFill)"
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
            {...motion}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
