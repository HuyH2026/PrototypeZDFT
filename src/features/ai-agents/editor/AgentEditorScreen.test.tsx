import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { resetAgentStore } from '../agent-store'
import { routes } from '@/routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

// The store is module-level and persists to localStorage, so without this the
// tests leak into each other — the "Approve" case leaves w3 with
// `previewPending: true`, which swaps the canvas for the inline diff.
beforeEach(() => {
  window.localStorage?.clear()
  resetAgentStore()
})

describe('AgentEditorScreen', () => {
  it('renders the editor for a seeded agent', () => {
    renderAt('/ai-agents/w3')
    expect(screen.getByTestId('view-agent-editor')).toBeInTheDocument()
    // Seeded Service cancellation policy chip.
    expect(screen.getByText('Retention Routing')).toBeInTheDocument()
    // Steps palette present.
    expect(screen.getByText('Steps')).toBeInTheDocument()
  })

  it('redirects to the list for an unknown agent id', () => {
    renderAt('/ai-agents/does-not-exist')
    expect(screen.getByTestId('view-agent-builder')).toBeInTheDocument()
  })

  it('navigates back to the list from the editor', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')
    await user.click(screen.getByRole('button', { name: 'Back to agents' }))
    expect(await screen.findByTestId('view-agent-builder')).toBeInTheDocument()
  })

  it('renders the expanded shipping-status condition block under the policy', () => {
    renderAt('/ai-agents/w3')
    const editor = within(screen.getByTestId('view-agent-editor'))
    expect(editor.getByText('Shipping status')).toBeInTheDocument()
    expect(editor.getAllByText('Condition description')).toHaveLength(2)
    expect(editor.getByText('Otherwise…')).toBeInTheDocument()
    expect(
      editor.getByRole('button', { name: 'Collapse Untitled classic block 01' }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('adds a step block when a Steps item is clicked', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')

    await user.click(screen.getByRole('button', { name: 'Add Condition step' }))

    expect(screen.getByText('Untitled classic block 02')).toBeInTheDocument()
    expect(screen.getAllByText('Shipping status')).toHaveLength(2)
  })

  it('keeps generated block titles unique after an earlier block is removed', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')

    await user.click(screen.getByRole('button', { name: 'Add Forms step' }))
    await user.click(screen.getByRole('button', { name: 'Remove Untitled classic block 01' }))
    await user.click(screen.getByRole('button', { name: 'Add Text card step' }))

    expect(screen.getByText('Untitled classic block 03')).toBeInTheDocument()
    expect(screen.getAllByText('Untitled classic block 02')).toHaveLength(1)
  })

  it('rail selection toggles the Steps palette', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')
    expect(screen.getByText('Steps')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Outline' }))
    expect(screen.queryByText('Steps')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Steps' }))
    expect(screen.getByText('Steps')).toBeInTheDocument()
  })

  it('swaps to the Voice rail when the Voice channel tab is selected, and back again', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')

    expect(screen.getByRole('button', { name: 'Insights' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Outline' })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Voice' }))

    expect(screen.getByRole('button', { name: 'Insights' })).toBeInTheDocument()
    for (const label of ['Comps', 'Actions', 'Articles', 'Reroutes', 'Events', 'Global', 'Templates']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    expect(screen.queryByRole('button', { name: 'Outline' })).not.toBeInTheDocument()
    // Voice opens on the Steps panel (the rail's Comps/layers item), per the
    // Voice policy detail frame 143:163114.
    expect(screen.getByRole('button', { name: 'Comps' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Insights' }))
    expect(screen.getByRole('button', { name: 'Insights' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('tab', { name: 'Widget' }))
    expect(screen.getByRole('button', { name: 'Insights' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Outline' })).toBeInTheDocument()
  })

  it('opens the Steps panel for Voice by default, and shows Agent Insights from the rail', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')
    await user.click(screen.getByRole('tab', { name: 'Voice' }))

    // Steps is the default right panel for Voice (frame 143:163114).
    expect(screen.getByRole('heading', { name: 'Steps' })).toBeInTheDocument()
    for (const label of ['Condition', 'Nested Policy', 'GoTo Component', 'Text', 'Code', 'Say']) {
      expect(screen.getByRole('button', { name: `Add ${label} step` })).toBeInTheDocument()
    }

    // Insights is reached from its rail item.
    await user.click(screen.getByRole('button', { name: 'Insights' }))
    expect(screen.getByText('Agent Insights')).toBeInTheDocument()
    expect(screen.getByText('Covered')).toBeInTheDocument()
    // A categorical verdict is a small status pill, not a giant number.
    const healthyPill = screen.getByText('Healthy').closest('[data-slot="status-tag"]')
    expect(healthyPill).toHaveAttribute('data-state', 'good')

    await user.click(screen.getByRole('button', { name: 'Actions' }))
    expect(screen.queryByText('Agent Insights')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Insights' }))
    expect(screen.getByText('Agent Insights')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close insights' }))
    expect(screen.queryByText('Agent Insights')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Comps' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches the Insights panel to the Self-improving tab and shows the plan', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')
    await user.click(screen.getByRole('tab', { name: 'Voice' }))
    // Voice opens on Steps; open the Insights panel from its rail item first.
    await user.click(screen.getByRole('button', { name: 'Insights' }))

    await user.click(screen.getByRole('tab', { name: 'Self-improving' }))
    expect(screen.queryByText('Healthy')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Self-improving' })).toHaveAttribute('aria-selected', 'true')

    expect(screen.getByText('Self-improving plan')).toBeInTheDocument()
    expect(screen.getByText('Needs approval')).toBeInTheDocument()
    expect(screen.getByText('SSO detection + separate flow branch')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Approve' })).toHaveLength(2)
    expect(screen.getByText('Recent activity')).toBeInTheDocument()
  })

  it('shows an Insights rail item for an agent with a self-improving plan, even off Voice', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w8')

    expect(screen.getByRole('button', { name: 'Outline' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Insights' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Insights' }))
    expect(screen.getByText('Agent Insights')).toBeInTheDocument()
    // A categorical verdict is a small status pill, not a giant number.
    const criticalPill = screen.getByText('Critical').closest('[data-slot="status-tag"]')
    expect(criticalPill).toHaveAttribute('data-state', 'attention')
    expect(screen.getByText('34%')).toBeInTheDocument()
    expect(screen.getByText('58%')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close insights' }))
    expect(screen.queryByText('Agent Insights')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Outline' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('derives the Self-improving tab for a plan-backed agent from the real plan data', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w8')
    await user.click(screen.getByRole('button', { name: 'Insights' }))
    await user.click(screen.getByRole('tab', { name: 'Self-improving' }))

    expect(screen.getByText('SSO detection + separate flow branch')).toBeInTheDocument()
    expect(screen.getByText('Expand intent recognition — 14 new trigger phrases')).toBeInTheDocument()
    expect(screen.getByText('Promote A/B winner + close experiment')).toBeInTheDocument()
    expect(screen.getByText('3/6')).toBeInTheDocument()
  })

  it('opens AI Studio, rewrites the policy, and reviews the plan full-view', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')

    // Rail "AI" opens the AI Studio panel (and hides Steps).
    await user.click(screen.getByRole('button', { name: 'AI' }))
    expect(screen.getByTestId('ai-studio-panel')).toBeInTheDocument()
    expect(screen.queryByText('Steps')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open full AI Studio' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Chat history' })).toBeInTheDocument()

    // Ask to rewrite → analysis + plan card appear.
    await user.type(
      screen.getByPlaceholderText('What can I help you with today?'),
      'Help me rewrite this policy to improve deflection{Enter}',
    )
    expect(screen.getByText('Current drop off rate:')).toBeInTheDocument()

    // Review plan opens the full-screen takeover.
    await user.click(screen.getByRole('button', { name: 'Review plan' }))
    expect(screen.getByTestId('ai-studio-full-view')).toBeInTheDocument()
    expect(screen.getByText('Update Policy Description')).toBeInTheDocument()

    // Close returns to the editor without the takeover.
    await user.click(screen.getByRole('button', { name: 'Close review plan' }))
    expect(screen.queryByTestId('ai-studio-full-view')).not.toBeInTheDocument()
  })

  it('returns to Steps when the shared AI Studio panel closes', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')

    await user.click(screen.getByRole('button', { name: 'AI' }))
    const panel = screen.getByTestId('ai-studio-panel')
    await user.click(screen.getByRole('button', { name: 'Close AI Studio' }))

    await waitForElementToBeRemoved(panel)
    expect(screen.getByText('Steps')).toBeInTheDocument()
  })

  it('typing "Approve" closes the full view and shows the inline diff preview', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')
    await user.click(screen.getByRole('button', { name: 'AI' }))
    await user.type(
      screen.getByPlaceholderText('What can I help you with today?'),
      'Help me rewrite this policy to improve deflection{Enter}',
    )
    await user.click(screen.getByRole('button', { name: 'Review plan' }))

    // Type Approve into the full-view composer → Working indicator, still in the takeover.
    const fullView = screen.getByTestId('ai-studio-full-view')
    await user.type(
      within(fullView).getByPlaceholderText('What can I help you with today?'),
      'Approve{Enter}',
    )
    expect(screen.getByText('Working...')).toBeInTheDocument()
    expect(screen.getByTestId('ai-studio-full-view')).toBeInTheDocument()

    // After the working delay, the takeover closes and the diff preview shows.
    expect(
      await screen.findByTestId('inline-policy-preview', {}, { timeout: 4000 }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('ai-studio-full-view')).not.toBeInTheDocument()
    expect(screen.getByText('Inline policy preview')).toBeInTheDocument()
  })

  it('opens the preview from the header, scoped to the use case being edited', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')
    await user.click(screen.getByRole('button', { name: 'Preview' }))

    const overlay = screen.getByTestId('use-case-preview')
    expect(
      within(within(overlay).getByRole('banner')).getByText('Service cancellation'),
    ).toBeInTheDocument()
    expect(
      within(overlay).getByText(/Currently previewing the “Service cancellation” use case/),
    ).toBeInTheDocument()
  })

  it('traces the edited use case’s own policy, flattened', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    await user.type(
      screen.getByLabelText('Ask a question'),
      'I want to cancel my subscription{enter}',
    )

    const trace = screen.getByTestId('preview-trace-card-0')
    expect(
      within(trace).getByText(/Reveal Form: Cancellation Diagnostic Survey to identify the root/),
    ).toBeInTheDocument()
    expect(within(trace).getByText('[Confidence score: High]')).toBeInTheDocument()
  })

  it('returns to the canvas when the preview closes', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    await user.click(
      within(screen.getByTestId('use-case-preview')).getByRole('button', { name: 'Close' }),
    )

    expect(screen.queryByTestId('use-case-preview')).not.toBeInTheDocument()
    expect(screen.getByText('Retention Routing')).toBeInTheDocument()
  })

  it('follows a renamed use case into the preview', async () => {
    const user = userEvent.setup()
    renderAt('/ai-agents/w3')
    const title = screen.getByLabelText('Agent title')
    await user.clear(title)
    await user.type(title, 'Winback offer')
    await user.tab()

    await user.click(screen.getByRole('button', { name: 'Preview' }))
    expect(
      within(within(screen.getByTestId('use-case-preview')).getByRole('banner')).getByText(
        'Winback offer',
      ),
    ).toBeInTheDocument()
  })
})
