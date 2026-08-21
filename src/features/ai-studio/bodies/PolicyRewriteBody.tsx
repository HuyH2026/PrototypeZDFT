import { ChevronDown } from 'lucide-react'
import {
  AI_STUDIO_ANALYSIS,
  AI_STUDIO_GREETING,
  AI_STUDIO_PLAN,
  AI_STUDIO_SUGGESTIONS,
} from '@/features/ai-agents/editor/ai-studio-data'

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end pt-4">
      <p
        className="max-w-[240px] rounded-2xl px-4 py-3 text-right text-[14px] leading-5 text-white"
        style={{ background: 'linear-gradient(90deg,#01567a,#6dbbd7)' }}
      >
        {text}
      </p>
    </div>
  )
}

function AnalysisReply({ onReview }: { onReview: () => void }) {
  return (
    <div className="flex flex-col gap-4 pb-6 pt-5">
      <div className="flex flex-col gap-1">
        <div className="flex h-6 items-center gap-2">
          <span className="text-[12px] font-medium leading-[18px] text-grey-700">
            {AI_STUDIO_ANALYSIS.thinkingLabel}
          </span>
          <ChevronDown size={16} className="-rotate-90 text-grey-700" aria-hidden />
        </div>
        {AI_STUDIO_ANALYSIS.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-[14px] leading-5 text-ink">
            {paragraph}
          </p>
        ))}
      </div>

      <p className="text-[14px] font-semibold leading-5 text-ink">
        {AI_STUDIO_ANALYSIS.dropOffTitle}
      </p>
      <ul className="list-disc ps-5 text-[14px] leading-5 text-ink">
        {AI_STUDIO_ANALYSIS.dropOff.map((dropOff) => (
          <li key={dropOff.channel}>{`${dropOff.channel}: ${dropOff.rate}`}</li>
        ))}
      </ul>
      <p className="text-[14px] leading-5 text-ink">{AI_STUDIO_ANALYSIS.closing}</p>

      <div className="rounded-xl border border-surface-border p-4">
        <div className="flex items-center gap-2">
          <span className="text-[24px] leading-5" aria-hidden>
            {AI_STUDIO_PLAN.emoji}
          </span>
          <span className="text-[14px] font-semibold leading-5 text-ink">
            {AI_STUDIO_PLAN.title}
          </span>
        </div>
        <p className="mt-3 text-[12px] leading-[18px] text-grey-700">
          {AI_STUDIO_PLAN.planSubtitle}
        </p>
        <button
          type="button"
          onClick={onReview}
          className="mt-4 h-8 w-full rounded-full bg-[#ebf5f7] text-[12px] font-semibold text-ink transition-colors hover:bg-[#dceff2]"
        >
          {AI_STUDIO_PLAN.reviewLabel}
        </button>
      </div>
    </div>
  )
}

export function PolicyRewriteBody({
  request,
  onSuggestion,
  onReview,
}: {
  request: string | null
  onSuggestion: (suggestion: string) => void
  onReview: () => void
}) {
  if (request) {
    return (
      <div>
        <UserBubble text={request} />
        <AnalysisReply onReview={onReview} />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <p className="mt-6 text-[22px] leading-[30px] tracking-[0.352px] text-black">
        {AI_STUDIO_GREETING}
      </p>
      <div className="mt-6 flex flex-col items-start gap-2">
        {AI_STUDIO_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestion(suggestion)}
            className="rounded-2xl border border-surface-border px-3 py-2 text-left text-[14px] leading-5 text-ink transition-colors hover:bg-table-row-hover"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
