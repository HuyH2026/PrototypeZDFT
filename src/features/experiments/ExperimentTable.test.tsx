import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { ExperimentTable } from './ExperimentTable'
import { EXPERIMENTS } from './experiments-data'

function renderTable() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <ExperimentTable experiments={EXPERIMENTS} /> },
      { path: '/experiment/new', element: <div data-testid="detail" /> },
    ],
    { initialEntries: ['/'] },
  )
  render(<RouterProvider router={router} />)
  return router
}

describe('ExperimentTable', () => {
  it('renders the experiments in a semantic table with padded headers', () => {
    renderTable()

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Traffic split' })).toHaveClass('px-3.5', 'py-3.5')
  })

  it('uses the catalog width with fixed proportional columns', () => {
    renderTable()

    expect(screen.getByRole('table')).toHaveClass('min-w-0', 'table-fixed')
  })

  it('renders column headers and a row per experiment', () => {
    renderTable()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Use Case' })).toBeInTheDocument()
    expect(screen.getByText('Traffic split')).toBeInTheDocument()
    expect(screen.getByText('Abandoned Cart Recovery')).toBeInTheDocument()
    expect(screen.getByText('Guided Troubleshoot Flow')).toBeInTheDocument()
    expect(screen.getByText('Running')).toBeInTheDocument()
  })

  it('navigates to the experiment detail with its id when a row is clicked', () => {
    const router = renderTable()
    fireEvent.click(screen.getByText('Abandoned Cart Recovery'))
    expect(router.state.location.pathname).toBe('/experiment/new')
    expect(router.state.location.search).toBe('?id=e2')
  })
})
