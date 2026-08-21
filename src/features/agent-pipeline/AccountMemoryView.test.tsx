import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AccountMemoryView } from './AccountMemoryView'
import { MEMORY, type MemoryEntry } from './pipeline-data'

const DECLINED: MemoryEntry = {
  id: 'declined-api-branch',
  title: 'Add an unapproved API dependency',
  agentName: 'Password Reset',
  triedInCycle: 148,
  outcome: 'Declined before any test or application',
  verdict: 'declined',
  retryLabel: 'Saved as a customer constraint until you revisit it',
}

describe('AccountMemoryView', () => {
  it('surfaces a declined decision in learned constraints and keeps its ledger entry', () => {
    render(<AccountMemoryView entries={[...MEMORY, DECLINED]} guidanceEntries={[]} />)

    const constraints = within(screen.getByTestId('learned-constraints-card'))
    expect(
      constraints.getByText(
        'Do not pursue “Add an unapproved API dependency” for Password Reset unless you revisit the decision.',
      ),
    ).toBeInTheDocument()

    const declinedLedger = within(screen.getByTestId('memory-group-declined'))
    expect(declinedLedger.getByText(DECLINED.title)).toBeInTheDocument()
    expect(declinedLedger.getByText(DECLINED.retryLabel)).toBeInTheDocument()
  })

  it('does not repeat static or equivalent decision-derived constraints', () => {
    const duplicateDecision: MemoryEntry = { ...DECLINED, id: 'declined-api-branch-copy' }
    render(
      <AccountMemoryView entries={[...MEMORY, DECLINED, duplicateDecision]} guidanceEntries={[]} />,
    )

    const constraints = within(screen.getByTestId('learned-constraints-card'))
    expect(
      constraints.getAllByText('Never trade below the 4.17 AI-interaction CSAT floor.'),
    ).toHaveLength(1)
    expect(
      constraints.getAllByText(
        'Do not pursue “Add an unapproved API dependency” for Password Reset unless you revisit the decision.',
      ),
    ).toHaveLength(1)
  })

  it('does not turn experiment outcomes into customer constraints', () => {
    render(<AccountMemoryView entries={MEMORY} guidanceEntries={[]} />)

    const constraints = within(screen.getByTestId('learned-constraints-card'))
    for (const entry of MEMORY) expect(constraints.queryByText(entry.title)).toBeNull()
  })

  it('threads reconsideration from the declined ledger to its parent', async () => {
    const user = userEvent.setup()
    const onReconsider = vi.fn()
    render(
      <AccountMemoryView
        entries={[...MEMORY, DECLINED]}
        guidanceEntries={[]}
        onReconsider={onReconsider}
      />,
    )

    await user.click(
      within(screen.getByTestId(`memory-row-${DECLINED.id}`)).getByRole('button', {
        name: `Reconsider ${DECLINED.title}`,
      }),
    )

    expect(onReconsider).toHaveBeenCalledWith('api-branch')
  })
})
