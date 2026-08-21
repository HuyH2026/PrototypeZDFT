// One coaching rule or content snippet — frame card nodes 1901:81197 (Coaching)
// and 1901:81484 (Content snippets). The two tabs draw the same row, so one card
// serves both.
//
// Four columns divided by hairlines — the entry and when it changed, what it is
// applied to, the instruction itself, then the Activate toggle and the row's
// actions menu. The instruction is clamped rather than wrapped in full: the frame
// truncates it, and the full detail belongs in its drill-in editor where one is
// designed.
import { cn } from '@/lib/cn'
import {
  ChannelBadge,
  RowActionsButton,
  RowDivider,
  RowToggle,
  SegmentChip,
} from '@/features/ai-agents/list-parts'
import { type KnowledgeEntry } from './knowledge-data'

// Shared by the card and the list's header bar so the two line up exactly. The
// frame's header approximates the alignment with its own widths; sharing the grid
// is truer to the intent. The name and applied-to columns hold the frame's widths
// until width runs short; the instruction takes whatever is left.
//
// The instruction column carries a *minimum* rather than `minmax(0,1fr)`: at the
// app's 1024px floor with the sidebar expanded, a bare 1fr collapses to nothing
// and the column headings above it slide into each other. The columns' minimums
// add up to just under that worst case, so the row stays legible there.
export const KNOWLEDGE_COLS =
  'grid grid-cols-[minmax(150px,254px)_1px_minmax(130px,196px)_1px_minmax(120px,1fr)_50px_28px] gap-x-[21px]'

/** A help-centre article the entry is bound to. Inert — there is no article view. */
function ArticleChip({ label }: { label: string }) {
  return (
    <span className="rounded-[4px] border border-[#e8e9eb] bg-white px-[7px] py-[2px] text-[11px] leading-[16px] font-medium text-[#2f83d7] underline">
      {label}
    </span>
  )
}

export function KnowledgeEntryCard({
  entry,
  enabled,
  onToggle,
  onOpen,
}: {
  entry: KnowledgeEntry
  enabled: boolean
  onToggle: () => void
  onOpen?: () => void
}) {
  return (
    <div
      data-testid={`knowledge-entry-${entry.id}`}
      onClick={(event) => {
        if (!onOpen) return

        const control = (event.target as HTMLElement).closest('button')
        if (control && !control.hasAttribute('data-knowledge-row-opener')) return

        onOpen()
      }}
      className={cn(
        KNOWLEDGE_COLS,
        'relative items-center border-b border-table-divider bg-white py-[21px] pr-[21px] pl-[21px] transition-colors duration-instant last:border-b-0 hover:bg-table-row-hover',
        onOpen && 'cursor-pointer',
      )}
    >
      {onOpen ? (
        <button
          type="button"
          aria-label={entry.name}
          data-knowledge-row-opener
          className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-flora-blue"
        />
      ) : null}

      <div className="flex min-h-[91px] flex-col items-start gap-2 self-stretch">
        <h3 className="whitespace-nowrap text-[16px] leading-[22px] font-semibold text-ink">
          {entry.name}
        </h3>
        <p className="text-[12px] leading-[16px] font-medium text-grey-700">
          Last updated on {entry.updatedOn}
        </p>
      </div>

      <RowDivider />

      {/* Channels, then segments, then articles — three stacked groups, each
          wrapping within itself, as the frame lays them out. */}
      <div className="flex flex-col items-start gap-[14px] self-stretch">
        <div className="flex flex-wrap items-center gap-[4px]">
          {entry.channels.map((channel) => (
            <ChannelBadge key={channel} label={channel} />
          ))}
        </div>
        {entry.segments.length > 0 ? (
          <div className="flex flex-wrap items-center gap-[4px]">
            {entry.segments.map((segment) => (
              <SegmentChip key={segment} label={segment} />
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-[4px]">
          {entry.articles.map((article) => (
            <ArticleChip key={article} label={article} />
          ))}
        </div>
      </div>

      <RowDivider />

      {/* Clamped to the frame's five lines. Deliberately not `self-stretch`: a
          line-clamped box stretched taller than its clamp paints the lines past
          the ellipsis, so the height has to stay content-driven. */}
      <p className="line-clamp-5 whitespace-pre-line text-[14px] leading-[18px] text-ink">
        {entry.body}
      </p>

      <span className="relative z-20 flex">
        <RowToggle label={`Activate ${entry.name}`} on={enabled} onToggle={onToggle} />
      </span>

      <span className="relative z-20 flex">
        <RowActionsButton label={`Actions for ${entry.name}`} />
      </span>
    </div>
  )
}
