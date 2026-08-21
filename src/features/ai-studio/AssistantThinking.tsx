// The live counterpart to the transcript's "Thinking complete ›" disclosure:
// what the studio shows while an answer is on its way. It owns its own clock —
// mounted per pending message and keyed by that message's id — and reports back
// once it has finished, so the conversation view stays a list of messages and
// this file is the only thing in the transcript that knows about time.
//
// Shaped after the side panel's build trace (bodies/DashboardBuilderBody): a
// "Thinking" header over a hairline rail of steps, each one appearing as it
// completes. The two surfaces narrate the same kind of work, so they read the
// same way.
import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { ZendeskLogo } from '@/components/ZendeskLogo'
import type { ThinkingPace } from './thinking-pace'

export function AssistantThinking({
  lines,
  pace,
  onDone,
}: {
  // The reasoning the pending message carries. Empty is normal — a reply with
  // nothing authored behind it gets a single quiet beat instead of a rail of
  // invented steps.
  lines: string[]
  pace: ThinkingPace
  // Called when the block has run its course, and when the reader skips it.
  onDone: () => void
}) {
  const [revealed, setRevealed] = useState(0)

  // One timer at a time: a line, then the next, then the tail before the answer.
  // Depending on the numbers rather than the pace object keeps a caller that
  // rebuilds its pace inline from restarting the pending beat.
  useEffect(() => {
    if (lines.length === 0) {
      const timer = setTimeout(onDone, pace.quietMs)
      return () => clearTimeout(timer)
    }
    if (revealed < lines.length) {
      const timer = setTimeout(() => setRevealed((n) => n + 1), pace.lineMs)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(onDone, pace.tailMs)
    return () => clearTimeout(timer)
  }, [revealed, lines.length, pace.lineMs, pace.tailMs, pace.quietMs, onDone])

  return (
    <div data-testid="assistant-thinking" role="status" className="flex flex-col">
      {/* Clicking through is the way out for a reader who does not want to watch
          the reasoning — the answer is the point, and this is a mock of the work
          rather than the work. Kept to a title, not a visible "Skip": a control
          competing with the thinking would undercut it. */}
      <button
        type="button"
        onClick={onDone}
        title="Show the answer now"
        className="flex w-fit items-center gap-2 py-2 text-[14px] font-medium leading-5 text-[#727583]"
      >
        <ZendeskLogo size={18} className="text-[#01567a]" />
        <span className="animate-thinking-sweep">Thinking</span>
      </button>

      {revealed > 0 && (
        <ol className="ms-[3px] flex flex-col">
          {lines.slice(0, revealed).map((line, index) => (
            <li key={line} className="flex flex-col">
              {/* The rail the panel's build trace draws, centred under the check. */}
              {index > 0 && <span aria-hidden className="ms-[4px] h-1.5 w-px bg-surface-border" />}
              <span className="flex items-start gap-2 text-[13px] leading-5 text-grey-700 animate-fade-in">
                <Check size={14} className="mt-0.5 shrink-0 text-grey-500" aria-hidden />
                {line}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
