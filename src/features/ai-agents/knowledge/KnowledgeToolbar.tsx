// Search + actions row above each Knowledge list — frame nodes 1901:81160
// (Coaching) and 1901:81447 (Content snippets).
//
// Search filters the list live and the header's "Name (n)" follows it. The sort
// and filter controls, Preview, and Create new are inert. The designed
// Business trip editor opens from its row name, not these controls.
import { GardenIcon } from '@/components/garden-icon'
import { Button } from '@/components/flora/Button'
import { type KnowledgeTabContent } from './knowledge-data'

export function KnowledgeToolbar({
  query,
  onQueryChange,
  filter,
}: {
  query: string
  onQueryChange: (value: string) => void
  filter: KnowledgeTabContent['filter']
}) {
  return (
    // Wraps rather than overlapping: at the 1024px floor with the sidebar
    // expanded there is not room for all five controls on one line, so the
    // Preview/Create new pair drops beneath the search row. The left group takes
    // its natural width (no `flex-1`) so it can force that wrap; `ml-auto` keeps
    // the actions right-aligned on whichever line they land.
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex w-[400px] min-w-[160px] shrink items-center gap-2 rounded-full border border-grey-400 bg-white px-3 py-1.5">
          <GardenIcon name="search-stroke" className="size-4 text-grey-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search keyword"
            aria-label="Search keyword"
            className="w-full min-w-0 bg-transparent text-[14px] text-ink outline-none placeholder:text-grey-500"
          />
        </div>
        <Button size="sm" variant="outline" className="shrink-0 font-semibold">
          <GardenIcon name="arrow-reverse-stroke" className="size-4" />
          Date updated (newest)
          <GardenIcon name="chevron-down-stroke" className="size-4" />
        </Button>
        <Button size="sm" variant="outline" className="shrink-0 font-semibold">
          <GardenIcon
            name={filter.kind === 'panel' ? 'filter-stroke' : 'arrow-reverse-stroke'}
            className="size-4"
          />
          {filter.label}
          {/* Only the dropdown form carries a chevron; a future panel trigger would not. */}
          {filter.kind === 'dropdown' ? (
            <GardenIcon name="chevron-down-stroke" className="size-4" />
          ) : null}
        </Button>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button size="sm" variant="outline" className="font-semibold">
          Preview
        </Button>
        <Button size="sm" variant="primary" className="font-semibold">
          Create new
        </Button>
      </div>
    </div>
  )
}
