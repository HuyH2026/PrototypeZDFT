import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AiPerformancesView } from './AiPerformancesView'

describe('AiPerformancesView', () => {
  it('renders the four section headings', () => {
    render(<AiPerformancesView />)
    const view = within(screen.getByTestId('view-ai-performances'))
    expect(view.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Performance insights (AI)' })).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Custom insights' })).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Conversation comparison' })).toBeInTheDocument()
  })

  it('renders headline stat cards', () => {
    render(<AiPerformancesView />)
    const view = within(screen.getByTestId('view-ai-performances'))
    expect(view.getByText('550,982')).toBeInTheDocument()
    expect(view.getByText('495,872')).toBeInTheDocument()
    expect(view.getByText('$740K')).toBeInTheDocument()
  })

  it('renders the worst-performing workflow rows', () => {
    render(<AiPerformancesView />)
    const view = within(screen.getByTestId('view-ai-performances'))
    expect(view.getByText('Vew bank statement')).toBeInTheDocument()
    expect(view.getByText('Update profile')).toBeInTheDocument()
  })

  it('collapses a section when its Collapse control is clicked', async () => {
    const user = userEvent.setup()
    render(<AiPerformancesView />)
    const view = within(screen.getByTestId('view-ai-performances'))
    expect(view.getByText('550,982')).toBeInTheDocument()
    // The Overview section header is the first Collapse toggle on the page.
    const [overviewToggle] = view.getAllByRole('button', { name: /Collapse/ })
    await user.click(overviewToggle)
    expect(view.queryByText('550,982')).not.toBeInTheDocument()
  })

  it('switches page tabs to a Coming soon placeholder', async () => {
    const user = userEvent.setup()
    render(<AiPerformancesView />)
    const view = within(screen.getByTestId('view-ai-performances'))
    await user.click(view.getByRole('tab', { name: 'Knowledge' }))
    expect(view.getByText('Coming soon')).toBeInTheDocument()
    expect(view.queryByText('550,982')).not.toBeInTheDocument()
  })

  it('toggles the comparison overlay checkbox', async () => {
    const user = userEvent.setup()
    render(<AiPerformancesView />)
    const view = within(screen.getByTestId('view-ai-performances'))
    const checkbox = view.getByRole('checkbox', { name: 'Show comparison' })
    expect(checkbox).toBeChecked()
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })
})
