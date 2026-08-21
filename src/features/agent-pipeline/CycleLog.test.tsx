import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ALL_CHANGES, CYCLES, MEMORY, TOTAL_CYCLES, type Decisions } from './pipeline-data'
import { CycleLog } from './CycleLog'

function renderLog(selectedId = CYCLES[0].id, onSelect = vi.fn(), decisions: Decisions = {}) {
  render(
    <CycleLog
      cycles={CYCLES}
      totalCycles={TOTAL_CYCLES}
      changes={ALL_CHANGES}
      memory={MEMORY}
      decisions={decisions}
      selectedId={selectedId}
      onSelect={onSelect}
    />,
  )
  return { view: within(screen.getByTestId('cycle-log')), onSelect }
}

describe('CycleLog', () => {
  it('says it is showing a window onto a longer history', () => {
    const { view } = renderLog()
    expect(
      view.getByText(`Last ${CYCLES.length} cycles · ${TOTAL_CYCLES} total`),
    ).toBeInTheDocument()
  })

  it('renders a row per cycle, newest first', () => {
    const { view } = renderLog()
    const rows = view.getAllByTestId(/^cycle-row-/)
    expect(rows).toHaveLength(CYCLES.length)
    expect(rows[0]).toHaveTextContent(`#${CYCLES[0].ordinal}`)
    expect(rows[0]).toHaveTextContent(CYCLES[0].whenLabel)
  })

  it('shows the selected cycle expanded, with its journal', () => {
    const { view } = renderLog()
    const detail = within(view.getByTestId(`cycle-detail-${CYCLES[0].id}`))
    const closeRecord = within(view.getByTestId(`cycle-close-record-${CYCLES[0].id}`))
    expect(
      closeRecord.getByRole('heading', { name: 'Cycle-close record · immutable' }),
    ).toBeInTheDocument()
    for (const line of CYCLES[0].journal) {
      expect(closeRecord.getByText(line)).toBeInTheDocument()
    }
    expect(detail.queryByTestId(`cycle-after-close-${CYCLES[0].id}`)).toBeNull()
  })

  it('collapses the cycles that are not selected', () => {
    const { view } = renderLog()
    expect(view.queryByTestId(`cycle-detail-${CYCLES[1].id}`)).toBeNull()
  })

  it('reports a selection when another row is clicked', async () => {
    const { view, onSelect } = renderLog()
    await userEvent.click(view.getByRole('button', { name: new RegExp(`#${CYCLES[2].ordinal}`) }))
    expect(onSelect).toHaveBeenCalledWith(CYCLES[2].id)
  })

  it('marks the selected row for assistive tech', () => {
    const { view } = renderLog()
    expect(view.getByRole('button', { name: new RegExp(`#${CYCLES[0].ordinal}`) })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(view.getByRole('button', { name: new RegExp(`#${CYCLES[1].ordinal}`) })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('lists the changes a cycle produced, with the operator’s reasoning', () => {
    const { view } = renderLog()
    const detail = within(view.getByTestId(`cycle-detail-${CYCLES[0].id}`))
    const first = ALL_CHANGES.find((change) => change.id === CYCLES[0].changeIds[0])!
    expect(detail.getByText(first.title)).toBeInTheDocument()
    expect(detail.getByText(first.rationale)).toBeInTheDocument()
  })

  it('says so when a cycle took no action', async () => {
    const quiet = CYCLES.find((cycle) => cycle.changeIds.length === 0)!
    render(
      <CycleLog
        cycles={CYCLES}
        totalCycles={TOTAL_CYCLES}
        changes={ALL_CHANGES}
        memory={MEMORY}
        decisions={{}}
        selectedId={quiet.id}
        onSelect={vi.fn()}
      />,
    )
    expect(
      within(screen.getByTestId(`cycle-detail-${quiet.id}`)).getByText(/changed nothing/i),
    ).toBeInTheDocument()
  })

  it('shows what the selected cycle recalled from memory', () => {
    const withRecall = CYCLES.find((cycle) => cycle.recalled.length > 0)!
    const { view } = renderLog(withRecall.id)
    const recalled = within(view.getByTestId(`cycle-recalled-${withRecall.id}`))
    for (const id of withRecall.recalled) {
      const entry = MEMORY.find((candidate) => candidate.id === id)!
      expect(recalled.getByText(new RegExp(entry.title))).toBeInTheDocument()
    }
  })

  it('renders no recalled block for a cycle that consulted no memory', () => {
    const quiet = CYCLES.find((cycle) => cycle.recalled.length === 0)!
    const { view } = renderLog(quiet.id)
    expect(view.queryByTestId(`cycle-recalled-${quiet.id}`)).toBeNull()
    expect(
      within(screen.getByTestId('cycle-log')).queryAllByTestId(/^cycle-recalled-/),
    ).toHaveLength(0)
  })

  it('keeps the cycle-close record immutable and separates later operator decisions', () => {
    const held = ALL_CHANGES.find((change) => change.id === 'if4')!
    const { view } = renderLog(CYCLES[0].id, vi.fn(), { [held.id]: 'approved' })
    const row = within(view.getByTestId(`cycle-row-${CYCLES[0].id}`))
    const closeSummary = within(row.getByRole('button'))
    expect(closeSummary.getByText(/2 pending asks/i)).toBeInTheDocument()
    expect(closeSummary.getByText(/1 experiment running/i)).toBeInTheDocument()

    const closeRecord = within(view.getByTestId(`cycle-close-record-${CYCLES[0].id}`))
    expect(
      closeRecord.getByText('Cycle complete — 3 applied, 1 experiment running, 2 pending asks'),
    ).toBeInTheDocument()
    expect(closeRecord.queryByText(/guarded experiment authorized after cycle close/i)).toBeNull()

    const afterClose = within(view.getByTestId(`cycle-after-close-${CYCLES[0].id}`))
    expect(
      afterClose.getByRole('heading', { name: 'After cycle close · operator decisions' }),
    ).toBeInTheDocument()
    expect(
      afterClose.getByText(`${held.title}: guarded experiment authorized after cycle close`),
    ).toBeInTheDocument()
  })
})
