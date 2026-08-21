import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { SimulationView } from './SimulationView'

function renderView() {
  render(
    <MemoryRouter initialEntries={['/experiment/simulation']}>
      <AiAssistantProvider>
        <SimulationView />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
  return within(screen.getByTestId('view-simulation'))
}

describe('SimulationView', () => {
  it('titles the screen', () => {
    const view = renderView()
    expect(view.getByRole('heading', { level: 1, name: 'Simulation' })).toBeInTheDocument()
  })

  it('renders the zero-simulations empty state', () => {
    const view = renderView()
    const empty = within(view.getByTestId('simulation-empty'))
    expect(empty.getByRole('heading', { level: 2, name: 'No simulations yet' })).toBeInTheDocument()
    expect(
      empty.getByText(
        'Create a simulation test to evaluate how your agent handles common scenarios',
      ),
    ).toBeInTheDocument()
  })

  it('offers a Create simulation button', () => {
    const view = renderView()
    expect(view.getByRole('button', { name: 'Create simulation' })).toBeInTheDocument()
  })

  // The design has no create flow, so the CTA is deliberately not a link — this
  // pins that it stays inert until one exists rather than silently routing.
  it('leaves the Create simulation CTA inert', () => {
    const view = renderView()
    const cta = view.getByRole('button', { name: 'Create simulation' })
    expect(cta).not.toHaveAttribute('href')
    expect(cta.closest('a')).toBeNull()
  })

  // The illustration carries no information the copy does not already give.
  it('marks the illustration as decorative', () => {
    const view = renderView()
    expect(view.getByTestId('simulation-illustration')).toHaveAttribute('alt', '')
  })

  it('carries the AI trigger the sibling Experiment screens have', () => {
    const view = renderView()
    expect(view.getByRole('button', { name: 'Ask AI about this page' })).toBeInTheDocument()
  })
})
