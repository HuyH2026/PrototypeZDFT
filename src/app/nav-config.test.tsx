import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { NAV_ITEMS, PRIMARY_NAV, SECONDARY_NAV, findNavItemByPath } from './nav-config'
import { routes } from '@/routes'

// Mirrors SubnavPanel's own kebab(): the subnav derives each child's href this
// way, so this is the contract between a submenu label and a real route. Kept as
// a copy rather than an import — if SubnavPanel's version changes, this test
// should fail rather than silently follow it.
function kebab(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
}

describe('nav-config', () => {
  it('lists the five sections plus Agent Directory, in order', () => {
    expect(NAV_ITEMS.map((i) => i.label)).toEqual([
      'Dashboard',
      'Insights',
      'Agent Builder',
      'Experiment',
      'Settings',
      'Agent Directory',
    ])
  })

  it('gives each section its path', () => {
    expect(NAV_ITEMS.map((i) => i.path)).toEqual([
      '/', '/insights', '/agent-builder', '/experiment', '/settings', '/agent-setup',
    ])
  })

  it('splits primary (5) and secondary (Agent Directory) groups', () => {
    expect(PRIMARY_NAV).toHaveLength(5)
    expect(SECONDARY_NAV.map((i) => i.label)).toEqual(['Agent Directory'])
    // NAV_ITEMS is derived from the two groups, not the other way round.
    expect(NAV_ITEMS).toEqual([...PRIMARY_NAV, ...SECONDARY_NAV])
  })

  it('carries the submenus from the design frame', () => {
    const submenus = Object.fromEntries(NAV_ITEMS.map((i) => [i.label, i.submenu]))
    expect(submenus['Dashboard']).toEqual([])
    expect(submenus['Insights']).toEqual(['Agent Overview', 'Topics', 'Automations'])
    expect(submenus['Agent Builder']).toEqual([
      'Use cases', 'Knowledge', 'Actions', 'AI QA', 'Configuration',
    ])
    expect(submenus['Experiment']).toEqual(['Test Suite', 'Simulation', 'A/B Test'])
    expect(submenus['Settings']).toEqual(['Integrations', 'Security', 'Logs'])
    expect(submenus['Agent Directory']).toEqual([])
  })

  // The subnav builds each child's href by kebab-casing its label, so a label
  // whose kebab does not match a served route is a dead link. Pinning the full
  // derived list catches label renames; verifying each renders catches route
  // renames (so renaming /topics → /topic in routes.tsx breaks this).
  it('derives every submenu path that the route table serves', () => {
    const derived = NAV_ITEMS.flatMap((i) => i.submenu.map((s) => `${i.path}/${kebab(s)}`))
    expect(derived).toEqual([
      '/insights/agent-overview',
      '/insights/topics',
      '/insights/automations',
      '/agent-builder/use-cases',
      '/agent-builder/knowledge',
      '/agent-builder/actions',
      '/agent-builder/ai-qa',
      '/agent-builder/configuration',
      '/experiment/test-suite',
      '/experiment/simulation',
      '/experiment/ab-test',
      '/settings/integrations',
      '/settings/security',
      '/settings/logs',
    ])

    // Each derived path must resolve to a real route — renaming a route path
    // without updating the nav config label is now a test failure.
    derived.forEach((path) => {
      const router = createMemoryRouter(routes, { initialEntries: [path] })
      const { unmount } = render(<RouterProvider router={router} />)
      expect(router.state.location.pathname).toBe(path)
      unmount()
    })
  })

  it('resolves the active item from a pathname, including nested routes', () => {
    expect(findNavItemByPath('/')?.label).toBe('Dashboard')
    expect(findNavItemByPath('/insights')?.label).toBe('Insights')
    expect(findNavItemByPath('/insights/agent-overview')?.label).toBe('Insights')
    expect(findNavItemByPath('/insights/automations/auto-2')?.label).toBe('Insights')
    expect(findNavItemByPath('/agent-builder/ai-qa')?.label).toBe('Agent Builder')
    expect(findNavItemByPath('/settings/logs')?.label).toBe('Settings')
    expect(findNavItemByPath('/agent-setup')?.label).toBe('Agent Directory')
    expect(findNavItemByPath('/nope')).toBeUndefined()
  })

  // The old paths are gone from the config; only the redirect layer knows them.
  it('no longer resolves the pre-consolidation paths', () => {
    expect(findNavItemByPath('/ai-agents')).toBeUndefined()
    expect(findNavItemByPath('/tools')).toBeUndefined()
    expect(findNavItemByPath('/orchestrator')).toBeUndefined()
    expect(findNavItemByPath('/log')).toBeUndefined()
    expect(findNavItemByPath('/organization')).toBeUndefined()
  })

  // Knowledge was the last unbuilt subnav destination. With it built, no route
  // renders a placeholder any more — so nothing in the app should say "Coming
  // soon". This is the guard that a newly added subnav label gets a real screen.
  it('renders no placeholder on any subnav destination', () => {
    const derived = NAV_ITEMS.flatMap((i) => i.submenu.map((s) => `${i.path}/${kebab(s)}`))
    derived.forEach((path) => {
      const router = createMemoryRouter(routes, { initialEntries: [path] })
      const { queryByText, unmount } = render(<RouterProvider router={router} />)
      expect(queryByText('Coming soon')).toBeNull()
      unmount()
    })
  })

  // Topics used to be on the list above; the CX Journey screen moved into it, so
  // the route must mount the real view and no longer a placeholder.
  it('mounts the built CX Journey screen at /insights/topics', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/insights/topics'] })
    const { getByTestId, queryByText } = render(<RouterProvider router={router} />)
    expect(getByTestId('view-cx-journey')).toBeInTheDocument()
    expect(queryByText('Coming soon')).not.toBeInTheDocument()
  })

  // Test Suite used to be on the list above; it is a built screen now, so the
  // route must mount the real view and no longer a placeholder.
  it('mounts the built Test Suite screen at /experiment/test-suite', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/experiment/test-suite'] })
    const { getByTestId, queryByText } = render(<RouterProvider router={router} />)
    expect(getByTestId('view-test-suite')).toBeInTheDocument()
    expect(queryByText('Coming soon')).not.toBeInTheDocument()
  })

  // Simulation used to be on the list above; its empty state is built now, so
  // the route must mount the real view and no longer a placeholder.
  it('mounts the built Simulation screen at /experiment/simulation', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/experiment/simulation'] })
    const { getByTestId, queryByText } = render(<RouterProvider router={router} />)
    expect(getByTestId('view-simulation')).toBeInTheDocument()
    expect(queryByText('Coming soon')).not.toBeInTheDocument()
  })

  // Security used to be on the list above; the Data Redaction screen is built,
  // so the route must mount the real view and no longer a placeholder.
  it('mounts the built Security screen at /settings/security', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/settings/security'] })
    const { getByTestId, queryByText } = render(<RouterProvider router={router} />)
    expect(getByTestId('screen-security')).toBeInTheDocument()
    expect(queryByText('Coming soon')).not.toBeInTheDocument()
  })

  // Knowledge was the last placeholder in the app.
  it('mounts the built Knowledge screen at /agent-builder/knowledge', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/agent-builder/knowledge'] })
    const { getByTestId, queryByText } = render(<RouterProvider router={router} />)
    expect(getByTestId('view-knowledge')).toBeInTheDocument()
    expect(queryByText('Coming soon')).not.toBeInTheDocument()
  })
})
