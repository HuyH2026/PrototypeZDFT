import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'
import { findNavItemByPath } from '@/app/nav-config'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('Automations routing', () => {
  it('renders the automations screen at /insights/automations', () => {
    renderAt('/insights/automations')
    expect(screen.getByTestId('screen-automations')).toBeInTheDocument()
  })

  it('does not render the placeholder at /insights/automations', () => {
    renderAt('/insights/automations')
    expect(screen.queryByText('Coming soon')).toBeNull()
  })

  it('resolves /insights/automations to the Insights nav item', () => {
    expect(findNavItemByPath('/insights/automations')?.label).toBe('Insights')
  })
})
