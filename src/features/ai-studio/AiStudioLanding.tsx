// Full-page AI Studio blank-slate landing (empty state): the right-pane
// greeting + composer + tabbed suggestions, rendered inside the shared
// AiStudioFrame chrome. Presentational mock — the composer is inert (no
// backend this phase); clicking a suggestion seeds it, and the tabs switch
// which rows show. Rendered by AiAssistantHost for `mode === 'full'` when the
// active context carries no seeded conversation.
// Drawn from Figma 1194:120005 (Explore AI Studio).
import { useState, type ComponentType } from 'react'
import { Heart, Lightbulb } from 'lucide-react'
import { greetingFor } from './greeting'
import { GradientSparkle, AiStudioFrame, COMPOSER_EDGE } from './AiStudioFrame'
import {
  SUGGESTION_TABS,
  type StudioFlowScope,
  type SuggestionRow,
  type SuggestionTabKey,
} from './ai-studio-landing-data'
import { ZendeskLogo } from '@/components/ZendeskLogo'

const TABS: ReadonlyArray<{
  key: SuggestionTabKey
  label: string
  // Both lucide glyphs and ZendeskLogo satisfy this — the frame mixes them.
  icon: ComponentType<{ size?: number; className?: string }>
  heading: string
}> = [
  { key: 'suggested', label: 'Suggested', icon: Lightbulb, heading: 'Suggested prompts' },
  { key: 'common', label: 'Most common', icon: ZendeskLogo, heading: 'Most common prompts' },
  { key: 'flashbacks', label: 'Flashbacks', icon: Heart, heading: 'Saved flashbacks' },
]

// The three New rows' badge tints, transcribed from the frame's badges
// (Figma 1194:120037 / 120046 / 120054).
const BADGE_TONE: Record<'pink' | 'blue' | 'green' | 'purple', { fg: string; bg: string }> = {
  pink: { fg: '#bc2f7c', bg: '#f7ddec' },
  blue: { fg: '#1b5996', bg: '#d8ecff' },
  green: { fg: '#014a44', bg: '#c3e3e1' },
  purple: { fg: '#724be8', bg: '#e2d9ff' },
}

export function AiStudioLanding({
  onClose,
  initialComposer = '',
  contextLabel,
  contextType,
  onSubmit,
  onStartAgentPlan,
  onStartSelfImprovingPlan,
}: {
  onClose: () => void
  initialComposer?: string
  contextLabel?: string
  contextType?: string
  // Sending is no longer entirely inert: a plan-shaped prompt starts the
  // create-agent flow. Everything else is still a mock (see AiAssistantHost).
  onSubmit?: (text: string) => void
  onStartAgentPlan?: () => void
  onStartSelfImprovingPlan?: () => void
}) {
  const [composer, setComposer] = useState(initialComposer)
  const [tab, setTab] = useState<SuggestionTabKey>('suggested')
  const rows: SuggestionRow[] = SUGGESTION_TABS[tab]
  const active = TABS.find((t) => t.key === tab) ?? TABS[0]
  const ActiveHeadingIcon = active.icon

  const submit = () => {
    const trimmed = composer.trim()
    if (!trimmed) return
    onSubmit?.(trimmed)
  }

  // The sidebar's Start group runs the same two handlers as the suggestion rows
  // below it — the flow is named the same in both places, so it must also do the
  // same thing in both places.
  const startFlow = (scope: StudioFlowScope) =>
    scope === 'self-improving' ? onStartSelfImprovingPlan?.() : onStartAgentPlan?.()

  return (
    <AiStudioFrame
      onClose={onClose}
      onNewConversation={() => setComposer('')}
      onStartFlow={startFlow}
    >
      {/* The landing's own scroller. The frame's column is bounded now, so a
          short viewport scrolls the hero and suggestion card here rather than
          clipping them. */}
      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto">
        {contextLabel ? (
          <div
            role="status"
            aria-label="Current AI Studio context"
            className="mb-5 flex items-center gap-2 rounded-full border border-surface-border bg-white/75 px-3 py-2 text-[13px] leading-5 shadow-xs-flora"
          >
            <span className="text-ink-muted">Improving</span>
            <span className="font-semibold text-ink">{contextLabel}</span>
            {contextType ? (
              <span className="rounded-full bg-[#ebf5f7] px-2 py-0.5 text-[11px] font-semibold text-[#01567a]">
                {contextType}
              </span>
            ) : null}
          </div>
        ) : null}
        <h1 className="flex items-center gap-4 text-center text-[42px] font-semibold leading-[42px] tracking-[-0.1px] text-black">
          <GradientSparkle size={42} />
          <span>
            {greetingFor(new Date())} <span aria-hidden>👋</span>
          </span>
        </h1>

        {/* Composer: a white pill on a gradient hairline. The frame draws it bare
            — no attachment or mic button — so the send control only appears once
            there is something to send; dictation is the Space hint below. */}
        <div
          className="mt-8 w-full max-w-[680px] rounded-full p-px shadow-[0px_0px_1px_0px_rgba(0,12,32,0.04),0px_2px_6px_0px_rgba(3,17,38,0.11)]"
          style={{ background: COMPOSER_EDGE }}
        >
          <div className="flex h-[52px] items-center gap-3 rounded-full bg-white px-[14px]">
            <input
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submit()
                }
              }}
              placeholder="What can I help you with today?"
              className="min-w-0 flex-1 bg-transparent text-[16px] leading-[22px] tracking-[-0.1px] text-ink outline-none placeholder:text-[#727583]"
            />
            {composer.trim() !== '' && (
              <button
                type="button"
                onClick={submit}
                aria-label="Send message"
                className="flex size-6 shrink-0 items-center justify-center rounded-full transition-opacity duration-instant ease-soft hover:opacity-80"
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M4 12l16-8-6 16-3-6-7-2z"
                    stroke="#01567a"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Suggestions card: glass, and 20px narrower than the composer on each
            side. Its height is held so switching to a shorter tab does not
            collapse the card under the composer. */}
        <div className="mt-4 min-h-[338px] w-full max-w-[640px] rounded-[30px] border border-white/80 bg-white/65 p-[15px]">
          <div className="flex items-center gap-[2px] rounded-full bg-[#f2f4f7]">
            {TABS.map((t) => {
              const TabIcon = t.icon
              const selected = tab === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  aria-pressed={selected}
                  className={
                    'flex h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-3 text-[14px] leading-5 tracking-[-0.1px] transition-colors ' +
                    (selected
                      ? 'border border-[#e4e7f0] bg-white text-black shadow-[0px_0px_1px_0px_rgba(0,12,32,0.04),0px_2px_6px_0px_rgba(3,17,38,0.11)]'
                      : 'text-[#545767] hover:text-black')
                  }
                >
                  <TabIcon size={16} className="shrink-0 text-[#01567a]" />
                  {t.label}
                </button>
              )
            })}
          </div>

          <span className="mt-[13px] flex items-center gap-1 px-2 text-[12px] font-semibold leading-5 tracking-[-0.1px] text-[#727583]">
            <ActiveHeadingIcon size={16} className="text-[#01567a]" />
            {active.heading}
          </span>

          <ul data-testid="ai-studio-suggestions" className="mt-1 flex flex-col">
            {rows.map((row) => {
              const tone = row.tone ? BADGE_TONE[row.tone] : null
              const BadgeIcon = row.icon
              return (
                <li key={row.title}>
                  <button
                    type="button"
                    onClick={() => {
                      if (row.startsSelfImprovingPlan) onStartSelfImprovingPlan?.()
                      else if (row.startsAgentPlan) onStartAgentPlan?.()
                      else setComposer(row.prompt)
                    }}
                    className="flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-left transition-colors hover:bg-white/70"
                  >
                    {row.badge && tone && (
                      <span
                        className="flex shrink-0 items-center gap-1 rounded-2xl px-2 py-1 text-[11px] font-semibold leading-[14px] tracking-[-0.1px]"
                        style={{ color: tone.fg, backgroundColor: tone.bg }}
                      >
                        {BadgeIcon && <BadgeIcon size={14} aria-hidden />}
                        New
                      </span>
                    )}
                    <span className="shrink-0 text-[14px] leading-5 tracking-[-0.1px] text-black">
                      {row.title}
                    </span>
                    <span className="min-w-0 truncate text-[14px] leading-5 tracking-[-0.1px] text-[#727583]">
                      {row.description}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <p className="mt-auto pt-8 text-center text-[12px] font-semibold leading-5 tracking-[-0.1px] text-[#9194a0]">
          Press &apos;/&apos; to open AI Studio, or &apos;Esc&apos; to close, or hold Space to
          dictate.
        </p>
      </div>
    </AiStudioFrame>
  )
}
