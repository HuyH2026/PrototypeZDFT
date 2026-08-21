import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render as rtlRender, screen, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import type { ReactElement } from 'react'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { AiAssistantHost } from '@/features/ai-studio/AiAssistantHost'
import { clearDashboardRequest } from './dashboard-request-store'
import { HomeScreen } from './HomeScreen'

// HomeScreen renders PmDashboard for PM views, whose feed cards / spotlight rows
// use react-router <Link>s — so every render needs a router context. Wrap here so
// the many call sites stay `render(<HomeScreen />)` unchanged.
//
// The assistant host renders alongside it, as it does in AppLayout: dashboard
// generation is driven from AI Studio, so Home's Generate action is only half the
// flow and the host must be mounted to exercise the rest.
function render(ui: ReactElement) {
  return rtlRender(
    <MemoryRouter>
      <AiAssistantProvider>
        {ui}
        <AiAssistantHost />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
}

// Both the request store (module state) and the saved views (jsdom localStorage,
// which persists for the whole file) outlive a test. Without this, a test that
// applies a generated view leaves it active — and the next test opens on that
// view instead of Default.
afterEach(() => {
  clearDashboardRequest()
  window.localStorage?.clear()
})

// Drive a dashboard request the way a user does: open the assistant from Home's
// Generate New action, type into the composer, and send. The assistant builds the
// dashboard from there and saves it itself, so callers that need the finished
// dashboard follow this with `settleDashboard`.
async function requestDashboardVia(user: ReturnType<typeof userEvent.setup>, prompt: string) {
  await user.click(screen.getByRole('button', { name: /generate new/i }))
  const panel = screen.getByTestId('ai-studio-panel')
  const composer = within(panel).getByRole('textbox')
  await user.type(composer, `${prompt}{Enter}`)
  return panel
}

// Wait out the assistant's build trace, which is what commits the dashboard. The
// timeout covers the whole trace (one step per beat) with room to spare.
async function settleDashboard(panel: HTMLElement) {
  await within(panel).findByText(/all done/i, undefined, { timeout: 4000 })
}

const VIEWS_KEY = 'home-dashboard-views-v1'

// All widget titles, used for order-capturing helper.
const WIDGET_TITLES = [
  'Overall agent health',
  'Test coverage',
  'Knowledge gaps',
  'Needs your approval',
  'Notifications',
  'Cost & usage',
  'Recent activity',
  'Top intents',
  'Self-improving',
  'New knowledge content',
]

// Captures the current ordered list of widget-card headings from the DOM.
function widgetOrder(): string[] {
  // Most widgets title themselves in <p> via CardHeader, but the redesigned
  // health card titles itself in an <h2>, so both are queried.
  return Array.from(document.querySelectorAll('p, h2'))
    .map((el) => el.textContent ?? '')
    .filter((t) => WIDGET_TITLES.includes(t))
}

// Install a minimal in-memory localStorage seeded with `stored`, so we can
// exercise the saved-views loader (jsdom does not provide localStorage by default).
function stubStorage(key: string, stored: string) {
  const map = new Map<string, string>([[key, stored]])
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    length: 0,
  })
}

// Seed the persisted views with a single Default view carrying `layout`, which is
// how a widget outside DEFAULT_LAYOUT gets on screen for a test.
function stubViewLayout(layout: { left: string[]; right: string[] }) {
  stubStorage(
    VIEWS_KEY,
    JSON.stringify({
      views: [{ id: 'view-1', name: 'Default', kind: 'grid', role: null, layout, builtIn: true }],
      activeId: 'view-1',
    }),
  )
}

// Scope queries to one widget. Several cards carry the same coverage pill and
// status badges, so a page-wide text match would be ambiguous. Scoped by the Card
// primitive's data-slot rather than a styling class, which survives class churn.
function cardByTitle(title: string): HTMLElement {
  const card = screen.getByText(title).closest('[data-slot="card"]')
  if (!card) throw new Error(`${title} card not found`)
  return card as HTMLElement
}

describe('HomeScreen', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('renders the dashboard surface with a greeting', () => {
    render(<HomeScreen />)
    const surface = screen.getByTestId('screen-home')
    expect(surface).toBeInTheDocument()
    expect(surface.className).toMatch(/rounded-\[26px\]/)
    expect(screen.getByText(/good morning, sunny/i)).toBeInTheDocument()
  })

  // The default view is the five widgets the design lands on — the rest stay
  // available from Customize ▸ Add widget.
  it('renders the five default widgets and none of the add-on ones', () => {
    render(<HomeScreen />)
    expect(screen.getByText('Overall agent health')).toBeInTheDocument()
    expect(screen.getByText('Self-improving')).toBeInTheDocument()
    expect(screen.getByText('Test coverage')).toBeInTheDocument()
    expect(screen.getByText('Needs your approval')).toBeInTheDocument()
    expect(screen.getByText('New knowledge content')).toBeInTheDocument()
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument()
    expect(screen.queryByText('Top intents')).not.toBeInTheDocument()
  })

  it('shows the new knowledge content widget with its count, coverage and items', () => {
    render(<HomeScreen />)
    const card = within(cardByTitle('New knowledge content'))
    expect(card.getByText('Content snippets created')).toBeInTheDocument()
    expect(card.getByText('12,479 tickets covered')).toBeInTheDocument()
    expect(card.getByText(/how to verify bank account verification issues/i)).toBeInTheDocument()
    // Status reads as saved-or-draft, not published-or-draft.
    expect(card.getByText('Draft')).toBeInTheDocument()
    expect(card.getAllByText('Saved')).toHaveLength(2)
  })

  it('shows the self-improving widget with its policies and their state', () => {
    render(<HomeScreen />)
    const card = within(cardByTitle('Self-improving'))
    expect(card.getByText('Policies improved')).toBeInTheDocument()
    expect(card.getByText('Refund escalation policy')).toBeInTheDocument()
    expect(card.getByText('-32% escalations')).toBeInTheDocument()
    expect(card.getByText('Widget channel • 2 hr ago')).toBeInTheDocument()
    expect(card.getAllByText('Applied')).toHaveLength(2)
    expect(card.getByText('Pending approval')).toBeInTheDocument()
  })

  it('shows test coverage with its pass rate, per-suite results and playlists', () => {
    render(<HomeScreen />)
    const card = within(cardByTitle('Test coverage'))
    expect(card.getByText('93%')).toBeInTheDocument()
    expect(card.getByText('118 pass')).toBeInTheDocument()
    expect(card.getByText('6 fail')).toBeInTheDocument()
    expect(card.getByText('Refund request')).toBeInTheDocument()
    expect(card.getByText(/newly generated playlists/i)).toBeInTheDocument()
    expect(card.getByText('Regression test')).toBeInTheDocument()
    expect(card.getByText('Tone of voice test')).toBeInTheDocument()
  })

  it('shows the knowledge gaps hero stats once that widget is added', () => {
    stubViewLayout({ left: ['gaps'], right: [] })
    render(<HomeScreen />)
    expect(screen.getByText('58')).toBeInTheDocument()
    expect(screen.getByText(/articles generated for identified gaps/i)).toBeInTheDocument()
    expect(screen.getByText('11,004')).toBeInTheDocument()
    expect(screen.getByText(/potential ticket coverage/i)).toBeInTheDocument()
  })

  it('renders the platform-level data (no org-level toggle)', () => {
    render(<HomeScreen />)
    // Home is always platform-level — there is no org/platform switch.
    expect(screen.queryByRole('button', { name: /^organization$/i })).not.toBeInTheDocument()
    // Health widget's narrative flows through the registry into the DOM.
    expect(screen.getByText(/resolution and csat are trending up/i)).toBeInTheDocument()
  })

  it('shows a finished A/B test approval with the winning variant', () => {
    render(<HomeScreen />)
    expect(screen.getByText(/a\/b test finished/i)).toBeInTheDocument()
    // The crest names the winner; the winning row is the only one tagged.
    expect(screen.getByText(/winner:/i)).toBeInTheDocument()
    expect(screen.getByText('Winner')).toBeInTheDocument()
    // Every variant reports its conversation count and traffic split.
    expect(screen.getByText('3,011 (33.6%)')).toBeInTheDocument()
    // Approve CTA publishes the declared winner.
    expect(screen.getByRole('button', { name: /publish variant b/i })).toBeInTheDocument()
  })

  it('renders a self-improving plan approval as an embedded Slack message', () => {
    render(<HomeScreen />)
    expect(screen.getByText(/self-improving plan needs approval/i)).toBeInTheDocument()
    // Origin is shown as a forwarded Slack message: channel, author, quoted text.
    expect(screen.getByText(/slack #ai-studio/i)).toBeInTheDocument()
    expect(screen.getByText('Joanna')).toBeInTheDocument()
    expect(screen.getByText(/this is for the service cancellation policy/i)).toBeInTheDocument()
    // A Slack-sourced approval still offers the plain Approve CTA.
    expect(screen.getByRole('button', { name: /^approve$/i })).toBeInTheDocument()
  })

  it('enters edit mode via Customize', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    await user.click(screen.getByRole('button', { name: /customize/i }))
    expect(screen.getByText(/customize your dashboard/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add widget/i })).toBeInTheDocument()
  })

  // The Add widget popover used to be a keyboard trap: no Escape handler, no
  // focus return, and nothing on the trigger saying it had opened. The PM
  // header renders the same component, so covering it once covers both.
  it('says on the Add widget trigger whether its popover is open', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    await user.click(screen.getByRole('button', { name: /customize/i }))

    const trigger = screen.getByRole('button', { name: /add widget/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger.getAttribute('aria-controls')).toBe(
      screen.getByTestId('add-widget-popover').id,
    )
  })

  it('closes the Add widget popover on Escape and hands focus back to the trigger', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    await user.click(screen.getByRole('button', { name: /customize/i }))
    const trigger = screen.getByRole('button', { name: /add widget/i })
    await user.click(trigger)
    expect(screen.getByTestId('add-widget-popover')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByTestId('add-widget-popover')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('ignores a crafted layout referencing prototype keys and falls back to defaults', () => {
    // "toString" is on Object.prototype; a naive `in WIDGETS` check would accept
    // it and crash on render. Validation must reject it and use DEFAULT_LAYOUT.
    stubViewLayout({ left: ['toString'], right: [] })
    render(<HomeScreen />)
    // Renders the default widgets, no crash.
    expect(screen.getByText('Overall agent health')).toBeInTheDocument()
    expect(screen.getByText('Needs your approval')).toBeInTheDocument()
  })

  it('dedupes a stored layout with duplicate widget ids', () => {
    stubViewLayout({ left: ['health', 'health'], right: ['qa'] })
    render(<HomeScreen />)
    // The duplicate is collapsed to a single instance (one heading, not two).
    expect(screen.getAllByText('Overall agent health')).toHaveLength(1)
    expect(screen.getByText('Test coverage')).toBeInTheDocument()
  })

  // Generate New hands off to AI Studio rather than opening a form of its own —
  // the assistant is the driver for dashboard building.
  it('opens the AI Studio assistant from the header Generate New action', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    expect(screen.queryByTestId('ai-studio-panel')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /generate new/i }))
    const panel = screen.getByTestId('ai-studio-panel')
    expect(within(panel).getByText(/let.s design your dashboard/i)).toBeInTheDocument()
    // Nothing left to ask for while the conversation is open.
    expect(screen.getByRole('button', { name: /generate new/i })).toBeDisabled()
  })

  // The panel asks its two questions itself, so the composer opens empty — it is
  // the way out of the questions, not a prefilled form.
  it('opens the composer empty and editable beside the guided picker', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    await user.click(screen.getByRole('button', { name: /generate new/i }))
    const panel = screen.getByTestId('ai-studio-panel')
    expect(within(panel).getByTestId('dashboard-picker')).toBeInTheDocument()

    const composer = within(panel).getByRole('textbox')
    expect(composer).toHaveValue('')
    expect(composer).not.toHaveAttribute('readonly')
    await user.type(composer, 'just cost please')
    expect(composer).toHaveValue('just cost please')
  })

  it('builds a dashboard from a typed request and saves it when it finishes', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const before = widgetOrder()
    const panel = await requestDashboardVia(user, 'a dashboard for a cs lead, testing focus')
    await settleDashboard(panel)

    const after = widgetOrder()
    expect(after.length).toBeGreaterThan(0) // Sanity check: widgets rendered
    expect(after).not.toEqual(before) // Order changed — proves the built layout was committed
  })

  // The request belongs to the conversation: closing the assistant mid-build must
  // not leave Home showing a dashboard it never saved.
  it('abandons an unfinished build when the assistant is closed', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const before = widgetOrder()
    const panel = await requestDashboardVia(user, 'cs lead, testing focus')

    await user.click(within(panel).getByLabelText('Close AI Studio'))
    await waitForElementToBeRemoved(panel)

    expect(widgetOrder()).toEqual(before)
  })

  it('hides Customize while a dashboard is being built', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    // Customize is available before building.
    expect(screen.getByRole('button', { name: /customize/i })).toBeInTheDocument()
    await requestDashboardVia(user, 'cs lead, testing focus')
    // Mid-build the shown layout is not the saved one, so editing it is withheld.
    expect(screen.queryByRole('button', { name: /customize/i })).not.toBeInTheDocument()
  })
})

// The brand breakdown lives in the Top intents card; scope queries to it.
const intentsCard = () => cardByTitle('Top intents')

describe('Top intents brand breakdown', () => {
  afterEach(() => vi.unstubAllGlobals())

  // DEFAULT_LAYOUT doesn't include the `intents` widget (it's an
  // add-on card, not shown out of the box) — seed a stored layout that
  // includes it so these accordion tests can find the card.
  beforeEach(() => {
    stubViewLayout({ left: ['intents'], right: [] })
  })

  it('renders every intent collapsed by default', () => {
    render(<HomeScreen />)
    const card = within(intentsCard())
    // No tier labels visible until a row is expanded.
    expect(card.queryByText('VIP')).not.toBeInTheDocument()
    expect(card.queryByText('Vendor')).not.toBeInTheDocument()
    // Every intent row is a collapsed toggle.
    const rows = card.getAllByRole('button', { expanded: false })
    expect(rows.length).toBeGreaterThanOrEqual(4)
  })

  it('expands an intent to reveal its VIP/Premium/Vendor breakdown', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const card = within(intentsCard())
    await user.click(card.getByRole('button', { name: /order status/i }))
    expect(card.getByText('VIP')).toBeInTheDocument()
    expect(card.getByText('Premium')).toBeInTheDocument()
    expect(card.getByText('Vendor')).toBeInTheDocument()
    // Order status → Vendor is 60% · 2,520 tickets.
    expect(card.getByText(/60% · 2,520 tickets/)).toBeInTheDocument()
    expect(card.getByRole('button', { name: /order status/i })).toHaveAttribute('aria-expanded', 'true')
  })

  it('keeps only one intent open at a time (accordion)', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const card = within(intentsCard())
    await user.click(card.getByRole('button', { name: /order status/i }))
    await user.click(card.getByRole('button', { name: /refund request/i }))
    expect(card.getByRole('button', { name: /order status/i })).toHaveAttribute('aria-expanded', 'false')
    expect(card.getByRole('button', { name: /refund request/i })).toHaveAttribute('aria-expanded', 'true')
    // Exactly one panel open.
    expect(card.getAllByRole('button', { expanded: true })).toHaveLength(1)
  })
})

describe('HomeScreen — dashboard views', () => {
  it('shows the view switcher with the Default view', () => {
    render(<HomeScreen />)
    const switcher = screen.getByTestId('view-switcher')
    expect(switcher).toHaveTextContent('Default')
  })

  it('a finished build becomes a new active view named for the role', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const panel = await requestDashboardVia(user, 'ops lead view of resolution and health')
    await settleDashboard(panel)
    // The new view is active and appears in the switcher.
    expect(screen.getByTestId('view-switcher')).toHaveTextContent('Ops lead')
  })

  // A request that names no role still produces a usable view — the composer is
  // free text, so "whatever they want to see" must work without naming a role.
  it('names a role-less request Custom Home', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const panel = await requestDashboardVia(user, 'just show me cost and knowledge gaps')
    await settleDashboard(panel)
    expect(screen.getByTestId('view-switcher')).toHaveTextContent('Custom Home')
  })

  it('switches back to the Default view from the switcher', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    // Build an Ops view first.
    const panel = await requestDashboardVia(user, 'ops lead view of resolution and health')
    await settleDashboard(panel)
    // Open switcher and pick Default.
    await user.click(within(screen.getByTestId('view-switcher')).getByRole('button', { name: /ops lead/i }))
    await user.click(screen.getByRole('button', { name: /^Default$/ }))
    expect(screen.getByTestId('view-switcher')).toHaveTextContent('Default')
  })

  it('the built-in Default view has no delete control', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    await user.click(within(screen.getByTestId('view-switcher')).getByRole('button', { name: /default/i }))
    expect(screen.queryByRole('button', { name: /delete default/i })).not.toBeInTheDocument()
  })

  it('a Product Manager request creates a Product lifecycle view showing the PM dashboard', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const panel = await requestDashboardVia(user, 'build me a product manager dashboard')
    await settleDashboard(panel)
    // The PM dashboard surface is now shown, and the switcher names it.
    expect(screen.getByTestId('screen-pm')).toBeInTheDocument()
    expect(screen.getByTestId('view-switcher')).toHaveTextContent('Product lifecycle')
    expect(within(screen.getByTestId('screen-pm')).getByText('ARR at risk')).toBeInTheDocument()
  })

  it('an Executive request creates a separate Executive dashboard view', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const panel = await requestDashboardVia(user, 'build me an executive dashboard')
    await settleDashboard(panel)

    expect(screen.getByTestId('screen-executive')).toBeInTheDocument()
    expect(screen.getByTestId('view-switcher')).toHaveTextContent('Executive dashboard')
    expect(screen.getByText('Executive outcome summary')).toBeInTheDocument()
    expect(screen.getByText("Here's what your executive outcome summary shows.")).toBeInTheDocument()

    await user.click(
      within(screen.getByTestId('view-switcher')).getByRole('button', {
        name: /executive dashboard/i,
      }),
    )
    expect(screen.getByRole('button', { name: /^Default$/ })).toBeInTheDocument()
  })

  // Tracking the lifecycle asks for the same dashboard, whoever is asking.
  it('a lifecycle request creates the PM dashboard even without the PM role', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const panel = await requestDashboardVia(user, 'ops lead view of the product lifecycle')
    await settleDashboard(panel)
    expect(screen.getByTestId('screen-pm')).toBeInTheDocument()
  })

  it('switching from a PM view back to Default restores the grid dashboard', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const panel = await requestDashboardVia(user, 'build me a product manager dashboard')
    await settleDashboard(panel)
    expect(screen.getByTestId('screen-pm')).toBeInTheDocument()
    // Switch back to Default.
    await user.click(within(screen.getByTestId('view-switcher')).getByRole('button', { name: /product lifecycle/i }))
    await user.click(screen.getByRole('button', { name: /^Default$/ }))
    expect(screen.queryByTestId('screen-pm')).not.toBeInTheDocument()
    expect(screen.getByText('Overall agent health')).toBeInTheDocument()
  })

  it('offers Build an agent on a cancellation-shaped knowledge gap only', async () => {
    stubViewLayout({ left: ['gaps'], right: [] })
    render(<HomeScreen />)
    expect(screen.getByText('Service cancellations')).toBeInTheDocument()
    const actions = screen.getAllByRole('button', { name: 'Build an agent' })
    expect(actions).toHaveLength(1)
  })
})
