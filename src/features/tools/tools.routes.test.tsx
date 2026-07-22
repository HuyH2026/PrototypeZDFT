import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'
import { findNavItemByPath } from '@/app/nav-config'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('Tools routing', () => {
  it('renders the Tool Builder screen at /tools', () => {
    renderAt('/tools')
    expect(screen.getByTestId('screen-tools')).toBeInTheDocument()
  })

  it('does not render the placeholder at /tools', () => {
    renderAt('/tools')
    expect(screen.queryByText('Coming soon')).toBeNull()
  })

  it('resolves /tools to the Tools nav item', () => {
    expect(findNavItemByPath('/tools')?.label).toBe('Tools')
  })
})
