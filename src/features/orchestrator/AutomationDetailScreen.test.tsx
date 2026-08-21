import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('AutomationDetailScreen', () => {
  beforeEach(() => {
    try { window.localStorage?.clear() } catch { /* no localStorage */ }
  })

  it('renders the detail screen with the automation name at /insights/automations/a1', () => {
    renderAt('/insights/automations/a1')
    expect(screen.getByTestId('screen-automation-detail')).toBeInTheDocument()
    expect(screen.getByText('Call users with issues')).toBeInTheDocument()
  })

  it('shows the Journey tab (canvas) by default', () => {
    renderAt('/insights/automations/a1')
    expect(screen.getByText('Nodes')).toBeInTheDocument() // palette present
  })

  it('switches to the Analytic tab placeholder', () => {
    renderAt('/insights/automations/a1')
    fireEvent.click(screen.getByRole('tab', { name: 'Analytic' }))
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
    expect(screen.queryByText('Nodes')).toBeNull()
  })

  it('redirects an unknown automation detail id to the consolidated screen', () => {
    renderAt('/insights/automations/does-not-exist')
    expect(screen.getByTestId('screen-automations')).toBeInTheDocument()
    expect(screen.queryByTestId('screen-automation-detail')).not.toBeInTheDocument()
  })
})
