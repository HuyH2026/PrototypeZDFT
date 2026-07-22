// "Conversation comparison" — a multi-series line chart with three stacked
// left axes (Conversation / Resolution rate / CSAT) and an optional dotted
// "previous period" overlay per series. Channel and granularity controls are
// static; the "Show comparison" checkbox is interactive.
import { useState } from 'react'
import { BarChart2, ChevronDown, LineChart as LineIcon } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { COMPARE_CHANNELS, COMPARE_SERIES, COMPARE_X } from './ai-performances-data'
import { DatePill } from './SectionHeader'

// The three left axes have different scales (Conversation 0–400, Rate 0–100,
// CSAT 0–5) but share one plot area, so each series is projected onto a common
// 0–400 domain before plotting. Ticks in AxisColumn label the real per-axis
// values.
const AXIS_SCALE: Record<string, number> = { conv: 1, rate: 4, csat: 80 }

// recharts wants one row per x-tick with a column per series; fold the
// per-series arrays into that shape (plus a `<key>__cmp` column for the dotted
// comparison line when present), projecting each value onto the shared domain.
function buildRows() {
  return COMPARE_X.map((x, i) => {
    const row: Record<string, number | string> = { x }
    for (const s of COMPARE_SERIES) {
      const k = AXIS_SCALE[s.axis]
      row[s.key] = s.data[i] * k
      if (s.compare) row[`${s.key}__cmp`] = s.compare[i] * k
    }
    return row
  })
}

function AxisColumn({ label, ticks }: { label: string; ticks: string[] }) {
  return (
    <div className="flex items-stretch gap-1">
      <span className="text-[10px] text-ink-muted [writing-mode:vertical-rl] [transform:rotate(180deg)]">
        {label}
      </span>
      <div className="flex flex-col justify-between py-1 text-right text-[10px] text-ink-muted">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  )
}

export function ConversationComparison() {
  const [showComparison, setShowComparison] = useState(true)
  const [channel, setChannel] = useState('Widget')
  const rows = buildRows()

  return (
    <div className="rounded-2xl border border-surface-border bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <h3 className="text-[15px] font-medium text-ink">{channel}</h3>
        <label className="flex items-center gap-2 text-[13px] text-ink">
          <input
            type="checkbox"
            checked={showComparison}
            onChange={(e) => setShowComparison(e.target.checked)}
            className="h-4 w-4 accent-[#01567A]"
          />
          Show comparison
        </label>
        <span className="text-[13px] text-ink-muted">Compare to Apr 2, 2025 – May 1, 2025</span>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" aria-label="Bar view" className="rounded-md border border-surface-border p-1.5 text-ink-muted">
            <BarChart2 className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Line view" className="rounded-md border border-surface-border bg-app-backdrop p-1.5 text-ink">
            <LineIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-surface-border px-3 py-1.5 text-[13px] text-ink"
          >
            Weekly <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
        {COMPARE_SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
            <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <div className="flex">
        <div className="flex gap-1 pr-2">
          <AxisColumn label="Conversation" ticks={['400', '320', '240', '160', '80', '0']} />
          <AxisColumn label="Resolution rate" ticks={['100', '80', '60', '40', '20', '0']} />
          <AxisColumn label="CSAT" ticks={['5', '4', '3', '2', '1', '0']} />
        </div>
        <div className="h-[260px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#ececef" />
              <XAxis dataKey="x" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8b8e89' }} />
              {/* Hidden domain axis; visible ticks are the AxisColumn labels. */}
              <YAxis hide domain={[0, 400]} />
              {COMPARE_SERIES.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
              {showComparison &&
                COMPARE_SERIES.filter((s) => s.compare).map((s) => (
                  <Line
                    key={`${s.key}__cmp`}
                    type="monotone"
                    dataKey={`${s.key}__cmp`}
                    stroke={s.color}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <DatePill />
        <div className="flex items-center gap-5 text-[13px]">
          {COMPARE_CHANNELS.map((c) => {
            const active = c === channel
            return (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={active ? 'font-medium text-ink' : 'text-ink-muted'}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
