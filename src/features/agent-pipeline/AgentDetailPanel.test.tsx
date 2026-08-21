import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { seedAgents } from '@/features/ai-agents/agent-store'
import { AgentDetailPanel } from './AgentDetailPanel'
import { FINDINGS } from './cockpit-data'

describe('AgentDetailPanel outcome language', () => {
  it('keeps an applied finding projected until outcome measurement is available', () => {
    const finding = FINDINGS.find((candidate) => candidate.id === 'fallback-near-match-routing')!
    const agent = seedAgents().find((candidate) => candidate.id === 'w2')!

    render(
      <AgentDetailPanel
        agent={agent}
        mode="full"
        actionMode="full"
        findings={[finding]}
        findingStates={{ [finding.id]: 'applied' }}
        selectedFindingId={finding.id}
        agentNameById={(agentId) => agentId}
        onSelectFinding={vi.fn()}
        onRequestMode={vi.fn()}
        onAdvanceFinding={vi.fn()}
        actionsPaused={false}
        onClose={vi.fn()}
      />,
    )

    const detail = within(screen.getByTestId('finding-detail-fallback-near-match-routing'))
    expect(detail.getByText('Projected resolution')).toBeInTheDocument()
    expect(
      detail.getByText('CSAT guardrail · 4.20 projected · above 4.17 floor'),
    ).toBeInTheDocument()
    expect(detail.queryByText(/observed/i)).not.toBeInTheDocument()
    expect(detail.queryByText(/measured/i)).not.toBeInTheDocument()
    expect(
      within(detail.getByTestId('change-receipt')).getByText(
        'Application complete · outcome measurement pending · CSAT monitoring active',
      ),
    ).toBeInTheDocument()
  })
})
