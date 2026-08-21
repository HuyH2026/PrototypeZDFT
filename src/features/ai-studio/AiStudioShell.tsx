import { useEffect, useState, type ReactNode } from 'react'
import { Plus, Menu, History, X } from 'lucide-react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { CONVERSATION_HISTORY } from './ai-studio-landing-data'

// --ease-soft (theme.css) as a literal curve — motion's `ease` option needs the
// array form, not the CSS custom property.
const EASE_SOFT = [0.33, 0.85, 0.4, 1] as const

// How long the AI disclaimer holds before it fades, and how long the fade runs.
// The prototype's copilot panel shows the notice on open and retires it after a
// few seconds (`COPILOT_FOOTNOTE_HOLD_MS`) so it doesn't sit under every
// conversation forever.
const DISCLAIMER_HOLD_MS = 5000

// The "Powered by AI" notice above the composer. It collapses its own height as
// it fades (max-height, plus a negative margin absorbing the gap) so the
// composer rises smoothly into the freed space instead of jumping once the text
// is gone.
function AiDisclaimer() {
  const [faded, setFaded] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setFaded(true), DISCLAIMER_HOLD_MS)
    return () => clearTimeout(timer)
  }, [])
  return (
    <p
      data-slot="ai-disclaimer"
      aria-hidden={faded}
      className={`overflow-hidden text-center text-[11px] leading-[14px] text-ink-muted transition-[opacity,max-height,margin] duration-[800ms] ease-out ${
        faded ? 'pointer-events-none mb-0 max-h-0 opacity-0' : 'mb-4 max-h-[60px] opacity-100'
      }`}
    >
      <strong className="mb-0.5 block font-semibold text-[#4a5560]">Powered by AI</strong>
      AI content can be inaccurate or misleading. Review it carefully.
    </p>
  )
}

// Reusable AI Studio assistant shell: a white card with a header (sparkle +
// "AI Studio" title, external-link and close actions), a scrollable body slot,
// and a chat composer pinned to the bottom. By default the composer is inert
// (no backend this phase). Passing composer* props makes it interactive: a
// controlled value, Enter/send submit, and an optional placeholder. `onClose`
// is wired to the header X; `onExpand` (when given) exposes the full Studio
// beside a separate chat-history control, matching the compact panel chrome.
export function AiStudioShell({
  testId = 'ai-studio-panel',
  onClose,
  onExpand,
  children,
  composerValue,
  onComposerChange,
  onComposerSubmit,
  composerPlaceholder = 'What can I help you with today?',
}: {
  testId?: string
  onClose?: () => void
  onExpand?: () => void
  children: ReactNode
  composerValue?: string
  onComposerChange?: (value: string) => void
  onComposerSubmit?: () => void
  composerPlaceholder?: string
}) {
  const interactive = onComposerChange !== undefined
  const [historyOpen, setHistoryOpen] = useState(false)
  const submit = () => {
    if (composerValue && composerValue.trim()) onComposerSubmit?.()
  }
  return (
    // Size-agnostic: the card fills whatever box its caller gives it. The two
    // callers place it very differently — AiAssistantHost slides it in as a
    // positioned overlay on the app row, the agent editor docks it as a flex
    // child of the editor's content area — so width belongs to them, not here.
    <MotionConfig reducedMotion="user">
      <aside
        data-testid={testId}
        className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white"
      >
        {/* Header: AI Studio title + action buttons. The hairline under it is the
          prototype's (`.copilot-panel__header`), which separates the header from
          a scrolled body without drawing a full border. */}
        <div className="flex items-center justify-between border-b border-black/5 px-5 pt-3.5 pb-2.5">
          <div className="flex items-center gap-1">
            <span className="text-[15px] font-semibold leading-[22px] tracking-[-0.085px] text-grey-800">
              AI Studio
            </span>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient
                  id="aiStudioSparkle"
                  x1="3"
                  y1="12"
                  x2="20"
                  y2="12"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#01567A" />
                  <stop offset="1" stopColor="#6DBBD7" />
                </linearGradient>
              </defs>
              <path
                d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3zM19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z"
                stroke="url(#aiStudioSparkle)"
                strokeWidth={1.2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* 32px hit targets on the warm translucent control hover at --radius-btn,
            matching the prototype's `.copilot-iconbtn`. The glyphs are the panel
            foreground (#293239), not the muted grey they used to be. */}
          <div className="flex items-center gap-1">
            {onExpand ? (
              <button
                type="button"
                aria-label="Open full AI Studio"
                onClick={onExpand}
                className="flex size-8 items-center justify-center rounded-[8px] text-fg-default transition-colors duration-instant ease-soft hover:bg-control-hover"
              >
                <Menu size={18} aria-hidden />
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Chat history"
              aria-expanded={historyOpen}
              aria-controls="ai-studio-chat-history"
              onClick={() => setHistoryOpen((open) => !open)}
              className={`flex size-8 items-center justify-center rounded-[8px] text-fg-default transition-colors duration-instant ease-soft hover:bg-control-hover ${
                historyOpen ? 'bg-control-hover' : ''
              }`}
            >
              <History size={18} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Close AI Studio"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-[8px] text-fg-default transition-colors duration-instant ease-soft hover:bg-control-hover"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {historyOpen && (
            <motion.div
              id="ai-studio-chat-history"
              role="region"
              aria-label="Chat history"
              className="absolute top-[54px] right-3 z-20 w-[calc(100%-24px)] origin-top-right rounded-2xl border border-surface-border bg-white p-2 shadow-menu"
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.16, ease: EASE_SOFT }}
            >
              <div className="px-2 pb-2 pt-1">
                <p className="text-[13px] font-semibold text-ink">Recent conversations</p>
                <p className="mt-0.5 text-[11px] leading-4 text-ink-muted">
                  Review your recent AI Studio conversations.
                </p>
              </div>
              <ul className="flex flex-col">
                {CONVERSATION_HISTORY.map((title) => (
                  <li key={title} className="border-t border-surface-border first:border-t-0">
                    <span
                      title={title}
                      className="block truncate rounded-[8px] px-2 py-2 text-[13px] leading-5 text-ink"
                    >
                      {title}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5">{children}</div>

        {/* Chat composer: peach-bordered pill with + and gradient sparkle send,
          preceded by the AI disclaimer (see AiDisclaimer). */}
        <div className="px-5 pb-5 pt-2">
          <AiDisclaimer />
          <div className="flex items-center gap-2 rounded-full border border-[#ffb393] bg-white px-2 py-2 shadow-[0px_0px_1px_0px_rgba(0,12,32,0.04),0px_2px_6px_0px_rgba(3,17,38,0.11)]">
            <button
              aria-label="Add attachment"
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-black transition-colors hover:bg-[#f5f6f7]"
            >
              <Plus size={16} />
            </button>
            <input
              className="min-w-0 flex-1 bg-transparent text-[14px] leading-5 tracking-[-0.1px] text-ink outline-none placeholder:text-grey-700"
              placeholder={composerPlaceholder}
              value={interactive ? (composerValue ?? '') : undefined}
              readOnly={!interactive}
              onChange={interactive ? (e) => onComposerChange?.(e.target.value) : undefined}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        submit()
                      }
                    }
                  : undefined
              }
            />
            <button
              type="button"
              aria-label="Send message"
              onClick={interactive ? submit : undefined}
              className="flex size-6 shrink-0 items-center justify-center rounded-full transition-opacity duration-instant ease-soft hover:opacity-80"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient
                    id="aiStudioSend"
                    x1="3"
                    y1="12"
                    x2="20"
                    y2="12"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#01567A" />
                    <stop offset="1" stopColor="#6DBBD7" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3zM19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z"
                  stroke="url(#aiStudioSend)"
                  strokeWidth={1.2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </MotionConfig>
  )
}
