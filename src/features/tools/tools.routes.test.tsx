import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'
import { findNavItemByPath } from '@/app/nav-config'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('Actions (tool builder) routing', () => {
  it('renders the tool builder at /agent-builder/actions', () => {
    renderAt('/agent-builder/actions')
    expect(screen.getByTestId('screen-tools')).toBeInTheDocument()
  })

  it('does not render the placeholder at /agent-builder/actions', () => {
    renderAt('/agent-builder/actions')
    expect(screen.queryByText('Coming soon')).toBeNull()
  })

  it('resolves /agent-builder/actions to the Agent Builder nav item', () => {
    expect(findNavItemByPath('/agent-builder/actions')?.label).toBe('Agent Builder')
  })

  it('renders the Tool Detail screen at /agent-builder/actions/t3', () => {
    renderAt('/agent-builder/actions/t3')
    expect(screen.getByTestId('screen-tool-detail')).toBeInTheDocument()
  })

  it('redirects an unknown tool back to the tool builder', () => {
    renderAt('/agent-builder/actions/does-not-exist')
    expect(screen.getByTestId('screen-tools')).toBeInTheDocument()
  })
})
