import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'
import { NAV_ITEMS, findNavItemByPath } from '@/app/nav-config'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('Agent pipeline routing', () => {
  it('renders the screen at /agent-pipeline', () => {
    renderAt('/agent-pipeline')
    expect(screen.getByTestId('screen-agent-pipeline')).toBeInTheDocument()
  })

  // Deliberately not in the nav while the screen is being evaluated (spec
  // Decision 10). Promotion is a submenu string under Insights — this test is
  // what makes that an explicit choice rather than a drift.
  it('is not a nav destination', () => {
    expect(findNavItemByPath('/agent-pipeline')).toBeUndefined()
    expect(NAV_ITEMS.flatMap((item) => item.submenu)).not.toContain('Agent pipeline')
  })

  it('renders inside the app chrome, with no section active', () => {
    renderAt('/agent-pipeline')
    expect(screen.getByTestId('screen-agent-pipeline')).toBeInTheDocument()
    // The rail still mounts; nothing in it is marked current.
    expect(screen.queryAllByRole('link', { current: 'page' })).toHaveLength(0)
  })
})
