// Serves /agent-builder/ai-qa ("AI QA") — frame 1545:321852.
//
// The screen is the rubric library: the criteria conversations are scored
// against. It replaced the earlier QA metric dashboard when this frame landed.
//
// Live: the search filter, each rubric's On/Off toggle, and the shared create /
// edit workspace. Everything stays local to this mounted mock screen. No backend.
import { useMemo, useRef, useState } from 'react'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'
import {
  CardListTable,
  CardListTableBody,
  CardListTableHeader,
} from '@/components/flora/CardListTable'
import { cn } from '@/lib/cn'
import { RubricCard, RUBRIC_COLS } from './RubricCard'
import { RubricsToolbar } from './RubricsToolbar'
import { NEW_RUBRIC_TEMPLATE, RUBRICS, type Rubric } from './rubrics-data'
import { PageHeader } from '@/components/flora/PageHeader'
import { RubricEditor, type RubricEditorChanges } from './RubricEditor'

const NEW_RUBRIC_ID = '__new__'

export function AgentQaView() {
  const [query, setQuery] = useState('')
  const [rubrics, setRubrics] = useState<Rubric[]>(RUBRICS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const nextRubricId = useRef(RUBRICS.length + 1)
  // Toggling is local to the screen: there is no rubric store, and nothing else
  // in the app reads the enabled state.
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries([
      ...RUBRICS.map((rubric) => [rubric.id, rubric.enabled] as const),
      [NEW_RUBRIC_ID, NEW_RUBRIC_TEMPLATE.enabled] as const,
    ]),
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? rubrics.filter((rubric) => rubric.name.toLowerCase().includes(q)) : rubrics
  }, [query, rubrics])

  const editingRubric =
    editingId === NEW_RUBRIC_ID
      ? NEW_RUBRIC_TEMPLATE
      : rubrics.find((rubric) => rubric.id === editingId)

  function saveRubric(changes: RubricEditorChanges) {
    if (editingId === NEW_RUBRIC_ID) {
      const id = `mock-rubric-${nextRubricId.current++}`
      setRubrics((current) => [
        ...current,
        {
          ...NEW_RUBRIC_TEMPLATE,
          ...changes,
          id,
          updatedOn: 'Aug 13, 2026',
          enabled: enabled[NEW_RUBRIC_ID],
        },
      ])
      setEnabled((current) => ({ ...current, [id]: current[NEW_RUBRIC_ID] }))
    } else if (editingId) {
      setRubrics((current) =>
        current.map((rubric) =>
          rubric.id === editingId ? { ...rubric, ...changes, updatedOn: 'Aug 13, 2026' } : rubric,
        ),
      )
    }

    setEditingId(null)
  }

  if (editingRubric) {
    const enabledKey = editingId === NEW_RUBRIC_ID ? NEW_RUBRIC_ID : editingRubric.id

    return (
      <RubricEditor
        key={enabledKey}
        rubric={editingRubric}
        enabled={enabled[enabledKey]}
        isNew={editingId === NEW_RUBRIC_ID}
        onToggle={() =>
          setEnabled((current) => ({ ...current, [enabledKey]: !current[enabledKey] }))
        }
        onClose={() => setEditingId(null)}
        onSave={saveRubric}
      />
    )
  }

  return (
    <div data-testid="view-agent-qa" className="h-full overflow-y-auto">
      <PageHeader title="AI QA" actions={<AiTriggerButton label="Ask AI about this page" />} />

      <div className="flex flex-col gap-6 px-16 pb-16">
        <p className="text-[14px] leading-[20px] text-ink">
          Score your AI's conversations against the criteria that matter, and see exactly where it
          excels and where it needs work.
        </p>

        <RubricsToolbar
          query={query}
          onQueryChange={setQuery}
          onCreate={() => setEditingId(NEW_RUBRIC_ID)}
        />

        <CardListTable aria-label="AI QA rubrics">
          {/* The header shares the row grid so the columns stay aligned inside a
              single, flush table shell. */}
          <CardListTableHeader
            className={cn(
              RUBRIC_COLS,
              'items-center py-3.5 pr-[24px] pl-[21px] text-[14px] font-semibold text-table-header-color',
            )}
          >
            <span>Name ({visible.length})</span>
            <span />
            <span>Channels and Segment</span>
            <span />
            <span>Definition</span>
            <span />
          </CardListTableHeader>

          <CardListTableBody>
            {visible.map((rubric) => (
              <RubricCard
                key={rubric.id}
                rubric={rubric}
                enabled={enabled[rubric.id]}
                onToggle={() => setEnabled((prev) => ({ ...prev, [rubric.id]: !prev[rubric.id] }))}
                onOpen={() => setEditingId(rubric.id)}
              />
            ))}

            {visible.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-grey-700">
                No rubrics match “{query.trim()}”.
              </p>
            ) : null}
          </CardListTableBody>
        </CardListTable>
      </div>
    </div>
  )
}
