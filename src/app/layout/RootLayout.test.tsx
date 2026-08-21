import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('create-agent layer routing', () => {
  it('layers the create flow over the roster instead of replacing it', () => {
    renderAt('/agent-setup/new')
    // By testid, not by the "Create new" title: the wizard's step-1 tile carries
    // the same words, so getByText would find two nodes.
    expect(screen.getByTestId('screen-create-agent')).toBeInTheDocument()
    // Both of these are what "a layer, not a page" means: the roster it covers is
    // still mounted, and so is the app chrome (the top bar's product switcher).
    expect(screen.getByTestId('screen-manage-agents')).toBeInTheDocument()
    expect(screen.getByText('AI Agent')).toBeInTheDocument()
  })

  it('still renders the shell (top bar) for in-app routes', () => {
    renderAt('/agent-setup')
    expect(screen.getByText('AI Agent')).toBeInTheDocument()
    expect(screen.getByTestId('screen-manage-agents')).toBeInTheDocument()
  })
})
