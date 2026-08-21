import type { CSSProperties } from 'react'

type MotionStyle = CSSProperties & { '--sankey-order': number }

export function sankeyMotionStyle(order: number): MotionStyle {
  return { '--sankey-order': order }
}

export function SankeySheen({
  gradientId,
  width,
  ribbons,
}: {
  gradientId: string
  width: number
  ribbons: { d: string }[]
}) {
  const sweepWidth = Math.max(width * 0.18, 120)
  const start = -sweepWidth
  const end = width + sweepWidth

  return (
    <>
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={start}
          x2={0}
          y1={0}
          y2={0}
        >
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.46" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="0.56" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="0.72" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          <animate
            attributeName="x1"
            values={`${start};${start};${width};${width}`}
            keyTimes="0;0.65;0.84;1"
            dur="6.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values={`0;0;${end};${end}`}
            keyTimes="0;0.65;0.84;1"
            dur="6.5s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      <g aria-hidden="true" className="sankey-sheen-layer">
        {ribbons.map((ribbon, index) => (
          <path
            key={index}
            d={ribbon.d}
            fill={`url(#${gradientId})`}
            className="sankey-sheen"
            data-sankey-sheen
          />
        ))}
      </g>
    </>
  )
}
