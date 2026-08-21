import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CreateUseCasePanel } from './CreateUseCasePanel'

const ASSIGN_TO_EXISTING = /Assign this topic to an existing use case/

function renderPanel(onClose = vi.fn(), topic = 'Refund Request') {
  render(<CreateUseCasePanel topic={topic} opener={null} onClose={onClose} />)
  return { onClose, dialog: within(screen.getByRole('dialog', { name: 'Create use case' })) }
}

describe('CreateUseCasePanel', () => {
  it('uses the design terminology in the title and tabs', () => {
    const { dialog } = renderPanel()
    expect(dialog.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(dialog.getByRole('tab', { name: 'Generated policy' })).toBeInTheDocument()
    expect(dialog.getByRole('tab', { name: 'Ticket source' })).toBeInTheDocument()
  })

  it('uses use case wording on the footer actions', () => {
    const { dialog } = renderPanel()
    expect(dialog.getByRole('button', { name: 'Create new use case' })).toBeInTheDocument()
    expect(dialog.getByRole('button', { name: ASSIGN_TO_EXISTING })).toBeInTheDocument()
  })

  it('explains the recurring request and suggested policy', () => {
    const { dialog } = renderPanel()

    expect(
      dialog.getByText(
        /We found a recurring customer request .* Review the suggested policy, then create a new use case/,
      ),
    ).toBeInTheDocument()
    expect(dialog.getByText('Suggested policy summary')).toBeInTheDocument()
  })

  it('names the clicked topic in the header', () => {
    const { dialog } = renderPanel(vi.fn(), 'Card and Account Services')

    expect(dialog.getByText('Card and Account Services')).toBeInTheDocument()
  })

  it('marks the drawer as modal', () => {
    renderPanel()

    expect(screen.getByRole('dialog', { name: 'Create use case' })).toHaveAttribute(
      'aria-modal',
      'true',
    )
  })

  it('moves initial focus to the close action', () => {
    const { dialog } = renderPanel()

    expect(dialog.getByRole('button', { name: 'Close' })).toHaveFocus()
  })

  it('wraps Tab from the last enabled action to the first action', async () => {
    const user = userEvent.setup()
    const { dialog } = renderPanel()
    const close = dialog.getByRole('button', { name: 'Close' })
    const last = dialog.getByRole('button', { name: ASSIGN_TO_EXISTING })

    last.focus()
    await user.tab()

    expect(close).toHaveFocus()
  })

  it('wraps Shift+Tab from the first action to the last enabled action', async () => {
    const user = userEvent.setup()
    const { dialog } = renderPanel()
    const close = dialog.getByRole('button', { name: 'Close' })
    const last = dialog.getByRole('button', { name: ASSIGN_TO_EXISTING })

    close.focus()
    await user.tab({ shift: true })

    expect(last).toHaveFocus()
  })

  it('switches between Generated policy and Ticket source', async () => {
    const user = userEvent.setup()
    const { dialog } = renderPanel()
    await user.click(dialog.getByRole('tab', { name: 'Generated policy' }))
    expect(dialog.getByText('Generated actions:')).toBeInTheDocument()
    await user.click(dialog.getByRole('tab', { name: 'Ticket source' }))
    expect(dialog.getByText(/Ticket ID:/)).toBeInTheDocument()
  })

  it('preselects the first similar topic, as the design shows', () => {
    const { dialog } = renderPanel()
    const rows = dialog.getAllByRole('checkbox', { name: /^Select (?!all similar)/ })

    expect((rows[0] as HTMLInputElement).checked).toBe(true)
    expect(rows.slice(1).some((row) => (row as HTMLInputElement).checked)).toBe(false)
  })

  it('marks the similar-topic header checkbox indeterminate for that partial selection', () => {
    const { dialog } = renderPanel()
    const selectAll = dialog.getByRole('checkbox', {
      name: 'Select all similar topics',
    }) as HTMLInputElement

    expect(selectAll.indeterminate).toBe(true)
  })

  it('closes from Escape, scrim, and close button', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<CreateUseCasePanel topic="Refund Request" opener={null} onClose={onClose} />)
    await user.keyboard('{Escape}')
    await user.click(screen.getByTestId('create-use-case-scrim'))
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
