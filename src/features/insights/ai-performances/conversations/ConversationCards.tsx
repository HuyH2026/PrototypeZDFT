// The three card archetypes for the Conversations tab, dispatched by `kind`:
// a stacked-bar card (headline + two-segment bar + legend), a donut card
// (recharts donut + left legend + centered value), and a ranked-bar card
// (total + horizontal bars). The donut uses the same measured-container pattern
// as CustomInsights (recharts paints a zero-width sliver until it has a size).
import { useEffect, useRef, useState } from 'react'
import { Cell, Pie, PieChart } from 'recharts'
import { INK } from '../ai-performances-data'
import type { ConvCard, DonutCardData, RankedBarCard, StackedBarCard } from './conversations-data'

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

function CardShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-5">
      <h3 className="mb-4 flex items-center gap-1.5 text-[15px] font-medium text-ink">
        {title}
        <span aria-hidden="true" className="text-[12px] text-ink-muted">ⓘ</span>
      </h3>
      {children}
    </div>
  )
}

function StackedBar({ card }: { card: StackedBarCard }) {
  return (
    <>
      <p className="text-[32px] font-semibold leading-none text-ink">{card.value}</p>
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
        {card.segments.map((s) => (
          <span key={s.label} style={{ width: s.pct, background: s.color }} />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {card.segments.map((s) => (
          <div key={s.label} className="flex items-center text-[13px]">
            <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
            <span className="ml-2 text-ink-muted">{s.label}</span>
            <span className="ml-auto font-medium text-ink">{s.count}</span>
            <span className="ml-8 w-8 text-right text-ink-muted">{s.pct}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function Donut({ card }: { card: DonutCardData }) {
  const { ref, size } = useMeasured()
  const outer = Math.min(size.width, size.height) / 2 - 4
  return (
    <div className="flex items-center gap-4">
      <div className="flex min-w-[120px] flex-col gap-2.5">
        {card.slices.map((s) => (
          <div key={s.name} className="text-[13px]">
            <span className="font-semibold text-ink">{s.count}</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-ink-muted">
              <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
              {s.name}
            </span>
          </div>
        ))}
      </div>
      <div ref={ref} className="relative h-[150px] flex-1">
        {size.width > 0 && size.height > 0 && (
          <PieChart width={size.width} height={size.height}>
            <Pie
              data={card.slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={outer * 0.7}
              outerRadius={outer}
              paddingAngle={1}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {card.slices.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        )}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[24px] font-semibold" style={{ color: INK }}>
            {card.center}
          </span>
          {card.centerLabel ? <span className="text-[12px] text-ink-muted">{card.centerLabel}</span> : null}
        </div>
      </div>
    </div>
  )
}

function RankedBars({ card }: { card: RankedBarCard }) {
  const max = Math.max(...card.rows.map((r) => r.value), 1)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-ink-muted">{card.totalLabel}</span>
        <span className="font-semibold text-ink">{card.total}</span>
      </div>
      {card.rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[140px_1fr_auto] items-center gap-3 text-[13px]">
          <span className="truncate text-right text-ink-muted">{r.label}</span>
          <span className="h-4 rounded-[4px]" style={{ width: `${(r.value / max) * 100}%`, background: card.color }} />
          <span className="text-ink-muted">{r.count}</span>
        </div>
      ))}
    </div>
  )
}

export function ConversationCard({ card }: { card: ConvCard }) {
  return (
    <CardShell title={card.title}>
      {card.kind === 'stacked' && <StackedBar card={card} />}
      {card.kind === 'donut' && <Donut card={card} />}
      {card.kind === 'ranked' && <RankedBars card={card} />}
    </CardShell>
  )
}
