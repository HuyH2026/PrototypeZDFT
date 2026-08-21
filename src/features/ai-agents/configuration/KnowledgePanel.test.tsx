import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KnowledgePanel } from './KnowledgePanel'
import {
  KNOWLEDGE_CONNECTIONS,
  WIDGET_RAIL_SECTIONS,
  WIDGET_RAIL_TRAILING_START,
} from './config-data'

function setup(overrides = {}) {
  const props = {
    connections: KNOWLEDGE_CONNECTIONS,
    sections: WIDGET_RAIL_SECTIONS,
    trailingStart: WIDGET_RAIL_TRAILING_START,
    activeSection: 'knowledge',
    onSectionChange: vi.fn(),
    onToggleConnection: vi.fn(),
    ...overrides,
  }
  render(<KnowledgePanel {...props} />)
  return props
}

describe('KnowledgePanel', () => {
  it('renders the three groups and their actions', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Knowledge Base' })).toBeInTheDocument()
    expect(screen.getByText(/Define your agent’s voice and behavior/)).toBeInTheDocument()
    expect(screen.getByText('Knowledge Retrieval')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Build ‘Knowledge Retrieval’' })).toBeInTheDocument()
    expect(screen.getAllByText('Knowledge coaching')).toHaveLength(2)
    expect(screen.getByRole('button', { name: /Knowledge coaching/ })).toBeInTheDocument()
    expect(screen.getByText('Connected knowledge')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Connect new/ })).toBeInTheDocument()
  })

  it('lists each connection with its last sync and a switch', () => {
    setup()
    expect(screen.getByText('Salesforce')).toBeInTheDocument()
    expect(screen.getByText('Airtable')).toBeInTheDocument()
    expect(screen.getByText('http://www.mytestknowledgebase.ai')).toBeInTheDocument()
    expect(screen.getByText('Last sync: Apr 4, 2023 at 11:15 am')).toBeInTheDocument()
    expect(screen.getAllByRole('switch')).toHaveLength(3)
    expect(screen.getAllByText('On')).toHaveLength(3)
  })

  it('reports which connection was toggled', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('switch', { name: /Salesforce enabled/ }))
    expect(props.onToggleConnection).toHaveBeenCalledWith('salesforce')
  })

  it('reflects a connection switched off', () => {
    setup({ connections: KNOWLEDGE_CONNECTIONS.map((c) => ({ ...c, on: c.id !== 'airtable' })) })
    expect(screen.getByRole('switch', { name: /Airtable enabled/ })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    expect(screen.getByRole('switch', { name: /Salesforce enabled/ })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })
})
