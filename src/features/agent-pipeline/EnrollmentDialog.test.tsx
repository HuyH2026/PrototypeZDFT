import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedAgents } from '@/features/ai-agents/agent-store'
import { EnrollmentDialog } from './EnrollmentDialog'

const AGENT = seedAgents().find((agent) => agent.id === 'w8') ?? seedAgents()[0]

function DrawerEnrollmentHarness() {
  const [open, setOpen] = useState(false)

  return (
    <aside aria-label="Agent details drawer">
      <button type="button" onClick={() => setOpen(true)}>
        Enable Suggest &amp; test
      </button>
      {open ? (
        <EnrollmentDialog
          agent={AGENT}
          targetMode="suggest"
          onConfirm={() => {}}
          onCancel={() => setOpen(false)}
        />
      ) : null}
    </aside>
  )
}

describe('EnrollmentDialog', () => {
  it('shows the immutable baseline, day-60 target, and requested mode', () => {
    render(
      <EnrollmentDialog
        agent={AGENT}
        targetMode="suggest"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Enroll agent' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByText(AGENT.name)).toBeInTheDocument()
    expect(screen.getAllByText('Suggest & test').length).toBeGreaterThan(0)
    const baseline = screen
      .getByRole('heading', { name: 'Immutable baseline snapshot' })
      .closest('section')!
    expect(within(baseline).getByText(AGENT.resolutionRate)).toBeInTheDocument()
    expect(within(baseline).getByText(AGENT.csat.toFixed(1))).toBeInTheDocument()

    const contract = screen
      .getByRole('heading', { name: '60-day outcome contract' })
      .closest('section')!
    expect(within(contract).getByText('Day-60 resolution target')).toBeInTheDocument()
    expect(within(contract).getByText('+5 points')).toBeInTheDocument()
    expect(within(contract).getByText('CSAT floor')).toBeInTheDocument()
    expect(within(contract).getByText('4.17')).toBeInTheDocument()
    expect(within(contract).getByText(/locked platform hard floor/i)).toBeInTheDocument()
    expect(within(contract).queryByText(AGENT.csat.toFixed(1))).not.toBeInTheDocument()
  })

  it('describes the authority granted by Full management', () => {
    render(
      <EnrollmentDialog agent={AGENT} targetMode="full" onConfirm={() => {}} onCancel={() => {}} />,
    )

    expect(screen.getAllByText('Full management').length).toBeGreaterThan(0)
    expect(
      screen.getByText(/apply proven low-risk winners and hold anything outside the guardrails/i),
    ).toBeInTheDocument()
  })

  it('confirms enrollment and cancels from the button or scrim', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <EnrollmentDialog
        agent={AGENT}
        targetMode="suggest"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Enroll agent' }))
    expect(onConfirm).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()

    await user.click(screen.getByTestId('enrollment-scrim'))
    expect(onCancel).toHaveBeenCalledTimes(2)
  })

  it('cancels on Escape', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <EnrollmentDialog agent={AGENT} targetMode="full" onConfirm={() => {}} onCancel={onCancel} />,
    )

    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('returns focus to the underlying drawer control after Escape', async () => {
    const user = userEvent.setup()
    render(<DrawerEnrollmentHarness />)
    const drawerControl = screen.getByRole('button', { name: 'Enable Suggest & test' })

    await user.click(drawerControl)
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Enroll agent' })).not.toBeInTheDocument()
    expect(drawerControl).toHaveFocus()
  })
})
