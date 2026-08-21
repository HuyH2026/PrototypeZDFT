import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoiceKnowledgePanel } from './VoiceKnowledgePanel'
import {
  KNOWLEDGE_CONNECTIONS,
  VOICE_RAIL_SECTIONS,
  VOICE_RAIL_TRAILING_START,
} from './config-data'

function setup(overrides = {}) {
  const props = {
    connections: KNOWLEDGE_CONNECTIONS,
    sections: VOICE_RAIL_SECTIONS,
    trailingStart: VOICE_RAIL_TRAILING_START,
    activeSection: 'knowledge',
    onSectionChange: vi.fn(),
    onToggleConnection: vi.fn(),
    ...overrides,
  }
  render(<VoiceKnowledgePanel {...props} />)
  return props
}

describe('VoiceKnowledgePanel', () => {
  it('renders the connect and retrieval groups plus the current connections', () => {
    setup()
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument()
    expect(screen.getByText('Connect with knowledge base')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Connect new integration/ })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Build Knowledge Retrieval in agent' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Current connections')).toBeInTheDocument()
    expect(screen.getByText('Salesforce')).toBeInTheDocument()
  })

  it('reports connection toggles by id', async () => {
    const props = setup()
    const first = KNOWLEDGE_CONNECTIONS[0]
    await userEvent.click(screen.getByRole('switch', { name: `${first.title} enabled` }))
    expect(props.onToggleConnection).toHaveBeenCalledWith(first.id)
  })
})
