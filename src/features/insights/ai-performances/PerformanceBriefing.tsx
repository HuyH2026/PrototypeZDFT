import { Sparkles, X } from 'lucide-react'
import { useBriefingMemory } from './use-briefing-memory'

// A deliberately small, evidence-backed arrival briefing. It supplements the
// dashboard rather than replacing it or opening a generic assistant by default.
// Findings, prioritization, and dismiss/seen memory come from useBriefingMemory;
// this component is presentational. When nothing clears the threshold it renders
// nothing — the dashboard stays quiet and per-metric "Explain this" actions (on
// the stat cards) remain the lightweight entry point.
export function PerformanceBriefing({
  onInvestigate,
}: {
  onInvestigate: (findingId: string) => void
}) {
  const { findings, dismiss } = useBriefingMemory()
  if (findings.length === 0) return null

  return (
    <section
      data-testid="ai-performance-briefing"
      aria-labelledby="performance-briefing-heading"
      className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-app-backdrop px-5 py-4"
    >
      <h2 id="performance-briefing-heading" className="text-[13px] font-medium text-ink-muted">
        {findings.length > 1 ? `${findings.length} need attention` : 'Needs attention'}
      </h2>
      <ul className="flex flex-col gap-3">
        {findings.map((f) => (
          <li key={f.id} className="flex flex-wrap items-center gap-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-accent-blue">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-[260px] flex-1">
              <h3 className="text-[15px] font-medium text-ink">{f.headline}</h3>
              <p className="mt-1 text-[13px] text-ink-muted">
                {f.evidence.observation}
                {f.evidence.suspectedDriver ? (
                  <>
                    {' '}
                    <span className="font-medium text-ink">Suspected:</span>{' '}
                    {f.evidence.suspectedDriver}
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onInvestigate(f.id)}
                className="flex h-8 items-center gap-1.5 rounded-full bg-nav-active px-3 text-[13px] font-medium text-white hover:bg-ink"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Investigate
              </button>
              <button
                type="button"
                aria-label={`Dismiss insight: ${f.headline}`}
                onClick={() => dismiss(f.id)}
                className="flex size-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-white hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
