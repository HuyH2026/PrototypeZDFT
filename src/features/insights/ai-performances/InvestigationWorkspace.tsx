// Tier-2 metric investigation workspace: replaces the Overview body when the user
// picks a finding to investigate. Left column is the metric's annotated chart;
// right column is a deterministic, evidence-first analysis rail. Escalations
// (Break down by intent / Compare agents / Continue in AI Studio) hand off to the
// AI Studio full view, seeding its composer with the relevant prompt. No LLM
// free-text lives here — this tier stays deterministic.
import { useEffect } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useAiAssistant } from '@/app/ai-assistant-context'
import { MetricChart } from '@/components/MetricChart'
import { Card } from '@/components/flora/Card'
import { investigationById, toConversationSeed } from './investigation-data'

function ActionChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected ? true : undefined}
      className={
        selected
          ? 'rounded-full bg-[#dbeafe] px-3.5 py-1.5 text-[13px] font-medium text-blue-700'
          : 'rounded-full border border-surface-border px-3.5 py-1.5 text-[13px] font-medium text-ink hover:bg-[rgba(92,105,112,0.08)]'
      }
    >
      {label}
    </button>
  )
}

export function InvestigationWorkspace({
  findingId,
  onBack,
  onViewConversations,
}: {
  findingId: string
  onBack: () => void
  onViewConversations: () => void
}) {
  const { open } = useAiAssistant()
  const inv = investigationById(findingId)

  // Defensive: an unknown id shouldn't strand the user on an empty screen.
  useEffect(() => {
    if (!inv) onBack()
  }, [inv, onBack])

  if (!inv) return null

  return (
    <div data-testid="investigation-workspace" className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to overview
      </button>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_minmax(360px,420px)]">
        {/* Left: annotated chart */}
        <Card className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-semibold text-ink">{inv.title}</h2>
              <p className="mt-0.5 text-[13px] text-ink-muted">{inv.subtitle}</p>
            </div>
          </div>
          <span className="mt-3 w-fit rounded-full bg-[#dbeafe] px-2.5 py-1 text-[12px] font-medium text-blue-700">
            {inv.badge}
          </span>
          <div className="mt-4">
            <MetricChart series={inv.series} />
          </div>
          <div className="mt-3 flex items-center justify-between text-[12px] text-ink-muted">
            <span>{inv.annotation}</span>
            <span>{inv.peak}</span>
          </div>
        </Card>

        {/* Right: analysis rail */}
        <Card flat className="flex flex-col bg-app-backdrop p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-ink">Investigate this metric</h3>
            <Sparkles className="h-4 w-4 text-accent-blue" aria-hidden="true" />
          </div>
          <p className="mt-0.5 text-[13px] text-ink-muted">{inv.title} · Jul 1–28</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <ActionChip label="Explain this change" selected />
            <ActionChip
              label="Break down by intent"
              onClick={() =>
                open(inv.scope, 'full', { prompt: `Break down the ${inv.title} change by intent` })
              }
            />
            <ActionChip
              label="Compare agents"
              onClick={() =>
                open(inv.scope, 'full', { prompt: `Compare agents driving the ${inv.title} change` })
              }
            />
          </div>

          <p className="mt-5 text-[13px] font-medium text-ink-muted">Observed change</p>
          <p className="mt-1 text-[15px] leading-6 text-ink">{inv.observed.summary}</p>
          <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-5 text-ink">
            {inv.observed.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>

          <p className="mt-4 text-[13px] text-ink-muted">{inv.observed.evidenceCount}</p>
          <p className="mt-1 text-[12px] italic text-ink-muted">Observation, not causation</p>

          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={onViewConversations}
              className="rounded-full border border-surface-border bg-white px-4 py-2 text-[13px] font-medium text-ink hover:bg-[#f5f6f7]"
            >
              View affected conversations
            </button>
            <button
              type="button"
              onClick={() =>
                open(inv.scope, 'full', {
                  prompt: inv.observed.summary,
                  conversation: toConversationSeed(inv),
                })
              }
              className="flex items-center justify-center gap-1.5 rounded-full bg-nav-active px-4 py-2 text-[13px] font-medium text-white hover:bg-ink"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Continue in AI Studio
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
