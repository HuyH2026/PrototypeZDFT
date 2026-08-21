// One rubric in the AI QA list — frame 1545:321852, card node 1772:379580.
//
// Three columns divided by hairlines: the rubric and its state, the channels and
// segments it is scoped to, and its definition. The definition is deliberately
// clamped rather than wrapped in full — the frame truncates it, and the detail
// lives in the (unbuilt) rubric editor behind the actions menu.
import { cn } from '@/lib/cn'
import {
  ChannelBadge,
  RowActionsButton,
  RowDivider,
  RowToggle,
  SegmentChip,
} from '@/features/ai-agents/list-parts'
import { type Rubric, type RubricChannel } from './rubrics-data'

// Shared by the card and the list's header bar so the two line up. The name and
// channel columns hold the frame's widths until width runs short; the definition
// takes whatever is left.
export const RUBRIC_COLS =
  'grid grid-cols-[minmax(190px,255px)_1px_minmax(140px,197px)_1px_minmax(0,1fr)_28px] gap-x-[21px]'

// Every segment the rubric is scoped to, in channel order, each named once. The
// scope column stacks channels then segments — the Knowledge cards' layout — so
// the pairing between a channel and its own segments is not drawn here; the
// per-channel scoping is edited in the rubric editor, where channels and their
// segments are separate fields.
function scopeSegments(channels: RubricChannel[]) {
  return [...new Set(channels.flatMap((scope) => scope.segments))]
}

export function RubricCard({
  rubric,
  enabled,
  onToggle,
  onOpen,
}: {
  rubric: Rubric
  enabled: boolean
  onToggle: () => void
  onOpen?: () => void
}) {
  const segments = scopeSegments(rubric.channels)

  return (
    <div
      data-testid={`rubric-card-${rubric.id}`}
      onClick={(event) => {
        if (!onOpen) return

        const control = (event.target as HTMLElement).closest('button')
        if (control && !control.hasAttribute('data-rubric-row-opener')) return

        onOpen()
      }}
      className={cn(
        RUBRIC_COLS,
        'relative items-stretch border-b border-table-divider bg-white py-[21px] pr-[24px] pl-[21px] transition-colors duration-instant hover:bg-table-row-hover last:border-b-0',
        onOpen && 'cursor-pointer',
      )}
    >
      {onOpen ? (
        <button
          type="button"
          aria-label={`Edit ${rubric.name}`}
          data-rubric-row-opener
          className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-flora-blue"
        />
      ) : null}

      <div className="flex min-h-[91px] flex-col items-start gap-[14px]">
        <h3 className="text-[18px] leading-[25px] font-semibold text-ink">{rubric.name}</h3>
        <div className="flex flex-wrap items-center gap-[14px]">
          <span className="relative z-20 flex">
            <RowToggle label={`Enable ${rubric.name}`} on={enabled} onToggle={onToggle} />
          </span>
          {rubric.excludedFromAverage ? (
            <span
              data-testid="excluded-badge"
              className="rounded-[4px] bg-[#ffdfa2] px-[7px] py-[3px] text-[10px] leading-[13px] font-semibold text-[#5f4c2b]"
            >
              Excluded from Avg
            </span>
          ) : null}
        </div>
        <p className="mt-auto text-[12px] leading-[16px] font-medium text-grey-700">
          Last updated on {rubric.updatedOn}
        </p>
      </div>

      <RowDivider />

      {/* Channels, then segments — two stacked groups, each wrapping within
          itself, matching the Coaching and Content snippets cards. */}
      <div className="flex flex-col items-start gap-[14px]">
        <div className="flex flex-wrap items-center gap-[4px]">
          {rubric.channels.map((scope) => (
            <ChannelBadge key={scope.channel} label={scope.channel} />
          ))}
        </div>
        {segments.length > 0 ? (
          <div className="flex flex-wrap items-center gap-[4px]">
            {segments.map((segment) => (
              <SegmentChip key={segment} label={segment} />
            ))}
          </div>
        ) : null}
      </div>

      <RowDivider />

      {/* Clamped to the frame's five lines; the blank line and numbered list in
          the churn definition are preserved, hence whitespace-pre-line. */}
      <p className="line-clamp-5 text-[14px] leading-[18px] whitespace-pre-line text-ink">
        {rubric.definition}
      </p>

      <span className="relative z-20 flex self-center">
        <RowActionsButton label={`Actions for ${rubric.name}`} />
      </span>
    </div>
  )
}
