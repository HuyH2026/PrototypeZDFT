// One accordion row in a plan panel: an icon tile, the section name, its chip,
// and a chevron. Single-open is the owning reducer's job, not this component's —
// it only reports the click. The chip is drawn only while collapsed, because an
// open section's own heading already names it.
//
// The card carries the open/closed state, because in a stack of sections that is
// the only structure there is. Closed sections are hairline outlines on the
// panel's glass; the open one is an opaque white sheet with a soft lift, and its
// icon tile turns teal. The flat `#f5f5f7` slab this replaces gave every section
// the same weight open or closed, so "open" read as nothing but extra height —
// and it put grey content on a grey field, which is what made the panel look
// unfinished.
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { PlanChipView, type PlanChipKey } from './plan-chip'

export function PlanAccordion({
  title,
  icon,
  chip,
  expanded,
  onToggle,
  children,
  testId,
}: {
  title: string
  icon: ReactNode
  chip: PlanChipKey | null
  expanded: boolean
  onToggle: () => void
  children: ReactNode
  // Defaults to the title, which is what agent-plan's tests already query. The
  // self-improving panel overrides it: its plan row's title carries a derived
  // "• 4 weeks" suffix.
  testId?: string
}) {
  return (
    <section
      data-testid={testId ?? `plan-section-${title}`}
      // Closed is an opaque tint, open is white with a lift. The fill has to be
      // opaque, not `bg-white/40`: the panel's own glass is ~90% over the page, so
      // a translucent row left the dashboard behind it legible straight through —
      // and a document you can read the app through reads as a hole.
      className={`rounded-[18px] border transition-colors duration-fast ease-soft ${
        expanded
          ? 'border-[#dfe4ee] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.03),0_12px_28px_-16px_rgba(16,24,40,0.16)]'
          : 'border-[#e7ebf2] bg-[#f5f7fa] hover:border-[#d2d9e5] hover:bg-[#eef2f7]'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="group flex w-full items-center gap-2.5 px-3.5 py-3 text-left"
      >
        {/* The glyph gets a tile so each section has an anchor at the same size,
            and so the open one can be marked without moving anything. */}
        <span
          className={`flex size-7 shrink-0 items-center justify-center rounded-[10px] transition-colors duration-fast ease-soft ${
            expanded ? 'bg-[#ebf5f7] text-[#01567a]' : 'bg-[#f1f4f9] text-[#5a6b8c]'
          }`}
          aria-hidden
        >
          {icon}
        </span>
        <span className="flex-1 text-[14px] font-semibold tracking-[-0.1px] text-ink">{title}</span>
        {chip && !expanded && <PlanChipView chip={chip} />}
        {/* One glyph that turns, rather than two that swap: the rotation is the
            only thing in the row that moves, so it reads as the affordance. */}
        <ChevronDown
          size={18}
          aria-hidden
          className={`shrink-0 text-[#9194a0] transition-transform duration-fast ease-soft group-hover:text-ink ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      {expanded && (
        // Opacity only (animate-fade-in), so the body does not travel over the
        // absolutely-positioned rails the overview and thinking timelines draw.
        <div className="animate-fade-in px-3.5 pb-4">{children}</div>
      )}
    </section>
  )
}
