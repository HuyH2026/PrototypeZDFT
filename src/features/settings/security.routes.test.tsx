import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'
import { findNavItemByPath } from '@/app/nav-config'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('Security routing', () => {
  it('renders the Security screen at /settings/security', () => {
    renderAt('/settings/security')
    expect(screen.getByTestId('screen-security')).toBeInTheDocument()
  })

  // It used to be a placeholder — this pins the swap so a revert is a failure.
  it('does not render the placeholder at /settings/security', () => {
    renderAt('/settings/security')
    expect(screen.queryByText('Coming soon')).toBeNull()
  })

  it('resolves /settings/security to the Settings nav item', () => {
    expect(findNavItemByPath('/settings/security')?.label).toBe('Settings')
  })
})
