import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { BrandProvider } from '@/app/brand-context'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import * as aiContext from '@/app/ai-assistant-context'
import { AgentBuilderScreen } from './AgentBuilderScreen'
import { resetAgentStore } from './agent-store'

// Mock useNavigate since these tests render the component bare (no router).
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

// AgentBuilderScreen now reads brand state via useBrands() and renders an
// AiTriggerButton, which requires BrandProvider, MemoryRouter (for useLocation in
// AiAssistantProvider), and AiAssistantProvider ancestors — in the real app it
// always has them (RootLayout wraps every route). Provide them here so these
// bare-render tests match production mounting.
function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/ai-agents/agent-builder']}>
      <BrandProvider>
        <AiAssistantProvider>
          <AgentBuilderScreen />
        </AiAssistantProvider>
      </BrandProvider>
    </MemoryRouter>,
  )
}

// Clear localStorage and reset module state before and after each test for deterministic store state.
beforeEach(() => {
  window.localStorage?.clear()
  resetAgentStore()
})
afterEach(() => {
  window.localStorage?.clear()
})

function surface(): HTMLElement {
  return screen.getByTestId('view-agent-builder')
}

describe('AgentBuilderScreen', () => {
  it('renders the Widget channel by default', () => {
    renderScreen()
    const view = within(surface())
    expect(view.getByRole('heading', { name: 'Use cases' })).toBeInTheDocument()
    expect(view.getByText('Total Chats')).toBeInTheDocument()
    expect(view.getByText('21,590')).toBeInTheDocument()
    expect(view.getByText('Knowledge Retrieval')).toBeInTheDocument()
    expect(view.getByText('Product recommendations')).toBeInTheDocument()
  })

  it('switches channels, changing the headline metric and rows', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(surface())
    await user.click(view.getByRole('tab', { name: 'Voice' }))
    expect(view.getByText('334 hr 16 min')).toBeInTheDocument()
    // Not '21,590': that happens to be both Widget's "Total Chats" value AND
    // the Figma-transcribed value for Voice's own "Total inbound calls" tile,
    // so it can't disambiguate. 'Total Chats' is the label unique to Widget.
    expect(view.queryByText('Total Chats')).not.toBeInTheDocument()
    expect(view.getByText('Call routing')).toBeInTheDocument()
    // Not 'Knowledge Retrieval': that's both a Widget agent's row name AND
    // Voice's own "Call routing" row's Type value (VOICE_COLUMNS renders a
    // Type column), so it can't disambiguate either. 'Product recommendations'
    // is a Widget-only agent name with no such collision.
    expect(view.queryByText('Product recommendations')).not.toBeInTheDocument()
  })

  it('shows an Inbound/Outbound tab only for Voice, defaulting to Inbound', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(surface())
    expect(view.queryByRole('tab', { name: 'Inbound' })).not.toBeInTheDocument()

    await user.click(view.getByRole('tab', { name: 'Voice' }))
    expect(view.getByRole('tab', { name: 'Inbound', selected: true })).toBeInTheDocument()
    expect(view.getByText('Call routing')).toBeInTheDocument()
    expect(view.queryByText('Payment')).not.toBeInTheDocument()
  })

  it('switches to Outbound metrics and rows, resetting to Inbound on channel change', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(surface())
    await user.click(view.getByRole('tab', { name: 'Voice' }))
    await user.click(view.getByRole('tab', { name: 'Outbound' }))
    expect(view.getByText('73 hr 41 min')).toBeInTheDocument()
    // The frame 112:51124 outbound rows and their own column set.
    expect(view.getByText('Payment')).toBeInTheDocument()
    expect(view.getByText('Product Selection')).toBeInTheDocument()
    expect(view.getByText('Refund Subscription')).toBeInTheDocument()
    expect(view.getByText('Voicemail left')).toBeInTheDocument()
    expect(view.getAllByText('5d74aa9e-fcbf-42d4-9efd-6024')).toHaveLength(3)
    expect(view.queryByText('Call routing')).not.toBeInTheDocument()

    await user.click(view.getByRole('tab', { name: 'Widget' }))
    await user.click(view.getByRole('tab', { name: 'Voice' }))
    expect(view.getByRole('tab', { name: 'Inbound', selected: true })).toBeInTheDocument()
  })

  it('filters to only On use cases under the Active use cases tab', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(surface())
    await user.click(view.getByRole('switch', { name: 'Activate Service cancellation' }))
    await user.click(view.getByRole('tab', { name: 'Active use cases' }))
    expect(view.getByText('Knowledge Retrieval')).toBeInTheDocument()
    expect(view.queryByText('Service cancellation')).not.toBeInTheDocument()
  })

  it('moves a row out of Active when toggled off', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(surface())
    await user.click(view.getByRole('switch', { name: 'Activate Service cancellation' }))
    await user.click(view.getByRole('tab', { name: 'Active use cases' }))
    expect(view.queryByText('Service cancellation')).not.toBeInTheDocument()
    expect(view.getByLabelText('Fallback is On')).toBeInTheDocument()
  })

  it('shows only subflows under the Active subflows tab', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(surface())
    await user.click(view.getByRole('tab', { name: 'Active subflows' }))
    expect(view.getByRole('switch', { name: 'Activate Service cancellation' })).toBeInTheDocument()
    expect(view.queryByText('Knowledge Retrieval')).not.toBeInTheDocument()
  })

  it('selects a row and deletes it after confirming', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(surface())
    expect(view.getByRole('switch', { name: 'Activate Service cancellation' })).toBeInTheDocument()

    // Select the row; the action bar appears.
    await user.click(view.getByRole('checkbox', { name: 'Select Service cancellation' }))
    expect(view.getByText('1 selected')).toBeInTheDocument()
    // Selected row carries the data attribute the CSS keys off.
    expect(view.getByTestId('agent-row-w3')).toHaveAttribute('data-selected', 'true')

    // Delete opens the confirm dialog; row still present until confirmed.
    await user.click(view.getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByRole('alertdialog')
    expect(within(dialog).getByText('Delete 1 use case?')).toBeInTheDocument()
    expect(view.getByRole('switch', { name: 'Activate Service cancellation' })).toBeInTheDocument()

    // Confirm removes the row and clears the bar.
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(
      view.queryByRole('switch', { name: 'Activate Service cancellation' }),
    ).not.toBeInTheDocument()
    expect(view.queryByText('1 selected')).not.toBeInTheDocument()
  })

  it('cancelling the confirm dialog keeps the row', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(surface())
    await user.click(view.getByRole('checkbox', { name: 'Select Service cancellation' }))
    await user.click(view.getByRole('button', { name: 'Delete' }))
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }),
    )
    expect(view.getByRole('switch', { name: 'Activate Service cancellation' })).toBeInTheDocument()
    // Selection is preserved on cancel.
    expect(view.getByText('1 selected')).toBeInTheDocument()
  })

  it('select-all toggles every visible row and clears on channel switch', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(surface())
    await user.click(view.getByRole('checkbox', { name: 'Select all use cases' }))
    expect(view.getByText('21 selected')).toBeInTheDocument()
    // Switching channel resets selection.
    await user.click(view.getByRole('tab', { name: 'Voice' }))
    expect(view.queryByText(/selected$/)).not.toBeInTheDocument()
  })

  it('unselected rows do not carry the selection attribute', async () => {
    renderScreen()
    const view = within(surface())
    // Initially no rows are selected.
    expect(view.getByTestId('agent-row-w1')).not.toHaveAttribute('data-selected')
    expect(view.getByTestId('agent-row-w3')).not.toHaveAttribute('data-selected')
  })

  it('has one AI entry and opens the contextual side panel first', async () => {
    const open = vi.fn()
    const close = vi.fn()
    const toggle = vi.fn()
    const expand = vi.fn()
    const collapse = vi.fn()

    vi.spyOn(aiContext, 'useAiAssistant').mockReturnValue({
      isOpen: false,
      mode: 'panel',
      context: { scope: 'agent-builder', greeting: '', prompt: '' },
      contextVersion: 0,
      open,
      close,
      toggle,
      expand,
      collapse,
    })

    renderScreen()
    const view = within(surface())
    const aiEntry = view.getByRole('button', { name: 'Ask AI about this page' })
    expect(view.queryByRole('button', { name: 'Build an agent with AI' })).not.toBeInTheDocument()

    await userEvent.click(aiEntry)
    expect(open).toHaveBeenCalledWith('agent-builder', 'panel')

    vi.restoreAllMocks()
  })

  it('opens the preview overlay from the toolbar and closes it again', async () => {
    renderScreen()
    expect(screen.queryByTestId('use-case-preview')).not.toBeInTheDocument()

    await userEvent.click(within(surface()).getByRole('button', { name: 'Preview' }))
    const overlay = screen.getByTestId('use-case-preview')
    expect(within(overlay).getByText('Preview settings')).toBeInTheDocument()

    await userEvent.click(within(overlay).getByRole('button', { name: 'Close' }))
    expect(screen.queryByTestId('use-case-preview')).not.toBeInTheDocument()
  })

  it('previews the channel that is currently selected', async () => {
    renderScreen()
    await userEvent.click(within(surface()).getByRole('tab', { name: 'Voice' }))
    await userEvent.click(within(surface()).getByRole('button', { name: 'Preview' }))

    const header = within(screen.getByTestId('use-case-preview')).getByRole('banner')
    expect(within(header).getByText('Voice')).toBeInTheDocument()
  })

  it('renders the channel switcher in the sticky header', () => {
    renderScreen()
    const header = surface().querySelector<HTMLElement>('[data-slot="page-header"]')!
    expect(within(header).getByRole('tab', { name: 'Voice' })).toBeInTheDocument()
  })

  it('offers the Web Call channel next to Voice, with the frame’s strip and rows', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(surface())
    const tablist = view.getByRole('tablist', { name: 'Channel' })
    expect(within(tablist).getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Widget',
      'Email',
      'Web Call',
      'Voice',
      'Headless',
    ])

    await user.click(within(tablist).getByRole('tab', { name: 'Web Call' }))
    // The eight-tile strip (frame 120:57534) — a Webcall-only label and value.
    expect(view.getByText('Total Web Calls')).toBeInTheDocument()
    expect(view.getByText('73 hr 41 min')).toBeInTheDocument()
    expect(view.getByText('Realized savings')).toBeInTheDocument()
    // The frame's four rows, with its own columns: Calls and Total talk time,
    // and no CSAT column.
    expect(view.getByRole('columnheader', { name: 'Calls' })).toBeInTheDocument()
    expect(view.getByRole('columnheader', { name: 'Total talk time' })).toBeInTheDocument()
    expect(view.queryByRole('columnheader', { name: 'Avg. CSAT' })).not.toBeInTheDocument()
    expect(view.getByTestId('agent-row-wc3')).toHaveTextContent('member_center +1')
    expect(view.getByTestId('agent-row-wc1')).toHaveTextContent('19 hr 37 min')
    // Built-ins keep a fixed status, the rest get switches.
    expect(view.getByLabelText('Knowledge Retrieval is On')).toBeInTheDocument()
    expect(view.getByRole('switch', { name: 'Activate Login Help' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('toggles between the table and grid view from the toolbar', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(surface())
    expect(view.getByRole('table')).toBeInTheDocument()
    expect(view.queryByTestId('agents-grid')).not.toBeInTheDocument()

    await user.click(view.getByRole('button', { name: 'Grid view' }))
    expect(view.queryByRole('table')).not.toBeInTheDocument()
    expect(view.getByTestId('agents-grid')).toBeInTheDocument()

    await user.click(view.getByRole('button', { name: 'List view' }))
    expect(view.getByRole('table')).toBeInTheDocument()
    expect(view.queryByTestId('agents-grid')).not.toBeInTheDocument()
  })
})
