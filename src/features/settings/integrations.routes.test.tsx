import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'
import { findNavItemByPath } from '@/app/nav-config'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('Integrations routing', () => {
  it('renders the Integrations screen at /settings/integrations', () => {
    renderAt('/settings/integrations')
    expect(screen.getByTestId('screen-integrations')).toBeInTheDocument()
  })

  // It used to be a placeholder — this pins the swap so a revert is a failure.
  it('does not render the placeholder at /settings/integrations', () => {
    renderAt('/settings/integrations')
    expect(screen.queryByText('Coming soon')).toBeNull()
  })

  // /settings has no index screen of its own; it lands on Integrations.
  it('lands the Settings index on Integrations', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/settings'] })
    render(<RouterProvider router={router} />)
    expect(router.state.location.pathname).toBe('/settings/integrations')
    expect(screen.getByTestId('screen-integrations')).toBeInTheDocument()
  })

  it('resolves /settings/integrations to the Settings nav item', () => {
    expect(findNavItemByPath('/settings/integrations')?.label).toBe('Settings')
  })
})
