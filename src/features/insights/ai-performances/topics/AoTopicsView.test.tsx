import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AoTopicsView } from './AoTopicsView'

const view = () => within(screen.getByTestId('view-ao-topics'))

describe('AoTopicsView', () => {
  it('draws the six cards and no channel pill group', () => {
    render(<AoTopicsView />)
    for (const title of [
      'Conversations with Topics',
      'CSAT',
      'Quick feedback',
      'Sentiment',
      'Relevance for chats with Topics',
      'User engagement for chat with Topics',
    ]) {
      expect(view().getByRole('heading', { name: title })).toBeInTheDocument()
    }
    expect(view().queryByRole('tab')).not.toBeInTheDocument()
  })

  it('carries the classification note between the grid and the toolbar', () => {
    render(<AoTopicsView />)
    expect(view().getByText(/Topics created for 64% of chats/)).toBeInTheDocument()
  })

  it('opens grouped, with a count chip per category and no child rows', () => {
    render(<AoTopicsView />)
    expect(view().getByRole('checkbox', { name: 'Group Topics' })).toBeChecked()
    expect(view().getByRole('columnheader', { name: 'Topics (115)' })).toBeInTheDocument()
    const row = view().getByText('Account Management').closest('tr')!
    expect(within(row).getByText('20')).toBeInTheDocument()
    expect(view().queryByText('Update account details')).not.toBeInTheDocument()
  })

  it('derives non-resolutions from chats and resolutions', () => {
    render(<AoTopicsView />)
    const row = view().getByText('Financial Transactions').closest('tr')!
    expect(within(row).getByText('17,269')).toBeInTheDocument()
    expect(within(row).getByText('11,817')).toBeInTheDocument()
    expect(within(row).getByText('5,452')).toBeInTheDocument()
  })

  it('expands a category to its child topics and collapses it again', async () => {
    const user = userEvent.setup()
    render(<AoTopicsView />)
    const expander = view().getByRole('button', { name: 'Expand Account Management' })
    await user.click(expander)
    expect(view().getByText('Update account details')).toBeInTheDocument()
    expect(view().getByText('Close account')).toBeInTheDocument()
    await user.click(view().getByRole('button', { name: 'Collapse Account Management' }))
    expect(view().queryByText('Update account details')).not.toBeInTheDocument()
  })

  it('flattens to the child topics with no expanders when Group Topics is cleared', async () => {
    const user = userEvent.setup()
    render(<AoTopicsView />)
    await user.click(view().getByRole('checkbox', { name: 'Group Topics' }))
    expect(view().queryByText('Account Management')).not.toBeInTheDocument()
    expect(view().getByText('Update account details')).toBeInTheDocument()
    expect(view().getByText('Withdraw funds')).toBeInTheDocument()
    const table = view().getByRole('table')
    expect(within(table).queryByRole('button', { name: /^Expand / })).not.toBeInTheDocument()
  })

  it('filters to categories carrying a gap when Gaps only is checked', async () => {
    const user = userEvent.setup()
    render(<AoTopicsView />)
    expect(view().getByText('Subscription Services')).toBeInTheDocument()
    await user.click(view().getByRole('checkbox', { name: 'Gaps only' }))
    expect(view().queryByText('Subscription Services')).not.toBeInTheDocument()
    expect(view().getByText('Customer Service')).toBeInTheDocument()
  })

  it('filters the flattened rows to gap topics too', async () => {
    const user = userEvent.setup()
    render(<AoTopicsView />)
    await user.click(view().getByRole('checkbox', { name: 'Group Topics' }))
    await user.click(view().getByRole('checkbox', { name: 'Gaps only' }))
    expect(view().getByText('Transaction failed')).toBeInTheDocument()
    expect(view().queryByText('Withdraw funds')).not.toBeInTheDocument()
  })

  it('sets Avg. CSAT in teal above the threshold and ink below', () => {
    render(<AoTopicsView />)
    const financial = view().getByText('Financial Transactions').closest('tr')!
    const service = view().getByText('Customer Service').closest('tr')!
    expect(within(financial).getByText('4.4')).toHaveStyle({ color: '#048c80' })
    expect(within(service).getByText('3.7')).toHaveStyle({ color: '#2f3130' })
  })

  it('renders the boundary CSAT value of 4.0 in teal (inclusive threshold)', async () => {
    const user = userEvent.setup()
    render(<AoTopicsView />)
    await user.click(view().getByRole('button', { name: 'Expand Account Management' }))
    const closeAccountRow = view().getByText('Close account').closest('tr')!
    expect(within(closeAccountRow).getByText('4.0')).toHaveStyle({ color: '#048c80' })
  })

  it('renders the use-case chip with its overflow count', () => {
    render(<AoTopicsView />)
    const row = view().getByText('Account Management').closest('tr')!
    const chip = within(row).getByText('Knowledge Retrieval').closest('span')!
    expect(within(chip).getByText('+1')).toBeInTheDocument()
  })

  it('hides and restores the card grid', async () => {
    const user = userEvent.setup()
    render(<AoTopicsView />)
    await user.click(view().getByRole('button', { name: /Collapse cards/ }))
    expect(view().queryByRole('heading', { name: 'Sentiment' })).not.toBeInTheDocument()
    await user.click(view().getByRole('button', { name: /Expand cards/ }))
    expect(view().getByRole('heading', { name: 'Sentiment' })).toBeInTheDocument()
  })
})
