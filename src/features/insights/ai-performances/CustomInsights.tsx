// "Custom insights" — a 2-column grid of user-defined report cards: a sales
// funnel (labeled bar chart) plus three category donuts. Charts render with
// recharts; all data is mocked.
import { useEffect, useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { Cell, Pie, PieChart } from 'recharts'
import { type Donut, DONUTS, FUNNEL, GREY, INK } from './ai-performances-data'

// Measure the container so the donut renders at a real size (recharts otherwise
// paints a zero-width sliver on first tick — the same reason the Sankey and the
// home Sparkline measure before rendering).
function useMeasured() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, size }
}

function CardShell({ title, info, children }: { title: string; info?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[15px] font-medium text-ink">
          {title}
          {info ? <span className="text-ink-muted">ⓘ</span> : null}
        </h3>
        <MoreVertical className="h-4 w-4 text-ink-muted" />
      </div>
      {children}
    </div>
  )
}

// Funnel: teal bars whose height encodes the stage's share of the top stage,
// each capped by a floating "pct / count" label chip. A faint full-height track
// sits behind each bar (matching the design's ghosted columns).
function SalesFunnel() {
  return (
    <div className="flex h-[240px] items-end gap-4">
      <div className="flex h-full flex-col justify-between py-2 text-[11px] text-ink-muted">
        <span>100%</span>
        <span>50%</span>
        <span>0%</span>
      </div>
      <div className="grid flex-1 grid-cols-5 gap-4">
        {FUNNEL.map((stage) => (
          <div key={stage.label} className="flex h-full flex-col">
            <div className="relative flex flex-1 items-end">
              {/* ghosted track */}
              <div className="absolute inset-x-0 bottom-0 top-0 rounded-t-md bg-[#e4f4f7]" />
              {/* filled bar */}
              <div className="relative w-full rounded-t-md bg-[#0f9bb0]" style={{ height: `${stage.value}%` }}>
                <div className="absolute -top-11 left-1/2 w-max -translate-x-1/2 rounded-md border border-surface-border bg-white px-2 py-1 text-center shadow-sm">
                  <div className="text-[12px] font-semibold text-ink">{stage.pct}</div>
                  <div className="text-[11px] text-ink-muted">{stage.count}</div>
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] leading-tight text-ink-muted">{stage.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DonutCard({ donut }: { donut: Donut }) {
  const { ref, size } = useMeasured()
  const outer = Math.min(size.width, size.height) / 2 - 6
  return (
    <div ref={ref} className="relative h-[240px] w-full">
      {size.width > 0 && size.height > 0 && (
        <PieChart width={size.width} height={size.height}>
          <Pie
            data={donut.slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={outer * 0.68}
            outerRadius={outer}
            paddingAngle={1}
            stroke="none"
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          >
            {donut.slices.map((s) => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
        </PieChart>
      )}
      {/* Center total, overlaid (recharts labels can't easily stack). */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-semibold" style={{ color: INK }}>
          {donut.centerValue}
        </span>
        <span className="text-[13px]" style={{ color: GREY }}>
          {donut.centerLabel}
        </span>
      </div>
    </div>
  )
}

function DonutLegend({ donut }: { donut: Donut }) {
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
      {donut.slices.map((s) => (
        <span key={s.name} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
          {s.name}
        </span>
      ))}
    </div>
  )
}

export function CustomInsights() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <CardShell title="Sales funnel by conversation" info>
        <SalesFunnel />
      </CardShell>
      <CardShell title={DONUTS[0].title}>
        <DonutCard donut={DONUTS[0]} />
        <DonutLegend donut={DONUTS[0]} />
      </CardShell>
      <CardShell title={DONUTS[1].title}>
        <DonutCard donut={DONUTS[1]} />
        <DonutLegend donut={DONUTS[1]} />
      </CardShell>
      <CardShell title={DONUTS[2].title}>
        <DonutCard donut={DONUTS[2]} />
        <DonutLegend donut={DONUTS[2]} />
      </CardShell>
    </div>
  )
}
