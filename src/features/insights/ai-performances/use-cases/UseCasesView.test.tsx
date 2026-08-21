import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { UseCasesView } from './UseCasesView'

const view = () => within(screen.getByTestId('view-ao-use-cases'))

describe('UseCasesView', () => {
  it('opens on Widget with the six cards and eight columns the frame draws', () => {
    render(<UseCasesView />)
    expect(view().getByRole('tab', { name: 'Widget' })).toHaveAttribute('aria-selected', 'true')
    for (const title of [
      'Automated resolutions (AR)',
      'CSAT',
      'Quick feedback',
      'Sentiment',
      'Relevance',
      'Engagement',
    ]) {
      expect(view().getByRole('heading', { name: title })).toBeInTheDocument()
    }
    for (const col of ['Use cases', 'Activate', 'Deflection rate', 'Avg. CSAT']) {
      expect(view().getByRole('columnheader', { name: col })).toBeInTheDocument()
    }
    // The header's eight columns only — none of the six unlabelled body cells.
    expect(view().queryByText('Published')).not.toBeInTheDocument()
    expect(view().queryByText(/Brandon Mango/)).not.toBeInTheDocument()
  })

  it('rescopes the rows when the channel changes', async () => {
    const user = userEvent.setup()
    render(<UseCasesView />)
    expect(view().getByText('3,000')).toBeInTheDocument()
    await user.click(view().getByRole('tab', { name: 'Voice' }))
    expect(view().queryByText('3,000')).not.toBeInTheDocument()
    expect(view().getByText('1,800')).toBeInTheDocument()
  })

  it('hides and restores the card grid', async () => {
    const user = userEvent.setup()
    render(<UseCasesView />)
    await user.click(view().getByRole('button', { name: /Collapse cards/ }))
    expect(view().queryByRole('heading', { name: 'Sentiment' })).not.toBeInTheDocument()
    await user.click(view().getByRole('button', { name: /Expand cards/ }))
    expect(view().getByRole('heading', { name: 'Sentiment' })).toBeInTheDocument()
  })

  it('reveals the carried changes when Show % change is checked', async () => {
    const user = userEvent.setup()
    render(<UseCasesView />)
    expect(view().queryByText('+7.4%')).not.toBeInTheDocument()
    await user.click(view().getByRole('checkbox', { name: 'Show % change' }))
    expect(view().getByText('+7.4%')).toBeInTheDocument()
    expect(view().getByText('-4.8%')).toBeInTheDocument()
  })

  it('draws Activate as a dot with an On / Off label, and flips it', async () => {
    const user = userEvent.setup()
    render(<UseCasesView />)
    const knowledge = view().getByRole('switch', { name: 'Activate Knowledge Retrieval' })
    const cancellation = view().getByRole('switch', { name: 'Activate Service cancellation' })

    expect(knowledge).toHaveAttribute('aria-checked', 'true')
    expect(knowledge).toHaveTextContent('On')
    expect(cancellation).toHaveAttribute('aria-checked', 'false')
    expect(cancellation).toHaveTextContent('Off')

    await user.click(cancellation)
    expect(view().getByRole('switch', { name: 'Activate Service cancellation' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    // Flipping one row leaves its neighbours alone.
    expect(view().getByRole('switch', { name: 'Activate Knowledge Retrieval' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('resets an Activate toggle to its data when the channel changes', async () => {
    const user = userEvent.setup()
    render(<UseCasesView />)
    await user.click(view().getByRole('switch', { name: 'Activate Service cancellation' }))
    await user.click(view().getByRole('tab', { name: 'Voice' }))
    expect(view().getByRole('switch', { name: 'Activate Service cancellation' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })
})
