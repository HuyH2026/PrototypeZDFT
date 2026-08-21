// AI Studio assistant docked in the policy editor (Figma 1886:75614 / 1886:76004).
//
// This panel does NOT use the shared `AiStudioShell`. The shell is the
// prototype's copilot panel — 15px semibold title beside a sparkle, a hairline
// under the header, a peach pill composer, a "Powered by AI" notice — and every
// one of those differs here: an 18px regular title, three actions (open / dock /
// close), a two-line teal composer, no notice, and a translucent card with a
// warm glow behind the conversation. Rather than fork the shared shell with a
// variant flag per difference (and change how it renders on Home, Insights and
// Manage agents), the editor's panel owns its own chrome.
//
// Behaviour is a frontend-only mock: the composer opens holding the design's
// prefilled request, and sending anything posts the user's message plus a canned
// analysis that ends in an "Improvement plan" card. The card's "Review plan"
// opens the full-view takeover, which the parent owns.
import { useState } from 'react'
import { ChevronDown, ExternalLink, PanelBottom, Plus, Send, X } from 'lucide-react'
import {
  AI_STUDIO_GREETING,
  AI_STUDIO_SUGGESTIONS,
  AI_STUDIO_REWRITE_PROMPT,
  AI_STUDIO_ANALYSIS,
  AI_STUDIO_PLAN,
} from './ai-studio-data'
import { EDITOR_PANEL_W } from './editor-data'

// 26.5px hit target on a 16px glyph, per the design's header buttons.
function HeaderAction({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-[26.5px] items-center justify-center rounded-[3.5px] text-ink transition-colors duration-instant ease-soft hover:bg-control-hover"
    >
      {children}
    </button>
  )
}

// A right-aligned gradient user bubble (Figma 1886:76104).
function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end pt-[16px]">
      <p
        className="max-w-[222px] rounded-2xl px-4 py-3.5 text-right text-[14px] leading-5 tracking-[-0.1px] text-white"
        style={{ background: 'linear-gradient(90deg,#01567a,#6dbbd7)' }}
      >
        {text}
      </p>
    </div>
  )
}

// The canned analysis reply + improvement-plan card (Figma 1886:76106 / 76117).
function AnalysisReply({ onReview }: { onReview: () => void }) {
  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex flex-col gap-1">
        <div className="flex h-6 items-center gap-2">
          <span className="text-[12px] font-medium leading-[18px] tracking-[-0.1px] text-grey-700">
            {AI_STUDIO_ANALYSIS.thinkingLabel}
          </span>
          <ChevronDown size={16} className="-rotate-90 text-grey-700" aria-hidden />
        </div>
        {AI_STUDIO_ANALYSIS.paragraphs.map((p, i) => (
          <p key={i} className="text-[14px] leading-5 tracking-[-0.1px] text-[#202121]">
            {p}
          </p>
        ))}
      </div>

      <p className="text-[14px] font-semibold leading-5 tracking-[-0.1px] text-black">
        {AI_STUDIO_ANALYSIS.dropOffTitle}
      </p>
      <ul className="list-disc ps-[21px] text-[14px] leading-5 tracking-[-0.1px] text-black">
        {AI_STUDIO_ANALYSIS.dropOff.map((d) => (
          <li key={d.channel}>{`${d.channel}: ${d.rate}`}</li>
        ))}
      </ul>
      <p className="text-[14px] leading-5 tracking-[-0.1px] text-black">
        {AI_STUDIO_ANALYSIS.closing}
      </p>

      {/* Improvement plan card with a full-width "Review plan" pill */}
      <div className="rounded-xl border border-[#e4e7f0] p-[15px]">
        <div className="flex items-center gap-2">
          <span className="text-[24px] leading-5" aria-hidden>
            {AI_STUDIO_PLAN.emoji}
          </span>
          <span className="text-[14px] font-semibold leading-5 tracking-[-0.1px] text-black">
            {AI_STUDIO_PLAN.title}
          </span>
        </div>
        <p className="mt-[14px] text-[12px] leading-[18px] tracking-[-0.1px] text-grey-700">
          {AI_STUDIO_PLAN.planSubtitle}
        </p>
        <button
          type="button"
          onClick={onReview}
          className="mt-[16px] h-[25px] w-full rounded-[20px] bg-[#ebf5f7] text-[9.6px] font-semibold text-[#313131]"
        >
          {AI_STUDIO_PLAN.reviewLabel}
        </button>
      </div>
    </div>
  )
}

export function AiStudioEditorPanel({
  onClose,
  onReview,
}: {
  onClose: () => void
  onReview: () => void
}) {
  const [submitted, setSubmitted] = useState(false)
  const [prompt, setPrompt] = useState('')
  // The panel opens with the design's request already typed, so the primary
  // action is to send it rather than to compose from nothing.
  const [composer, setComposer] = useState(AI_STUDIO_REWRITE_PROMPT)

  const submit = () => {
    const text = composer.trim()
    if (!text) return
    setPrompt(text)
    setComposer('')
    setSubmitted(true)
  }

  return (
    <aside
      data-testid="ai-studio-editor-panel"
      style={{ width: EDITOR_PANEL_W }}
      className="relative me-[72px] flex shrink-0 flex-col overflow-hidden rounded-3xl border border-[#f2f4f7] bg-white/80 shadow-[0px_0px_15px_0px_rgba(0,0,0,0.04)]"
    >
      {/* The warm glow that sits behind the conversation, bleeding off the card's
          bottom-left corner (Figma "Gradient [Flora]"). */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-288px] left-1/2 size-[676px] -translate-x-1/2 opacity-70"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,196,163,0.55) 0%, rgba(255,222,205,0.32) 38%, rgba(255,255,255,0) 68%)',
        }}
      />

      <div className="relative flex h-full flex-col px-10">
        {/* Header: title + open-in-new-tab / dock / close. No hairline in the
            design — the glass card separates itself from the content beside it. */}
        <div className="flex items-center justify-between pt-5">
          <p className="text-[18px] leading-6 tracking-[-0.45px] text-black">AI Studio</p>
          <div className="flex items-center gap-2">
            <HeaderAction label="Open in new tab" onClick={submitted ? onReview : undefined}>
              <ExternalLink size={16} aria-hidden />
            </HeaderAction>
            <HeaderAction label="Dock to bottom">
              <PanelBottom size={16} aria-hidden />
            </HeaderAction>
            <HeaderAction label="Close AI Studio" onClick={onClose}>
              <X size={16} aria-hidden />
            </HeaderAction>
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto">
          {!submitted ? (
            <div className="flex h-full flex-col">
              <p className="mt-[192px] text-center text-[24px] leading-[30px] tracking-[-0.1px] text-black">
                {AI_STUDIO_GREETING}
              </p>
              <div className="mt-auto flex flex-col items-start gap-2 pb-4">
                {AI_STUDIO_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setComposer(s === AI_STUDIO_SUGGESTIONS[1] ? AI_STUDIO_REWRITE_PROMPT : s)
                    }
                    className="rounded-[25px] border border-[#d2d9e5] px-2.5 py-2 text-[12px] font-medium leading-[18px] tracking-[-0.1px] text-[#01567a]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-6">
              <UserBubble text={prompt || AI_STUDIO_REWRITE_PROMPT} />
              <AnalysisReply onReview={onReview} />
            </div>
          )}
        </div>

        {/* Composer: a two-line box rather than a single-line pill, so the
            prefilled request reads in full the way the design shows it. */}
        <div className="flex min-h-[60px] items-center gap-1 rounded-2xl border border-[#01567a] bg-white py-[6px] px-[7px] shadow-[0px_0px_1px_0px_rgba(0,12,32,0.04),0px_2px_6px_0px_rgba(3,17,38,0.11)] mb-[18px]">
          <button
            type="button"
            aria-label="Add attachment"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-black transition-colors hover:bg-[#f5f6f7]"
          >
            <Plus size={16} aria-hidden />
          </button>
          <textarea
            aria-label="Message AI Studio"
            rows={2}
            value={composer}
            placeholder="What can I help you with today?"
            onChange={(e) => setComposer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            className="min-w-0 flex-1 resize-none bg-transparent py-[3px] text-[14px] leading-5 tracking-[-0.1px] text-black outline-none placeholder:text-grey-700"
          />
          <button
            type="button"
            aria-label="Send message"
            onClick={submit}
            className="flex size-7 shrink-0 items-center justify-center rounded text-[#01567a] transition-opacity duration-instant ease-soft hover:opacity-80"
          >
            <Send size={16} aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  )
}
