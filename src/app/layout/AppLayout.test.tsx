import { describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { BrandProvider } from '@/app/brand-context'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { routes } from '@/routes'
import { AppLayout } from './AppLayout'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <BrandProvider>
            <AiAssistantProvider>
              <AppLayout />
            </AiAssistantProvider>
          </BrandProvider>
        ),
        children: [{ index: true, element: <div>home</div> }],
      },
    ],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('routing + layout', () => {
  it('renders the Home screen at /', () => {
    renderAt('/')
    expect(screen.getByTestId('screen-home')).toBeInTheDocument()
  })

  // A subnav destination renders inside the content region, not beside the rail.
  // This used to assert the Knowledge placeholder; the screen is built now, so it
  // asserts the screen instead.
  it('renders a subnav destination inside main', () => {
    renderAt('/agent-builder/knowledge')
    // Scoped to main: the nav's pages column also carries a "Knowledge" label.
    const main = screen.getByRole('main')
    expect(within(main).getByTestId('view-knowledge')).toBeInTheDocument()
    expect(within(main).getByRole('heading', { level: 1, name: 'Knowledge' })).toBeInTheDocument()
  })

  it('marks the active nav item based on the URL', () => {
    renderAt('/insights')
    expect(screen.getByRole('link', { name: /insights/i })).toHaveAttribute('aria-current', 'page')
  })
})

describe('AppLayout nav pages column', () => {
  // Opening the column follows the active section: selecting a rail icon shows its
  // pages straight away, as in the prototype's `selectNav` → `openSubnav`.
  it('shows the active section’s pages beside the rail', () => {
    renderAt('/insights/agent-overview')
    const panel = screen.getByTestId('subnav-panel')
    expect(within(panel).getByRole('link', { name: /agent overview/i })).toBeInTheDocument()
  })

  it('shows no column for a section without pages', () => {
    renderAt('/agent-setup')
    expect(screen.queryByTestId('subnav-panel')).not.toBeInTheDocument()
  })

  it('renders the column as a sibling of the rail, not nested in it', () => {
    renderAt('/insights/agent-overview')
    const panel = screen.getByTestId('subnav-panel')
    expect(panel.previousElementSibling).toContainElement(
      screen.getByRole('link', { name: /^Insights$/ }),
    )
  })

  // The rail's toggle is the prototype's `.nav-toggle` → `toggleSubnav()`: it hides
  // and shows this column. It must never open a second, wider nav beside it.
  it('hides and reopens the column from the rail toggle', async () => {
    renderAt('/insights/agent-overview')
    expect(screen.getByTestId('subnav-panel')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Hide pages' }))
    expect(screen.queryByTestId('subnav-panel')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Show pages' }))
    expect(screen.getByTestId('subnav-panel')).toBeInTheDocument()
  })

  // The regression this replaced: the toggle swapped the 56px rail for a 234px
  // labelled nav while the pages column stayed, giving two nav columns and the
  // section name twice. There is only ever one nav list.
  it('never shows a second labelled nav beside the column', async () => {
    renderAt('/insights/agent-overview')
    await userEvent.click(screen.getByRole('button', { name: 'Hide pages' }))
    await userEvent.click(screen.getByRole('button', { name: 'Show pages' }))

    // The rail names Insights via its tooltip only; the column heads itself
    // "Insights". A labelled nav row would be a third.
    const panel = screen.getByTestId('subnav-panel')
    expect(within(panel).getByText('Insights')).toBeInTheDocument()
    expect(screen.getAllByText('Insights')).toHaveLength(1)
  })

  it('reopens the column when moving to another section', async () => {
    renderAt('/insights/agent-overview')
    await userEvent.click(screen.getByRole('button', { name: 'Hide pages' }))
    expect(screen.queryByTestId('subnav-panel')).not.toBeInTheDocument()

    // Closing frees room for the page you are on; it is not a lasting preference.
    await userEvent.click(screen.getByRole('link', { name: /^Agent Builder$/ }))
    expect(screen.getByTestId('subnav-panel')).toBeInTheDocument()
  })

  // The prototype's `selectNav` calls `openSubnav` for *every* section with pages,
  // including the one you are already on — selecting a rail icon is how you get the
  // column back, not only the toggle. Deriving visibility from the section label
  // alone left the column shut for the section it was hidden for, so returning to
  // it (or re-selecting it) kept it hidden.
  it('reopens the column when re-selecting the section it was hidden for', async () => {
    renderAt('/agent-builder/use-cases')
    await userEvent.click(screen.getByRole('button', { name: 'Hide pages' }))
    expect(screen.queryByTestId('subnav-panel')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('link', { name: /^Agent Builder$/ }))
    expect(screen.getByTestId('subnav-panel')).toBeInTheDocument()
  })

  it('reopens the column when coming back to the section it was hidden for', async () => {
    renderAt('/agent-builder/use-cases')
    await userEvent.click(screen.getByRole('button', { name: 'Hide pages' }))

    await userEvent.click(screen.getByRole('link', { name: /^Insights$/ }))
    await userEvent.click(screen.getByRole('link', { name: /^Agent Builder$/ }))
    expect(screen.getByTestId('subnav-panel')).toBeInTheDocument()
  })

  // Hiding the column frees room for the page you are on, so drilling into a
  // detail route from that page must not pop it back open — only the rail's own
  // section links do that (the prototype's `selectSubnav` never calls
  // `openSubnav`).
  it('keeps the column hidden while navigating within the section', async () => {
    renderAt('/agent-builder/use-cases')
    await userEvent.click(screen.getByRole('button', { name: 'Hide pages' }))

    // An agent row opens the editor at /agent-builder/:agentId.
    const main = screen.getByRole('main')
    await userEvent.click(within(main).getAllByRole('row')[1])
    expect(screen.queryByTestId('subnav-panel')).not.toBeInTheDocument()
  })

  it('suppresses the rail tooltips while the column is open', () => {
    renderAt('/insights/agent-overview')
    // They would open straight over the column, which already names the section.
    expect(screen.queryByTestId('nav-tooltip')).not.toBeInTheDocument()
  })

  it('still shows the rail tooltips on a section without pages', () => {
    renderAt('/agent-setup')
    expect(screen.getAllByTestId('nav-tooltip').length).toBeGreaterThan(0)
  })

  // Closing the column brings the tooltips back — the only thing then naming a
  // rail icon.
  it('shows the rail tooltips again once the column is closed', async () => {
    renderAt('/insights/agent-overview')
    await userEvent.click(screen.getByRole('button', { name: 'Hide pages' }))
    expect(screen.getAllByTestId('nav-tooltip').length).toBeGreaterThan(0)
  })
})

describe('AppLayout AI assistant', () => {
  it('opens the full-suite view from the sidebar AI button and closes it', async () => {
    renderLayout()
    const button = screen.getByLabelText('AI assistant')
    expect(screen.queryByTestId('ai-studio-landing')).not.toBeInTheDocument()

    await userEvent.click(button)
    expect(screen.getByTestId('ai-studio-landing')).toBeInTheDocument()

    // Opened directly into full mode, so closing dismisses everything — it does
    // NOT fall back to the inline panel (no panel was ever behind it). The
    // studio animates its own close rather than vanishing, so its removal
    // isn't guaranteed to land in the same tick as the click.
    await userEvent.click(screen.getByLabelText('Close AI Studio'))
    await waitFor(() => {
      expect(screen.queryByTestId('ai-studio-landing')).not.toBeInTheDocument()
    })
    expect(screen.queryByTestId('ai-studio-panel')).not.toBeInTheDocument()
  })

  it('opens the assistant via Cmd+K', async () => {
    renderLayout()
    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(screen.getByTestId('ai-studio-panel')).toBeInTheDocument()
  })

  // The panel slides in over the row rather than being laid out in it, so it
  // needs a spacer to open the gap it lands in — without one it would cover the
  // right edge of the content instead of pushing it clear.
  it('opens the side panel outside the content flow, with a spacer for the gap', async () => {
    renderLayout()
    await userEvent.keyboard('{Meta>}k{/Meta}')

    const panel = screen.getByTestId('ai-studio-panel')
    const main = screen.getByRole('main')
    expect(main).not.toContainElement(panel)

    // Both the panel and the spacer are siblings of `main` in the app row.
    const row = main.parentElement as HTMLElement
    expect(row).toContainElement(panel)
    const spacer = row.querySelector('[aria-hidden="true"]')
    expect(spacer).toBeInTheDocument()
  })
})
