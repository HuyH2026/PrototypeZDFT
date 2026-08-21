// The Test cases table. Columns: selection · Test Cases · Scenarios · Use Case ·
// Last Run · Pass Rate. Selection is real (the caller owns the state so the
// toolbar can report the count); the sort glyphs are decorative, matching the
// frame — the mock's rows share one timestamp, so sorting them would be a no-op.
import { ArrowDown } from 'lucide-react'
import { Table, Thead, Tbody, Th, Td } from '@/components/flora/Table'
import { PASS_RATE_GOOD_FLOOR, type TestCase } from './test-suite-data'

const TEAL = '#048c80'
const RED = '#e53112'
// The frame's table sits on the cool slate scale, which has no Flora token.
const SLATE_INK = '#545767'
const SLATE_LINE = '#e4e7f0'
const SLATE_MUTED = '#9194a0'
const SLATE_TINT = '#f2f4f7'

// Every column but Scenarios carries the glyph in the frame.
function SortGlyph() {
  return <ArrowDown size={14} className="shrink-0" style={{ color: SLATE_INK }} aria-hidden />
}

function HeaderLabel({
  children,
  sortable = true,
}: {
  children: React.ReactNode
  sortable?: boolean
}) {
  return (
    <span
      className="flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold leading-[17px] tracking-[-0.085px]"
      style={{ color: SLATE_INK }}
    >
      {children}
      {sortable && <SortGlyph />}
    </span>
  )
}

function UseCaseTag({ useCase }: { useCase: string }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-[4px] px-2 py-1"
      style={{ backgroundColor: SLATE_TINT }}
    >
      <span
        aria-hidden
        className="size-[6px] shrink-0 rounded-full"
        style={{ backgroundColor: TEAL }}
      />
      <span
        className="truncate text-[12px] font-medium leading-[18px] tracking-[-0.1px]"
        style={{ color: SLATE_INK }}
      >
        {useCase}
      </span>
    </span>
  )
}

function LastRunBadge({ status }: { status: TestCase['lastRun']['status'] }) {
  const passed = status === 'passed'
  const notRun = status === 'not-run'
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-[6px] px-1.5 py-px text-[14px] font-medium leading-[18px] tracking-[-0.1px] text-white"
      style={{ backgroundColor: notRun ? SLATE_MUTED : passed ? TEAL : RED }}
    >
      {notRun ? 'Not run' : passed ? 'Passed' : 'Failed'}
    </span>
  )
}

export function TestCasesTable({
  testCases,
  selected,
  onToggle,
  onToggleAll,
}: {
  testCases: TestCase[]
  selected: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
}) {
  const allSelected = testCases.length > 0 && testCases.every((t) => selected.has(t.id))
  const someSelected = testCases.some((t) => selected.has(t.id))

  return (
    <Table className="table-fixed min-w-[880px]">
      <Thead>
        <tr>
          <Th className="w-[5%]">
            <input
              type="checkbox"
              checked={allSelected}
              // Mixed state when only part of the list is picked; the DOM property
              // has no attribute equivalent, so it is set on the node.
              ref={(el) => {
                if (el) el.indeterminate = someSelected && !allSelected
              }}
              onChange={onToggleAll}
              aria-label="Select all test cases"
              className="size-4 accent-[#048c80]"
            />
          </Th>
          <Th className="w-[23%] border-r" style={{ borderRightColor: SLATE_LINE }}>
            <HeaderLabel>Test Cases ({testCases.length})</HeaderLabel>
          </Th>
          <Th className="w-[28%]">
            <HeaderLabel sortable={false}>Scenarios</HeaderLabel>
          </Th>
          <Th className="w-[13%]">
            <HeaderLabel>Use Case</HeaderLabel>
          </Th>
          <Th className="w-[21%]">
            <HeaderLabel>Last Run</HeaderLabel>
          </Th>
          <Th className="w-[10%] px-2">
            <HeaderLabel>Pass Rate</HeaderLabel>
          </Th>
        </tr>
      </Thead>
      <Tbody>
        {testCases.map((t) => (
          <tr key={t.id} data-selected={selected.has(t.id) ? 'true' : undefined}>
            <Td>
              <input
                type="checkbox"
                checked={selected.has(t.id)}
                onChange={() => onToggle(t.id)}
                aria-label={`Select ${t.name}`}
                className="size-4 accent-[#048c80]"
              />
            </Td>
            <Td className="border-r" style={{ borderRightColor: SLATE_LINE }}>
              <p className="text-[14px] font-semibold leading-5 tracking-[-0.1px] text-black">
                {t.name}
              </p>
            </Td>
            <Td>
              <p className="line-clamp-2 text-[14px] font-normal leading-5 tracking-[-0.1px] text-black">
                {t.scenario}
              </p>
            </Td>
            <Td>
              <UseCaseTag useCase={t.useCase} />
            </Td>
            <Td>
              <div className="flex items-center gap-1.5">
                <LastRunBadge status={t.lastRun.status} />
                <span
                  className="whitespace-nowrap text-[12px] font-medium leading-[18px] tracking-[-0.1px]"
                  style={{ color: SLATE_MUTED }}
                >
                  {t.lastRun.at}
                </span>
              </div>
            </Td>
            <Td>
              <span
                className="text-[14px] font-bold leading-[22px] tracking-[-0.1px]"
                style={{ color: t.passRate >= PASS_RATE_GOOD_FLOOR ? TEAL : RED }}
              >
                {t.passRate}%
              </span>
            </Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}
