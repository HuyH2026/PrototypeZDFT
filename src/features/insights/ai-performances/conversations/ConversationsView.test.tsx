import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ConversationsView } from './ConversationsView'

describe('ConversationsView', () => {
  it('renders the Widget card grid and the table by default', () => {
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    expect(view.getByRole('heading', { name: 'Total conversations' })).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'CSAT' })).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Quick feedback' })).toBeInTheDocument()
    expect(view.queryByRole('heading', { name: 'Top A2A solve agents' })).not.toBeInTheDocument()
  })

  it('swaps in the A2A cards when Headless is selected', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    await user.click(view.getByRole('tab', { name: 'Headless' }))
    expect(view.queryByRole('heading', { name: 'CSAT' })).not.toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Top A2A solve agents' })).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Top A2A calling clients' })).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Total conversations' })).toBeInTheDocument()
  })

  it('shows a Create insight card tile for every channel except Headless', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    expect(view.getByRole('button', { name: 'Create insight card' })).toBeInTheDocument()
    await user.click(view.getByRole('tab', { name: 'Headless' }))
    expect(view.queryByRole('button', { name: 'Create insight card' })).not.toBeInTheDocument()
  })

  it('shows User query and Resolved columns by default, swapping to Detected agents on Headless', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    expect(view.getByRole('columnheader', { name: 'User query' })).toBeInTheDocument()
    expect(view.getByRole('columnheader', { name: 'Resolved' })).toBeInTheDocument()
    expect(view.queryByRole('columnheader', { name: 'Detected agents' })).not.toBeInTheDocument()
    await user.click(view.getByRole('tab', { name: 'Headless' }))
    expect(view.getByRole('columnheader', { name: 'Detected agents' })).toBeInTheDocument()
    expect(view.queryByRole('columnheader', { name: 'User query' })).not.toBeInTheDocument()
  })

  it('hides the card grid when Collapse cards is toggled', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    expect(view.getByRole('heading', { name: 'Automated resolutions (AR)' })).toBeInTheDocument()
    await user.click(view.getByRole('button', { name: /Collapse cards/ }))
    expect(view.queryByRole('heading', { name: 'Automated resolutions (AR)' })).not.toBeInTheDocument()
  })

  it('filters the table to gap rows when Gaps only is checked', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    // A non-gap transcript line is present initially…
    expect(view.getByText(/I want a refund for order 88213/)).toBeInTheDocument()
    await user.click(view.getByRole('checkbox', { name: 'Gaps only' }))
    // …and gone once filtered to gap rows only.
    expect(view.queryByText(/I want a refund for order 88213/)).not.toBeInTheDocument()
    // A gap row remains.
    expect(view.getByText(/Abnormal bank statement/)).toBeInTheDocument()
  })

  it('keeps the shared flush and rounded body treatment on the Conversations table', () => {
    render(<ConversationsView />)
    const [thead, tbody] = within(screen.getByTestId('view-conversations')).getAllByRole('rowgroup')

    expect(thead).toHaveClass('bg-transparent')
    expect(thead.className).not.toContain('shadow')
    expect(tbody).toHaveClass('bg-white')
    expect(tbody.className).not.toContain('shadow')
    expect(tbody).toHaveClass('[&_tr:first-child>td:first-child]:rounded-tl-[24px]')
    expect(tbody).toHaveClass('[&_tr:first-child>td:last-child]:rounded-tr-[24px]')
  })

  it('opens the detail panel when a table row is clicked and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    await user.click(view.getByText(/Abnormal bank statement/))
    const dialog = screen.getByRole('dialog', { name: 'Conversation Details' })
    expect(within(dialog).getByText('Chat ID')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Conversation Details' })).not.toBeInTheDocument()
  })

  it('shows a State chip column on Widget only', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    expect(view.getByRole('columnheader', { name: 'State' })).toBeInTheDocument()
    // g-1 and g-4 are both partial failures, so this is getAll, not get.
    expect(view.getAllByText('Partial failure')).toHaveLength(2)
    expect(view.getAllByText('Healthy')).toHaveLength(2)
    expect(view.getByText('Unresolved')).toBeInTheDocument()
    await user.click(view.getByRole('tab', { name: 'Voice' }))
    expect(view.queryByRole('columnheader', { name: 'State' })).not.toBeInTheDocument()
  })

  it('filters the table to non-healthy rows when Errors only is checked', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    await user.click(view.getByRole('checkbox', { name: 'Errors only' }))
    expect(view.queryByText('Healthy')).not.toBeInTheDocument()
    expect(view.getByText('Unresolved')).toBeInTheDocument()
    expect(view.getAllByText('Partial failure')).toHaveLength(2)
  })

  it('offers Errors only on Widget alone, and drops it when the channel changes', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    await user.click(view.getByRole('checkbox', { name: 'Errors only' }))
    await user.click(view.getByRole('tab', { name: 'Voice' }))
    expect(view.queryByRole('checkbox', { name: 'Errors only' })).not.toBeInTheDocument()
    await user.click(view.getByRole('tab', { name: 'Widget' }))
    // The filter resets rather than surviving invisibly on a channel that can't show it.
    expect(view.getByRole('checkbox', { name: 'Errors only' })).not.toBeChecked()
    expect(view.getAllByText('Healthy')).toHaveLength(2)
  })
})
