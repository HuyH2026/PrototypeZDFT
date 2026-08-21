import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { RealizedImpactView } from './RealizedImpactView'

const renderView = () => {
  render(<RealizedImpactView />)
  return within(screen.getByTestId('view-realized-impact'))
}

describe('RealizedImpactView', () => {
  it('defaults to Use cases and switches metrics and rows with Content snippets', async () => {
    const user = userEvent.setup()
    const view = renderView()

    expect(view.getByRole('tab', { name: 'Use cases' })).toHaveAttribute('aria-selected', 'true')
    expect(view.queryByRole('tab', { name: 'Agents' })).not.toBeInTheDocument()
    expect(view.getByText('847')).toBeInTheDocument()
    expect(view.getByText('Card ETA')).toBeInTheDocument()

    await user.click(view.getByRole('tab', { name: 'Content snippets' }))
    expect(view.getByText('847')).toBeInTheDocument()
    expect(view.getByText('Refund Processing Ti...')).toBeInTheDocument()
    expect(view.queryByText('Card ETA')).not.toBeInTheDocument()
  })

  it('heads the first column after the active mode', async () => {
    const user = userEvent.setup()
    const view = renderView()

    expect(view.getByRole('columnheader', { name: 'Use case' })).toBeInTheDocument()

    await user.click(view.getByRole('tab', { name: 'Content snippets' }))
    expect(view.getByRole('columnheader', { name: /Content snippet/ })).toBeInTheDocument()
  })

  it('carries the Figma impact summary copy', () => {
    const view = renderView()

    expect(
      view.getByText(
        'See how your active use cases and content snippets reduce tickets, resolution time, and support costs.',
      ),
    ).toBeInTheDocument()
    expect(view.getByText('Impact delivered in the last 30 days.')).toBeInTheDocument()
    expect(view.getByText('Tickets avoided')).toBeInTheDocument()
    expect(view.getByText('Resolution time saved')).toBeInTheDocument()
    expect(view.getByText('Cost savings')).toBeInTheDocument()
    expect(view.getByText('Estimated using $15 per ticket avoided')).toBeInTheDocument()
  })

  it('uses use-case terminology for row actions', () => {
    const view = renderView()

    expect(view.getAllByRole('button', { name: 'View use case' })).toHaveLength(3)
    expect(view.getByRole('button', { name: 'Activate use case' })).toBeInTheDocument()
    expect(view.queryByRole('button', { name: /agent/i })).not.toBeInTheDocument()
  })

  it('offers a search and view controls above the table', () => {
    const view = renderView()

    expect(view.getByPlaceholderText('Search')).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Row height' })).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Column settings' })).toBeInTheDocument()
    expect(view.queryByRole('button', { name: /Export/ })).not.toBeInTheDocument()
  })

  it('offers sorting on the content snippet columns only', async () => {
    const user = userEvent.setup()
    const view = renderView()

    expect(view.queryByRole('button', { name: /^Sort by/ })).not.toBeInTheDocument()

    await user.click(view.getByRole('tab', { name: 'Content snippets' }))
    expect(view.getAllByRole('button', { name: /^Sort by/ })).toHaveLength(5)
  })
})
