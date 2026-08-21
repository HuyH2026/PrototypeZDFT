import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider, useAiAssistant } from '@/app/ai-assistant-context'
import { AiAssistantHost } from '@/features/ai-studio/AiAssistantHost'
import { KnowledgeView } from './KnowledgeView'
import { KNOWLEDGE_CONTENT } from './knowledge-data'
import { clearKnowledgeSectionRequest } from './knowledge-section-request-store'

const COACHING = KNOWLEDGE_CONTENT['Knowledge coaching']
const SNIPPETS = KNOWLEDGE_CONTENT['Content snippets']

function AssistantStateProbe() {
  const { isOpen, context } = useAiAssistant()
  return (
    <output data-testid="assistant-state" data-open={isOpen} data-scope={context.scope}>
      {context.prompt}
    </output>
  )
}

function renderView() {
  render(
    <MemoryRouter initialEntries={['/agent-builder/knowledge']}>
      <AiAssistantProvider>
        <KnowledgeView />
        <AssistantStateProbe />
        <AiAssistantHost />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
  return within(screen.getByTestId('view-knowledge'))
}

afterEach(() => clearKnowledgeSectionRequest())

function entryIds(view: ReturnType<typeof renderView>) {
  return view
    .getAllByTestId(/^knowledge-entry-/)
    .map((el) => el.getAttribute('data-testid')?.replace('knowledge-entry-', ''))
}

describe('KnowledgeView', () => {
  it('titles the screen and opens on Knowledge coaching', () => {
    const view = renderView()
    expect(view.getByRole('heading', { level: 1, name: 'Knowledge' })).toBeInTheDocument()
    expect(view.getByRole('tab', { name: 'Knowledge coaching' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(view.getByRole('tab', { name: 'Content snippets' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    expect(view.getByText(COACHING.description)).toBeInTheDocument()
  })

  it('labels the columns for the tab on show', () => {
    const view = renderView()
    expect(view.getByText(`Name (${COACHING.entries.length})`)).toBeInTheDocument()
    expect(view.getByText('Applied to')).toBeInTheDocument()
    expect(view.getByText('Knowledge Coaching')).toBeInTheDocument()
    expect(view.getByText('Activate')).toBeInTheDocument()
  })

  it('renders the coaching rules in the shared table shell', () => {
    const view = renderView()

    const table = view.getByRole('region', { name: 'Knowledge coaching rules' })
    expect(table).toHaveClass('bg-table-header-bg')
    expect(within(table).getByText(`Name (${COACHING.entries.length})`)).toBeInTheDocument()

    const body = within(table).getByTestId('card-list-table-body')
    expect(body).toHaveClass('bg-white')
    expect(within(body).getAllByTestId(/^knowledge-entry-/)).toHaveLength(COACHING.entries.length)
  })

  it('lists every coaching rule in the design’s order', () => {
    const view = renderView()
    expect(entryIds(view)).toEqual(COACHING.entries.map((e) => e.id))
  })

  it('uses the streamlined frame without a metric strip', () => {
    const view = renderView()
    expect(view.queryByTestId('knowledge-metrics')).toBeNull()
  })

  it('swaps the whole body when Content snippets is chosen', async () => {
    const view = renderView()
    await userEvent.click(view.getByRole('tab', { name: 'Content snippets' }))

    expect(view.getByText(SNIPPETS.description)).toBeInTheDocument()
    expect(view.getByTestId('knowledge-metrics')).toBeInTheDocument()
    expect(view.getByText('Active content snippets')).toBeInTheDocument()
    expect(view.getByText('8,000')).toBeInTheDocument()
    expect(view.getByText('2,500')).toBeInTheDocument()
    expect(view.getByText('2,000')).toBeInTheDocument()
    expect(view.getByText('85%')).toBeInTheDocument()
    expect(view.getByText('Content snippet')).toBeInTheDocument()
    expect(entryIds(view)).toEqual(SNIPPETS.entries.map((e) => e.id))
    expect(view.queryByText('Knowledge Coaching')).toBeNull()
  })

  it('uses the Filter by dropdown shown in both updated frames', async () => {
    const view = renderView()
    expect(view.getByRole('button', { name: 'Filter by' })).toBeInTheDocument()

    await userEvent.click(view.getByRole('tab', { name: 'Content snippets' }))
    expect(view.getByRole('button', { name: 'Filter by' })).toBeInTheDocument()
    expect(view.queryByRole('button', { name: 'Filters' })).toBeNull()
  })

  it('renders the updated Content snippets copy and scopes in design order', async () => {
    const view = renderView()
    await userEvent.click(view.getByRole('tab', { name: 'Content snippets' }))

    expect(entryIds(view)).toEqual([
      'how-ride-pricing-works',
      'vip-account-inactive',
      'billing-for-premium-plan',
    ])

    const pricing = within(view.getByTestId('knowledge-entry-how-ride-pricing-works'))
    expect(pricing.getByRole('heading', { name: 'How ride pricing works' })).toBeInTheDocument()
    expect(pricing.getByText('Last updated on Feb 23, 2026')).toBeInTheDocument()
    expect(pricing.getByText('Ride billing')).toBeInTheDocument()
    expect(pricing.getByText(/How Ride Pricing Works/)).toBeInTheDocument()

    const inactive = within(view.getByTestId('knowledge-entry-vip-account-inactive'))
    expect(inactive.getByText('Account management')).toBeInTheDocument()

    const billing = within(view.getByTestId('knowledge-entry-billing-for-premium-plan'))
    expect(billing.getByText('Business riders')).toBeInTheDocument()
    expect(billing.getByText('Headless')).toBeInTheDocument()
    expect(billing.queryByText('Riders')).toBeNull()
    expect(billing.getByText(/Billing for Premium Plan/)).toBeInTheDocument()
  })

  it('drills into the How ride pricing works content snippet details', async () => {
    const view = renderView()
    await userEvent.click(view.getByRole('tab', { name: 'Content snippets' }))
    await userEvent.click(view.getByRole('button', { name: 'How ride pricing works' }))

    const editor = within(screen.getByTestId('content-snippet-editor'))
    expect(editor.getByRole('heading', { level: 1 })).toHaveTextContent('How Ride Pricing Works')
    expect(editor.getByRole('toolbar', { name: 'Content formatting' })).toBeInTheDocument()
    expect(editor.getByRole('heading', { name: 'How are prices calculated?' })).toBeInTheDocument()
    expect(editor.getByText('Route-based adjustments')).toBeInTheDocument()
    expect(editor.getByText(/2 suggestions/)).toBeInTheDocument()
    expect(editor.getByText('Troubleshooting login issues')).toBeInTheDocument()
    expect(editor.getByRole('textbox', { name: 'Content snippet name' })).toHaveValue(
      'How to recover my points',
    )
    expect(editor.getByLabelText('Selected channels')).toHaveTextContent('WidgetHeadlessVoice')
    expect(editor.getByLabelText('Selected segments')).toHaveTextContent('Riders')

    await userEvent.click(editor.getByRole('button', { name: 'Close settings panel' }))
    expect(editor.queryByText('Insights')).toBeNull()
    const suggestions = within(editor.getByRole('complementary', { name: 'Content suggestions' }))
    expect(suggestions.getByText('Contradiction')).toBeInTheDocument()
    expect(suggestions.getByText('Rewrite')).toBeInTheDocument()
    expect(suggestions.getByRole('button', { name: 'Reconcile' })).toBeInTheDocument()
    expect(suggestions.getByRole('button', { name: 'Apply rewrite' })).toBeInTheDocument()

    await userEvent.click(suggestions.getByRole('button', { name: 'Apply rewrite' }))
    expect(editor.queryByRole('complementary', { name: 'Content suggestions' })).toBeNull()
    expect(editor.getByRole('textbox', { name: 'Content snippet body' })).toHaveTextContent(
      'If your final price differs, it’s usually due to a route or time change during the trip.',
    )
    expect(editor.getByRole('button', { name: 'Discard applied rewrite' })).toBeInTheDocument()
    await userEvent.click(editor.getByRole('button', { name: 'Confirm applied rewrite' }))
    expect(editor.queryByRole('button', { name: 'Confirm applied rewrite' })).toBeNull()
    const remainingSuggestions = within(
      editor.getByRole('complementary', { name: 'Content suggestions' }),
    )
    expect(remainingSuggestions.getByText('Contradiction')).toBeInTheDocument()
    expect(remainingSuggestions.queryByText('Rewrite')).toBeNull()

    await userEvent.click(remainingSuggestions.getByRole('button', { name: 'Dismiss' }))
    expect(editor.queryByRole('complementary', { name: 'Content suggestions' })).toBeNull()
    expect(editor.queryByText('All suggestions reviewed')).toBeNull()
    expect(editor.getByRole('button', { name: 'Open AI Studio for this content' })).toBeEnabled()

    await userEvent.click(editor.getByRole('button', { name: 'Open settings panel' }))
    expect(editor.getByText('Insights')).toBeInTheDocument()

    await userEvent.click(editor.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByTestId('view-knowledge')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Content snippets' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('previews the content snippet in a simulated live conversation', async () => {
    const view = renderView()
    await userEvent.click(view.getByRole('tab', { name: 'Content snippets' }))
    await userEvent.click(view.getByRole('button', { name: 'How ride pricing works' }))

    const editor = within(screen.getByTestId('content-snippet-editor'))
    await userEvent.click(editor.getByRole('button', { name: 'Preview' }))

    const preview = within(screen.getByTestId('content-snippet-preview'))
    expect(
      preview.getByRole('region', { name: 'Content snippet conversation preview' }),
    ).toHaveTextContent('Help me recover my points')
    expect(preview.getByRole('complementary', { name: 'Preview settings' })).toHaveTextContent(
      'Recover points (Live)',
    )
    expect(preview.getByText('Content snippet - How to recover my points')).toBeInTheDocument()

    await userEvent.click(preview.getByRole('button', { name: 'Close' }))
    expect(screen.getByTestId('content-snippet-editor')).toBeInTheDocument()
    expect(screen.queryByTestId('content-snippet-preview')).toBeNull()
  })

  it('offers contextual AI Studio actions for selected article text', async () => {
    const view = renderView()
    await userEvent.click(view.getByRole('tab', { name: 'Content snippets' }))
    await userEvent.click(view.getByRole('button', { name: 'How ride pricing works' }))

    const editor = within(screen.getByTestId('content-snippet-editor'))
    const selectedHeading = editor.getByRole('heading', {
      name: 'Will I pay tolls or surcharges?',
    })
    const selectedText = selectedHeading.textContent as string
    const range = {
      commonAncestorContainer: selectedHeading.firstChild as Node,
      getBoundingClientRect: () => new DOMRect(420, 300, 240, 20),
    } as Range
    const removeAllRanges = vi.fn()
    const selectionSpy = vi.spyOn(window, 'getSelection').mockReturnValue({
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: () => range,
      toString: () => selectedText,
      removeAllRanges,
    } as unknown as Selection)

    fireEvent(document, new Event('selectionchange'))
    const actions = await editor.findByRole('toolbar', {
      name: 'AI Studio suggestions for selected text',
    })
    expect(
      within(actions).getByRole('button', { name: 'Ask AI Studio about selected text' }),
    ).toBeInTheDocument()
    expect(within(actions).getByRole('button', { name: 'Tighten scope' })).toBeInTheDocument()
    expect(
      within(actions).getByRole('button', { name: 'Flag agent behavior drift' }),
    ).toBeInTheDocument()
    expect(
      within(actions).getByRole('button', { name: 'Emerging topic detected' }),
    ).toBeInTheDocument()

    await userEvent.click(within(actions).getByRole('button', { name: 'Emerging topic detected' }))
    // The AI Studio panel replaces the editor's own aside in place — it must not
    // also open the app-wide assistant overlay on top of this takeover.
    expect(editor.getByTestId('ai-studio-panel')).toBeInTheDocument()
    expect(screen.getByTestId('assistant-state')).toHaveAttribute('data-open', 'false')
    expect(removeAllRanges).toHaveBeenCalled()
    expect(
      editor.queryByRole('toolbar', { name: 'AI Studio suggestions for selected text' }),
    ).toBeNull()
    selectionSpy.mockRestore()
  })

  it('opens AI Studio from the editor rail instead of only closing settings', async () => {
    const view = renderView()
    await userEvent.click(view.getByRole('tab', { name: 'Content snippets' }))
    await userEvent.click(view.getByRole('button', { name: 'How ride pricing works' }))

    const editor = within(screen.getByTestId('content-snippet-editor'))
    await userEvent.click(editor.getByRole('button', { name: 'Open AI Studio for this content' }))

    expect(editor.queryByText('Insights')).toBeNull()
    expect(editor.getByTestId('ai-studio-panel')).toBeInTheDocument()
    expect(screen.getByTestId('assistant-state')).toHaveAttribute('data-open', 'false')

    await userEvent.click(
      await screen.findByRole('button', { name: 'Add section to content snippet' }),
    )
    expect(
      editor.getByRole('heading', { name: 'Will I pay tolls if I cancel my ride?' }),
    ).toBeInTheDocument()
    expect(editor.getByRole('button', { name: 'Discard added section' })).toBeInTheDocument()
    expect(editor.getByRole('button', { name: 'Confirm added section' })).toBeInTheDocument()
    expect(
      screen.getByText(/Done — added the cancellation section based on the 41 tickets\/wk trend/),
    ).toBeInTheDocument()

    await userEvent.click(editor.getByRole('button', { name: 'Confirm added section' }))
    expect(
      editor.getByRole('heading', { name: 'Will I pay tolls if I cancel my ride?' }),
    ).toBeInTheDocument()
    expect(editor.queryByRole('button', { name: 'Confirm added section' })).toBeNull()
  })

  it('filters the list by name and re-counts the header', async () => {
    const view = renderView()
    await userEvent.type(view.getByRole('searchbox', { name: 'Search keyword' }), 'account plan')

    expect(entryIds(view)).toEqual(['account-plan'])
    expect(view.getByText('Name (1)')).toBeInTheDocument()
  })

  it('says so when nothing matches, naming what it searched', async () => {
    const view = renderView()
    await userEvent.type(view.getByRole('searchbox', { name: 'Search keyword' }), 'nothing here')

    expect(view.queryAllByTestId(/^knowledge-entry-/)).toHaveLength(0)
    expect(view.getByText(/No coaching rules match/)).toBeInTheDocument()
  })

  // A query left over from the other tab would show a filtered list with no
  // visible reason for it.
  it('clears the search when the tab changes', async () => {
    const view = renderView()
    const search = view.getByRole('searchbox', { name: 'Search keyword' })
    await userEvent.type(search, 'account plan')
    await userEvent.click(view.getByRole('tab', { name: 'Content snippets' }))

    expect(search).toHaveValue('')
    expect(entryIds(view)).toEqual(SNIPPETS.entries.map((e) => e.id))
  })

  it('activates and deactivates an entry', async () => {
    const view = renderView()
    const card = within(view.getByTestId('knowledge-entry-clarification'))
    const toggle = card.getByRole('switch', { name: 'Activate Clarification' })
    expect(toggle).toHaveAttribute('aria-checked', 'true')

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(card.getByText('Off')).toBeInTheDocument()
  })

  // The toggles are screen-level state, not per-tab, so the trip back must not
  // reset what the user changed.
  it('keeps a toggled entry’s state across a tab round trip', async () => {
    const view = renderView()
    await userEvent.click(
      within(view.getByTestId('knowledge-entry-clarification')).getByRole('switch'),
    )
    await userEvent.click(view.getByRole('tab', { name: 'Content snippets' }))
    await userEvent.click(view.getByRole('tab', { name: 'Knowledge coaching' }))

    expect(
      within(view.getByTestId('knowledge-entry-clarification')).getByRole('switch'),
    ).toHaveAttribute('aria-checked', 'false')
  })

  it.each(COACHING.entries.filter((entry) => entry.id !== 'business-trip-expense-eligibility'))(
    'opens distinct mock coaching content for $name',
    async (entry) => {
      const view = renderView()
      await userEvent.click(view.getByRole('button', { name: entry.name }))

      const editor = within(screen.getByTestId('knowledge-coaching-editor'))
      expect(editor.getByRole('heading', { level: 1 })).toHaveTextContent(entry.name)
      expect(editor.getByRole('textbox', { name: 'Coaching instructions' })).toHaveValue(entry.body)
      expect(editor.getByText(entry.editor!.insights.timesApplied)).toBeInTheDocument()
      expect(editor.getByText(entry.editor!.insights.conversations)).toBeInTheDocument()
      expect(editor.getByText(entry.editor!.insights.resolutions)).toBeInTheDocument()
      entry.editor!.appliedUseCases.forEach((useCase) => {
        expect(editor.getByText(useCase)).toBeInTheDocument()
      })
      entry.editor!.channels.forEach((channel) => {
        expect(
          within(editor.getByLabelText('Selected channels')).getByText(channel),
        ).toBeInTheDocument()
      })
    },
  )

  it('drills into the Business trip expense coaching rule and closes back to the list', async () => {
    const view = renderView()

    await userEvent.click(view.getByRole('button', { name: 'Business trip expense eligibility' }))

    const editor = within(screen.getByTestId('knowledge-coaching-editor'))
    expect(editor.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Business trip expense eligibility',
    )
    expect(editor.getByRole('heading', { name: 'Instructions' })).toBeInTheDocument()
    expect(editor.getByRole('heading', { name: 'Insights' })).toBeInTheDocument()
    expect(editor.getByText('2,999')).toBeInTheDocument()
    expect(editor.getByText('1,600')).toBeInTheDocument()
    expect(editor.getByText('1,244 (85%)')).toBeInTheDocument()
    expect(editor.getByLabelText('Selected channels')).toHaveTextContent('WidgetHeadless')
    expect(editor.getByLabelText('Selected segments')).toHaveTextContent('RidersBusiness riders')

    await userEvent.click(editor.getByRole('button', { name: 'Close' }))
    expect(screen.getByTestId('view-knowledge')).toBeInTheDocument()
    expect(screen.queryByTestId('knowledge-coaching-editor')).toBeNull()
  })

  it('previews the coaching rule in a simulated live conversation', async () => {
    const view = renderView()
    await userEvent.click(view.getByRole('button', { name: 'Business trip expense eligibility' }))

    const editor = within(screen.getByTestId('knowledge-coaching-editor'))
    await userEvent.click(editor.getByRole('button', { name: 'Preview' }))

    const preview = within(screen.getByTestId('knowledge-coaching-preview'))
    expect(
      preview.getByRole('region', { name: 'Knowledge coaching conversation preview' }),
    ).toHaveTextContent('Is my ride to the airport covered by my company account?')
    expect(preview.getByRole('complementary', { name: 'Preview settings' })).toHaveTextContent(
      'Business trip expense eligibility (Live)',
    )
    expect(
      preview.getByText('Knowledge coaching - Business trip expense eligibility'),
    ).toBeInTheDocument()

    await userEvent.click(preview.getByRole('button', { name: 'Close' }))
    expect(screen.queryByTestId('knowledge-coaching-preview')).toBeNull()

    // The debug panel quotes the instruction as it currently reads, so a preview
    // taken after an edit shows the edit rather than the saved rule.
    const reopened = within(screen.getByTestId('knowledge-coaching-editor'))
    const instructions = reopened.getByRole('textbox', { name: 'Coaching instructions' })
    await userEvent.clear(instructions)
    await userEvent.type(instructions, 'Check the remaining program balance first.')
    await userEvent.click(reopened.getByRole('button', { name: 'Preview' }))

    expect(
      within(screen.getByTestId('knowledge-coaching-preview')).getByText(
        'Check the remaining program balance first.',
      ),
    ).toBeInTheDocument()
  })

  it('keeps saved coaching edits for the current session', async () => {
    const view = renderView()
    await userEvent.click(view.getByRole('button', { name: 'Business trip expense eligibility' }))

    const editor = within(screen.getByTestId('knowledge-coaching-editor'))
    await userEvent.clear(editor.getByRole('textbox', { name: 'Coaching name' }))
    await userEvent.type(editor.getByRole('textbox', { name: 'Coaching name' }), 'Business travel')
    await userEvent.click(editor.getByRole('button', { name: 'Save' }))

    expect(editor.getByRole('heading', { level: 1 })).toHaveTextContent('Business travel')
    await userEvent.click(editor.getByRole('button', { name: 'Close' }))
    expect(screen.getByRole('button', { name: 'Business travel' })).toBeInTheDocument()
  })

  it('offers the toolbar actions and the AI trigger', () => {
    const view = renderView()
    expect(view.getByRole('button', { name: 'Date updated (newest)' })).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Preview' })).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Create new' })).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Ask AI about this page' })).toBeInTheDocument()
  })
})
