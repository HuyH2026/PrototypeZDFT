// One metric card: icon + title, a donut, and a legend. The donut is inline SVG
// with strokeDasharray arcs on one circle, following features/home/pm-ui.tsx's
// ImpactDonut — this app draws its own charts and has no chart library.
//
// 'stacked' draws one arc per segment, proportional to its share (Conversations).
// 'single' draws one arc of `value` percent against the track (AR, Escalations).
import { Info, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/flora/Card'
import type { Segment } from './roster-metrics'

const R = 44
const C = 2 * Math.PI * R
const TRACK = '#efeeec'
const STROKE = 14

type Arc = { color: string; length: number; offset: number }

function stackedArcs(segments: Segment[]): Arc[] {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  if (total <= 0) return []
  let offset = 0
  return segments.map((segment) => {
    const length = (segment.value / total) * C
    const arc: Arc = { color: segment.color, length, offset }
    offset += length
    return arc
  })
}

export function MetricDonutCard({
  title,
  Icon,
  mode,
  centerLabel,
  value = 0,
  singleColor = '#2f3130',
  segments,
  totalLabel,
  formatValue,
  emptyTitle,
  emptyBody,
  testId,
}: {
  title: string
  Icon: LucideIcon
  mode: 'stacked' | 'single'
  centerLabel: string | null
  value?: number
  singleColor?: string
  segments: Segment[]
  totalLabel?: string
  formatValue: (value: number) => string
  emptyTitle: string
  emptyBody: string
  testId: string
}) {
  const isEmpty = centerLabel === null
  const arcs: Arc[] = isEmpty
    ? []
    : mode === 'stacked'
      ? stackedArcs(segments)
      : [{ color: singleColor, length: (value / 100) * C, offset: 0 }]

  return (
    <Card flat data-testid={testId} className="flex flex-col p-5">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-ink-muted" aria-hidden />
        <span className="text-sm font-semibold leading-5 text-ink">{title}</span>
        <Info size={14} className="text-grey-600" aria-hidden />
      </div>

      <div className="mt-4 flex items-center gap-5">
        <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden className="shrink-0">
          <circle cx="56" cy="56" r={R} fill="none" stroke={TRACK} strokeWidth={STROKE} />
          {arcs.map((arc, index) => (
            <circle
              key={index}
              data-testid="metric-arc"
              cx="56"
              cy="56"
              r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE}
              strokeDasharray={`${arc.length} ${C - arc.length}`}
              strokeDashoffset={-arc.offset}
              transform="rotate(-90 56 56)"
            />
          ))}
        </svg>

        <div className="min-w-0 flex-1">
          <span
            data-testid="metric-center"
            className="block text-[22px] font-semibold leading-7 tracking-[-0.4px] text-ink"
          >
            {centerLabel ?? '—'}
          </span>

          {isEmpty ? (
            <>
              <p className="mt-1 text-sm font-semibold leading-5 text-ink">{emptyTitle}</p>
              <p className="mt-1 text-[12px] leading-4 text-ink-muted">{emptyBody}</p>
            </>
          ) : (
            <>
              {totalLabel && (
                <p className="mt-1 text-[12px] leading-4 text-ink-muted">{totalLabel}</p>
              )}
              <ul className="mt-2 flex flex-col gap-1.5">
                {segments.map((segment) => (
                  <li key={segment.label} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[12px] leading-4 text-ink">
                      {segment.label}
                    </span>
                    <span className="text-[12px] font-semibold leading-4 text-ink">
                      {formatValue(segment.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
