import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'

const HEADER_CASES = [
  [
    '/settings/integrations',
    'screen-integrations',
    'Integrations',
    'Integration views',
    'Connections',
  ],
  ['/settings/security', 'screen-security', 'Security', null, null],
  ['/settings/logs', 'screen-log', 'Logs', 'Log views', 'Change Logs'],
] as const

describe('Settings page headers', () => {
  it.each(HEADER_CASES)(
    'uses the shared destination header at %s',
    (path, testId, title, tablistLabel, selectedTab) => {
      const router = createMemoryRouter(routes, { initialEntries: [path] })
      render(<RouterProvider router={router} />)
      const header = screen
        .getByTestId(testId)
        .querySelector<HTMLElement>('[data-slot="page-header"]')
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
