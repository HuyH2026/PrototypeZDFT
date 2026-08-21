// "Custom insights" — a 2-column grid of user-defined report cards: a sales
// funnel (labeled bar chart) plus three category donuts. Charts render with
// recharts; all data is mocked.
import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { Cell, Pie, PieChart } from 'recharts'
import { type Donut, DONUTS, FUNNEL, GREY, INK } from './ai-performances-data'
import { Card } from '@/components/flora/Card'
import { useChartMotion } from '@/lib/chart-motion'
import { PIE_CHART_INNER_RADIUS_RATIO } from '@/lib/pie-chart'
import { useInView } from '@/lib/use-in-view'

// Measure the container so the donut renders at a real size (recharts otherwise
// paints a zero-width sliver on first tick — the same reason the Sankey measures
// before rendering).
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

function CardShell({
  title,
  info,
  children,
}: {
  title: string
  info?: boolean
  children: React.ReactNode
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[15px] font-medium text-ink">
          {title}
          {info ? <span className="text-ink-muted">ⓘ</span> : null}
        </h3>
        <MoreVertical className="h-4 w-4 text-ink-muted" />
      </div>
      {children}
    </Card>
  )
}

// Funnel: teal bars whose height encodes the stage's share of the top stage, each
// carrying a "pct / count" label. A faint full-height track sits behind each bar
// (matching the design's ghosted columns).
//
// Two things were wrong with the labels. They floated above the bar as `w-max`
// chips, so a chip wider than its column overlapped its neighbour ("3,000" ran
// into "30% / 900"); and the first stage is 100% tall, so its chip sat above the
// plot area entirely and was clipped by the card. They now sit *inside* the bar
// whenever it is tall enough to hold one — which reads as a value on the bar —
// while short stages use a dedicated label lane below the plot. That keeps the
// values with their columns without making them read as hover tooltips.
//
// The bar area is its own row rather than `flex-1` inside a content-sized column,
// so its height comes from the card and not from whatever the labels happen to
// measure: with the label in flow inside the bar, content sizing collapsed the
// whole plot to the height of one label.
const LABEL_FITS = 22 // % of the plot height needed to hold a two-line label
const AXIS_W = 'w-8' // gutter shared by the tick column and the label row's spacer
export const DONUT_INNER_RADIUS_RATIO = PIE_CHART_INNER_RADIUS_RATIO

function SalesFunnel() {
  // Sits well below the fold, so the bars wait for the scroll to grow.
  const { ref, inView } = useInView()
  return (
    <div ref={ref} data-testid="sales-funnel" className="flex h-[240px] flex-col">
      <div className="flex min-h-0 flex-1 gap-3">
        <div
          className={`flex ${AXIS_W} shrink-0 flex-col justify-between py-1 text-[11px] text-ink-muted`}
        >
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>
        <div className="grid flex-1 grid-cols-5 items-end gap-3">
          {FUNNEL.map((stage, i) => {
            const inside = stage.value >= LABEL_FITS
            return (
              <div key={stage.label} className="relative flex h-full min-w-0 items-end">
                {/* ghosted track */}
                <div className="absolute inset-0 rounded-t-md bg-[#e4f4f7]" />
                {/* filled bar */}
                  <div
                    className={`relative w-full rounded-t-md bg-[#0f9bb0] ${
                      inView ? 'animate-bar-rise' : ''
                    }`}
                    style={{ height: inView ? `${stage.value}%` : 0, '--rise': i } as CSSProperties}
                  >
                  {inside ? (
                    <div className="px-1 pt-1.5 text-center">
                      <div className="truncate text-[12px] font-semibold text-white">{stage.pct}</div>
                      <div className="truncate text-[11px] text-white/80">{stage.count}</div>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* Low bars cannot hold a two-line value without turning it into a floating
          card. Their values use this fixed lane instead, so they stay attached to
          their column and clear of the stage names below. */}
      <div className="mt-1 flex gap-3">
        <div className={`${AXIS_W} shrink-0`} aria-hidden />
        <div data-testid="funnel-low-value-labels" className="grid flex-1 grid-cols-5 gap-3">
          {FUNNEL.map((stage) => (
            <div key={stage.label} className="min-w-0 text-center leading-tight">
              {stage.value < LABEL_FITS ? (
                <>
                  <div className="truncate text-[11px] font-semibold text-ink">{stage.pct}</div>
                  <div className="truncate text-[10px] text-ink-muted">{stage.count}</div>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      {/* Stage names, in a matching 5-column grid so they stay under their bar.
          The row is `data-testid`-tagged so tests can tell a stage name from the
          identical strings in the axis ticks and the bar labels.
          10px because "Recommendation" is a single unbreakable word that overran
          its column at 11px and touched the name beside it. */}
      <div className="mt-2 flex gap-3">
        <div className={`${AXIS_W} shrink-0`} aria-hidden />
        <div data-testid="funnel-stage-names" className="grid flex-1 grid-cols-5 gap-3">
          {FUNNEL.map((stage) => (
            <p key={stage.label} className="text-center text-[10px] leading-tight text-ink-muted">
              {stage.label}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

function DonutCard({ donut }: { donut: Donut }) {
  const { ref, size } = useMeasured()
  const { ref: viewRef, inView } = useInView<HTMLDivElement>()
  const motion = useChartMotion()
  // Both hooks watch the same box — one for its size, one for whether it has been
  // scrolled to — so the two refs are set from one callback.
  const setBox = (el: HTMLDivElement | null) => {
    ref.current = el
    viewRef.current = el
  }
  const outer = Math.min(size.width, size.height) / 2 - 6
  return (
    <div ref={setBox} className="relative h-[240px] w-full">
      {/* The ring only mounts once it is on screen, so its sweep-in plays to
          someone watching rather than three screens above them. */}
      {inView && size.width > 0 && size.height > 0 && (
        <PieChart width={size.width} height={size.height}>
          <Pie
            data={donut.slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={outer * DONUT_INNER_RADIUS_RATIO}
            outerRadius={outer}
            paddingAngle={1}
            stroke="none"
            startAngle={90}
            endAngle={-270}
            {...motion}
          >
            {donut.slices.map((s) => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
        </PieChart>
      )}
      {/* Center total, overlaid (recharts labels can't easily stack). Faded in with
          the ring rather than sitting in an empty hole waiting for it. */}
      <div
        className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center ${
          inView ? 'animate-fade-in' : 'opacity-0'
        }`}
      >
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
