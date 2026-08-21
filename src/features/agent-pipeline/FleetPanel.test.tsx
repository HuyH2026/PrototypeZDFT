import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { seedAgents } from '@/features/ai-agents/agent-store'
import { ALL_CHANGES } from './pipeline-data'
import { FleetPanel } from './FleetPanel'

const AGENTS = seedAgents()

describe('FleetPanel', () => {
  it('lists every agent the loop manages', () => {
    render(<FleetPanel agents={AGENTS} changes={ALL_CHANGES} />)
    const view = within(screen.getByTestId('fleet-panel'))
    expect(view.getAllByTestId(/^fleet-row-/)).toHaveLength(AGENTS.length)
    expect(view.getByText(`${AGENTS.length} agents under management`)).toBeInTheDocument()
  })

  it('names the last change the loop made to an agent', () => {
    render(<FleetPanel agents={AGENTS} changes={ALL_CHANGES} />)
    const change = ALL_CHANGES[0]
    const row = within(screen.getByTestId(`fleet-row-${change.agentId}`))
    expect(row.getByText(change.title)).toBeInTheDocument()
  })

  it('says so for an agent the loop has never touched', () => {
    const untouched = AGENTS.find(
      (agent) => !ALL_CHANGES.some((change) => change.agentId === agent.id),
    )
    expect(untouched).toBeDefined()
    render(<FleetPanel agents={AGENTS} changes={ALL_CHANGES} />)
    const row = within(screen.getByTestId(`fleet-row-${untouched!.id}`))
    expect(row.getByText('No changes yet')).toBeInTheDocument()
  })

  it('excludes an agent that is switched off from autonomy', () => {
    const agents = [{ ...AGENTS[0], on: false }, ...AGENTS.slice(1)]
    render(<FleetPanel agents={agents} changes={ALL_CHANGES} />)
    expect(within(screen.getByTestId(`fleet-row-${agents[0].id}`)).getByText('Excluded')).toBeInTheDocument()
    expect(within(screen.getByTestId(`fleet-row-${agents[1].id}`)).getByText('Managed')).toBeInTheDocument()
  })

  it('names each agent’s channel', () => {
    render(<FleetPanel agents={AGENTS} changes={ALL_CHANGES} />)
    const widget = AGENTS.find((agent) => agent.channel === 'widget')!
    expect(within(screen.getByTestId(`fleet-row-${widget.id}`)).getByText('Widget')).toBeInTheDocument()
  })
})
