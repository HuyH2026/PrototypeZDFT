import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('Insights routing', () => {
  it('shows Agent Overview by default at /insights', () => {
    renderAt('/insights')
    expect(screen.getByTestId('view-ai-performances')).toBeInTheDocument()
  })

  it('shows Agent Overview at /insights/agent-overview', () => {
    renderAt('/insights/agent-overview')
    expect(screen.getByTestId('view-ai-performances')).toBeInTheDocument()
  })

  it('shows CX Journey at /insights/topics', () => {
    renderAt('/insights/topics')
    expect(screen.getByTestId('view-cx-journey')).toBeInTheDocument()
  })

  // CX Journey used to have its own subnav entry; Topics is its home now, and the
  // old URL keeps working.
  it('redirects /insights/cx-journey to /insights/topics', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/insights/cx-journey?tab=1#top'],
    })
    render(<RouterProvider router={router} />)
    expect(router.state.location.pathname).toBe('/insights/topics')
    expect(router.state.location.search).toBe('?tab=1')
    expect(router.state.location.hash).toBe('#top')
    expect(screen.getByTestId('view-cx-journey')).toBeInTheDocument()
  })
})

const HEADER_CASES = [
  ['/insights/agent-overview', 'Agent Overview', 'Agent Overview views', 'Overview'],
  ['/insights/topics', 'Topics', null, null],
  ['/insights/automations', 'Automation opportunities', 'Automation insights', 'Use case gaps'],
] as const

describe('Insights page headers', () => {
  it.each(HEADER_CASES)(
    'keeps the page identity and controls in one header at %s',
    (path, title, tablistLabel, selectedTab) => {
      renderAt(path)

      const insights = screen.getByTestId('screen-insights')
      const header = insights.querySelector<HTMLElement>('[data-slot="page-header"]')
      expect(header).not.toBeNull()

      const scoped = within(header!)
      expect(scoped.getByRole('heading', { level: 1, name: title })).toBeVisible()
      if (tablistLabel) {
        expect(scoped.getByRole('tablist', { name: tablistLabel })).toBeInTheDocument()
      } else {
        expect(scoped.queryByRole('tablist')).not.toBeInTheDocument()
      }
      if (selectedTab) {
        expect(scoped.getByRole('tab', { name: selectedTab })).toHaveAttribute(
          'aria-selected',
          'true',
        )
      } else {
        expect(
          scoped
            .queryAllByRole('tab')
            .every((tab) => tab.getAttribute('aria-selected') === 'false'),
        ).toBe(true)
      }
      // Exactly one AI entry per header: the agent-health survey used to be a
      // second sparkle on Agent Overview, and two of them read as two assistants.
      expect(scoped.getByRole('button', { name: 'Ask AI about this page' })).toBeInTheDocument()
      expect(
        scoped.queryByRole('button', { name: 'Check agent health with AI' }),
      ).not.toBeInTheDocument()
    },
  )
})

describe('Insights card treatment', () => {
  // Insights screens are dense with charts, so the Flora card's violet wash is
  // switched off for the whole section — color belongs to the series. Asserted on
  // the token rather than on a class, since that is what every Card below reads.
  it('turns the glass card wash off for the whole section', () => {
    renderAt('/insights/agent-overview')
    const shell = screen.getByTestId('screen-insights')
    expect(shell.style.getPropertyValue('--glass-card-sheen')).toBe('none')
  })
})
