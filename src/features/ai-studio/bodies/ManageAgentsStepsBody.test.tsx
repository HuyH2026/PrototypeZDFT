import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { resetRoster } from '@/features/manage-agents/agent-roster-store'
import { SEED_AGENTS } from '@/features/manage-agents/roster-data'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { ManageAgentsStepsBody } from './ManageAgentsStepsBody'
import * as aiContext from '@/app/ai-assistant-context'

describe('ManageAgentsStepsBody', () => {
  beforeEach(() => {
    window.localStorage?.clear()
  })

  it('lists the four setup steps while the roster is empty', () => {
    resetRoster([])
    render(
      <MemoryRouter>
        <AiAssistantProvider>
          <ManageAgentsStepsBody />
        </AiAssistantProvider>
      </MemoryRouter>
    )
    expect(screen.getByText(/Let's set up your first agent/)).toBeInTheDocument()
    expect(screen.getByText('Setup checklist')).toBeInTheDocument()
    expect(screen.getByText('Create Agent')).toBeInTheDocument()
    expect(screen.getByText('Connect Knowledge')).toBeInTheDocument()
    expect(screen.getByText('Channel Configuration')).toBeInTheDocument()
    expect(screen.getByText('Build Agent')).toBeInTheDocument()
  })

  it('marks the first step done once an agent exists', () => {
    resetRoster(SEED_AGENTS)
    render(
      <MemoryRouter>
        <AiAssistantProvider>
          <ManageAgentsStepsBody />
        </AiAssistantProvider>
      </MemoryRouter>
    )
    expect(screen.getByText('Agent created')).toBeInTheDocument()
    expect(
      screen.getByText('Congrats, great start! Your agent is ready to configure. 👍'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Create Agent')).not.toBeInTheDocument()
  })

  it('offers Build with AI on the Build Agent step and opens the flow', async () => {
    const open = vi.fn()
    const close = vi.fn()
    const toggle = vi.fn()
    const expand = vi.fn()
    const collapse = vi.fn()

    vi.spyOn(aiContext, 'useAiAssistant').mockReturnValue({
      isOpen: false,
      mode: 'panel',
      context: { scope: 'manage-agents', greeting: '', prompt: '' },
      contextVersion: 0,
      open,
      close,
      toggle,
      expand,
      collapse,
    })

    resetRoster([])
    render(
      <MemoryRouter>
        <AiAssistantProvider>
          <ManageAgentsStepsBody />
        </AiAssistantProvider>
      </MemoryRouter>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Build with AI' }))
    expect(open).toHaveBeenCalledWith('build-agent', 'full')

    vi.restoreAllMocks()
  })
})
