import { describe, it, expect } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'

function renderScreen() {
  return renderScreenAt('/experiment/new')
}

function renderScreenAt(entry: string) {
  const router = createMemoryRouter(routes, { initialEntries: [entry] })
  return render(<RouterProvider router={router} />)
}

describe('ExperimentSetupScreen', () => {
  it('renders the shell with the updated use-case content and publish actions', () => {
    renderScreen()
    const el = screen.getByTestId('screen-experiment-setup')
    expect(within(el).getByText('Setup')).toBeInTheDocument()
    expect(within(el).getByText('Results')).toBeInTheDocument()
    expect(within(el).getByText('Use Cases')).toBeInTheDocument()
    expect(within(el).getByText('Conversations')).toBeInTheDocument()
    expect(within(el).getByText('A/B Test detail')).toBeInTheDocument()
    expect(within(el).getByText('Use Cases and variants')).toBeInTheDocument()
    expect(within(el).getByText('Winner & Test end')).toBeInTheDocument()
    expect(within(el).getByRole('button', { name: 'Preview' })).toBeInTheDocument()
    expect(within(el).getByRole('button', { name: 'Versions' })).toBeInTheDocument()
    expect(within(el).getByRole('button', { name: 'Publish' })).toBeInTheDocument()
  })

  it('reflects the Test name in the top-bar title', () => {
    renderScreen()
    const el = screen.getByTestId('screen-experiment-setup')
    const input = within(el).getByDisplayValue('Login fix method comparison')
    fireEvent.change(input, { target: { value: 'My new test' } })
    // top-bar title node also shows the new name
    expect(within(el).getAllByText('My new test').length).toBeGreaterThanOrEqual(1)
  })

  it('switches to the Results tab when Publish is clicked', () => {
    renderScreen()
    const el = screen.getByTestId('screen-experiment-setup')
    fireEvent.click(within(el).getByRole('button', { name: 'Publish' }))
    expect(within(el).getByRole('tab', { name: 'Results' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('view-ab-test-results')).toBeInTheDocument()
    expect(within(el).getByRole('button', { name: 'View use cases' })).toBeInTheDocument()
  })

  it('opens on the Results tab and shows the experiment name for a known id', () => {
    renderScreenAt('/experiment/new?id=e2')
    const el = screen.getByTestId('screen-experiment-setup')
    expect(within(el).getByRole('tab', { name: 'Results' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('view-ab-test-results')).toBeInTheDocument()
    // e2 winner label appears in the winner card
    expect(within(el).getByText('Abandoned Cart Recovery')).toBeInTheDocument()
  })

  it('defaults to the Setup tab with no id', () => {
    renderScreenAt('/experiment/new')
    const el = screen.getByTestId('screen-experiment-setup')
    expect(within(el).getByRole('tab', { name: 'Setup' })).toHaveAttribute('aria-selected', 'true')
    expect(within(el).getByText('A/B Test detail')).toBeInTheDocument()
  })

  it('falls back to the Setup tab for an unknown id', () => {
    renderScreenAt('/experiment/new?id=does-not-exist')
    const el = screen.getByTestId('screen-experiment-setup')
    expect(within(el).getByRole('tab', { name: 'Setup' })).toHaveAttribute('aria-selected', 'true')
    expect(within(el).getByText('A/B Test detail')).toBeInTheDocument()
  })
})
