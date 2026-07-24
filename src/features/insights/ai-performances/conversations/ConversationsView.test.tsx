import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ConversationsView } from './ConversationsView'

describe('ConversationsView', () => {
  it('renders the Headless card grid and the table by default', () => {
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    expect(view.getByRole('heading', { name: 'Total conversations' })).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Top A2A solve agents' })).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Top A2A calling clients' })).toBeInTheDocument()
    expect(view.getByText('Calling client')).toBeInTheDocument()
  })

  it('swaps the A2A cards when a non-Headless channel is selected', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    await user.click(view.getByRole('tab', { name: 'Widget' }))
    expect(view.queryByRole('heading', { name: 'Top A2A solve agents' })).not.toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Top intents' })).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Total conversations' })).toBeInTheDocument()
  })

  it('hides the card grid when Collapse cards is toggled', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    expect(view.getByRole('heading', { name: 'Resolutions' })).toBeInTheDocument()
    await user.click(view.getByRole('button', { name: /Collapse cards/ }))
    expect(view.queryByRole('heading', { name: 'Resolutions' })).not.toBeInTheDocument()
  })

  it('filters the table to gap rows when Gaps only is checked', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    // A non-gap transcript line is present initially…
    expect(view.getByText(/Delegation token verified/)).toBeInTheDocument()
    await user.click(view.getByRole('checkbox', { name: 'Gaps only' }))
    // …and gone once filtered to gap rows only.
    expect(view.queryByText(/Delegation token verified/)).not.toBeInTheDocument()
    // A gap row remains.
    expect(view.getByText(/Abnormal bank statement/)).toBeInTheDocument()
  })
})
