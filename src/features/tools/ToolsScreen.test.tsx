import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { BrandProvider } from '@/app/brand-context'
import { ToolsScreen } from './ToolsScreen'

function renderToolsScreen() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <BrandProvider>
            <AiAssistantProvider>
              <ToolsScreen />
            </AiAssistantProvider>
          </BrandProvider>
        ),
      },
    ],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('ToolsScreen', () => {
  it('renders the Actions title and the Available table by default', () => {
    renderToolsScreen()
    const el = screen.getByTestId('screen-tools')
    expect(within(el).getByRole('heading', { name: 'Actions' })).toBeInTheDocument()
    expect(within(el).getByText('Name (113)')).toBeInTheDocument()
    expect(within(el).getByRole('tab', { name: 'Available' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(within(el).getByRole('region', { name: 'Action performance' })).toBeInTheDocument()
    expect(within(el).getByText('8,000')).toBeInTheDocument()
    // Actions' own captions, not the Knowledge strip's ("Active content
    // snippets" / "Times applied") that this screen was built from.
    expect(within(el).getByText('Active actions')).toBeInTheDocument()
    expect(within(el).getByText('Times invoked')).toBeInTheDocument()
    expect(within(el).queryByText('Active content snippets')).not.toBeInTheDocument()
  })

  it('switches to the History tab and renders the real history table', async () => {
    const user = userEvent.setup()
    renderToolsScreen()
    const el = screen.getByTestId('screen-tools')
    await user.click(within(el).getByRole('tab', { name: 'History' }))
    expect(within(el).getByRole('tab', { name: 'History' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(within(el).queryByText('Name (113)')).toBeNull()
    expect(within(el).getByTestId('tools-history-table')).toBeInTheDocument()
  })

  it('switches to an empty placeholder tab for Recommended', async () => {
    const user = userEvent.setup()
    renderToolsScreen()
    const el = screen.getByTestId('screen-tools')
    await user.click(within(el).getByRole('tab', { name: 'Recommended' }))
    expect(within(el).getByRole('tab', { name: 'Recommended' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(within(el).queryByText('Name (113)')).toBeNull()
    expect(within(el).getByTestId('tools-tab-Recommended')).toBeInTheDocument()
  })

  it('opens a row into the tool detail route', async () => {
    const user = userEvent.setup()
    renderToolsScreen()
    await user.click(screen.getByText('Reconcile payout'))
    // ToolsScreen has no /tools/:id route in this isolated router, so the
    // navigation attempt itself (no crash) confirms onOpen is wired; the
    // actual detail render is covered by tools.routes.test.tsx.
    expect(screen.queryByTestId('screen-tools')).toBeNull()
  })

  it('filters the available actions with local search', async () => {
    const user = userEvent.setup()
    renderToolsScreen()
    await user.type(screen.getByRole('textbox', { name: 'Search actions' }), 'flight')
    expect(screen.getByText('Get flight')).toBeInTheDocument()
    expect(screen.queryByText('Get earnings')).toBeNull()
  })
})
