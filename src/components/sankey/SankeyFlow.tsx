// The app's Sankey renderer, shared by Insights ▸ Agent Overview (conversation
// flow) and the Executive dashboard (customer outcomes) so both read as the same
// chart. recharts' Sankey runs a force-directed layout that reorders nodes and
// crosses ribbons; the design needs a fixed left-to-right flow with a colored
// pill label sitting on each node bar. So we lay it out deterministically from
// the `col` metadata and the link values.
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { SankeySheen, sankeyMotionStyle } from './SankeyMotion'

export type SankeyNode = { name: string; label: string; color: string; col: number }
export type SankeyLink = { source: number; target: number; value: number; color: string }
export type SankeyData = { nodes: SankeyNode[]; links: SankeyLink[] }

const NODE_W = 12
const GAP = 26 // vertical gap between stacked bands in a column
const MIN_H = 20 // floor so thin flows (e.g. un-resolved strands) stay visible
const PAD = { top: 20, bottom: 20, left: 4, right: 4 }

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

export function sankeyColumnStart(column: number, width: number, columnCount = 4) {
  const innerLeft = PAD.left
  const innerRight = width - PAD.right
  return innerLeft + (column * (innerRight - innerLeft - NODE_W)) / (columnCount - 1)
}

function buildLayout(
  flow: SankeyData,
  width: number,
  height: number,
  columnCount: number,
  minH: number,
) {
  const { nodes, links } = flow
  const innerTop = PAD.top
  const innerH = height - PAD.top - PAD.bottom

  const cols = Array.from({ length: columnCount }, (_, index) => index)
  const columns = cols.map((c) => nodes.map((n, i) => ({ n, i })).filter((o) => o.n.col === c))

  const thOf = (value: number, scale: number) => Math.max(value * scale, minH)
  const nodeH = (i: number, scale: number) => {
    const out = links.filter((l) => l.source === i).reduce((a, l) => a + thOf(l.value, scale), 0)
    const inc = links.filter((l) => l.target === i).reduce((a, l) => a + thOf(l.value, scale), 0)
    return Math.max(out, inc, minH)
  }
  const colHeight = (col: { i: number }[], scale: number) =>
    col.reduce((a, o) => a + nodeH(o.i, scale), 0) + (col.length - 1) * GAP

  // Largest scale (biggest bars) such that no column overflows innerH. The upper
  // bound is derived from the data — a fixed ceiling would silently clamp the
  // bars of any flow whose values are small (thousands rather than 100,000s).
  // At twice this scale the heaviest column is 2×innerH, so it cannot fit.
  const rawNodeValue = (i: number) => {
    const out = links.filter((l) => l.source === i).reduce((a, l) => a + l.value, 0)
    const inc = links.filter((l) => l.target === i).reduce((a, l) => a + l.value, 0)
    return Math.max(out, inc)
  }
  const heaviestColumn = Math.max(
    0,
    ...columns.map((col) => col.reduce((a, o) => a + rawNodeValue(o.i), 0)),
  )
  let lo = 0
  let hi = heaviestColumn > 0 ? (2 * innerH) / heaviestColumn : 1
  for (let iter = 0; iter < 40; iter++) {
    const mid = (lo + hi) / 2
    const fits = columns.every((col) => !col.length || colHeight(col, mid) <= innerH)
    if (fits) lo = mid
    else hi = mid
  }
  const scale = lo

  const placed: PlacedNode[] = nodes.map(() => ({ x: 0, y: 0, h: 0 }))
  for (const col of columns) {
    if (!col.length) continue
    const colH = colHeight(col, scale)
    let y = innerTop + (innerH - colH) / 2
    for (const { n, i } of col) {
      const h = nodeH(i, scale)
      placed[i] = { x: sankeyColumnStart(n.col, width, columnCount), y, h }
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
function PillLabel({
  x,
  y,
  color,
  label,
  order,
  align = 'start',
}: {
  x: number
  y: number
  color: string
  label: string
  order: number
  align?: 'start' | 'end'
}) {
  const lines = label.split('\n')
  const charW = 5.5
  const widest = Math.max(...lines.map((l) => l.length))
  const w = widest * charW + 12
  const lineH = 13
  const h = lines.length * lineH + 6
  const rectX = align === 'end' ? x - w : x
  const textX = rectX + 6
  return (
    <g className="sankey-label" data-sankey-label style={sankeyMotionStyle(order)}>
      <rect x={rectX} y={y - h / 2} width={w} height={h} rx={4} fill={color} />
      <text x={textX} y={y - h / 2 + 3} fontSize={10} fill="#ffffff" fontWeight={500}>
        {lines.map((ln, i) => (
          <tspan key={i} x={textX} dy={i === 0 ? 11 : lineH}>
            {ln}
          </tspan>
        ))}
      </text>
    </g>
  )
}

function Diagram({
  flow,
  width,
  height,
  columnCount,
  minThickness,
  ariaLabel,
}: {
  flow: SankeyData
  width: number
  height: number
  columnCount: number
  minThickness: number
  ariaLabel: string
}) {
  const { placed, ribbons } = useMemo(
    () => buildLayout(flow, width, height, columnCount, minThickness),
    [flow, width, height, columnCount, minThickness],
  )
  const gradientId = `sankey-sheen-${useId().replace(/:/g, '')}`
  return (
    <svg
      width={width}
      height={height}
      className="sankey-chart overflow-visible"
      role="img"
      aria-label={ariaLabel}
    >
      {ribbons.map((r, i) => (
        <path
          key={i}
          d={r.d}
          fill={r.color}
          fillOpacity={0.35}
          className="sankey-ribbon"
          data-sankey-ribbon
          style={sankeyMotionStyle(i)}
        />
      ))}
      <SankeySheen gradientId={gradientId} width={width} ribbons={ribbons} />
      {flow.nodes.map((node, i) => {
        const p = placed[i]
        // The final label ends just before its node; every other label begins
        // just after its node. Anchoring the edge (rather than guessing a pill
        // width) keeps the alignment stable as copy or type size changes.
        const isLast = node.col === columnCount - 1
        const labelX = isLast ? p.x - 6 : p.x + NODE_W + 6
        return (
          <g key={node.name}>
            <rect
              x={p.x}
              y={p.y}
              width={NODE_W}
              height={p.h}
              rx={3}
              fill={node.color}
              className="sankey-node"
              data-sankey-node
              style={sankeyMotionStyle(node.col)}
            />
            <PillLabel
              x={labelX}
              y={p.y + p.h / 2}
              color={node.color}
              label={node.label}
              order={node.col}
              align={isLast ? 'end' : 'start'}
            />
          </g>
        )
      })}
    </svg>
  )
}

export function SankeyFlow({
  flow,
  titles,
  ariaLabel,
  height = 230,
  // Ribbons are floored so a tiny strand stays visible, but the floor also
  // flattens two small-but-different bands into one height. A column carrying
  // several long-tail outcomes can lower it.
  minThickness = MIN_H,
  // Bump to replay the entrance animation (e.g. when the flow's shape changes).
  // It keys the diagram only, so the measured container keeps its size.
  replayKey,
}: {
  flow: SankeyData
  titles: string[]
  ariaLabel: string
  height?: number
  minThickness?: number
  replayKey?: string | number
}) {
  const { ref, size } = useMeasured()
  const columnCount = titles.length
  return (
    <>
      <div className="relative mb-2 h-5 text-[12px] font-medium text-ink-muted">
        {size.width > 0 &&
          titles.map((title, column) => (
            <span
              key={title}
              className={column === titles.length - 1 ? 'absolute right-0' : 'absolute'}
              style={
                column === titles.length - 1
                  ? undefined
                  : { left: sankeyColumnStart(column, size.width, columnCount) }
              }
            >
              {title}
            </span>
          ))}
      </div>
      <div ref={ref} className="w-full" style={{ height }}>
        {size.width > 0 && size.height > 0 && (
          <Diagram
            key={replayKey}
            flow={flow}
            width={size.width}
            height={size.height}
            columnCount={columnCount}
            minThickness={minThickness}
            ariaLabel={ariaLabel}
          />
        )}
      </div>
    </>
  )
}
