import { Pencil } from 'lucide-react'
import { Card } from '@/components/flora/Card'
import { OUTCOME_METRICS, type OutcomeMetric } from './cockpit-data'

export type OutcomeOverlayProps = {
  metrics?: OutcomeMetric[]
  onEdit: () => void
}

function formatMetric(value: number, format: OutcomeMetric['format']): string {
  if (format === 'percent') return `${value.toFixed(1)}%`
  if (format === 'rating') return value.toFixed(2)
  // maximumFractionDigits alone is not ICU-stable: Node 22's ICU prints
  // "$500.0K" where 24+ prints "$500K", which split CI from local. Rounding
  // first and formatting the rounded integer/decimal ourselves keeps every
  // runtime on the same string.
  const compact = (v: number) => {
    const scaled = v >= 1_000_000 ? v / 1_000_000 : v >= 1_000 ? v / 1_000 : v
    const suffix = v >= 1_000_000 ? 'M' : v >= 1_000 ? 'K' : ''
    const rounded = Math.round(scaled * 10) / 10
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}${suffix}`
  }
  if (format === 'currency') return `$${compact(value)}`
  return compact(value)
}

function targetProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.max(0, (current / target) * 100))
}

function TargetOutcomeCard({
  metric,
  target,
  onEdit,
}: {
  metric: OutcomeMetric
  target: number
  onEdit: () => void
}) {
  const progress = targetProgress(metric.current, target)
  const remaining = Math.max(0, target - metric.current)
  const remainingLabel =
    metric.format === 'percent'
      ? `${remaining.toFixed(1)} pts remaining`
      : `${formatMetric(remaining, metric.format)} remaining`

  return (
    <Card flat data-testid={`outcome-${metric.id}`} className="min-w-0 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[13px] font-medium text-ink-muted">{metric.label}</h3>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${metric.label}`}
          className="rounded-md p-1 text-ink-muted transition-colors hover:bg-grey-100 hover:text-ink"
        >
          <Pencil className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
            Current
          </span>
          <strong className="mt-1 block text-[28px] font-semibold leading-none tracking-[-0.03em] text-ink">
            {formatMetric(metric.current, metric.format)}
          </strong>
        </div>
        <div className="text-right">
          <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
            Target
          </span>
          <span className="mt-1 block text-[15px] font-semibold text-ink">
            {formatMetric(target, metric.format)}
          </span>
        </div>
      </div>

      <div
        className="mt-5 h-2 overflow-hidden rounded-full bg-grey-300"
        role="progressbar"
        aria-label={`${metric.label} progress toward target`}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.min(metric.current, target)}
        aria-valuetext={`${formatMetric(metric.current, metric.format)} of ${formatMetric(target, metric.format)}`}
      >
        <div className="h-full rounded-full bg-blue-700" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-[12px] text-ink-muted">
        <span>{remainingLabel}</span>
        <span>{Math.round(progress)}% of target</span>
      </div>
    </Card>
  )
}

function GuardrailOutcomeCard({ metric, hardFloor }: { metric: OutcomeMetric; hardFloor: number }) {
  // A tight range makes the relationship between the current score and its
  // floor legible; this is a guardrail comparison, not a growth-progress bar.
  // The window scales with format since a 0-5 rating and a 0-100 percent
  // need very different padding around the same floor value.
  const scaleMax = metric.format === 'rating' ? 5 : 100
  const padding = metric.format === 'rating' ? 0.1 : 1.5
  const rangeStart = Math.max(0, hardFloor - padding)
  const rangeEnd = Math.min(scaleMax, hardFloor + padding)
  const range = rangeEnd - rangeStart
  const floorPosition = ((hardFloor - rangeStart) / range) * 100
  const currentPosition = Math.min(100, Math.max(0, ((metric.current - rangeStart) / range) * 100))

  return (
    <Card flat data-testid={`outcome-${metric.id}`} className="min-w-0 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[13px] font-medium text-ink-muted">{metric.label}</h3>
        <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
          Guardrail holding
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
            Current
          </span>
          <strong className="mt-1 block text-[28px] font-semibold leading-none tracking-[-0.03em] text-ink">
            {formatMetric(metric.current, metric.format)}
          </strong>
        </div>
        <div className="text-right">
          <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
            Hard floor
          </span>
          <span className="mt-1 block text-[15px] font-semibold text-ink">
            {formatMetric(hardFloor, metric.format)}
          </span>
        </div>
      </div>

      <div
        className="relative mt-5 h-7"
        role="img"
        aria-label={`${metric.label}: current ${formatMetric(metric.current, metric.format)}, hard floor marker ${formatMetric(hardFloor, metric.format)}`}
      >
        <div className="absolute inset-x-0 top-1.5 h-2 rounded-full bg-green-100" />
        <span
          data-testid="hard-floor-marker"
          className="absolute top-0 h-5 w-0.5 -translate-x-1/2 bg-red-700"
          style={{ left: `${floorPosition}%` }}
        />
        <span
          className="absolute top-0 size-5 -translate-x-1/2 rounded-full border-4 border-white bg-green-700 shadow-sm"
          style={{ left: `${currentPosition}%` }}
          aria-hidden="true"
        />
        <span
          className="absolute top-5 -translate-x-1/2 text-[10px] font-medium text-red-700"
          style={{ left: `${floorPosition}%` }}
          aria-hidden="true"
        >
          Floor
        </span>
      </div>

      <div className="mt-2 text-[12px] text-ink-muted">
        Set by your service agreement — not a dial the loop can trade away.
      </div>
    </Card>
  )
}

function MaximizeOutcomeCard({ metric }: { metric: OutcomeMetric }) {
  const progress = Math.min(100, Math.max(0, metric.current))

  return (
    <Card flat data-testid={`outcome-${metric.id}`} className="min-w-0 p-5">
      <h3 className="text-[13px] font-medium text-ink-muted">{metric.label}</h3>

      <div className="mt-4">
        <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
          Current
        </span>
        <strong className="mt-1 block text-[28px] font-semibold leading-none tracking-[-0.03em] text-ink">
          {formatMetric(metric.current, metric.format)}
        </strong>
      </div>

      <div
        className="mt-5 h-2 overflow-hidden rounded-full bg-grey-300"
        role="progressbar"
        aria-label={`${metric.label} progress toward 100%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={metric.current}
        aria-valuetext={`${formatMetric(metric.current, metric.format)} of 100%`}
      >
        <div className="h-full rounded-full bg-blue-700" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-2 text-[12px] text-ink-muted">
        No target — climbs toward 100%, bounded only by the CSAT floor.
      </div>
    </Card>
  )
}

export function OutcomeOverlay({ metrics = OUTCOME_METRICS, onEdit }: OutcomeOverlayProps) {
  return (
    <section data-testid="outcome-overlay" aria-labelledby="targets-floors-heading">
      <div>
        <h2
          id="targets-floors-heading"
          className="text-[18px] font-semibold tracking-[-0.02em] text-ink"
        >
          Targets &amp; floors
        </h2>
        <p className="mt-1 text-[13px] text-ink-muted">Day 34 of 60</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {metrics.map((metric) => {
          if (metric.target !== undefined) {
            return (
              <TargetOutcomeCard
                key={metric.id}
                metric={metric}
                target={metric.target}
                onEdit={onEdit}
              />
            )
          }
          if (metric.hardFloor !== undefined) {
            return (
              <GuardrailOutcomeCard key={metric.id} metric={metric} hardFloor={metric.hardFloor} />
            )
          }

          return <MaximizeOutcomeCard key={metric.id} metric={metric} />
        })}
      </div>
    </section>
  )
}
