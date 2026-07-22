// A hand-built SVG Sankey for the conversation flow (Total → Channels →
// Resolutions → Savings). recharts' Sankey runs a force-directed layout that
// reorders nodes and crosses ribbons; the design needs a fixed left-to-right
// flow with a colored pill label sitting on each node bar. So we lay it out
// deterministically from the `col` metadata and the link values.
import { useEffect, useMemo, useRef, useState } from 'react'
import { FLOW } from './ai-performances-data'

const NODE_W = 12
const GAP = 26 // vertical gap between stacked bands in a column
const MIN_H = 20 // floor so thin flows (e.g. un-resolved strands) stay visible
const PAD = { top: 20, bottom: 20, left: 4, right: 4 }

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

type PlacedNode = { x: number; y: number; h: number }

function buildLayout(width: number, height: number) {
  const { nodes, links } = FLOW
  const innerTop = PAD.top
  const innerH = height - PAD.top - PAD.bottom
  const innerLeft = PAD.left
  const innerRight = width - PAD.right

  const cols = [0, 1, 2, 3]
  const columns = cols.map((c) => nodes.map((n, i) => ({ n, i })).filter((o) => o.n.col === c))

  const thOf = (value: number, scale: number) => Math.max(value * scale, MIN_H)
  const nodeH = (i: number, scale: number) => {
    const out = links.filter((l) => l.source === i).reduce((a, l) => a + thOf(l.value, scale), 0)
    const inc = links.filter((l) => l.target === i).reduce((a, l) => a + thOf(l.value, scale), 0)
    return Math.max(out, inc, MIN_H)
  }
  const colHeight = (col: { i: number }[], scale: number) =>
    col.reduce((a, o) => a + nodeH(o.i, scale), 0) + (col.length - 1) * GAP

  // Largest scale (biggest bars) such that no column overflows innerH.
  let lo = 0
  let hi = 0.01
  for (let iter = 0; iter < 40; iter++) {
    const mid = (lo + hi) / 2
    const fits = columns.every((col) => !col.length || colHeight(col, mid) <= innerH)
    if (fits) lo = mid
    else hi = mid
  }
  const scale = lo

  const xOf = (c: number) => innerLeft + (c * (innerRight - innerLeft - NODE_W)) / 3

  const placed: PlacedNode[] = nodes.map(() => ({ x: 0, y: 0, h: 0 }))
  for (const col of columns) {
    if (!col.length) continue
    const colH = colHeight(col, scale)
    let y = innerTop + (innerH - colH) / 2
    for (const { n, i } of col) {
      const h = nodeH(i, scale)
      placed[i] = { x: xOf(n.col), y, h }
      y += h + GAP
    }
  }

  const outCur = placed.map((p) => p.y)
  const inCur = placed.map((p) => p.y)
  const ribbons = links.map((link) => {
    const s = placed[link.source]
    const t = placed[link.target]
    const th = thOf(link.value, scale)
    const x0 = s.x + NODE_W
    const x1 = t.x
    const ya0 = outCur[link.source]
    const ya1 = ya0 + th
    const yb0 = inCur[link.target]
    const yb1 = yb0 + th
    outCur[link.source] = ya1
    inCur[link.target] = yb1
    const xc = x0 + (x1 - x0) / 2
    const d = `M${x0},${ya0} C${xc},${ya0} ${xc},${yb0} ${x1},${yb0} L${x1},${yb1} C${xc},${yb1} ${xc},${ya1} ${x0},${ya1} Z`
    return { d, color: link.color }
  })

  return { placed, ribbons }
}

// A colored pill label anchored to a node bar, matching the Figma tags. Sized
// from the (fixed-width) font so it wraps predictably; multi-line labels split
// on '\n'.
function PillLabel({ x, y, color, label }: { x: number; y: number; color: string; label: string }) {
  const lines = label.split('\n')
  const charW = 6.2
  const widest = Math.max(...lines.map((l) => l.length))
  const w = widest * charW + 16
  const lineH = 15
  const h = lines.length * lineH + 8
  return (
    <g>
      <rect x={x} y={y - h / 2} width={w} height={h} rx={5} fill={color} />
      <text x={x + 8} y={y - h / 2 + 4} fontSize={11} fill="#ffffff" fontWeight={500}>
        {lines.map((ln, i) => (
          <tspan key={i} x={x + 8} dy={i === 0 ? 12 : lineH}>
            {ln}
          </tspan>
        ))}
      </text>
    </g>
  )
}

function Diagram({ width, height }: { width: number; height: number }) {
  const { placed, ribbons } = useMemo(() => buildLayout(width, height), [width, height])
  return (
    <svg width={width} height={height} className="overflow-visible">
      {ribbons.map((r, i) => (
        <path key={i} d={r.d} fill={r.color} fillOpacity={0.35} />
      ))}
      {FLOW.nodes.map((node, i) => {
        const p = placed[i]
        // Savings pill (last col) sits inside the bar area to its left so it
        // doesn't overflow the chart; others sit just right of their bar.
        const isLast = node.col === 3
        const labelX = isLast ? p.x - 92 : p.x + NODE_W + 6
        return (
          <g key={node.name}>
            <rect x={p.x} y={p.y} width={NODE_W} height={p.h} rx={3} fill={node.color} />
            <PillLabel x={labelX} y={p.y + Math.min(p.h / 2, 40)} color={node.color} label={node.label} />
          </g>
        )
      })}
    </svg>
  )
}

// Column titles across the top of the flow.
const TITLES = ['Total conversations', 'Channels', 'Resolutions', 'Savings']

export function FlowSankey() {
  const { ref, size } = useMeasured()
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-6">
      <div className="mb-2 flex justify-between text-[13px] font-medium text-ink">
        {TITLES.map((t, i) => (
          <span key={t} className={i === TITLES.length - 1 ? 'text-right' : ''}>
            {t}
          </span>
        ))}
      </div>
      <div ref={ref} className="h-[230px] w-full">
        {size.width > 0 && size.height > 0 && <Diagram width={size.width} height={size.height} />}
      </div>
    </div>
  )
}
