// Left column of the Configuration screen: a "New segment" button (inert)
// and a selectable list of segments. Presentational — selection state lives in
// the view. Rows show the segment's short `label`, not its editable name.
import { type Segment } from './config-data'
import { Plus } from 'lucide-react'

type SegmentListProps = {
  segments: Segment[]
  selectedId: string
  onSelect: (id: string) => void
}

export function SegmentList({ segments, selectedId, onSelect }: SegmentListProps) {
  return (
    <div className="flex w-[180px] shrink-0 flex-col bg-white/80 pt-6 shadow-[1px_0_0_0_rgba(228,231,240,0.3)]">
      <div className="px-3 pb-6">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-full border border-grey-500 px-3 py-2 text-[12px] font-semibold text-ink"
        >
          <Plus className="size-3.5" aria-hidden />
          New segment
        </button>
      </div>
      <div className="flex flex-col">
        {segments.map((segment) => {
          const selected = segment.id === selectedId
          return (
            <button
              key={segment.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(segment.id)}
              className={`flex h-12 items-center gap-1.5 border-b border-[#f6f6f6] px-5 text-left text-[12px] text-ink ${selected ? 'bg-[#ebf5f7]' : ''}`}
            >
              <span
                className="h-4 w-[15px] shrink-0 rounded-[3px]"
                style={{ backgroundColor: segment.swatch }}
              />
              <span className="flex-1">{segment.label}</span>
              {selected ? <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" /> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
