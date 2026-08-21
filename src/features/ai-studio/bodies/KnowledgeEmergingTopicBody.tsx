import { TrendingUp } from 'lucide-react'
import {
  addCancellationSection,
  useKnowledgeSectionStatus,
} from '@/features/ai-agents/knowledge/knowledge-section-request-store'

const SELECTED_TOPIC = 'Will I pay tolls or surcharges?'

// The scripted AI Studio result for the Content Snippet selection in Figma
// 1:4278. This is intentionally content-focused: it uses the shared panel
// shell and presents the designed copy without introducing another assistant
// layout or a backend dependency.
export function KnowledgeEmergingTopicBody() {
  const sectionStatus = useKnowledgeSectionStatus()
  const sectionAdded = sectionStatus !== 'idle'

  return (
    <div className="flex flex-col gap-4 py-5 text-[13px] leading-[18px] text-ink">
      <div className="ml-8 rounded-2xl bg-[#e8f4f8] px-3 py-2.5 text-right">
        Show me details for the detected emerging topic related to “{SELECTED_TOPIC}”
      </div>

      <p className="text-[11px] leading-4 text-grey-700">Thinking complete ›</p>

      <p>
        Found the most related topic trending in tickets right now — here&apos;s how it connects to
        what you selected.
      </p>

      <section
        aria-label="Emerging topic result"
        className="rounded-2xl border border-surface-border bg-white p-3 shadow-sm"
      >
        <div className="flex items-center gap-1 text-[11px] font-semibold text-ink">
          <TrendingUp size={12} className="text-[#b2527c]" aria-hidden />
          Emerging Topic
        </div>
        <p className="mt-2 text-[11px] text-grey-700">Related to your selection</p>
        <blockquote className="mt-1.5 rounded-md bg-[#f5f6f7] px-2 py-1.5 text-[11px] text-grey-700">
          “{SELECTED_TOPIC}”
        </blockquote>

        <h2 className="mt-3 text-[13px] leading-[18px] font-semibold text-ink">
          Toll charge after canceled ride
        </h2>
        <div className="mt-1 flex items-end gap-2">
          <strong className="text-[22px] leading-6 font-semibold text-ink">41</strong>
          <svg
            aria-label="Rising ticket trend"
            role="img"
            viewBox="0 0 92 24"
            className="mb-0.5 h-5 flex-1 text-[#3d8f88]"
          >
            <path
              d="M1 19L9 16L16 18L23 11L30 14L37 8L44 13L51 7L58 10L65 5L72 9L80 4L91 2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="91" cy="2" r="2" fill="currentColor" />
          </svg>
        </div>
        <p className="mt-1 text-[11px] text-grey-700">
          41 tickets/wk · <span className="font-semibold text-[#b2527c]">+340%</span> vs. last week
        </p>

        <p className="mt-3 text-[12px] leading-[17px] text-grey-800">
          Directly overlaps your selection — customers ask this right after reading the surcharge
          breakdown, but cancellations aren&apos;t covered here.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={sectionAdded}
          className={`rounded-full border px-3 py-1.5 text-[11px] font-medium ${
            sectionAdded
              ? 'border-transparent bg-[#3d7890] text-white'
              : 'border-surface-border text-ink hover:bg-control-hover'
          }`}
          onClick={addCancellationSection}
        >
          Add section to content snippet
        </button>
        <button
          type="button"
          className="rounded-full border border-surface-border px-3 py-1.5 text-[11px] font-medium text-ink hover:bg-control-hover"
        >
          Review tickets
        </button>
      </div>

      {sectionAdded ? (
        <div className="space-y-2">
          <p className="text-[11px] leading-4 text-grey-700">Thinking complete ›</p>
          <p>
            Done — added the cancellation section based on the 41 tickets/wk trend. It&apos;s
            highlighted in the draft; let me know if you want it moved or rewritten.
          </p>
        </div>
      ) : null}
    </div>
  )
}
