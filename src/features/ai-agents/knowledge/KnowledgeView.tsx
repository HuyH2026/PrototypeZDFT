// Serves /agent-builder/knowledge ("Knowledge") — frame 1:3847 (Knowledge
// coaching), alongside the existing Content snippets view.
//
// Two tabs over the same shape: a one-line explanation, a search/actions toolbar,
// then a card list. Knowledge coaching tells the AI how to use
// help-centre content; Content snippets are standalone answers that need no
// article.
//
// Live: tab switching, the search filter (the header's "Name (n)" follows it),
// each entry's Activate toggle, every coaching drill-in, and the designed How
// ride pricing works snippet editor. Sort, filter, Preview, Create new, and row
// menus stay inert.
import { useMemo, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { GardenIcon } from '@/components/garden-icon'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'
import {
  CardListTable,
  CardListTableBody,
  CardListTableHeader,
} from '@/components/flora/CardListTable'
import { cn } from '@/lib/cn'
import {
  KNOWLEDGE_CONTENT,
  KNOWLEDGE_TABS,
  type KnowledgeEntry,
  type KnowledgeTab,
} from './knowledge-data'
import { KnowledgeToolbar } from './KnowledgeToolbar'
import { KNOWLEDGE_COLS, KnowledgeEntryCard } from './KnowledgeEntryCard'
import { PageHeader } from '@/components/flora/PageHeader'
import { KnowledgeCoachingEditor } from './KnowledgeCoachingEditor'
import { KnowledgeMetricStrip } from './KnowledgeMetricStrip'
import { ContentSnippetEditor } from './ContentSnippetEditor'

// Every entry across both tabs, so a toggle flipped on one tab survives a trip to
// the other. Ids are unique across the two lists.
const INITIAL_ENABLED: Record<string, boolean> = Object.fromEntries(
  KNOWLEDGE_TABS.flatMap((tab) =>
    KNOWLEDGE_CONTENT[tab].entries.map((entry) => [entry.id, entry.enabled]),
  ),
)

export function KnowledgeView() {
  const [tab, setTab] = useState<KnowledgeTab>('Knowledge coaching')
  const [query, setQuery] = useState('')
  const [enabled, setEnabled] = useState<Record<string, boolean>>(INITIAL_ENABLED)
  const [overrides, setOverrides] = useState<
    Record<string, Partial<Pick<KnowledgeEntry, 'name' | 'body'>>>
  >({})
  const [editingId, setEditingId] = useState<string | null>(null)

  const content = KNOWLEDGE_CONTENT[tab]
  const entries = useMemo(
    () => content.entries.map((entry) => ({ ...entry, ...overrides[entry.id] })),
    [content.entries, overrides],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? entries.filter((e) => e.name.toLowerCase().includes(q)) : entries
  }, [entries, query])

  const editingEntry = entries.find((entry) => entry.id === editingId)

  if (editingEntry?.snippetEditor) {
    return (
      <ContentSnippetEditor
        entry={editingEntry}
        editor={editingEntry.snippetEditor}
        enabled={enabled[editingEntry.id]}
        onToggle={() =>
          setEnabled((prev) => ({ ...prev, [editingEntry.id]: !prev[editingEntry.id] }))
        }
        onClose={() => setEditingId(null)}
        onSave={(changes) =>
          setOverrides((prev) => ({
            ...prev,
            [editingEntry.id]: { ...prev[editingEntry.id], ...changes },
          }))
        }
      />
    )
  }

  if (editingEntry?.editor) {
    return (
      <KnowledgeCoachingEditor
        entry={editingEntry}
        editor={editingEntry.editor}
        enabled={enabled[editingEntry.id]}
        onToggle={() =>
          setEnabled((prev) => ({ ...prev, [editingEntry.id]: !prev[editingEntry.id] }))
        }
        onClose={() => setEditingId(null)}
        onSave={(changes) =>
          setOverrides((prev) => ({
            ...prev,
            [editingEntry.id]: { ...prev[editingEntry.id], ...changes },
          }))
        }
      />
    )
  }

  return (
    <div data-testid="view-knowledge" className="h-full overflow-y-auto">
      <PageHeader
        title="Knowledge"
        tabs={KNOWLEDGE_TABS}
        activeTab={tab}
        onTabChange={(nextTab) => {
          setTab(nextTab)
          setQuery('')
        }}
        tablistLabel="Knowledge views"
        actions={<AiTriggerButton label="Ask AI about this page" />}
        // No px- override: PageHeader's own px-16 is the gutter every other
        // section page uses. This carried `px-[clamp(32px,7.14%,97px)]`, a
        // percentage gutter unique in the codebase that resolved to 81px at the
        // 1136px content width — so Knowledge's title started 49px further in
        // than its five siblings' and the screen read as a narrower column.
        className="[&_[data-slot=page-header-divider]]:hidden"
      />

      <div className="flex flex-col gap-6 px-16 pb-16">
        <p className="max-w-[960px] text-[14px] leading-5 text-[#3d6f78]">{content.description}</p>

        {content.metrics ? <KnowledgeMetricStrip metrics={content.metrics} /> : null}

        <KnowledgeToolbar query={query} onQueryChange={setQuery} filter={content.filter} />

        <CardListTable
          aria-label={
            tab === 'Knowledge coaching' ? 'Knowledge coaching rules' : 'Content snippets'
          }
        >
          {/* The shared grid keeps the plain header aligned with the separated
              card-backed rows. */}
          <CardListTableHeader
            className={cn(
              KNOWLEDGE_COLS,
              'items-center px-[21px] py-3 text-[14px] font-semibold text-table-header-color',
            )}
          >
            <span className="flex items-center gap-1">
              Name ({visible.length})
              {/* The frame marks the sortable columns; sorting itself is unbuilt. */}
              <ArrowDown size={16} className="text-ink-muted" aria-hidden />
            </span>
            <span />
            <span>Applied to</span>
            <span />
            <span className="flex items-center gap-1">
              {content.bodyColumn}
              <GardenIcon name="info-stroke" className="size-[18px] text-ink-muted" />
            </span>
            <span className="col-span-2 flex items-center gap-1 whitespace-nowrap">
              Activate
              <ArrowDown size={16} className="text-ink-muted" aria-hidden />
            </span>
          </CardListTableHeader>

          <CardListTableBody>
            {visible.map((entry) => (
              <KnowledgeEntryCard
                key={entry.id}
                entry={entry}
                enabled={enabled[entry.id]}
                onToggle={() => setEnabled((prev) => ({ ...prev, [entry.id]: !prev[entry.id] }))}
                onOpen={
                  (tab === 'Knowledge coaching' && entry.editor) ||
                  (tab === 'Content snippets' && entry.snippetEditor)
                    ? () => setEditingId(entry.id)
                    : undefined
                }
              />
            ))}

            {visible.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-grey-700">
                No {tab === 'Knowledge coaching' ? 'coaching rules' : 'content snippets'} match “
                {query.trim()}
                ”.
              </p>
            ) : null}
          </CardListTableBody>
        </CardListTable>
      </div>
    </div>
  )
}
