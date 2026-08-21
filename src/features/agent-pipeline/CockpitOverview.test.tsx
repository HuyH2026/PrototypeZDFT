import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedAgents } from '@/features/ai-agents/agent-store'
import { CockpitOverview, type CockpitOverviewProps } from './CockpitOverview'
import {
  ATTENTION_AGENT_IDS,
  INITIAL_MANAGEMENT_MODES,
  OUTCOME_METRICS,
  type OutcomeMetric,
} from './cockpit-data'

function props(overrides: Partial<CockpitOverviewProps> = {}): CockpitOverviewProps {
  return {
    agents: seedAgents(),
    metrics: OUTCOME_METRICS,
    modes: INITIAL_MANAGEMENT_MODES,
    findingStates: {},
    selectedAgentId: null,
    selectedFindingId: null,
    guidance: '',
    guidanceSaved: false,
    actionsPaused: false,
    onGuidanceChange: vi.fn(),
    onSaveGuidance: vi.fn(),
    onSaveOutcomes: vi.fn(),
    onSelectAgent: vi.fn(),
    onSelectFinding: vi.fn(),
    onRequestMode: vi.fn(),
    onAdvanceFinding: vi.fn(),
    onCloseAgent: vi.fn(),
    ...overrides,
  }
}

describe('CockpitOverview outcomes', () => {
  it('requests entitlement and cost-avoided changes while keeping displayed outcomes controlled by its parent', async () => {
    const user = userEvent.setup()
    const onSaveOutcomes = vi.fn()
    const metrics: OutcomeMetric[] = OUTCOME_METRICS.map((metric) => {
      if (metric.id === 'entitlement-consumption' && metric.target !== undefined) {
        return { ...metric, target: 55_000 }
      }
      if (metric.id === 'cost-avoided' && metric.target !== undefined) {
        return { ...metric, target: 400_000 }
      }
      return metric
    })
    const { view } = renderOverview({ metrics, onSaveOutcomes })

    expect(
      within(view.getByTestId('outcome-entitlement-consumption')).getByText('55K'),
    ).toBeInTheDocument()
    expect(within(view.getByTestId('outcome-cost-avoided')).getByText('$400K')).toBeInTheDocument()

    await user.click(view.getByRole('button', { name: 'Edit Entitlement consumption' }))
    const dialog = within(screen.getByRole('dialog', { name: 'Edit outcome targets' }))
    expect(dialog.queryByLabelText('AI resolution target (%)')).toBeNull()
    const entitlementInput = dialog.getByLabelText('Entitlement target')
    const costAvoidedInput = dialog.getByLabelText('Cost-avoided target ($)')
    await user.clear(entitlementInput)
    await user.type(entitlementInput, '60000')
    await user.clear(costAvoidedInput)
    await user.type(costAvoidedInput, '500000')
    await user.click(dialog.getByRole('button', { name: 'Save outcomes' }))

    expect(onSaveOutcomes).toHaveBeenCalledWith(60_000, 500_000)
    expect(screen.queryByRole('dialog', { name: 'Edit outcome targets' })).toBeNull()
    expect(
      within(view.getByTestId('outcome-ai-resolution-rate')).getByText('42.1%'),
    ).toBeInTheDocument()
    expect(
      within(view.getByTestId('outcome-entitlement-consumption')).getByText('55K'),
    ).toBeInTheDocument()
    expect(within(view.getByTestId('outcome-cost-avoided')).getByText('$400K')).toBeInTheDocument()
  })
})

function renderOverview(overrides: Partial<CockpitOverviewProps> = {}) {
  const value = props(overrides)
  render(<CockpitOverview {...value} />)
  return { value, view: within(screen.getByTestId('cockpit-overview')) }
}

describe('CockpitOverview attention', () => {
  it('starts with the four authored highest-impact agents', () => {
    const { view } = renderOverview()
    const map = within(view.getByTestId('agent-oversight'))

    expect(map.getAllByTestId('agent-attention-badge')).toHaveLength(4)
    for (const agentId of ATTENTION_AGENT_IDS) {
      expect(
        within(map.getByTestId(`agent-map-node-${agentId}`)).getByTestId('agent-attention-badge'),
      ).toBeInTheDocument()
    }
  })

  it('shows the agent’s top finding directly on its map node', () => {
    const { view } = renderOverview()
    const node = within(view.getByTestId('agent-map-node-w8'))

    expect(node.getByText('Recognize account-lockout language earlier')).toBeInTheDocument()
  })

  it('clicking the node badge opens that agent’s top finding, not a separate list', async () => {
    const user = userEvent.setup()
    const onSelectAgent = vi.fn()
    const { view } = renderOverview({ onSelectAgent })

    await user.click(
      within(view.getByTestId('agent-map-node-w8')).getByTestId('agent-attention-badge'),
    )
    expect(onSelectAgent).toHaveBeenCalledWith('w8')
    expect(view.queryByTestId('findings-rail')).toBeNull()
  })

  it('removes an applied finding from the map and clears its agent badge', () => {
    const { view } = renderOverview({
      findingStates: { 'email-escalation-context': 'applied' },
    })
    const map = within(view.getByTestId('agent-oversight'))

    expect(
      within(map.getByTestId('agent-map-node-c1')).queryByTestId('agent-attention-badge'),
    ).toBeNull()
    expect(map.getAllByTestId('agent-attention-badge')).toHaveLength(3)
  })

  it('omits findings when any targeted agent is inactive', () => {
    const agents = seedAgents().map((agent) =>
      agent.id === 'w8' ? { ...agent, on: false } : agent,
    )
    const { view } = renderOverview({ agents })

    expect(view.queryByTestId('agent-map-node-w8')).toBeNull()
    expect(view.queryByText('Recognize account-lockout language earlier')).toBeNull()
  })
})

describe('CockpitOverview finding authority', () => {
  it('uses the most restrictive target mode and navigates to a Shadow blocker', async () => {
    const user = userEvent.setup()
    const onSelectAgent = vi.fn()
    renderOverview({
      modes: { ...INITIAL_MANAGEMENT_MODES, w8: 'shadow', w2: 'full' },
      selectedAgentId: 'w2',
      selectedFindingId: 'widget-recovery-language',
      onSelectAgent,
    })
    const detail = within(screen.getByTestId('agent-detail-panel'))

    expect(
      detail.getByText(/most restrictive mode controls the action: Shadow/i),
    ).toBeInTheDocument()
    expect(
      detail.getByText(/Shadow mode on Password Reset blocks this shared finding/i),
    ).toBeInTheDocument()
    await user.click(detail.getByRole('button', { name: 'Review Password Reset' }))
    expect(onSelectAgent).toHaveBeenCalledWith('w8')
  })

  it('passes the effective mode when advancing a shared finding', async () => {
    const user = userEvent.setup()
    const onAdvanceFinding = vi.fn()
    renderOverview({
      selectedAgentId: 'w2',
      selectedFindingId: 'widget-recovery-language',
      onAdvanceFinding,
    })

    await user.click(
      within(screen.getByTestId('agent-detail-panel')).getByRole('button', {
        name: 'Start A/B test',
      }),
    )
    expect(onAdvanceFinding).toHaveBeenCalledWith('widget-recovery-language', 'suggest')
  })

  it('blocks finding actions while the loop is paused', () => {
    renderOverview({
      selectedAgentId: 'w2',
      selectedFindingId: 'fallback-near-match-routing',
      actionsPaused: true,
    })
    const detail = within(screen.getByTestId('agent-detail-panel'))

    expect(
      detail.getByText(/Resume the loop before running or publishing changes/i),
    ).toBeInTheDocument()
    expect(detail.getByRole('button', { name: 'Complete test & apply winner' })).toBeDisabled()
  })
})
