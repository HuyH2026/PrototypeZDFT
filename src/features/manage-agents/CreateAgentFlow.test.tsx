import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { BrandProvider } from '@/app/brand-context'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { resetRoster, useAgentRoster } from './agent-roster-store'
import { CreateAgentFlow } from './CreateAgentFlow'

function RosterProbe() {
  const { agents } = useAgentRoster()
  return (
    <div data-testid="roster">{agents.map((a) => `${a.brandId}:${a.name}:${a.ar}`).join('|')}</div>
  )
}

function renderFlow() {
  return render(
    <MemoryRouter initialEntries={['/agent-setup/new']}>
      <BrandProvider>
        <AiAssistantProvider>
          <Routes>
            <Route path="/agent-setup/new" element={<CreateAgentFlow />} />
            <Route path="/agent-setup" element={<div>roster screen</div>} />
          </Routes>
          <RosterProbe />
        </AiAssistantProvider>
      </BrandProvider>
    </MemoryRouter>,
  )
}

// Widget, not Email: CHANNEL_SECTIONS has a section *titled* 'Email' whose only
// channel also displays as 'Email', so `{ name: 'Email' }` matches two buttons.
// 'Widget' (the display name of the 'Web Widget' key) is unambiguous — the same
// choice the create-org test made.
async function fillAgentAndChannel(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Agent name'), 'Rider Refunds')
  await user.click(screen.getByRole('button', { name: /^widget$/i }))
}

describe('CreateAgentFlow', () => {
  beforeEach(() => {
    window.localStorage?.clear()
    resetRoster([])
  })

  it('keeps Save disabled until a brand, a name, and a channel are set', async () => {
    const user = userEvent.setup()
    renderFlow()
    const save = screen.getByRole('button', { name: 'Save' })
    expect(save).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Create new' }))
    await user.type(screen.getByLabelText('Brand name'), 'Uber Rentals')
    expect(save).toBeDisabled()

    await user.type(screen.getByLabelText('Agent name'), 'Rental Support')
    expect(save).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /^widget$/i }))
    expect(save).toBeEnabled()
  })

  // The wizard is a full-app takeover like the Knowledge drill-ins, so it wears
  // the shared glass header: the section it came from on the left, and in the
  // centre the agent being created — which is a placeholder until it is named.
  it('heads the takeover with the section and the agent being named', async () => {
    const user = userEvent.setup()
    renderFlow()
    expect(screen.getByText('Agent Directory')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create new agent')

    await user.click(screen.getByRole('button', { name: 'Create new' }))
    await user.type(screen.getByLabelText('Brand name'), 'Uber Rentals')
    await user.type(screen.getByLabelText('Agent name'), 'Rental Support')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Rental Support')
  })

  // Frame 1844:116764 gives the header Close and Save only. The screen still
  // mounts the assistant host, so this asserts the absent *trigger*, not the
  // absent host.
  it('offers no AI trigger', () => {
    renderFlow()
    expect(screen.queryByRole('button', { name: 'AI assistant' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Build an agent with AI' })).not.toBeInTheDocument()
  })

  it('reveals the later steps as earlier ones complete', async () => {
    const user = userEvent.setup()
    renderFlow()
    expect(screen.queryByLabelText('Agent name')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Create new' }))
    await user.type(screen.getByLabelText('Brand name'), 'Uber Rentals')
    expect(screen.getByLabelText('Agent name')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Agent name'), 'Rental Support')
    expect(screen.getByRole('button', { name: /^widget$/i })).toBeInTheDocument()
  })

  it('creates a brand and an agent with no metrics, then returns to the roster', async () => {
    const user = userEvent.setup()
    renderFlow()
    await user.click(screen.getByRole('button', { name: 'Create new' }))
    await user.type(screen.getByLabelText('Brand name'), 'Uber Rentals')
    await fillAgentAndChannel(user)
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('roster screen')).toBeInTheDocument()
    expect(screen.getByTestId('roster')).toHaveTextContent('uber-rentals-1:Rider Refunds:null')
  })

  it('attaches the agent to an existing brand', async () => {
    const user = userEvent.setup()
    renderFlow()
    await user.click(screen.getByRole('button', { name: 'Select existing' }))
    await user.click(screen.getByRole('button', { name: 'Uber Eats' }))
    await fillAgentAndChannel(user)
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByTestId('roster')).toHaveTextContent('uber-eats:Rider Refunds:null')
  })
})
