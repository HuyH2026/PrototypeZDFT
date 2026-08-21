import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AiStudioLanding } from './AiStudioLanding'

function composer() {
  return screen.getByPlaceholderText('What can I help you with today?') as HTMLInputElement
}

describe('AiStudioLanding', () => {
  it('renders the greeting, composer, and all three tabs', () => {
    render(<AiStudioLanding onClose={() => {}} />)
    expect(screen.getByTestId('ai-studio-landing')).toBeInTheDocument()
    expect(screen.getByText(/Good (morning|afternoon|evening), Sunny/)).toBeInTheDocument()
    expect(composer()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Suggested' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Most common' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Flashbacks' })).toBeInTheDocument()
  })

  it('defaults to the Suggested tab', () => {
    render(<AiStudioLanding onClose={() => {}} />)
    expect(screen.getByText('Suggested prompts')).toBeInTheDocument()
    expect(screen.getByText('Plan mode')).toBeInTheDocument()
    expect(screen.queryByText('Catch me up on Solve')).not.toBeInTheDocument()
  })

  it('switches tabs when a tab is clicked', async () => {
    render(<AiStudioLanding onClose={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Most common' }))
    expect(screen.getByText('Catch me up on Solve')).toBeInTheDocument()
    expect(screen.queryByText('Plan mode')).not.toBeInTheDocument()
  })

  it('fills the composer when a suggestion row is clicked', async () => {
    render(<AiStudioLanding onClose={() => {}} />)
    await userEvent.click(screen.getByText('Voice conversations surge'))
    expect(composer().value).toBe('Why did voice conversations surge?')
  })

  it('clears the composer on New conversation', async () => {
    render(<AiStudioLanding onClose={() => {}} initialComposer="seeded" />)
    expect(composer().value).toBe('seeded')
    await userEvent.click(screen.getByRole('button', { name: /New conversation/i }))
    expect(composer().value).toBe('')
  })

  it('pre-fills the composer from initialComposer', () => {
    render(<AiStudioLanding onClose={() => {}} initialComposer="Seeded summary text" />)
    expect(composer().value).toBe('Seeded summary text')
  })

  it('names the object and type carried in from a contextual panel', () => {
    render(
      <AiStudioLanding
        onClose={() => {}}
        contextLabel="Service cancellation"
        contextType="Policy"
      />,
    )

    const context = screen.getByRole('status', { name: 'Current AI Studio context' })
    expect(within(context).getByText('Improving')).toBeInTheDocument()
    expect(within(context).getByText('Service cancellation')).toBeInTheDocument()
    expect(within(context).getByText('Policy')).toBeInTheDocument()
  })

  it('calls onClose from the close button', async () => {
    const onClose = vi.fn()
    render(<AiStudioLanding onClose={onClose} />)
    await userEvent.click(screen.getByLabelText('Close AI Studio'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows the four New rows on the Suggested tab', () => {
    render(<AiStudioLanding onClose={() => {}} />)
    // Scoped to the suggestions list: the sidebar's Start group names the same two
    // flows, so a page-wide match on either title is ambiguous.
    const rows = within(screen.getByTestId('ai-studio-suggestions'))
    expect(rows.getByText('Plan mode')).toBeInTheDocument()
    expect(rows.getByText('Build an agent')).toBeInTheDocument()
    expect(rows.getByText('Build an Autoflow using plain language')).toBeInTheDocument()
    expect(rows.getByText('Self-improving agent')).toBeInTheDocument()
    expect(rows.getByText('Check agent health and plan an improvement cycle')).toBeInTheDocument()
    expect(rows.getByText('Deflection diagnosis')).toBeInTheDocument()
    expect(rows.getAllByText('New')).toHaveLength(4)
    // The unbadged rows are still there, below the new ones.
    expect(rows.getByText('Voice conversations surge')).toBeInTheDocument()
  })

  it('starts the agent-plan flow from Build an agent, and seeds the composer from the others', async () => {
    const user = userEvent.setup()
    const onStartAgentPlan = vi.fn()
    render(<AiStudioLanding onClose={() => {}} onStartAgentPlan={onStartAgentPlan} />)
    const rows = within(screen.getByTestId('ai-studio-suggestions'))
    await user.click(rows.getByText('Build an agent'))
    expect(onStartAgentPlan).toHaveBeenCalledTimes(1)
    expect(composer().value).toBe('')
    await user.click(rows.getByText('Plan mode'))
    expect(composer().value).toBe('Create a plan for my lowest-performing workflow')
  })

  it('starts the self-improving flow from its row rather than seeding the composer', async () => {
    const user = userEvent.setup()
    const onStartSelfImprovingPlan = vi.fn()
    const onStartAgentPlan = vi.fn()
    render(
      <AiStudioLanding
        onClose={() => {}}
        onStartAgentPlan={onStartAgentPlan}
        onStartSelfImprovingPlan={onStartSelfImprovingPlan}
      />,
    )
    await user.click(
      within(screen.getByTestId('ai-studio-suggestions')).getByText('Self-improving agent'),
    )
    expect(onStartSelfImprovingPlan).toHaveBeenCalledTimes(1)
    expect(onStartAgentPlan).not.toHaveBeenCalled()
    expect(composer().value).toBe('')
  })

  // The sidebar row is the same launch as the suggestion row: it must not, for
  // instance, seed the composer with the flow's title instead.
  it('starts the same flows from the sidebar Start group', async () => {
    const user = userEvent.setup()
    const onStartSelfImprovingPlan = vi.fn()
    const onStartAgentPlan = vi.fn()
    render(
      <AiStudioLanding
        onClose={() => {}}
        onStartAgentPlan={onStartAgentPlan}
        onStartSelfImprovingPlan={onStartSelfImprovingPlan}
      />,
    )
    const start = within(screen.getByTestId('ai-studio-sidebar-start'))
    await user.click(start.getByRole('button', { name: 'Self-improving agent' }))
    expect(onStartSelfImprovingPlan).toHaveBeenCalledTimes(1)
    expect(composer().value).toBe('')
    await user.click(start.getByRole('button', { name: 'Build an agent' }))
    expect(onStartAgentPlan).toHaveBeenCalledTimes(1)
  })

  it('submits the composer on Enter and on the send button', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AiStudioLanding onClose={() => {}} onSubmit={onSubmit} />)
    await user.type(composer(), 'Build me an agent for cancellations')
    await user.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('Build me an agent for cancellations')
    await user.click(screen.getByLabelText('Send message'))
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })

  // The frame draws the composer bare, so there is nothing to press until there
  // is something to send.
  it('only offers the send button once the composer has text', async () => {
    const user = userEvent.setup()
    render(<AiStudioLanding onClose={() => {}} />)
    expect(screen.queryByLabelText('Send message')).not.toBeInTheDocument()
    await user.type(composer(), 'hello')
    expect(screen.getByLabelText('Send message')).toBeInTheDocument()
    await user.clear(composer())
    expect(screen.queryByLabelText('Send message')).not.toBeInTheDocument()
  })
})
