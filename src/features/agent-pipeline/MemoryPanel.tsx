// The loop's memory, made readable. "We tried this, it lost, we won't retry it
// before Q4" is the sentence that distinguishes a system that learns from one
// that merely acts (agent-pipeline spec, Decision 5).
import { Ban, Check, CircleX } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { Card } from '@/components/flora/Card'
import type { MemoryEntry } from './pipeline-data'

export type MemoryPanelProps = {
  entries: MemoryEntry[]
  onReconsider?: (changeId: string) => void
}

function declinedChangeId(entry: MemoryEntry): string | null {
  if (entry.verdict !== 'declined') return null
  const match = /^declined-(.+)$/.exec(entry.id)
  return match?.[1] ?? null
}

function Group({
  testId,
  title,
  entries,
  tone,
  onReconsider,
}: {
  testId: string
  title: string
  entries: MemoryEntry[]
  tone: MemoryEntry['verdict']
  onReconsider?: (changeId: string) => void
}) {
  const Icon = tone === 'ruled-out' ? Ban : tone === 'declined' ? CircleX : Check
  const iconColor =
    tone === 'ruled-out'
      ? 'var(--flora-red)'
      : tone === 'declined'
        ? '#8a6d1d'
        : 'var(--flora-green)'
  return (
    <section data-testid={testId}>
      <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
        <Icon aria-hidden className="size-4" style={{ color: iconColor }} />
        {title} · {entries.length}
      </h3>
      <ul className="mt-2 flex flex-col">
        {entries.map((entry) => {
          const changeId = declinedChangeId(entry)
          return (
            <li
              key={entry.id}
              data-testid={`memory-row-${entry.id}`}
              className="border-t border-surface-border py-3 first:border-t-0"
            >
              <p className="text-[13px] text-ink">{entry.title}</p>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                {entry.agentName} · {tone === 'declined' ? 'proposed in cycle' : 'cycle'}{' '}
                {entry.triedInCycle}
              </p>
              <p className="mt-1 text-[12px] text-grey-700">{entry.outcome}</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-[12px] text-grey-600">{entry.retryLabel}</p>
                {changeId && onReconsider ? (
                  <Button
                    size="sm"
                    variant="basic"
                    aria-label={`Reconsider ${entry.title}`}
                    onClick={() => onReconsider(changeId)}
                  >
                    Reconsider
                  </Button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function MemoryPanel({ entries, onReconsider }: MemoryPanelProps) {
  const ruledOut = entries.filter((entry) => entry.verdict === 'ruled-out')
  const working = entries.filter((entry) => entry.verdict === 'working')
  const declined = entries.filter((entry) => entry.verdict === 'declined')

  return (
    <Card data-testid="memory-panel" className="px-6 py-5">
      {entries.length === 0 ? (
        <p data-testid="memory-empty" className="text-[13px] text-ink-muted">
          The loop has not run an experiment yet, so there is nothing to recall.
        </p>
      ) : (
        <div className={`grid gap-8 ${declined.length > 0 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <Group
            testId="memory-group-ruled-out"
            title="Ruled out"
            entries={ruledOut}
            tone="ruled-out"
          />
          <Group
            testId="memory-group-working"
            title="Working / monitoring"
            entries={working}
            tone="working"
          />
          {declined.length > 0 ? (
            <Group
              testId="memory-group-declined"
              title="Declined by you"
              entries={declined}
              tone="declined"
              onReconsider={onReconsider}
            />
          ) : null}
        </div>
      )}
    </Card>
  )
}
