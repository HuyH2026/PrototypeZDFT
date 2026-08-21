import { afterEach, describe, expect, it } from 'vitest'
import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider, useAiAssistant } from '@/app/ai-assistant-context'
import { BrandProvider } from '@/app/brand-context'
import { clearDashboardRequest, getDashboardRequest } from '@/features/home/dashboard-request-store'
import { AiTriggerButton } from './AiTriggerButton'
import { AiAssistantHost } from './AiAssistantHost'
import { clearKnowledgeSectionRequest } from '@/features/ai-agents/knowledge/knowledge-section-request-store'

afterEach(() => clearKnowledgeSectionRequest())

function ExpandButton() {
  const { expand } = useAiAssistant()
  return <button onClick={expand}>expand</button>
}

function setup() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <BrandProvider>
        <AiAssistantProvider>
          <AiTriggerButton scope="brand-setup" label="open-setup" />
          <AiTriggerButton scope="manage-agents" label="open-list" />
          <AiTriggerButton scope="knowledge-emerging-topic" label="open-knowledge-topic" />
          <AiTriggerButton scope="service-cancellation-policy" label="open-policy" />
          <AiTriggerButton scope="agent-builder" label="open-agent-builder" />
          <AiTriggerButton label="open-global" />
          <AiTriggerButton scope="self-improving" mode="full" label="open-self-improving" />
          <ExpandButton />
          <AiAssistantHost />
        </AiAssistantProvider>
      </BrandProvider>
    </MemoryRouter>,
  )
}

describe('AiAssistantHost', () => {
  it('renders nothing until opened', () => {
    setup()
    expect(screen.queryByTestId('ai-studio-panel')).not.toBeInTheDocument()
  })

  it('opens the panel primed with the scope prompt', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'open-setup' }))
    expect(screen.getByTestId('ai-studio-panel')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue(
      'Help me choose the right channels for this brand',
    )
  })

  it('renders the setup checklist body for the manage-agents scope', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'open-list' }))
    expect(screen.getByText('Setup checklist')).toBeInTheDocument()
  })

  it('shows the emerging-topic content for the Knowledge snippet context', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'open-knowledge-topic' }))

    expect(
      screen.getByText(
        'Show me details for the detected emerging topic related to “Will I pay tolls or surcharges?”',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Toll charge after canceled ride')).toBeInTheDocument()
    expect(screen.getByText('41 tickets/wk', { exact: false })).toHaveTextContent(
      '41 tickets/wk · +340% vs. last week',
    )
    expect(
      screen.getByRole('button', { name: 'Add section to content snippet' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Review tickets' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Add section to content snippet' }))
    expect(
      screen.getByText(/Done — added the cancellation section based on the 41 tickets\/wk trend/),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add section to content snippet' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('closes from the shell close button', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'open-global' }))
    const panel = screen.getByTestId('ai-studio-panel')
    await userEvent.click(screen.getByLabelText('Close AI Studio'))
    // The panel slides out rather than vanishing, so it stays mounted for the
    // length of its exit animation.
    await waitForElementToBeRemoved(panel)
  })

  it('expands to the full-page landing', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'open-global' }))
    await userEvent.click(screen.getByRole('button', { name: 'Open full AI Studio' }))
    // The panel's exit finishes before the full studio enters (AnimatePresence
    // `mode="wait"` — see AiAssistantHost), so it's a moment before this lands.
    expect(await screen.findByTestId('ai-studio-landing')).toBeInTheDocument()
  })

  it('carries the Service cancellation policy context into the full Studio', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'open-policy' }))
    await userEvent.click(screen.getByRole('button', { name: 'Refine this intent' }))
    await userEvent.click(screen.getByRole('button', { name: 'Open full AI Studio' }))

    const context = await screen.findByRole('status', { name: 'Current AI Studio context' })
    expect(within(context).getByText('Improving')).toBeInTheDocument()
    expect(within(context).getByText('Service cancellation')).toBeInTheDocument()
    expect(within(context).getByText('Policy')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('What can I help you with today?')).toHaveValue(
      'Refine this intent',
    )
  })

  it('opens chat history without expanding the side panel', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'open-global' }))
    await userEvent.click(screen.getByRole('button', { name: 'Chat history' }))

    expect(screen.getByRole('region', { name: 'Chat history' })).toBeInTheDocument()
    expect(screen.getByTestId('ai-studio-panel')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-studio-landing')).not.toBeInTheDocument()
  })

  it('starts the create-agent flow from a plan-shaped prompt typed on the landing', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'open-global' }))
    await userEvent.click(screen.getByRole('button', { name: 'expand' }))
    // The panel's exit finishes before the full studio enters (AnimatePresence
    // `mode="wait"` — see AiAssistantHost); wait for the landing itself rather
    // than its composer, which the exiting panel also has one of.
    await screen.findByTestId('ai-studio-landing')
    const composer = screen.getByPlaceholderText('What can I help you with today?')
    await userEvent.clear(composer)
    await userEvent.type(composer, 'Build me an agent for cancellations')
    await userEvent.keyboard('{Enter}')
    expect(await screen.findByRole('button', { name: 'Review plan' })).toBeInTheDocument()
  })

  it('leaves an off-topic landing prompt on the landing', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'open-global' }))
    await userEvent.click(screen.getByRole('button', { name: 'expand' }))
    await screen.findByTestId('ai-studio-landing')
    const composer = screen.getByPlaceholderText('What can I help you with today?')
    await userEvent.clear(composer)
    await userEvent.type(composer, 'show cost trend')
    await userEvent.keyboard('{Enter}')
    expect(screen.queryByRole('button', { name: 'Review plan' })).not.toBeInTheDocument()
    expect(screen.getByTestId('ai-studio-landing')).toBeInTheDocument()
  })

  it('routes the self-improving scope to its flow', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'open-self-improving' }))
    expect(screen.getByText(/Are any of them struggling\?/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Review plan' }))
    expect(screen.getByTestId('self-improving-canvas')).toBeInTheDocument()
  })

  // The point of the sidebar's Start group: a flow is reachable from inside a
  // transcript, where the landing's suggestion rows are long gone.
  it('starts either flow from the Studio sidebar, mid-conversation', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'open-self-improving' }))
    const start = () => within(screen.getByTestId('ai-studio-sidebar-start'))

    await user.click(start().getByRole('button', { name: 'Build an agent' }))
    expect(screen.getByText(/cancellation requests are being handled/)).toBeInTheDocument()
    expect(screen.queryByText(/Are any of them struggling\?/)).not.toBeInTheDocument()

    await user.click(start().getByRole('button', { name: 'Self-improving agent' }))
    expect(screen.getByText(/Are any of them struggling\?/)).toBeInTheDocument()
    expect(screen.queryByText(/cancellation requests are being handled/)).not.toBeInTheDocument()
  })

  // The more specific matcher wins: this prompt matches both, and it is
  // unambiguously the self-improving flow.
  it('sends a self-improving prompt to the self-improving flow, not the create-agent one', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'open-global' }))
    await user.click(screen.getByRole('button', { name: 'expand' }))
    await screen.findByTestId('ai-studio-landing')
    const composer = screen.getByPlaceholderText('What can I help you with today?')
    await user.type(composer, 'create a self-improving plan for my agent')
    await user.keyboard('{Enter}')
    expect(screen.getByText(/Are any of them struggling\?/)).toBeInTheDocument()
    expect(screen.queryByText(/cancellation requests are being handled/)).not.toBeInTheDocument()
  })
})

function DashboardTrigger() {
  const { open } = useAiAssistant()
  return <button onClick={() => open('build-dashboard')}>open-build-dashboard</button>
}

function renderDashboardBuilder() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AiAssistantProvider>
        <DashboardTrigger />
        <AiAssistantHost />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
}

// The build-dashboard scope is the one live composer: a request — typed, or picked
// from the two questions — publishes for Home to render, and is promoted to apply
// once the panel has finished building it (see dashboard-request-store).
describe('AiAssistantHost — build-dashboard scope', () => {
  afterEach(() => clearDashboardRequest())

  async function openBuilder() {
    renderDashboardBuilder()
    await userEvent.click(screen.getByRole('button', { name: 'open-build-dashboard' }))
    return screen.getByRole('textbox')
  }

  it('opens on the two questions with an empty composer', async () => {
    const composer = await openBuilder()
    expect(composer).toHaveValue('')
    expect(screen.getByText("What's your role?")).toBeInTheDocument()
    expect(screen.getByText('1 of 2')).toBeInTheDocument()
    expect(screen.getByText('0 selected')).toBeInTheDocument()
    // Nothing to send yet, so the step has no continue control.
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
    expect(getDashboardRequest()).toBeNull()
  })

  it('sends the sentence the two questions stand for', async () => {
    await openBuilder()
    await userEvent.click(screen.getByRole('radio', { name: 'Product Manager' }))
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('What do you want to track?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Quality and testing' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Feature gaps and requirements' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Product lifecycle' }))
    await userEvent.click(screen.getByRole('button', { name: 'Build my dashboard' }))

    const request = getDashboardRequest()
    expect(request?.intent).toBe('preview')
    expect(request?.prompt).toBe(
      'Build me a product management dashboard tailored to my role as a Product Manager. ' +
        'The dashboard should provide an end-to-end view of the product lifecycle, with a strong ' +
        'focus on feature gaps, requirements, testing, and product quality.',
    )
    expect(request?.view.name).toBe('Product lifecycle')
    // The request is echoed as the user's own message.
    expect(screen.getByText(request!.prompt)).toBeInTheDocument()
  })

  it('leaves "Something else" to the composer rather than offering it as an answer', async () => {
    await openBuilder()
    expect(screen.getByText('Something else')).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: 'Something else' })).not.toBeInTheDocument()
  })

  it('publishes a preview request from the sent text', async () => {
    const composer = await openBuilder()
    await userEvent.type(composer, 'show me cost and quality{Enter}')

    const request = getDashboardRequest()
    expect(request?.intent).toBe('preview')
    expect(request?.prompt).toBe('show me cost and quality')
    expect(request?.view.name).toBe('Custom Home')
  })

  it('publishes an Executive dashboard as its own saved view', async () => {
    const composer = await openBuilder()
    await userEvent.type(composer, 'build me an executive dashboard{Enter}')

    const request = getDashboardRequest()
    expect(request?.intent).toBe('preview')
    expect(request?.view.name).toBe('Executive dashboard')
    expect(request?.view.kind).toBe('executive')
  })

  it('shows the Executive tracking choices from the AI Studio design', async () => {
    await openBuilder()
    await userEvent.click(screen.getByRole('radio', { name: 'Executive' }))
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByRole('checkbox', { name: 'Resolution trends' })).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Business value and outcomes' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Cost model' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Operational diagnostics' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Target and forecast' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Product lifecycle' })).not.toBeInTheDocument()
  })

  it('turns the selected Executive priorities into the designed business-case request', async () => {
    await openBuilder()
    await userEvent.click(screen.getByRole('radio', { name: 'Executive' }))
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Business value and outcomes' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Cost model' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Target and forecast' }))
    await userEvent.click(screen.getByRole('button', { name: 'Build my dashboard' }))

    const request = getDashboardRequest()
    expect(request?.prompt).toBe(
      'Build me a business case with value, costs, targets, and forecasted impact.',
    )
    expect(request?.view.kind).toBe('executive')
  })

  it('uses the Executive CRM and forecast build response', async () => {
    await openBuilder()
    await userEvent.click(screen.getByRole('radio', { name: 'Executive' }))
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Business value and outcomes' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Cost model' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Target and forecast' }))
    await userEvent.click(screen.getByRole('button', { name: 'Build my dashboard' }))

    expect(await screen.findByText('Fetching CRMs')).toBeInTheDocument()
    expect(await screen.findByText('Forecasting potential impact…')).toBeInTheDocument()
    expect(
      await screen.findByText(
        /Because no CRM is connected, the cost model uses estimated values/,
        undefined,
        { timeout: 4000 },
      ),
    ).toBeInTheDocument()
  })

  it('keeps Product lifecycle when an Executive free-text request names the lifecycle', async () => {
    const composer = await openBuilder()
    await userEvent.type(composer, 'executive view of the product lifecycle{Enter}')

    const request = getDashboardRequest()
    expect(request?.view.name).toBe('Product lifecycle')
    expect(request?.view.kind).toBe('pm')
  })

  it('clears the composer after sending and does not restore the prefill', async () => {
    const composer = await openBuilder()
    await userEvent.type(composer, 'show me cost{Enter}')
    expect(composer).toHaveValue('')
  })

  it('does not send an empty composer', async () => {
    const composer = await openBuilder()
    await userEvent.type(composer, '   {Enter}')
    expect(getDashboardRequest()).toBeNull()
  })

  it('shows what it is doing, then promotes the request to apply', async () => {
    const composer = await openBuilder()
    await userEvent.type(composer, 'ops lead view of feature gaps{Enter}')

    // The trace is what the panel is doing, step by step.
    expect(screen.getByText(/creating/i)).toBeInTheDocument()
    expect(await screen.findByText('Fetching Jira')).toBeInTheDocument()
    expect(await screen.findByText('Done', undefined, { timeout: 4000 })).toBeInTheDocument()

    // Finishing is what keeps the dashboard — there is no separate confirmation.
    expect(await screen.findByText(/all done/i)).toBeInTheDocument()
    expect(getDashboardRequest()?.intent).toBe('apply')
  })

  it('drops an unfinished request when the panel is closed', async () => {
    const composer = await openBuilder()
    await userEvent.type(composer, 'ops lead view{Enter}')
    expect(getDashboardRequest()).not.toBeNull()

    await userEvent.click(screen.getByLabelText('Close AI Studio'))
    expect(getDashboardRequest()).toBeNull()
  })
})

function Trigger() {
  const { open } = useAiAssistant()
  return (
    <button
      onClick={() => open('ai-performance-reopens', 'full', { prompt: 'Seeded summary text' })}
    >
      open-seeded-full
    </button>
  )
}

function renderHost() {
  return render(
    <MemoryRouter initialEntries={['/insights/ai-performances']}>
      <AiAssistantProvider>
        <Trigger />
        <AiAssistantHost />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
}

describe('AiAssistantHost full-view seed', () => {
  it('prefills the landing composer from the seeded context prompt', async () => {
    renderHost()
    await userEvent.click(screen.getByText('open-seeded-full'))
    expect(screen.getByTestId('ai-studio-landing')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('What can I help you with today?')).toHaveValue(
      'Seeded summary text',
    )
  })
})

function ConversationTrigger() {
  const { open } = useAiAssistant()
  return (
    <button
      onClick={() =>
        open('ai-performance-reopens', 'full', {
          prompt: 'Reopens are up',
          conversation: {
            title: 'Tickets reopened',
            messages: [
              {
                id: 'seed-assistant',
                role: 'assistant',
                text: 'Reopened tickets increased 18%.',
                attachments: [
                  {
                    type: 'chart',
                    title: 'Tickets reopened',
                    series: [
                      { x: 'Jul 1', value: 10 },
                      { x: 'Jul 28', value: 47 },
                    ],
                  },
                ],
                recommendations: ['Explain this change'],
              },
            ],
          },
        })
      }
    >
      open-seeded-conversation
    </button>
  )
}

function renderHostWithConversationTrigger() {
  return render(
    <MemoryRouter initialEntries={['/insights/ai-performances']}>
      <AiAssistantProvider>
        <ConversationTrigger />
        <AiAssistantHost />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
}

describe('AiAssistantHost full-view conversation seed', () => {
  it('renders AiStudioConversation instead of the blank landing when a conversation is seeded', async () => {
    renderHostWithConversationTrigger()
    await userEvent.click(screen.getByText('open-seeded-conversation'))
    expect(screen.getByTestId('ai-studio-conversation-body')).toBeInTheDocument()
    expect(screen.getByText('Reopened tickets increased 18%.')).toBeInTheDocument()
  })

  it('still renders the blank landing (no conversation body) for prompt-only seeds', async () => {
    renderHost() // existing helper from this file, uses the prompt-only Trigger
    await userEvent.click(screen.getByText('open-seeded-full'))
    expect(screen.getByTestId('ai-studio-landing')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-studio-conversation-body')).not.toBeInTheDocument()
  })

  it('wires onBranch so clicking a branch icon opens a new conversation seeded from that message', async () => {
    renderHostWithConversationTrigger()
    await userEvent.click(screen.getByText('open-seeded-conversation'))
    await userEvent.click(screen.getByRole('button', { name: 'Branch off in new chat' }))
    const body = screen.getByTestId('ai-studio-conversation-body')
    expect(body).toHaveTextContent('Reopened tickets increased 18%.')
    // still in a conversation view (not knocked back to the blank landing, which
    // has no conversation body and instead shows the tabbed suggestions card)
    expect(screen.queryByRole('button', { name: 'Most common' })).not.toBeInTheDocument()
  })

  // A health ask is answered by the survey wherever it is asked — here, from
  // inside a seeded investigation, where the reply would otherwise be canned.
  it('sends a health ask inside a transcript to the survey', async () => {
    const user = userEvent.setup()
    renderHostWithConversationTrigger()
    await user.click(screen.getByText('open-seeded-conversation'))
    const composer = screen.getByPlaceholderText('What can I help you with today?')
    await user.type(
      composer,
      'I wanted to check in on how our AI agents are doing. Are any of them struggling?',
    )
    await user.keyboard('{Enter}')
    expect(screen.getByText(/Are any of them struggling\?/)).toBeInTheDocument()
    expect(screen.queryByText('Reopened tickets increased 18%.')).not.toBeInTheDocument()
  })
})

describe('AiAssistantHost panel asks and chips', () => {
  // The panel composer used to swallow every send. It still does for anything the
  // survey cannot answer — this is the one ask that now escalates.
  it('escalates a health ask in the panel to the full survey', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'open-setup' }))
    const composer = screen.getByRole('textbox')
    await user.clear(composer)
    await user.type(composer, 'how are our AI agents doing?')
    await user.keyboard('{Enter}')
    // The panel's exit finishes before the full studio enters (AnimatePresence
    // `mode="wait"` — see AiAssistantHost), so it's a moment before this lands.
    expect(await screen.findByTestId('ai-studio-conversation-body')).toBeInTheDocument()
    expect(screen.getByText(/Are any of them struggling\?/)).toBeInTheDocument()
  })

  it('leaves every other panel ask the inert mock it was', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'open-setup' }))
    const composer = screen.getByRole('textbox')
    await user.clear(composer)
    await user.type(composer, 'what does resolution rate measure?')
    await user.keyboard('{Enter}')
    expect(screen.getByTestId('ai-studio-panel')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-studio-conversation-body')).not.toBeInTheDocument()
    // The text stays put: nothing consumed it, so nothing should clear it either.
    expect(composer).toHaveValue('what does resolution rate measure?')
  })

  it('starts the survey from a health chip, and seeds the composer from the others', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'open-agent-builder' }))
    // A chip the survey cannot answer lands in the composer, which is what a
    // suggestion is for — it used to be a span, so it did nothing at all.
    await user.click(screen.getByRole('button', { name: 'Which agents are inactive?' }))
    expect(screen.getByRole('textbox')).toHaveValue('Which agents are inactive?')
    // The health chip is the one that escalates into the full survey.
    await user.click(screen.getByRole('button', { name: 'Are any of my agents struggling?' }))
    expect(await screen.findByText(/Are any of them struggling\?/)).toBeInTheDocument()
  })
})
