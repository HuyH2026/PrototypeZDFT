import { Check, MessageSquareText, Shield } from 'lucide-react'
import { Card } from '@/components/flora/Card'
import { MemoryPanel } from './MemoryPanel'
import type { MemoryEntry } from './pipeline-data'

const ACCEPTED_PATTERNS = [
  'Ask one concise clarification question before falling back on Widget.',
  'Use a single-sentence opening on Voice before presenting routing choices.',
]

const LEARNED_CONSTRAINTS = [
  'Never trade below the 4.17 AI-interaction CSAT floor.',
  'Any new API call still requires a human review.',
]

export function AccountMemoryView({
  entries,
  guidanceEntries,
  onReconsider,
}: {
  entries: MemoryEntry[]
  guidanceEntries: string[]
  onReconsider?: (changeId: string) => void
}) {
  const declinedConstraints = entries
    .filter((entry) => entry.verdict === 'declined')
    .map(
      (entry) =>
        `Do not pursue “${entry.title}” for ${entry.agentName} unless you revisit the decision.`,
    )
  const learnedConstraints = [...new Set([...LEARNED_CONSTRAINTS, ...declinedConstraints])]

  return (
    <div data-testid="account-memory-view" className="flex flex-col gap-5">
      <div>
        <h2 className="text-[18px] font-semibold text-ink">Account memory</h2>
        <p className="mt-1 text-[13px] text-ink-muted">
          What the loop has learned, what you told it, and what it will not repeat.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <Check className="size-4 text-[#5b8e3e]" aria-hidden />
            Accepted patterns
          </h3>
          <ul className="mt-3 flex flex-col gap-3">
            {ACCEPTED_PATTERNS.map((pattern) => (
              <li key={pattern} className="text-[12px] leading-5 text-ink-muted">
                {pattern}
              </li>
            ))}
          </ul>
        </Card>

        <Card data-testid="learned-constraints-card" className="p-5">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <Shield className="size-4 text-[#406cc4]" aria-hidden />
            Learned constraints
          </h3>
          <ul className="mt-3 flex flex-col gap-3">
            {learnedConstraints.map((constraint) => (
              <li key={constraint} className="text-[12px] leading-5 text-ink-muted">
                {constraint}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <MessageSquareText className="size-4 text-[#7556a8]" aria-hidden />
            Your guidance
          </h3>
          {guidanceEntries.length === 0 ? (
            <p className="mt-3 text-[12px] leading-5 text-ink-muted">
              Add guidance from Outcomes and it will appear here for the next pass.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {guidanceEntries.map((guidance) => (
                <li
                  key={guidance}
                  className="rounded-xl bg-[#f7f4fb] px-3 py-2 text-[12px] leading-5 text-[#59446d]"
                >
                  “{guidance}”
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <MemoryPanel entries={entries} onReconsider={onReconsider} />
    </div>
  )
}
