import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { KnowledgeView } from './KnowledgeView'

const view = () => within(screen.getByTestId('view-ao-knowledge'))

describe('KnowledgeView', () => {
  it('opens on Widget with the five cards the frame draws', () => {
    render(<KnowledgeView />)
    expect(view().getByRole('tab', { name: 'Widget' })).toHaveAttribute('aria-selected', 'true')
    for (const title of [
      'Conversations with articles surfaced',
      'Automated resolutions (AR)',
      'Click rate',
      'CSAT',
      'Quick feedback',
    ]) {
      expect(view().getByRole('heading', { name: title })).toBeInTheDocument()
    }
    // No filler tile: the second row is two cards wide, as drawn.
    expect(view().queryByRole('button', { name: 'Create insight card' })).not.toBeInTheDocument()
  })

  it('rescopes the cards and the rows when the channel changes', async () => {
    const user = userEvent.setup()
    render(<KnowledgeView />)
    expect(view().getAllByText('Widget').length).toBeGreaterThan(0)
    // Row 1 resolutions: unique to Widget
    expect(view().getByText('8,390')).toBeInTheDocument()

    await user.click(view().getByRole('tab', { name: 'Voice' }))
    expect(view().queryByText('8,390')).not.toBeInTheDocument()
    // 8,390 scaled to Voice (0.6).
    expect(view().getByText('5,034')).toBeInTheDocument()
    expect(view().getAllByText('Voice').length).toBeGreaterThan(0)
  })

  it('hides and restores the card grid', async () => {
    const user = userEvent.setup()
    render(<KnowledgeView />)
    await user.click(view().getByRole('button', { name: /Collapse cards/ }))
    expect(view().queryByRole('heading', { name: 'Click rate' })).not.toBeInTheDocument()
    await user.click(view().getByRole('button', { name: /Expand cards/ }))
    expect(view().getByRole('heading', { name: 'Click rate' })).toBeInTheDocument()
  })

  it('swaps the toolbar and the table between the two sub-tabs', async () => {
    const user = userEvent.setup()
    render(<KnowledgeView />)
    const tabs = within(view().getByRole('tablist', { name: 'Knowledge insight views' }))

    expect(view().getByRole('columnheader', { name: 'Top 3 surfaced agents' })).toBeInTheDocument()
    expect(view().getByText('Search article')).toBeInTheDocument()

    await user.click(tabs.getByRole('tab', { name: 'Knowledge gap' }))
    expect(view().getByRole('columnheader', { name: 'Missing topic' })).toBeInTheDocument()
    expect(view().queryByRole('columnheader', { name: 'Top 3 surfaced agents' })).not.toBeInTheDocument()
    expect(view().getByText('Search missing topic')).toBeInTheDocument()
    // Cards and channel scope are shared by both sub-tabs.
    expect(view().getByRole('heading', { name: 'Click rate' })).toBeInTheDocument()
    expect(view().getByRole('tab', { name: 'Widget' })).toBeInTheDocument()

    await user.click(tabs.getByRole('tab', { name: 'Knowledge' }))
    expect(view().getByRole('columnheader', { name: 'Top 3 surfaced agents' })).toBeInTheDocument()
  })

  it('reveals the carried changes when Show % change is checked', async () => {
    const user = userEvent.setup()
    render(<KnowledgeView />)
    expect(view().queryByText('+12.4%')).not.toBeInTheDocument()
    await user.click(view().getByRole('checkbox', { name: 'Show % change' }))
    expect(view().getByText('+12.4%')).toBeInTheDocument()
  })

  it('offers Show % change on the article sub-tab only', async () => {
    const user = userEvent.setup()
    render(<KnowledgeView />)
    const tabs = within(view().getByRole('tablist', { name: 'Knowledge insight views' }))
    await user.click(tabs.getByRole('tab', { name: 'Knowledge gap' }))
    expect(view().queryByRole('checkbox', { name: 'Show % change' })).not.toBeInTheDocument()
  })
})
