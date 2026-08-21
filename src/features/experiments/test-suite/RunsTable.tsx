import { ArrowDown, Info } from 'lucide-react'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import type { TestRun } from './test-suite-data'

const TEAL = '#048c80'
const RED = '#e53112'
const SLATE = '#545767'
const SLATE_TINT = '#f2f4f7'

function HeaderLabel({ children, info = false }: { children: React.ReactNode; info?: boolean }) {
  return (
    <span
      className="flex items-center gap-1 text-[12px] font-semibold leading-[17px]"
      style={{ color: SLATE }}
    >
      {children}
      {info ? <Info size={13} aria-hidden /> : <ArrowDown size={14} aria-hidden />}
    </span>
  )
}

function UseCaseTag({ children }: { children: string }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-[4px] px-2 py-1"
      style={{ backgroundColor: SLATE_TINT }}
    >
      <span
        className="size-[6px] shrink-0 rounded-full"
        style={{ backgroundColor: TEAL }}
        aria-hidden
      />
      <span className="truncate text-[12px] font-medium leading-[18px]" style={{ color: SLATE }}>
        {children}
      </span>
    </span>
  )
}

function ResultBadge({ result }: { result: TestRun['result'] }) {
  const label = result === 'in-progress' ? 'In progress' : result === 'passed' ? 'Passed' : 'Failed'
  const color = result === 'in-progress' ? '#9194a0' : result === 'passed' ? TEAL : RED
  return (
    <span
      className="inline-flex rounded-[6px] px-1.5 py-px text-[14px] font-medium leading-[18px] text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  )
}

export function RunsTable({ runs }: { runs: TestRun[] }) {
  return (
    <Table>
      <Thead>
        <tr>
          <Th className="w-[56px]">
            <input
              type="checkbox"
              aria-label="Select all runs"
              className="size-4 accent-[#048c80]"
            />
          </Th>
          <Th className="w-[150px]">
            <HeaderLabel>Last Run</HeaderLabel>
          </Th>
          <Th className="w-[230px]">
            <HeaderLabel>Test Case</HeaderLabel>
          </Th>
          <Th className="w-[190px]">
            <HeaderLabel>Use Case</HeaderLabel>
          </Th>
          <Th className="w-[140px]">
            <HeaderLabel>Result</HeaderLabel>
          </Th>
          <Th>
            <HeaderLabel info>Reasoning</HeaderLabel>
          </Th>
        </tr>
      </Thead>
      <Tbody>
        {runs.map((run) => (
          <tr key={run.id}>
            <Td>
              <input
                type="checkbox"
                aria-label={`Select run for ${run.testCase}`}
                className="size-4 accent-[#048c80]"
              />
            </Td>
            <Td>
              <span className="text-[12px] leading-[17px] text-grey-700">{run.lastRun}</span>
            </Td>
            <Td>
              <p className="text-[14px] font-semibold leading-5 text-ink">{run.testCase}</p>
            </Td>
            <Td>
              <UseCaseTag>{run.useCase}</UseCaseTag>
            </Td>
            <Td>
              <ResultBadge result={run.result} />
            </Td>
            <Td>
              <p className="max-w-[460px] text-[12px] leading-[17px] text-ink">{run.reasoning}</p>
            </Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}
