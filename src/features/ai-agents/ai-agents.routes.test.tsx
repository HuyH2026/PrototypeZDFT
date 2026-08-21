import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'
import { findNavItemByPath } from '@/app/nav-config'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

const HEADER_CASES = [
  ['/agent-builder/use-cases', 'view-agent-builder', 'Use cases', null, null],
  [
    '/agent-builder/knowledge',
    'view-knowledge',
    'Knowledge',
    'Knowledge views',
    'Knowledge coaching',
  ],
  ['/agent-builder/actions', 'screen-tools', 'Actions', 'Action views', 'Available'],
  ['/agent-builder/ai-qa', 'view-agent-qa', 'AI QA', null, null],
  ['/agent-builder/configuration', 'view-configuration', 'Configuration', null, null],
] as const

describe('Agent Builder page headers', () => {
  it.each(HEADER_CASES)(
    'uses the shared destination header at %s',
    (path, testId, title, tablistLabel, selectedTab) => {
      renderAt(path)
      const view = screen.getByTestId(testId)
      const header = view.querySelector<HTMLElement>('[data-slot="page-header"]')
      expect(header).not.toBeNull()
      expect(header!.tagName).toBe('HEADER')
      const scoped = within(header!)
      expect(scoped.getByRole('heading', { level: 1, name: title })).toBeVisible()
      expect(scoped.getByRole('button', { name: 'Ask AI about this page' })).toBeVisible()
      if (tablistLabel && selectedTab) {
        expect(scoped.getByRole('tablist', { name: tablistLabel })).toBeVisible()
        expect(scoped.getByRole('tab', { name: selectedTab })).toHaveAttribute(
          'aria-selected',
          'true',
        )
      }
    },
  )
})

describe('Agent Builder routing', () => {
  it('renders Use cases at /agent-builder (index)', () => {
    renderAt('/agent-builder')
    expect(screen.getByTestId('view-agent-builder')).toBeInTheDocument()
  })

  it('renders Use cases at /agent-builder/use-cases', () => {
    renderAt('/agent-builder/use-cases')
    expect(screen.getByTestId('view-agent-builder')).toBeInTheDocument()
  })

  it('renders Configuration at /agent-builder/configuration', () => {
    renderAt('/agent-builder/configuration')
    expect(screen.getByTestId('view-configuration')).toBeInTheDocument()
  })

  it('renders AI QA at /agent-builder/ai-qa', () => {
    renderAt('/agent-builder/ai-qa')
    expect(screen.getByTestId('view-agent-qa')).toBeInTheDocument()
  })

  it('renders Actions (the tool builder) at /agent-builder/actions', () => {
    renderAt('/agent-builder/actions')
    expect(screen.getByTestId('screen-tools')).toBeInTheDocument()
  })

  // Knowledge was the section's last placeholder; it is a built screen now.
  it('renders Knowledge at /agent-builder/knowledge', () => {
    renderAt('/agent-builder/knowledge')
    expect(screen.getByTestId('view-knowledge')).toBeInTheDocument()
    expect(screen.queryByText('Coming soon')).toBeNull()
  })

  // The pre-consolidation URL still has to land here.
  it('redirects /knowledge to /agent-builder/knowledge', () => {
    renderAt('/knowledge')
    expect(screen.getByTestId('view-knowledge')).toBeInTheDocument()
  })

  // A static child must outrank the :agentId sibling, or every one of them would
  // render the agent editor instead.
  it('prefers the static children over the :agentId route', () => {
    renderAt('/agent-builder/configuration')
    expect(screen.getByTestId('view-configuration')).toBeInTheDocument()
    expect(screen.queryByTestId('view-agent-editor')).not.toBeInTheDocument()
  })

  it('resolves /agent-builder/configuration to the Agent Builder nav item', () => {
    expect(findNavItemByPath('/agent-builder/configuration')?.label).toBe('Agent Builder')
  })
})
