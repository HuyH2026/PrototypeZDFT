// src/features/insights/cx-journey/ConversationFlowSection.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { FLOW_HEADER, FLOW_SANKEY } from './cx-journey-data'
import { FilterRow } from './FilterRow'

// A hand-built SVG Sankey. recharts' Sankey runs a force-directed layout that
// reorders nodes and crosses the ribbons; the design needs a fixed, stacked flow
// (AI on top, Human in the middle, Not-handled/resolved at the bottom) with
// labels above each band. So we lay it out deterministically from the `col` /
// `amount` metadata on each node.

const NODE_W = 10
const GAP = 26 // vertical gap between stacked bands in a column
const MIN_H = 16 // floor for node/ribbon thickness so small flows stay visible
const PAD = { top: 44, bottom: 18, left: 14, right: 26 }

// Measure the container so the SVG fills it fluidly and only renders once it has
// a real size (avoids a zero-size render in jsdom tests).
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

// Compute node rectangles (fixed columns, stacked + centered per column) and the
// ribbon paths between them. Ribbons attach top-to-bottom in link order, which —
// given the node ordering — yields non-crossing bands that match the design.
function buildLayout(width: number, height: number) {
  const { nodes, links } = FLOW_SANKEY
  const innerTop = PAD.top
  const innerH = height - PAD.top - PAD.bottom
  const innerLeft = PAD.left
  const innerRight = width - PAD.right

  const columns = [0, 1, 2, 3].map((c) => nodes.map((n, i) => ({ n, i })).filter((o) => o.n.col === c))

  // One scale across all columns so ribbon thickness is conserved. The tightest
  // column (largest sum for its available height) sets it.
  let scale = Infinity
  for (const col of columns) {
    if (!col.length) continue
    const sum = col.reduce((a, o) => a + o.n.amount, 0)
    scale = Math.min(scale, (innerH - (col.length - 1) * GAP) / sum)
  }

  const xOf = (c: number) => innerLeft + (c * (innerRight - innerLeft - NODE_W)) / 3

  // Floor node heights so small flows stay visible; the extra height a floored
  // node gains is folded into the column total so centering stays correct.
  const hOf = (amount: number) => Math.max(amount * scale, MIN_H)

  const placed: PlacedNode[] = nodes.map(() => ({ x: 0, y: 0, h: 0 }))
  for (const col of columns) {
    if (!col.length) continue
    const colH = col.reduce((a, o) => a + hOf(o.n.amount), 0) + (col.length - 1) * GAP
    let y = innerTop + (innerH - colH) / 2 // vertically center each column
    for (const { n, i } of col) {
      const h = hOf(n.amount)
      placed[i] = { x: xOf(n.col), y, h }
      y += h + GAP
    }
  }

  // Running attachment cursors per node (top of node initially).
  const outCur = placed.map((p) => p.y)
  const inCur = placed.map((p) => p.y)
  const ribbons = links.map((link) => {
    const s = placed[link.source]
    const t = placed[link.target]
    const th = Math.max(link.value * scale, MIN_H)
    const x0 = s.x + NODE_W
    const x1 = t.x
    const ya0 = outCur[link.source]
    const ya1 = ya0 + th
    const yb0 = inCur[link.target]
    const yb1 = yb0 + th
    outCur[link.source] = ya1
    inCur[link.target] = yb1
    const xc = x0 + (x1 - x0) / 2 // control points at the horizontal midpoint
    const d = `M${x0},${ya0} C${xc},${ya0} ${xc},${yb0} ${x1},${yb0} L${x1},${yb1} C${xc},${yb1} ${xc},${ya1} ${x0},${ya1} Z`
    return { d, color: link.color }
  })

  return { placed, ribbons }
}

function FlowSankey({ width, height }: { width: number; height: number }) {
  const { placed, ribbons } = useMemo(() => buildLayout(width, height), [width, height])
  const lastIndex = FLOW_SANKEY.nodes.length - 1
  return (
    <svg width={width} height={height} className="overflow-visible">
      {ribbons.map((r, i) => (
        <path key={i} d={r.d} fill={r.color} fillOpacity={0.4} />
      ))}
      {FLOW_SANKEY.nodes.map((node, i) => {
        const p = placed[i]
        const isLast = i === lastIndex
        const labelX = isLast ? p.x - 8 : p.x + NODE_W + 8
        const anchor = isLast ? 'end' : 'start'
        return (
          <g key={node.name}>
            <rect x={p.x} y={p.y} width={NODE_W} height={p.h} rx={2} fill={node.color} />
            <text x={labelX} y={p.y - 20} textAnchor={anchor} fontSize={11} fill="#8b8e89">
              {node.name}
              {node.pct ? ` ${node.pct}` : ''}
            </text>
            <text x={labelX} y={p.y - 4} textAnchor={anchor} fontSize={14} fontWeight={600} fill="#2f3130">
              {node.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function ConversationFlowSection() {
  const { ref, size } = useMeasured()
  return (
    <section className="flex flex-col gap-4">
      <FilterRow title="Total conversations (AI + Human)" />
      <div className="rounded-2xl bg-app-backdrop p-6">
        <div className="mb-6 flex flex-wrap gap-x-20 gap-y-4">
          {FLOW_HEADER.map((stat) => (
            <div key={stat.label}>
              <p className="text-[13px] text-ink-muted">{stat.label}</p>
              <p className="text-[28px] font-semibold text-ink">
                {stat.value}
                {stat.pct ? <span className="ml-1 text-ink-muted">({stat.pct})</span> : null}
              </p>
            </div>
          ))}
        </div>
        <div ref={ref} className="h-[260px] w-full">
          {size.width > 0 && size.height > 0 && <FlowSankey width={size.width} height={size.height} />}
        </div>
      </div>
    </section>
  )
}
