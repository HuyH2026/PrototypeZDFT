import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { InlinePolicyPreview } from './InlinePolicyPreview'

describe('InlinePolicyPreview', () => {
  it('renders the header, counters, and the rewritten policy blocks', () => {
    render(<InlinePolicyPreview />)
    expect(screen.getByText('Inline policy preview')).toBeInTheDocument()
    expect(screen.getByText('Autoflow policy')).toBeInTheDocument()
    expect(screen.getByText('Confirm before writing', { exact: false })).toBeInTheDocument()
    // 3 changes / 0 resolved / 3 pending initially — three changed diff blocks.
    expect(screen.getByText('Changes')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Accept change:/ })).toHaveLength(3)
    expect(screen.getAllByRole('button', { name: /^Reject change:/ })).toHaveLength(3)
  })

  it('accepting one change moves it from pending to resolved', async () => {
    const user = userEvent.setup()
    render(<InlinePolicyPreview />)
    const acceptButtons = screen.getAllByRole('button', { name: /^Accept change:/ })
    expect(acceptButtons).toHaveLength(3)
    await user.click(acceptButtons[0])
    // The resolved counter should now read 1, and one fewer accept control remains.
    expect(screen.getAllByRole('button', { name: /^Accept change:/ })).toHaveLength(2)
  })

  it('Accept all resolves every change', async () => {
    const user = userEvent.setup()
    render(<InlinePolicyPreview />)
    await user.click(screen.getByRole('button', { name: 'Accept all' }))
    expect(screen.queryByRole('button', { name: /^Accept change:/ })).not.toBeInTheDocument()
  })

  it('Reject all resolves every change', async () => {
    const user = userEvent.setup()
    render(<InlinePolicyPreview />)
    await user.click(screen.getByRole('button', { name: 'Reject all' }))
    expect(screen.queryByRole('button', { name: /^Reject change:/ })).not.toBeInTheDocument()
  })
})
