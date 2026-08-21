// Experiment ▸ Test Suite, built from the Figma section (node 81:90448): the
// page header with populated Test cases and Runs tabs, tab-specific stat cards,
// toolbars, and tables. Search and filters are presentational; test-case row
// selection is local so the toolbar can report the count. No backend.
import { useState } from 'react'
import { ChevronDown, FunnelPlus, Search } from 'lucide-react'
import { PageHeader } from '@/components/flora/PageHeader'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'
import { CreateTestCaseFlow, type TestCaseDraft } from './CreateTestCaseFlow'
import { RunsTable } from './RunsTable'
import { TestCaseEditor } from './TestCaseEditor'
import { TestCasesTable } from './TestCasesTable'
import { RunStatCards, TestSuiteStatCards } from './TestSuiteStatCards'
import { TEST_CASES, TEST_RUNS, type TestCase } from './test-suite-data'

type Tab = 'Test cases' | 'Runs'
const TABS: Tab[] = ['Test cases', 'Runs']

export function TestSuiteView() {
  const [tab, setTab] = useState<Tab>('Test cases')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [testCases, setTestCases] = useState<TestCase[]>(TEST_CASES)
  const [createOpen, setCreateOpen] = useState(false)
  const [editorDraft, setEditorDraft] = useState<TestCaseDraft | null>(null)

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === testCases.length ? new Set() : new Set(testCases.map((t) => t.id)),
    )

  const appendDraft = (draft: TestCaseDraft) => {
    setTestCases((current) => [
      ...current,
      {
        id: `created-${current.length + 1}`,
        name: draft.name,
        scenario: draft.scenario,
        useCase: draft.useCase,
        lastRun: { status: 'not-run', at: 'Not run yet' },
        passRate: 0,
      },
    ])
    setEditorDraft(null)
  }

  const toolbar = (kind: 'test-cases' | 'runs') => (
    <div className="flex items-center gap-2">
      <label className="flex w-[263px] items-center gap-2 rounded-[26px] border border-grey-400 bg-white px-3 py-1.5">
        <Search size={16} className="shrink-0 text-ink-muted" aria-hidden />
        <input
          type="text"
          placeholder="Search"
          aria-label={kind === 'test-cases' ? 'Search test cases' : 'Search runs'}
          className="min-w-0 flex-1 bg-transparent text-[14px] leading-5 tracking-[-0.154px] text-ink outline-none placeholder:text-grey-600"
        />
      </label>
      <button
        type="button"
        className="flex h-8 items-center gap-2 rounded-full border border-grey-400 bg-white px-3 text-[12px] font-semibold leading-4 text-ink"
      >
        <FunnelPlus size={16} className="text-ink-muted" aria-hidden />
        Filter by
        <ChevronDown size={16} className="text-ink-muted" aria-hidden />
      </button>
      <p className="text-[12px] leading-[17px] text-grey-700">
        {kind === 'runs'
          ? 'Select to rerun or delete'
          : selected.size > 0
            ? `${selected.size} ${selected.size === 1 ? 'test' : 'tests'} selected`
            : 'Select tests to run or delete'}
      </p>
      {kind === 'test-cases' ? (
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="ml-auto flex h-8 items-center rounded-full bg-ink px-3 text-[12px] font-semibold leading-4 text-white"
        >
          New Test Case
        </button>
      ) : null}
    </div>
  )

  if (editorDraft) {
    return (
      <TestCaseEditor
        initial={editorDraft}
        onCancel={() => setEditorDraft(null)}
        onSave={appendDraft}
      />
    )
  }

  return (
    <div data-testid="view-test-suite" className="h-full overflow-y-auto">
      <PageHeader
        title="Test suite"
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        tablistLabel="Test suite views"
        actions={<AiTriggerButton label="Ask AI about this page" />}
      />

      <div className="flex flex-col gap-6 px-16 pb-16">
        {tab === 'Test cases' ? (
          <>
            <TestSuiteStatCards />

            {toolbar('test-cases')}

            <TestCasesTable
              testCases={testCases}
              selected={selected}
              onToggle={toggle}
              onToggleAll={toggleAll}
            />
          </>
        ) : (
          <>
            <RunStatCards />
            {toolbar('runs')}
            <RunsTable runs={TEST_RUNS} />
          </>
        )}
      </div>

      {createOpen ? (
        <CreateTestCaseFlow
          onClose={() => setCreateOpen(false)}
          onManualCreate={(draft) => {
            setCreateOpen(false)
            setEditorDraft(draft)
          }}
        />
      ) : null}
    </div>
  )
}
