// Full-page AI Studio conversation view, populated from a seeded
// AiConversationSeed (chart + analysis handed off from a deterministic
// source, e.g. the AI Performances investigation workspace). Renders inside
// the shared AiStudioFrame chrome. Presentational mock — there is no
// backend/LLM in this app, so composer free-text always gets the same canned
// acknowledgement; recommendation chips can resolve to a scripted reply via
// the seed's `responses` map, letting a conversation go multiple rounds deep.
// Rendered by AiAssistantHost for `mode === 'full'` when the active context
// carries a conversation seed.
//
// The transcript is authored but it does not arrive at once: it plays in at the
// pace in thinking-pace.ts, with a live AssistantThinking block standing in for
// the work behind each assistant turn.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronRight, GitBranch, Mic, Plus } from 'lucide-react'
import { ZendeskLogo } from '@/components/ZendeskLogo'
import { MetricChart } from '@/components/MetricChart'
import { AiStudioFrame, COMPOSER_EDGE } from './AiStudioFrame'
import type { StudioFlowScope } from './ai-studio-landing-data'
import { AssistantThinking } from './AssistantThinking'
import { DEFAULT_PACE, isPaced, type ThinkingPace } from './thinking-pace'
import type {
  AiAttachmentAction,
  AiConversationSeed,
  AiFollowUp,
  AiMessage,
} from './ai-context-registry'

const CANNED_REPLY = "Thanks — I'll factor that in. This is a preview build, so I can't go deeper yet."

// "Thinking complete ›" — the frames draw it collapsed above an assistant
// message, so the reasoning is available without being in the way.
function ThinkingDisclosure({ lines }: { lines: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 py-2 text-[14px] font-medium leading-5 text-[#727583]"
      >
        Thinking complete
        <ChevronRight size={18} className={open ? 'rotate-90' : undefined} aria-hidden />
      </button>
      {open && (
        <ul className="flex list-disc flex-col gap-1 ps-5 text-[13px] leading-5 text-grey-700">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AttachmentCard({
  attachment,
  onAction,
}: {
  attachment: NonNullable<AiMessage['attachments']>[number]
  onAction?: (action: AiAttachmentAction) => void
}) {
  if (attachment.type === 'plan') {
    return (
      <div className="mt-3 flex items-center gap-4 rounded-xl border border-[#acbdd5] px-4 py-4">
        <ZendeskLogo size={32} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[14px] font-semibold leading-5 text-ink">{attachment.title}</span>
          <span className="text-[12px] leading-[18px] text-grey-700">{attachment.subtitle}</span>
        </div>
        <button
          type="button"
          onClick={() => onAction?.({ kind: 'review-plan' })}
          className="shrink-0 rounded-[20px] bg-[#ebf5f7] px-4 py-1.5 text-[14px] font-semibold tracking-[-0.1px] text-ink transition-opacity hover:opacity-90"
        >
          {attachment.actionLabel}
        </button>
      </div>
    )
  }
  if (attachment.type === 'agent-created') {
    return (
      <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[#acbdd5] px-4 py-4">
        <div className="flex items-center gap-3">
          <ZendeskLogo size={32} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] font-semibold leading-5 text-ink">{attachment.agentName}</span>
            <span className="text-[12px] leading-[18px] text-grey-700">{attachment.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAction?.({ kind: 'open-agent', agentId: attachment.agentId })}
            className="rounded-[20px] bg-[#ebf5f7] px-4 py-1.5 text-[14px] font-semibold text-ink transition-opacity hover:opacity-90"
          >
            {attachment.openLabel}
          </button>
          <button
            type="button"
            onClick={() => onAction?.({ kind: 'run-test' })}
            className="rounded-[20px] border border-grey-200 px-4 py-1.5 text-[14px] font-semibold text-[#01567a] transition-colors hover:bg-white"
          >
            {attachment.testLabel}
          </button>
        </div>
      </div>
    )
  }
  if (attachment.type === 'improvement-active') {
    return (
      <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[#acbdd5] px-4 py-4">
        <div className="flex items-center gap-3">
          <ZendeskLogo size={32} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] font-semibold leading-5 text-ink">
              {attachment.agentName}
            </span>
            <span className="text-[12px] leading-[18px] text-grey-700">{attachment.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAction?.({ kind: 'view-improvement-plan' })}
            className="rounded-[20px] bg-[#ebf5f7] px-4 py-1.5 text-[14px] font-semibold text-ink transition-opacity hover:opacity-90"
          >
            {attachment.viewLabel}
          </button>
          <button
            type="button"
            onClick={() => onAction?.({ kind: 'open-agent', agentId: attachment.agentId })}
            className="rounded-[20px] border border-grey-200 px-4 py-1.5 text-[14px] font-semibold text-[#01567a] transition-colors hover:bg-white"
          >
            {attachment.openLabel}
          </button>
        </div>
      </div>
    )
  }
  if (attachment.type === 'chart') {
    return (
      <div className="mt-3 rounded-xl bg-white p-3">
        <p className="text-[13px] font-semibold text-ink">{attachment.title}</p>
        <div className="mt-2">
          <MetricChart series={attachment.series} color={attachment.color} />
        </div>
        {(attachment.annotation || attachment.peak) && (
          <div className="mt-2 flex items-center justify-between text-[12px] text-ink-muted">
            <span>{attachment.annotation}</span>
            <span>{attachment.peak}</span>
          </div>
        )}
      </div>
    )
  }
  if (attachment.type === 'list') {
    return (
      <div className="mt-3 rounded-xl bg-white p-3">
        <p className="text-[13px] font-semibold text-ink">{attachment.title}</p>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-[13px] leading-5 text-ink">
          {attachment.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        {attachment.footnote && <p className="mt-2 text-[12px] text-ink-muted">{attachment.footnote}</p>}
      </div>
    )
  }
  if (attachment.type === 'actions') {
    return (
      <div className="mt-3 rounded-xl bg-white p-3">
        <p className="text-[13px] font-semibold text-ink">{attachment.title}</p>
        <div className="mt-2 flex flex-col gap-1.5">
          {attachment.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3 text-[13px]">
              <span className="text-ink">{item.text}</span>
              <span className="shrink-0 rounded-full bg-[#f5f6f7] px-2.5 py-1 text-[12px] font-medium text-ink-muted">{item.tag}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="mt-3 rounded-xl bg-white p-3">
      <p className="text-[13px] font-semibold text-ink">{attachment.title}</p>
      <div className="mt-2 flex flex-col gap-1.5">
        {attachment.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-ink">{row.label}</span>
            <span className="text-ink-muted">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Bubble({
  message,
  onBranch,
  onAction,
}: {
  message: AiMessage
  onBranch: (message: AiMessage) => void
  onAction?: (action: AiAttachmentAction) => void
}) {
  // Every bubble now arrives on its own (see the reveal engine below), so the
  // entrance is per message rather than per screen.
  if (message.role === 'user') {
    return (
      <div className="flex animate-rise-in justify-end">
        <div className="max-w-[70%] rounded-2xl bg-nav-active px-4 py-3 text-[14px] leading-5 text-white">
          <p className="whitespace-pre-line">{message.text}</p>
        </div>
      </div>
    )
  }
  // Assistant messages are prose, not a bubble: at this length a 70% grey block
  // reads as a quote rather than as the assistant talking (Figma 1:183739).
  return (
    <div className="group relative w-full animate-rise-in">
      {message.thinking && <ThinkingDisclosure lines={message.thinking} />}
      <p className="whitespace-pre-line pe-8 text-[16px] leading-6 text-ink">{message.text}</p>
      <button
        type="button"
        aria-label="Branch off in new chat"
        onClick={() => onBranch(message)}
        className="absolute right-0 top-0 flex size-6 items-center justify-center rounded-full text-[#5c6970] opacity-0 transition-opacity hover:bg-[#f5f6f7] focus-visible:opacity-100 group-hover:opacity-100"
      >
        <GitBranch size={14} />
      </button>
      {message.attachments?.map((att, i) => (
        <AttachmentCard key={i} attachment={att} onAction={onAction} />
      ))}
    </div>
  )
}

export function AiStudioConversation({
  onClose,
  onNewConversation,
  onBranch,
  conversation,
  panel,
  extraMessages,
  composerValue,
  onComposerChange,
  onUserMessage,
  onAttachmentAction,
  onStartFlow,
  pace = DEFAULT_PACE,
}: {
  onClose: () => void
  onNewConversation: () => void
  onBranch: (seed: AiConversationSeed) => void
  // Forwarded to the frame's sidebar, so a flow can be started from inside a
  // transcript rather than only from the blank-slate landing.
  onStartFlow?: (scope: StudioFlowScope) => void
  conversation: AiConversationSeed
  panel?: ReactNode
  // Owner-appended messages. They always sit at the end of the transcript, which
  // is where both of the ones we post belong: the created agent, and the
  // activated self-improving plan.
  extraMessages?: AiMessage[]
  composerValue?: string
  onComposerChange?: (value: string) => void
  // A scripted reply for a sent message. Returning undefined keeps the canned
  // acknowledgement, so every other conversation behaves exactly as before.
  onUserMessage?: (text: string) => AiFollowUp | undefined
  onAttachmentAction?: (action: AiAttachmentAction) => void
  // How fast the transcript plays in. Defaults to the app's live pace, and to no
  // pacing at all under test — see thinking-pace.
  pace?: ThinkingPace
}) {
  const [messages, setMessages] = useState<AiMessage[]>(conversation.messages)
  const [ownComposer, setOwnComposer] = useState('')
  const [nextId, setNextId] = useState(0)
  // How much of the transcript has arrived. The opening turn is on screen from
  // the first frame when it is the user's — it stands for the request that
  // opened the studio, and pacing someone's own words back at them reads as lag.
  const [arrived, setArrived] = useState(() =>
    conversation.messages[0]?.role === 'user' ? 1 : 0,
  )
  // Reply side effects, held by message id until that message lands (see below).
  const revealEffects = useRef(new Map<string, () => void>())
  const bodyRef = useRef<HTMLDivElement | null>(null)

  const controlled = onComposerChange !== undefined
  const composer = controlled ? (composerValue ?? '') : ownComposer
  const setComposer = (value: string) => (controlled ? onComposerChange?.(value) : setOwnComposer(value))

  const staged = isPaced(pace)
  const visibleCount = staged ? Math.min(arrived, messages.length) : messages.length
  // The next scripted message, still to arrive. Its role decides how: a user turn
  // waits out a beat below, an assistant turn waits for its thinking block.
  const pending = visibleCount < messages.length ? messages[visibleCount] : undefined
  // Owner-appended messages sit at the end of the transcript, so they wait for
  // the script to finish arriving. Their own pacing belongs to the owner — the
  // plan flow posts its created-agent card when its build trace ends, and that
  // trace has just spent 2.4s narrating, so the card lands without a further beat.
  const visible = pending
    ? messages.slice(0, visibleCount)
    : [...messages, ...(extraMessages ?? [])]
  const lastMessage = visible[visible.length - 1]
  // Chips belong to the end of the conversation, so they wait for it: offering a
  // follow-up while the assistant is still answering invites a second question
  // over the top of the first.
  const activeRecommendations =
    !pending && lastMessage?.role === 'assistant' ? lastMessage.recommendations ?? [] : []

  const advance = useCallback(() => setArrived((n) => n + 1), [])

  // A user turn is not thought about: it lands after a typing beat. Only a
  // scripted one ever gets here — the user's own is revealed by the send itself.
  useEffect(() => {
    if (!pending || pending.role !== 'user') return
    const timer = setTimeout(advance, pace.userTurnMs)
    return () => clearTimeout(timer)
  }, [pending, pace.userTurnMs, advance])

  // Fire a reply's side effects the moment it is on screen, wherever the reveal
  // came from — its own thinking block finishing, or a send that fast-forwarded
  // past it. Keyed by id and consumed once, so a rerender cannot repeat them.
  useEffect(() => {
    for (const message of messages.slice(0, visibleCount)) {
      const effect = revealEffects.current.get(message.id)
      if (!effect) continue
      revealEffects.current.delete(message.id)
      effect()
    }
  }, [messages, visibleCount])

  // Keep the newest turn in view as the transcript plays in; a reply that lands
  // below the fold is a reply the reader never sees arrive.
  useEffect(() => {
    const body = bodyRef.current
    if (body) body.scrollTop = body.scrollHeight
  }, [visibleCount, messages.length, extraMessages?.length])

  function branchFrom(message: AiMessage) {
    onBranch({
      title: `Branch: ${conversation.title}`,
      messages: [{ ...message, id: 'seed-assistant' }],
      responses: conversation.responses,
    })
  }

  function appendExchange(userText: string, reply: AiFollowUp) {
    const userId = `runtime-${nextId}`
    const replyId = `runtime-${nextId + 1}`
    setNextId((n) => n + 2)
    if (reply.onReveal) revealEffects.current.set(replyId, reply.onReveal)
    setMessages((prev) => [
      ...prev,
      { id: userId, role: 'user', text: userText },
      {
        id: replyId,
        role: 'assistant',
        text: reply.text,
        thinking: reply.thinking,
        attachments: reply.attachments,
        recommendations: reply.recommendations,
      },
    ])
    // Asking interrupts the playback: whatever was still arriving is shown at
    // once, and the user's own words with it. A bubble that queued behind the
    // previous answer would read as a dropped keystroke rather than as an
    // assistant taking its time.
    setArrived(messages.length + 1)
  }

  function handleRecommendationClick(label: string) {
    appendExchange(label, conversation.responses?.[label] ?? { text: CANNED_REPLY })
  }

  function handleSend() {
    const trimmed = composer.trim()
    if (!trimmed) return
    appendExchange(trimmed, onUserMessage?.(trimmed) ?? { text: CANNED_REPLY })
    setComposer('')
  }

  return (
    <AiStudioFrame
      onClose={onClose}
      onNewConversation={onNewConversation}
      onStartFlow={onStartFlow}
      activeHistoryTitle={conversation.title}
      panel={panel}
    >
      <div
        data-testid="ai-studio-conversation-body"
        ref={bodyRef}
        // min-h-0 pairs with the frame's bounded column: the transcript is the
        // scroller, so it has to be allowed to shrink rather than push the
        // composer and the shortcut hint under the dialog's edge.
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-2"
      >
        {visible.map((m) => (
          <Bubble key={m.id} message={m} onBranch={branchFrom} onAction={onAttachmentAction} />
        ))}

        {/* Keyed by the message it is thinking about, so consecutive assistant
            turns each get their own clock rather than inheriting a spent one. */}
        {pending?.role === 'assistant' && (
          <AssistantThinking
            key={pending.id}
            lines={pending.thinking ?? []}
            pace={pace}
            onDone={advance}
          />
        )}

        {activeRecommendations.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-1">
            {activeRecommendations.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => handleRecommendationClick(label)}
                className="rounded-full border border-surface-border px-3.5 py-1.5 text-[13px] font-medium text-ink hover:bg-[rgba(92,105,112,0.08)]"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Composer. Sits on the same gradient hairline as the landing's — it is
          the same control one step later in the flow (see COMPOSER_EDGE). */}
      <div
        className="mt-4 rounded-full p-px shadow-[0px_0px_1px_0px_rgba(0,12,32,0.04),0px_2px_6px_0px_rgba(3,17,38,0.11)]"
        style={{ background: COMPOSER_EDGE }}
      >
        <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3.5">
          <button
            type="button"
            aria-label="Add attachment"
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-black transition-colors hover:bg-[#f5f6f7]"
          >
            <Plus size={18} />
          </button>
          <input
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="What can I help you with today?"
            className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-grey-700"
          />
          <button
            type="button"
            aria-label="Dictate"
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-[#5c6970] transition-colors hover:bg-[#f5f6f7]"
          >
            <Mic size={18} />
          </button>
          <button
            type="button"
            aria-label="Send message"
            onClick={handleSend}
            className="flex size-6 shrink-0 items-center justify-center rounded-full transition-opacity duration-instant ease-soft hover:opacity-80"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 12l16-8-6 16-3-6-7-2z" stroke="#01567a" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      <p className="mt-2 text-center text-[12px] font-semibold text-grey-500">
        Press &apos;/&apos; to open AI Studio or &apos;Esc&apos; to close anytime. You&apos;ll be
        notified when a conversation finishes.
      </p>
    </AiStudioFrame>
  )
}
