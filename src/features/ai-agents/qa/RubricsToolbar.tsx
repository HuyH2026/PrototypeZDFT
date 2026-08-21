// Search + actions row above the rubric list — frame node 1762:324793.
// Search filters the list live (the header's "Name (n)" count follows it),
// while Create new opens the detailed rubric workspace.
import { GardenIcon } from '@/components/garden-icon'
import { Button } from '@/components/flora/Button'

export function RubricsToolbar({
  query,
  onQueryChange,
  onCreate,
}: {
  query: string
  onQueryChange: (value: string) => void
  onCreate: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex w-[400px] max-w-full items-center gap-2 rounded-full border border-grey-400 bg-white px-3 py-1.5">
        <GardenIcon name="search-stroke" className="size-4 text-grey-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by rubric name"
          aria-label="Search by rubric name"
          className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-grey-500"
        />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" variant="outline" className="font-semibold">
          Test
        </Button>
        <Button size="sm" variant="primary" className="font-semibold" onClick={onCreate}>
          Create new
        </Button>
      </div>
    </div>
  )
}
