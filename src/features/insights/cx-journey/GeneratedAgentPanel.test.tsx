import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GeneratedAgentPanel } from './GeneratedAgentPanel'

const renderPanel = (onClose = vi.fn()) => {
  render(<GeneratedAgentPanel topic="Reactivate account" onClose={onClose} />)
  return { onClose, dialog: within(screen.getByRole('dialog')) }
}

describe('GeneratedAgentPanel', () => {
  it('shows the topic chip and Create Agent tab by default', () => {
    const { dialog } = renderPanel()
    expect(dialog.getByText('Generated Agent')).toBeInTheDocument()
    expect(dialog.getAllByText('Reactivate account').length).toBeGreaterThanOrEqual(1)
    expect(dialog.getByText('3,144')).toBeInTheDocument()
  })

  it('switches to the Generate Policy tab', async () => {
    const user = userEvent.setup()
    const { dialog } = renderPanel()
    await user.click(dialog.getByRole('tab', { name: 'Generate Policy' }))
    expect(dialog.getByText('Generated Autoflow policy')).toBeInTheDocument()
  })

  it('switches to the Ticket Sources tab', async () => {
    const user = userEvent.setup()
    const { dialog } = renderPanel()
    await user.click(dialog.getByRole('tab', { name: 'Ticket Sources' }))
    expect(dialog.getByText(/Ticket ID:/)).toBeInTheDocument()
  })

  it('enables Create once a training-phrase row is checked', async () => {
    const user = userEvent.setup()
    const { dialog } = renderPanel()
    const create = dialog.getByRole('button', { name: 'Create' })
    expect(create).toBeDisabled()
    await user.click(dialog.getByLabelText('Refund not received'))
    expect(create).toBeEnabled()
  })

  it('closes on Escape, scrim click, and the X button', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<GeneratedAgentPanel topic="Reactivate account" onClose={onClose} />)
    await user.keyboard('{Escape}')
    await user.click(screen.getByTestId('generated-agent-scrim'))
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
