import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MEMORY, type MemoryEntry } from './pipeline-data'
import { MemoryPanel } from './MemoryPanel'

describe('MemoryPanel', () => {
  it('separates what was ruled out from what is working', () => {
    render(<MemoryPanel entries={MEMORY} />)
    const view = within(screen.getByTestId('memory-panel'))
    const ruledOut = within(view.getByTestId('memory-group-ruled-out'))
    const working = within(view.getByTestId('memory-group-working'))
    for (const entry of MEMORY) {
      const group = entry.verdict === 'ruled-out' ? ruledOut : working
      expect(group.getByText(entry.title)).toBeInTheDocument()
    }
  })

  it('gives each entry its outcome, its cycle, and when it may be retried', () => {
    render(<MemoryPanel entries={MEMORY} />)
    const view = within(screen.getByTestId('memory-panel'))
    for (const entry of MEMORY) {
      const row = within(view.getByTestId(`memory-row-${entry.id}`))
      expect(row.getByText(entry.outcome)).toBeInTheDocument()
      expect(row.getByText(entry.retryLabel)).toBeInTheDocument()
      expect(row.getByText(new RegExp(`cycle ${entry.triedInCycle}`, 'i'))).toBeInTheDocument()
    }
  })

  it('counts each group in its heading', () => {
    render(<MemoryPanel entries={MEMORY} />)
    const ruledOutCount = MEMORY.filter((entry) => entry.verdict === 'ruled-out').length
    expect(
      within(screen.getByTestId('memory-group-ruled-out')).getByRole('heading'),
    ).toHaveTextContent(`Ruled out · ${ruledOutCount}`)
    expect(
      within(screen.getByTestId('memory-group-working')).getByRole('heading'),
    ).toHaveTextContent('Working / monitoring')
  })

  it('keeps a declined proposal separate from ruled-out experiments', () => {
    const declined: MemoryEntry = {
      id: 'declined-example',
      title: 'Add an unapproved API dependency',
      agentName: 'Password Reset',
      triedInCycle: 148,
      outcome: 'Declined before any test or application',
      verdict: 'declined',
      retryLabel: 'Saved as a customer constraint until you revisit it',
    }

    render(<MemoryPanel entries={[...MEMORY, declined]} />)

    const group = within(screen.getByTestId('memory-group-declined'))
    expect(group.getByRole('heading')).toHaveTextContent('Declined by you · 1')
    expect(group.getByText(declined.title)).toBeInTheDocument()
    expect(group.getByText(/proposed in cycle 148/i)).toBeInTheDocument()
  })

  it('reconsiders a declined entry using its underlying change id', async () => {
    const user = userEvent.setup()
    const onReconsider = vi.fn()
    const declined: MemoryEntry = {
      id: 'declined-if4-api-branch',
      title: 'Add an unapproved API dependency',
      agentName: 'Password Reset',
      triedInCycle: 148,
      outcome: 'Declined before any test or application',
      verdict: 'declined',
      retryLabel: 'Saved as a customer constraint until you revisit it',
    }
    render(<MemoryPanel entries={[declined]} onReconsider={onReconsider} />)

    await user.click(screen.getByRole('button', { name: `Reconsider ${declined.title}` }))

    expect(onReconsider).toHaveBeenCalledWith('if4-api-branch')
  })

  it('does not offer reconsideration for a malformed declined entry id', () => {
    const declined: MemoryEntry = {
      id: 'declined-',
      title: 'Malformed decision memory',
      agentName: 'Password Reset',
      triedInCycle: 148,
      outcome: 'Declined before any test or application',
      verdict: 'declined',
      retryLabel: 'Saved as a customer constraint until you revisit it',
    }
    render(<MemoryPanel entries={[declined]} onReconsider={vi.fn()} />)

    expect(screen.queryByRole('button', { name: /reconsider/i })).not.toBeInTheDocument()
  })

  it('says so when the loop has learned nothing yet', () => {
    render(<MemoryPanel entries={[]} />)
    expect(screen.getByTestId('memory-empty')).toBeInTheDocument()
  })
})
