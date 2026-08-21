// What the preview shows inside the widget frame, one body per rail section that
// has a designed preview: the sample conversation, the CSAT survey, the
// knowledge-source prompt, and the quick replies the embed frame shows.
//
// All static mock content — the copy lives in PREVIEW_COPY (config-data).
import { Asterisk, Cloud, Network, ShoppingBag, Star } from 'lucide-react'
import { CSAT_STYLES, PREVIEW_COPY, type CsatConfig, type CsatStyle } from './config-data'
import { PreviewHint } from './PreviewFrame'

const GOLD = '#f5c518'

function AgentBubble({ mark, children }: { mark: string; children: string }) {
  return (
    <div className="flex max-w-[85%] items-end gap-2 self-start">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-black text-[9px] font-semibold text-white">
        {mark}
      </span>
      <p className="rounded-2xl bg-app-backdrop px-3 py-2 text-[13px] text-ink">{children}</p>
    </div>
  )
}

function UserBubble({ color, children }: { color: string; children: string }) {
  return (
    <p
      data-slot="widget-preview-user-message"
      className="max-w-[85%] self-end rounded-2xl px-3 py-2 text-[13px] text-white"
      style={{ backgroundColor: color }}
    >
      {children}
    </p>
  )
}

/** The default conversation: what the Widget segments and Sentiment sections show. */
export function ChatPreviewBody({ mark, accent }: { mark: string; accent: string }) {
  const c = PREVIEW_COPY.chat
  return (
    <div className="flex flex-1 flex-col gap-3">
      <PreviewHint>{c.hint}</PreviewHint>
      <div className="mt-6 flex flex-col gap-3">
        <AgentBubble mark={mark}>{c.agent}</AgentBubble>
        <UserBubble color={accent}>{c.user}</UserBubble>
      </div>
    </div>
  )
}

/** One mark on the survey's scale, drawn the way the chosen style draws it. */
function ScaleMark({ style, filled }: { style: CsatStyle; filled: boolean }) {
  // Stars get lucide's outline star when unfilled, which is what the frame
  // shows; the other styles fade instead — an emoji has no outline form.
  if (style.id === 'stars') {
    return (
      <Star
        size={30}
        aria-hidden
        style={{ color: filled ? GOLD : '#d2d3d8', fill: filled ? GOLD : 'transparent' }}
      />
    )
  }
  if (style.kind === 'outline')
    return <span className="text-[26px] leading-none opacity-70">☺</span>
  if (style.kind === 'numeral') {
    return (
      <span className={`text-[22px] font-medium ${filled ? 'text-black' : 'text-grey-400'}`}>
        {style.value}
      </span>
    )
  }
  return (
    <span className={`text-[26px] leading-none ${filled ? '' : 'opacity-30'}`} aria-hidden>
      {style.value}
    </span>
  )
}

/** The slice of either CSAT config (widget's or voice's) the preview draws. */
type CsatPreviewData = Pick<CsatConfig, 'style' | 'question' | 'steps'>

/** The Mood section's preview: the survey as the customer sees it. */
export function CsatPreviewBody({ csat }: { csat: CsatPreviewData }) {
  const c = PREVIEW_COPY.csat
  const style = CSAT_STYLES.find((s) => s.id === csat.style) ?? CSAT_STYLES[0]
  // The frame previews a mid-scale answer, which is what brings up the
  // follow-up question below.
  const answered = 4

  return (
    <div className="flex flex-1 flex-col">
      <PreviewHint>{c.hint}</PreviewHint>
      <p className="mt-6 text-center text-[13px] text-grey-500">{c.resolution}</p>

      <p className="mt-6 text-center text-[14px] leading-5 text-black">{csat.question}</p>
      <div className="mt-4 flex items-start justify-center gap-3">
        {csat.steps.map((step) => (
          <div key={step.value} className="flex w-[54px] flex-col items-center gap-1">
            <ScaleMark style={style} filled={step.value <= answered} />
            <span className="text-[12px] leading-4 text-grey-500">{step.label}</span>
          </div>
        ))}
      </div>

      <hr className="my-5 border-t border-grey-200" />

      <p className="text-center text-[13px] leading-5 text-ink">{c.followUpLead}</p>
      <p className="text-center text-[13px] leading-5 text-ink">{c.followUpAsk}</p>
      <div className="mt-3 flex justify-center gap-3">
        {c.followUpOptions.map((option) => (
          <span
            key={option}
            className="rounded-full border border-grey-400 px-3 py-1.5 text-[13px] text-ink"
          >
            {option}
          </span>
        ))}
      </div>
      <div className="mt-5 rounded-full bg-black py-2.5 text-center text-[13px] font-medium text-white">
        {c.submit}
      </div>
    </div>
  )
}

/** The Knowledge section's preview: the sources the AI can be pointed at. */
export function KnowledgePreviewBody() {
  const c = PREVIEW_COPY.knowledge
  return (
    <div className="flex flex-1 flex-col">
      {/* Decorative: vendor stand-ins scattered as the frame shows them. */}
      <div aria-hidden className="relative h-[140px]">
        <SourceBubble className="left-[22px] top-[14px]">
          <Cloud size={17} style={{ color: '#00a1e0' }} />
        </SourceBubble>
        <SourceBubble className="left-[110px] top-[52px]">
          <ShoppingBag size={16} style={{ color: '#95bf47' }} />
        </SourceBubble>
        <SourceBubble className="left-[168px] top-0">
          <Network size={17} style={{ color: '#2684ff' }} />
        </SourceBubble>
        <SourceBubble className="left-[272px] top-[46px]">
          <Asterisk size={16} style={{ color: '#29b5e8' }} />
        </SourceBubble>
      </div>
      <div className="flex flex-col gap-4 px-2">
        <PreviewHint>{c.hintLead}</PreviewHint>
        <PreviewHint>{c.hintTail}</PreviewHint>
      </div>
    </div>
  )
}

function SourceBubble({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={`absolute flex size-9 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_0_rgba(3,17,38,0.10)] ${className}`}
    >
      {children}
    </span>
  )
}

/** The Embed section's preview: the widget answering with quick replies. */
export function QuickRepliesPreviewBody({ mark, accent }: { mark: string; accent: string }) {
  const c = PREVIEW_COPY.quickReplies
  return (
    <div className="flex flex-1 flex-col justify-end gap-3">
      <AgentBubble mark={mark}>{c.agent}</AgentBubble>
      <div className="flex justify-end gap-3">
        {c.options.map((option) => (
          <span
            key={option}
            className="rounded-full border border-grey-400 px-3 py-1.5 text-[13px] text-ink"
          >
            {option}
          </span>
        ))}
      </div>
      <UserBubble color={accent}>{c.user}</UserBubble>
    </div>
  )
}
