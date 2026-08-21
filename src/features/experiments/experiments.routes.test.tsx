import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'
import { findNavItemByPath } from '@/app/nav-config'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

const HEADER_CASES = [
  ['/experiment/test-suite', 'view-test-suite', 'Test suite', 'Test suite views', 'Test cases'],
  ['/experiment/simulation', 'view-simulation', 'Simulation', null, null],
  ['/experiment/ab-test', 'view-ab-test', 'A/B test', null, null],
] as const

describe('Experiment page headers', () => {
  it.each(HEADER_CASES)(
    'uses the shared destination header at %s',
    (path, testId, title, tablistLabel, selectedTab) => {
      renderAt(path)
      const header = screen
        .getByTestId(testId)
        .querySelector<HTMLElement>('[data-slot="page-header"]')
      expect(header).not.toBeNull()
      expect(header!.tagName).toBe('HEADER')
      const scoped = within(header!)
      expect(scoped.getByRole('heading', { level: 1, name: title })).toBeVisible()
      expect(scoped.getByRole('button', { name: 'Ask AI about this page' })).toBeVisible()
      if (tablistLabel && selectedTab) {
        expect(scoped.getByRole('tablist', { name: tablistLabel })).toBeVisible()
        expect(scoped.getByRole('tab', { name: selectedTab })).toHaveAttribute(
          'aria-selected',
          'true',
        )
      }
    },
  )
})

describe('Experiments routing', () => {
  // The section lands on its first page. It used to land on A/B Test instead,
  // because Test Suite was unbuilt and would have shown "Coming soon"; both are
  // built now, so list order and landing target agree again.
  it('shows Test Suite by default at /experiment', () => {
    renderAt('/experiment')
    expect(screen.getByTestId('view-test-suite')).toBeInTheDocument()
  })

  it('shows A/B Test at /experiment/ab-test', () => {
    renderAt('/experiment/ab-test')
    expect(screen.getByTestId('view-ab-test')).toBeInTheDocument()
  })

  it('does not render the placeholder at /experiment', () => {
    renderAt('/experiment')
    expect(screen.queryByText('Coming soon')).toBeNull()
  })

  it('resolves /experiment to the Experiment nav item', () => {
    expect(findNavItemByPath('/experiment')?.label).toBe('Experiment')
  })

  it('resolves /experiment/ab-test to the Experiment nav item', () => {
    expect(findNavItemByPath('/experiment/ab-test')?.label).toBe('Experiment')
  })
})

describe('Simulation routing', () => {
  it('renders the Simulation screen at /experiment/simulation', () => {
    renderAt('/experiment/simulation')
    expect(screen.getByTestId('view-simulation')).toBeInTheDocument()
  })

  // It used to be a placeholder — this pins the swap so a revert is a failure.
  it('does not render the placeholder at /experiment/simulation', () => {
    renderAt('/experiment/simulation')
    expect(screen.queryByText('Coming soon')).toBeNull()
  })

  it('resolves /experiment/simulation to the Experiment nav item', () => {
    expect(findNavItemByPath('/experiment/simulation')?.label).toBe('Experiment')
  })

  // The pre-consolidation URL still has to land here.
  it('redirects /experiments/simulations to /experiment/simulation', () => {
    renderAt('/experiments/simulations')
    expect(screen.getByTestId('view-simulation')).toBeInTheDocument()
  })
})

describe('A/B Test Setup routing', () => {
  it('renders the Setup screen at /experiment/new', () => {
    renderAt('/experiment/new')
    expect(screen.getByTestId('screen-experiment-setup')).toBeInTheDocument()
    expect(screen.queryByText('Coming soon')).toBeNull()
  })

  // The A/B Test tab by name, not the section root: the button belongs to that
  // screen, and the root lands on Test Suite.
  it('navigates from Create new to the Setup screen', () => {
    renderAt('/experiment/ab-test')
    fireEvent.click(screen.getByRole('button', { name: 'Create new' }))
    expect(screen.getByTestId('screen-experiment-setup')).toBeInTheDocument()
  })
})
