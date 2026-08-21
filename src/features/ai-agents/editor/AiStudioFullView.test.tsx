import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AiStudioFullView } from './AiStudioFullView'

describe('AiStudioFullView', () => {
  it('renders the plan detail with summary, section, and constraints/content', () => {
    render(<AiStudioFullView onClose={vi.fn()} onApprove={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'AI Studio — Review plan' })).toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('Update Policy Description')).toBeInTheDocument()
    expect(screen.getByText('Call to Action')).toBeInTheDocument()
    expect(screen.getByText('Constraints')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    // Sections 02 and 03.
    expect(screen.getByText('Add a buttons step asking clothes vs shoes')).toBeInTheDocument()
    expect(screen.getByText('Add response messages for each branch')).toBeInTheDocument()
  })

  it('has no Approve button (approval is typed in the composer)', () => {
    render(<AiStudioFullView onClose={vi.fn()} onApprove={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
  })

  it('typing "Approve" shows the Approved badge + Working indicator and fires onApprove', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    render(<AiStudioFullView onClose={vi.fn()} onApprove={onApprove} />)
    expect(screen.queryByText('Approved')).not.toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('What can I help you with today?'), 'approve{Enter}')

    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Working...')).toBeInTheDocument()
    expect(onApprove).toHaveBeenCalledTimes(1)
  })

  it('typing a non-approve message does not approve', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    render(<AiStudioFullView onClose={vi.fn()} onApprove={onApprove} />)
    await user.type(screen.getByPlaceholderText('What can I help you with today?'), 'tell me more{Enter}')
    expect(onApprove).not.toHaveBeenCalled()
    expect(screen.queryByText('Approved')).not.toBeInTheDocument()
  })

  it('close fires onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AiStudioFullView onClose={onClose} onApprove={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Close review plan' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
