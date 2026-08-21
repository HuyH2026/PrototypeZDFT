import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TopicsTable } from './TopicsTable'

describe('TopicsTable view toggle', () => {
  it('renders the updated Topics filters and view controls', () => {
    render(<TopicsTable />)

    expect(screen.getByRole('button', { name: 'Last 30 days' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All filters' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Human only' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Table view' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Treemap view' })).toBeInTheDocument()
    expect(screen.getByText('Topic (78)')).toBeInTheDocument()
  })

  it('shows the table view by default', () => {
    render(<TopicsTable />)
    expect(screen.queryByTestId('topics-treemap')).not.toBeInTheDocument()
    expect(screen.getByText('Account Management')).toBeInTheDocument()
  })

  it('can collapse and reopen the default Payment Management details', async () => {
    const user = userEvent.setup()
    render(<TopicsTable />)
    const payment = screen.getByRole('button', { name: /Payment Management/ })

    expect(screen.getByText('Refund Requests and Inquiries')).toBeInTheDocument()
    await user.click(payment)
    expect(screen.queryByText('Refund Requests and Inquiries')).not.toBeInTheDocument()
    await user.click(payment)
    expect(screen.getByText('Refund Requests and Inquiries')).toBeInTheDocument()
  })

  it('switches to the treemap view when the treemap toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<TopicsTable />)
    const toggle = screen.getByRole('button', { name: 'Treemap view' })
    await user.click(toggle)
    expect(screen.getByTestId('topics-treemap')).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches back to the table view from the table control', async () => {
    const user = userEvent.setup()
    render(<TopicsTable />)
    await user.click(screen.getByRole('button', { name: 'Treemap view' }))
    await user.click(screen.getByRole('button', { name: 'Table view' }))
    expect(screen.queryByTestId('topics-treemap')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Table view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
