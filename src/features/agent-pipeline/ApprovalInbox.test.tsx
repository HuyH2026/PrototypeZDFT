import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ALL_CHANGES, GATE_LABEL } from './pipeline-data'
import { heldChanges } from './pipeline-selectors'
import { ApprovalInbox } from './ApprovalInbox'

const HELD = heldChanges(ALL_CHANGES, {})

describe('ApprovalInbox', () => {
  it('lists every held change with the guardrail that held it', () => {
    render(<ApprovalInbox changes={HELD} onDecide={vi.fn()} />)
    const view = within(screen.getByTestId('approval-inbox'))
    for (const change of HELD) {
      const row = within(view.getByTestId(`inbox-row-${change.id}`))
      expect(row.getByText(change.title)).toBeInTheDocument()
      expect(row.getByText(GATE_LABEL[change.gate])).toBeInTheDocument()
      expect(row.getByText(change.blastRadius)).toBeInTheDocument()
    }
  })

  it('frames the queue as current pending asks without claiming other work shipped', () => {
    render(<ApprovalInbox changes={HELD} onDecide={vi.fn()} />)
    const view = within(screen.getByTestId('approval-inbox'))
    expect(view.getByRole('heading', { name: 'Pending asks' })).toBeInTheDocument()
    expect(
      view.getByText('2 current proposals need your decision before testing.'),
    ).toBeInTheDocument()
    expect(view.queryByText(/shipped itself/i)).toBeNull()
  })

  it('uses singular proposal copy for one current ask', () => {
    render(<ApprovalInbox changes={[HELD[0]]} onDecide={vi.fn()} />)
    expect(
      within(screen.getByTestId('approval-inbox')).getByText(
        '1 current proposal needs your decision before testing.',
      ),
    ).toBeInTheDocument()
  })

  it('labels the primary action for the test each existing proposal authorizes', async () => {
    const onDecide = vi.fn()
    render(<ApprovalInbox changes={HELD} onDecide={onDecide} />)
    const apiChange = HELD.find((change) => change.gate === 'new-api-call')!
    const flowChange = HELD.find((change) => change.gate === 'core-flow')!

    const apiRow = within(screen.getByTestId(`inbox-row-${apiChange.id}`))
    const flowRow = within(screen.getByTestId(`inbox-row-${flowChange.id}`))
    expect(apiRow.getByRole('button', { name: /approve guarded test/i })).toBeInTheDocument()
    expect(flowRow.getByRole('button', { name: /approve a\/b test/i })).toBeInTheDocument()

    await userEvent.click(apiRow.getByRole('button', { name: /approve guarded test/i }))
    expect(onDecide).toHaveBeenCalledWith(apiChange.id, 'approved')
  })

  it('uses neutral decline copy while preserving the existing decision behavior', async () => {
    const onDecide = vi.fn()
    render(<ApprovalInbox changes={HELD} onDecide={onDecide} />)
    const row = within(screen.getByTestId(`inbox-row-${HELD[1].id}`))
    await userEvent.click(row.getByRole('button', { name: /decline/i }))
    expect(onDecide).toHaveBeenCalledWith(HELD[1].id, 'rejected')
  })

  it('shows a neutral empty state without implying what happened to other changes', () => {
    render(<ApprovalInbox changes={[]} onDecide={vi.fn()} />)
    const view = within(screen.getByTestId('approval-inbox'))
    expect(view.getByRole('heading', { name: 'Pending asks' })).toBeInTheDocument()
    expect(view.getByTestId('inbox-empty')).toHaveTextContent('No pending asks right now.')
    expect(view.queryByText(/shipped/i)).toBeNull()
    expect(view.queryByRole('button')).toBeNull()
  })

  it('holds proposal decisions while the loop is paused', async () => {
    const user = userEvent.setup()
    const onDecide = vi.fn()
    render(<ApprovalInbox changes={HELD} disabled onDecide={onDecide} />)
    const view = within(screen.getByTestId('approval-inbox'))
    expect(view.getAllByRole('button')).not.toHaveLength(0)
    for (const button of view.getAllByRole('button')) expect(button).toBeDisabled()
    expect(view.getByText(/resume the loop/i)).toBeInTheDocument()

    for (const button of view.getAllByRole('button')) await user.click(button)
    expect(onDecide).not.toHaveBeenCalled()
  })

  it('enforces per-agent authority without blocking unrelated rows', async () => {
    const user = userEvent.setup()
    const onDecide = vi.fn()
    const blocked = HELD[0]
    render(
      <ApprovalInbox
        changes={HELD}
        getDisabledReason={(change) =>
          change.id === blocked.id ? `${change.agentName} is in Shadow mode.` : null
        }
        onDecide={onDecide}
      />,
    )

    const blockedRow = within(screen.getByTestId(`inbox-row-${blocked.id}`))
    expect(blockedRow.getByText(/Shadow mode/i)).toBeInTheDocument()
    for (const button of blockedRow.getAllByRole('button')) expect(button).toBeDisabled()

    const openRow = within(screen.getByTestId(`inbox-row-${HELD[1].id}`))
    await user.click(openRow.getByRole('button', { name: /approve/i }))
    expect(onDecide).toHaveBeenCalledWith(HELD[1].id, 'approved')
  })
})
