// Row furniture shared by the Agent Builder's card-list screens (AI QA's rubric
// list, Knowledge's coaching rules and content snippets). The frames draw these
// pieces identically, so they live here rather than in either screen's folder.
//
// Presentational only — every piece takes its state from the caller.
import { GardenIcon } from '@/components/garden-icon'
import { cn } from '@/lib/cn'
import { segmentColor } from './segment-colors'

/** A channel the row applies to — Widget, Voice, Headless, … */
export function ChannelBadge({ label }: { label: string }) {
  return (
    <span className="rounded-[4px] bg-[#eef5f9] px-[7px] py-[3px] text-[10px] leading-[13px] font-semibold text-[#193d50]">
      {label}
    </span>
  )
}

/** A segment within a channel: swatch + name, in the frame's white chip. */
export function SegmentChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-[3px] rounded-[4px] border border-[#e8e9eb] bg-white px-[7px] py-[2px]">
      <span
        aria-hidden
        className="h-[12px] w-[11px] shrink-0 rounded-[3px]"
        style={{ backgroundColor: segmentColor(label) }}
      />
      <span className="text-[11px] leading-[16px] font-medium text-[#373a4d]">{label}</span>
    </span>
  )
}

// The Flora toggle carries its state *inside* the pill, so it is built here
// rather than reusing configuration/panel-parts' plain switch.
export function RowToggle({
  label,
  on,
  onToggle,
}: {
  /** Accessible name — the frames label this column differently per screen. */
  label: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="relative h-[21px] w-[50px] shrink-0 cursor-pointer rounded-full transition-colors duration-instant ease-soft"
      // Flora's success green; the off state reuses the neutral the other
      // switches in the app use.
      style={{ backgroundColor: on ? '#048c80' : '#c9c7c3' }}
    >
      <span
        className={cn(
          'absolute inset-y-0 flex items-center text-[12px] leading-none font-semibold text-white',
          on ? 'left-[7px]' : 'right-[7px]',
        )}
      >
        {on ? 'On' : 'Off'}
      </span>
      <span
        className={cn(
          'absolute top-[3.5px] size-[14px] rounded-full bg-white transition-all duration-instant ease-soft',
          on ? 'left-[32px]' : 'left-[4px]',
        )}
      />
    </button>
  )
}

/** The hairline that separates a card's columns. */
export function RowDivider() {
  return <span aria-hidden className="w-px self-stretch bg-surface-border" />
}

/**
 * The per-row overflow menu. Inert everywhere it is used so far — the editors it
 * would open are unbuilt — so it takes no handler.
 */
export function RowActionsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'flex size-[28px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] text-ink-muted hover:bg-black/5',
        className,
      )}
    >
      <GardenIcon name="overflow-vertical-stroke" className="size-[18px]" />
    </button>
  )
}
