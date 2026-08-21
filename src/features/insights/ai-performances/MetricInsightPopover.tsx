// Persistent status trigger for an AI Performances stat card. Replaces
// the card's old click-to-open-AI-Studio icon: hovering (or focusing, for
// keyboard users) shows what to pay attention to — or what improved — before
// the user chooses to drill in. The status pill itself has no onClick; the only way
// to act is the popover's own drill-in button, which always opens the AI
// Studio full view as a populated conversation.
import { type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles } from 'lucide-react'
import { useAiAssistant } from '@/app/ai-assistant-context'
import { useHoverIntent } from '@/app/layout/useHoverIntent'
import { cardTone, insightRows } from './card-insight'
import { findingIdForCard, investigationById, toConversationSeed, toStatCardConversationSeed } from './investigation-data'
import { POS, NEG, type StatCard } from './ai-performances-data'
import { Card } from '@/components/flora/Card'

export function MetricInsightPopover({
  card,
  onOpenChange,
}: {
  card: StatCard
  onOpenChange?: (isOpen: boolean) => void
}) {
  const { open } = useAiAssistant()
  // Use the hook's default open/close delay. A synchronous close-on-blur
  // (delay 0) unmounts the popover's drill-in button before keyboard focus
  // can move onto it via Tab, and reintroduces the accidental-flicker
  // problem hover-intent exists to prevent.
  const { activeKey, open: openHover, scheduleClose, close } = useHoverIntent()
  const isOpen = activeKey === card.title
  const tone = cardTone(card)
  const statusLabel = tone === 'attention' ? 'Needs attention' : 'Improved'
  const allRows = insightRows(card)
  const displayRows = allRows.slice(0, 3)
  const fid = findingIdForCard(card.title)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drillInRef = useRef<HTMLButtonElement>(null)
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 })

  function openPopover() {
    const bounds = triggerRef.current?.getBoundingClientRect()
    if (bounds) {
      setPopoverPosition({
        top: bounds.bottom + 4,
        left: Math.max(8, Math.min(bounds.right - 280, window.innerWidth - 288)),
      })
    }
    openHover(card.title)
  }

  // The popover can extend over the next dashboard section. Tell the owning
  // metric card when it is open so that card stays above the section even once
  // the pointer is no longer directly over its trigger.
  useEffect(() => onOpenChange?.(isOpen), [isOpen, onOpenChange])

  // Scrolling moves the trigger away from a stationary pointer without always
  // emitting mouseleave. Close in the capture phase so a card never drifts over
  // a later section of the overview.
  useEffect(() => {
    if (!isOpen) return
    window.addEventListener('scroll', close, true)
    return () => window.removeEventListener('scroll', close, true)
  }, [close, isOpen])

  function drillIn(e: MouseEvent<HTMLButtonElement>) {
    // The popover can render inside a finding-backed stat card, whose outer
    // div has its own onClick (opening the in-page workspace). Without this,
    // clicking the drill-in button would bubble and open both the workspace
    // and the AI Studio full view at once.
    e.stopPropagation()
    if (fid) {
      const inv = investigationById(fid)!
      open(inv.scope, 'full', { conversation: toConversationSeed(inv) })
      return
    }
    open('ai-performances', 'full', { conversation: toStatCardConversationSeed(card, tone, allRows) })
  }

  function focusPopoverFromTrigger(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Tab' && !e.shiftKey && isOpen) {
      e.preventDefault()
      drillInRef.current?.focus()
    }
  }

  return (
    <div
      className="relative"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onMouseEnter={openPopover}
      onMouseLeave={scheduleClose}
      onFocus={openPopover}
      onBlur={scheduleClose}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${statusLabel} for ${card.title}`}
        onKeyDown={focusPopoverFromTrigger}
        className={
          tone === 'attention'
            ? 'inline-flex h-6 items-center gap-1 rounded-full bg-[#fbe7e5] px-2 text-[12px] font-medium text-[#9f2d20] hover:bg-[#f7d4d0]'
            : 'inline-flex h-6 items-center gap-1 rounded-full bg-[#dff3e4] px-2 text-[12px] font-medium text-[#216b3b] hover:bg-[#cdebd5]'
        }
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{statusLabel}</span>
      </button>

      {isOpen && createPortal(
        <Card
          flat
          role="dialog"
          data-testid={`metric-insight-popover-${card.title}`}
          onMouseEnter={() => openHover(card.title)}
          onMouseLeave={scheduleClose}
          onFocus={() => openHover(card.title)}
          onBlur={scheduleClose}
          style={popoverPosition}
          className="fixed z-50 w-[280px] rounded-xl p-4 text-left shadow-[0px_16px_12px_rgba(10,13,14,0.16)]"
        >
          <span
            className={
              tone === 'attention'
                ? 'inline-flex rounded-full bg-[#fbe7e5] px-2.5 py-1 text-[12px] font-medium text-[#9f2d20]'
                : 'inline-flex rounded-full bg-[#dff3e4] px-2.5 py-1 text-[12px] font-medium text-[#216b3b]'
            }
          >
            {statusLabel}
          </span>

          <p className="mt-2 text-[14px] leading-5 text-ink">{card.insight.headline}</p>
          {card.insight.detail && (
            <p className="mt-1 text-[13px] leading-5 text-ink-muted">{card.insight.detail}</p>
          )}

          {displayRows.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {displayRows.map((row) => (
                <li key={row.label} className="flex items-center justify-between text-[13px]">
                  <span className="text-ink">{row.label}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-ink-muted">{row.value}</span>
                    <span style={{ color: row.delta.up ? POS : NEG }}>{row.delta.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button
            ref={drillInRef}
            type="button"
            onClick={drillIn}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-nav-active px-3 py-2 text-[13px] font-medium text-white hover:bg-ink"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {tone === 'attention' ? 'Investigate in AI Studio' : 'See what changed'}
          </button>
        </Card>
      , document.body)}
    </div>
  )
}
