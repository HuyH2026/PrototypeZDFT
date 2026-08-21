import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { BrandProvider } from '@/app/brand-context'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { resetRoster, useAgentRoster } from './agent-roster-store'
import type { RosterAgent } from './roster-data'
import { EditAgentFlow } from './EditAgentFlow'

const AGENT: RosterAgent = {
  id: 'eats-eater-order',
  brandId: 'uber-eats',
  name: 'Uber Eater Order',
  // Not 'Email': CHANNEL_SECTIONS has a section *titled* Email whose only
  // channel also displays as 'Email', so the name would match two buttons.
  channels: ['WhatsApp', 'Slack'],
  health: 'good',
  ar: 86,
  conversations: 6912,
  insightCount: 3,
}

function RosterProbe() {
  const { agents } = useAgentRoster()
  return (
    <div data-testid="roster">
      {agents.map((a) => `${a.id}:${a.name}:${a.channels.join('+')}:${a.ar}`).join('|')}
    </div>
  )
}

function renderFlow(agentId = AGENT.id) {
  return render(
    <MemoryRouter initialEntries={[`/agent-setup/${agentId}`]}>
      <BrandProvider>
        <AiAssistantProvider>
          <Routes>
            <Route path="/agent-setup/:agentId" element={<EditAgentFlow />} />
            <Route path="/agent-setup" element={<div>roster screen</div>} />
          </Routes>
          <RosterProbe />
        </AiAssistantProvider>
      </BrandProvider>
    </MemoryRouter>,
  )
}

describe('EditAgentFlow', () => {
  beforeEach(() => {
    window.localStorage?.clear()
    resetRoster([AGENT])
  })

  it('opens pre-filled with the agent name and its channels selected', () => {
    renderFlow()
    expect(screen.getByLabelText('Agent name')).toHaveValue('Uber Eater Order')
    expect(screen.getByRole('button', { name: /^whatsapp$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /^widget$/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  // Brand is not editable here (it is chosen once, in the create wizard), so it
  // appears as context rather than as a step.
  it('names the brand the agent belongs to without offering to change it', () => {
    renderFlow()
    // Ignoring the decorative mark chip, which repeats the name for the eye
    // only — this asserts the brand is *announced*, not merely drawn.
    expect(screen.getByText('Uber Eats', { ignore: '[aria-hidden="true"]' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Select existing' })).not.toBeInTheDocument()
  })

  it('heads the takeover with the section and the agent being edited', () => {
    renderFlow()
    expect(screen.getByText('Agent Directory')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Uber Eater Order')
  })

  it('keeps Save disabled until something changes', async () => {
    const user = userEvent.setup()
    renderFlow()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /^widget$/i }))
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('refuses to save an empty name', async () => {
    const user = userEvent.setup()
    renderFlow()
    await user.clear(screen.getByLabelText('Agent name'))
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('refuses to save with every channel turned off', async () => {
    const user = userEvent.setup()
    renderFlow()
    await user.click(screen.getByRole('button', { name: /^whatsapp$/i }))
    await user.click(screen.getByRole('button', { name: /^slack$/i }))
    // Both of the agent's channels are now off.
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('writes the rename and the channel change back to the roster, then returns', async () => {
    const user = userEvent.setup()
    renderFlow()
    const name = screen.getByLabelText('Agent name')
    await user.clear(name)
    await user.type(name, 'Eats Order Support')
    await user.click(screen.getByRole('button', { name: /^widget$/i }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('roster screen')).toBeInTheDocument()
    // Metrics survive the edit; the id does not change.
    expect(screen.getByTestId('roster')).toHaveTextContent(
      'eats-eater-order:Eats Order Support:WhatsApp+Slack+Web Widget:86',
    )
  })

  it('discards the edit on Close', async () => {
    const user = userEvent.setup()
    renderFlow()
    await user.clear(screen.getByLabelText('Agent name'))
    await user.type(screen.getByLabelText('Agent name'), 'Thrown Away')
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.getByText('roster screen')).toBeInTheDocument()
    expect(screen.getByTestId('roster')).toHaveTextContent('Uber Eater Order')
  })

  // A bookmark to an agent someone has since deleted must not render an empty
  // form that would save a phantom.
  it('returns to the roster when the agent no longer exists', () => {
    renderFlow('deleted-agent-9')
    expect(screen.getByText('roster screen')).toBeInTheDocument()
    expect(screen.queryByLabelText('Agent name')).not.toBeInTheDocument()
  })

  it('offers no AI trigger', () => {
    renderFlow()
    expect(screen.queryByRole('button', { name: 'AI assistant' })).not.toBeInTheDocument()
  })
})
