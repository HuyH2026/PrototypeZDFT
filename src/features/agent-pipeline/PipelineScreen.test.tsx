import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { resetAgentStore } from '@/features/ai-agents/agent-store'
import { ATTENTION_AGENT_IDS } from './cockpit-data'
import { ALL_CHANGES, CYCLES } from './pipeline-data'
import { resetPipelineStore } from './pipeline-store'
import { PipelineScreen } from './PipelineScreen'

function renderScreen() {
  render(
    <MemoryRouter initialEntries={['/agent-pipeline']}>
      <PipelineScreen />
    </MemoryRouter>,
  )
  return within(screen.getByTestId('screen-agent-pipeline'))
}

describe('PipelineScreen', () => {
  beforeEach(() => {
    resetPipelineStore()
    resetAgentStore()
  })

  it('opens on the outcome-led cockpit', () => {
    const view = renderScreen()
    expect(view.getByRole('heading', { name: 'Agent Governance' })).toBeInTheDocument()
    expect(view.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Direction',
      'Activity',
      'Memory',
    ])
    expect(view.getByTestId('outcome-overlay')).toBeInTheDocument()
    expect(view.getByTestId('agent-oversight')).toBeInTheDocument()
  })

  it('marks exactly the four outcome-ranked agents for attention', () => {
    const view = renderScreen()
    expect(view.getAllByTestId('agent-attention-badge')).toHaveLength(4)
    for (const agentId of ATTENTION_AGENT_IDS) {
      expect(
        within(view.getByTestId(`agent-map-node-${agentId}`)).getByTestId('agent-attention-badge'),
      ).toBeInTheDocument()
    }
  })

  it('opens one shared agent detail from the map and its ranked finding', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByTestId('agent-map-node-w8'))
    const detail = within(screen.getByTestId('agent-detail-panel'))
    expect(detail.getByRole('heading', { name: 'Password Reset' })).toBeInTheDocument()
    expect(
      detail.getByRole('heading', { name: 'Recognize account-lockout language earlier' }),
    ).toBeInTheDocument()
    expect(detail.getByText('+3.1 pt')).toBeInTheDocument()
    expect(detail.getByText(/above 4.17 floor/)).toBeInTheDocument()
  })

  it('enrolls a Shadow agent before granting Suggest & test authority', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByTestId('agent-map-node-c1'))

    const detail = within(screen.getByTestId('agent-detail-panel'))
    await user.click(detail.getByRole('radio', { name: 'Suggest & test' }))
    const enrollment = within(screen.getByRole('dialog', { name: 'Enroll agent' }))
    expect(enrollment.getByText('Immutable baseline snapshot')).toBeInTheDocument()
    expect(enrollment.getByText('+5 points')).toBeInTheDocument()
    await user.click(enrollment.getByRole('button', { name: 'Enroll agent' }))

    expect(detail.getByRole('radio', { name: 'Suggest & test' })).toBeChecked()
    expect(screen.queryByRole('dialog', { name: 'Enroll agent' })).toBeNull()
  })

  it('publishes a tested winner without collapsing the review context', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(
      view.getByRole('button', { name: /Recognize account-lockout language earlier/ }),
    )
    const detail = within(screen.getByTestId('agent-detail-panel'))
    await user.click(detail.getByRole('button', { name: 'Publish test winner' }))
    expect(detail.getByText('Applied')).toBeInTheDocument()
    expect(detail.getByText('Change receipt')).toBeInTheDocument()

    await user.click(view.getByRole('tab', { name: 'Activity' }))
    const activity = within(view.getByTestId('session-activity-password-reset-lockout-language'))
    expect(activity.getByText('Applied · measuring')).toBeInTheDocument()
    expect(activity.getByText(/measurement is still pending/i)).toBeInTheDocument()
  })

  it('automatically applies a completed low-risk test under Full management', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByTestId('agent-map-node-w2'))

    let detail = within(screen.getByTestId('agent-detail-panel'))
    expect(
      detail.getByRole('heading', { name: 'Preserve captured context during sibling handoff' }),
    ).toBeInTheDocument()
    await user.click(detail.getByRole('button', { name: 'Complete test & apply winner' }))
    expect(detail.getByText('Applied')).toBeInTheDocument()
    expect(detail.getByText('Change receipt')).toBeInTheDocument()
    expect(detail.queryByText('Winner ready')).toBeNull()

    await user.click(detail.getByRole('button', { name: 'Close' }))
    await user.click(view.getByTestId('agent-map-node-w2'))
    detail = within(screen.getByTestId('agent-detail-panel'))
    expect(
      detail.getByRole('heading', { name: 'Reuse the proven recovery-language pattern' }),
    ).toBeInTheDocument()
  })

  it('edits the entitlement and cost-avoided outcomes while leaving resolution uncapped and both floors locked', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByRole('button', { name: 'Edit Entitlement consumption' }))
    const editor = within(screen.getByRole('dialog', { name: 'Edit outcome targets' }))
    expect(editor.queryByRole('spinbutton', { name: 'AI resolution target (%)' })).toBeNull()
    const entitlement = editor.getByRole('spinbutton', { name: 'Entitlement target' })
    const costAvoided = editor.getByRole('spinbutton', { name: 'Cost-avoided target ($)' })
    await user.clear(entitlement)
    await user.type(entitlement, '60000')
    await user.clear(costAvoided)
    await user.type(costAvoided, '500000')
    await user.click(editor.getByRole('button', { name: 'Save outcomes' }))
    expect(
      within(view.getByTestId('outcome-entitlement-consumption')).getByText('60K'),
    ).toBeInTheDocument()
    expect(within(view.getByTestId('outcome-cost-avoided')).getByText('$500K')).toBeInTheDocument()
    expect(
      within(view.getByTestId('outcome-ai-interaction-csat')).getByText('Hard floor'),
    ).toBeInTheDocument()
    expect(
      within(view.getByTestId('outcome-policy-compliance-rate')).getByText('Hard floor'),
    ).toBeInTheDocument()

    await user.click(view.getByRole('tab', { name: 'Activity' }))
    await user.click(view.getByRole('tab', { name: 'Direction' }))
    expect(
      within(view.getByTestId('outcome-entitlement-consumption')).getByText('60K'),
    ).toBeInTheDocument()
    expect(within(view.getByTestId('outcome-cost-avoided')).getByText('$500K')).toBeInTheDocument()
  })

  it('keeps keyboard focus inside the outcome editor and restores it on Escape', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    const trigger = view.getByRole('button', { name: 'Edit Entitlement consumption' })
    await user.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'Edit outcome targets' })
    const editor = within(dialog)
    const entitlement = editor.getByRole('spinbutton', { name: 'Entitlement target' })
    const close = editor.getByRole('button', { name: 'Close' })
    const save = editor.getByRole('button', { name: 'Save outcomes' })
    expect(entitlement).toHaveFocus()

    save.focus()
    await user.tab()
    expect(close).toHaveFocus()
    await user.tab({ shift: true })
    expect(save).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Edit outcome targets' })).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it('blocks empty, non-finite, and non-positive entitlement and cost-avoided targets', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByRole('button', { name: 'Edit Entitlement consumption' }))
    const editor = within(screen.getByRole('dialog', { name: 'Edit outcome targets' }))
    const entitlement = editor.getByRole('spinbutton', { name: 'Entitlement target' })
    const costAvoided = editor.getByRole('spinbutton', { name: 'Cost-avoided target ($)' })
    const save = editor.getByRole('button', { name: 'Save outcomes' })

    await user.clear(entitlement)
    expect(editor.getByText('Enter an entitlement target greater than 0.')).toBeInTheDocument()
    expect(entitlement).toHaveAttribute('aria-invalid', 'true')
    expect(save).toBeDisabled()

    fireEvent.change(entitlement, { target: { value: '1e309' } })
    expect(editor.getByText('Enter an entitlement target greater than 0.')).toBeInTheDocument()
    expect(save).toBeDisabled()
    await user.clear(entitlement)
    await user.type(entitlement, '51000')
    expect(save).toBeEnabled()

    await user.clear(costAvoided)
    expect(editor.getByText('Enter a cost-avoided target greater than 0.')).toBeInTheDocument()
    expect(costAvoided).toHaveAttribute('aria-invalid', 'true')
    expect(save).toBeDisabled()

    fireEvent.change(costAvoided, { target: { value: '1e309' } })
    expect(editor.getByText('Enter a cost-avoided target greater than 0.')).toBeInTheDocument()
    expect(save).toBeDisabled()
    await user.clear(costAvoided)
    await user.type(costAvoided, '420000')
    expect(save).toBeEnabled()
  })

  it('threads operator guidance into account memory', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    const guidance = 'Deprioritize trial flows until the Q4 rewrite.'
    await user.type(view.getByRole('textbox', { name: 'Guidance for the next pass' }), guidance)
    await user.click(view.getByRole('button', { name: 'Add guidance' }))
    expect(view.getByText('Saved to memory')).toBeInTheDocument()
    await user.click(view.getByRole('tab', { name: 'Memory' }))
    expect(view.getByText(new RegExp(guidance))).toBeInTheDocument()
  })

  it('keeps the loop diagram, exception inbox, and cycle log in Activity', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByRole('tab', { name: 'Activity' }))
    expect(view.getByTestId('loop-diagram')).toBeInTheDocument()
    expect(view.getByTestId('approval-inbox')).toBeInTheDocument()
    expect(view.getByTestId('cycle-log')).toBeInTheDocument()
    expect(view.getByTestId('stat-managed')).toHaveTextContent('36')
  })

  it('returns to the top when switching views', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    const root = screen.getByTestId('screen-agent-pipeline')
    root.scrollTop = 480

    await user.click(view.getByRole('tab', { name: 'Memory' }))

    expect(root.scrollTop).toBe(0)
  })

  it('repositions the activity hero to the selected historical cycle', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByRole('tab', { name: 'Activity' }))
    await user.click(view.getByRole('button', { name: new RegExp(`#${CYCLES[1].ordinal}`) }))
    expect(view.getByTestId('loop-ticker')).toHaveTextContent(CYCLES[1].journal[0])
    expect(within(view.getByTestId('lane-deployed')).getByTestId('lane-count')).toHaveTextContent(
      '1',
    )
    expect(within(view.getByTestId('lane-held')).getByTestId('lane-count')).toHaveTextContent('0')
  })

  it('returns Activity to the current cycle when reopening the view', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByRole('tab', { name: 'Activity' }))
    await user.click(view.getByRole('button', { name: new RegExp(`#${CYCLES[1].ordinal}`) }))
    await user.click(view.getByRole('tab', { name: 'Memory' }))
    await user.click(view.getByRole('tab', { name: 'Activity' }))

    expect(view.getByRole('button', { name: new RegExp(`#${CYCLES[0].ordinal}`) })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(within(view.getByTestId('lane-held')).getByTestId('lane-count')).toHaveTextContent('2')
  })

  it('moves an approved pending ask into a guarded experiment', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByRole('tab', { name: 'Activity' }))

    await user.click(view.getByRole('button', { name: /approve guarded test/i }))

    expect(within(view.getByTestId('lane-testing')).getByTestId('lane-count')).toHaveTextContent(
      '2',
    )
    expect(within(view.getByTestId('lane-held')).getByTestId('lane-count')).toHaveTextContent('1')
  })

  it('moves an Activity proposal through experiment, winner publication, and Applied', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    const change = ALL_CHANGES.find((candidate) => candidate.id === 'if4')!
    await user.click(view.getByRole('tab', { name: 'Activity' }))

    const proposal = within(view.getByTestId(`inbox-row-${change.id}`))
    await user.click(proposal.getByRole('button', { name: /approve guarded test/i }))
    expect(view.queryByTestId(`inbox-row-${change.id}`)).toBeNull()

    let experiment = within(view.getByTestId(`experiment-row-${change.id}`))
    expect(experiment.getByText('Experiment running')).toBeInTheDocument()
    expect(within(view.getByTestId('lane-testing')).getByTestId('lane-count')).toHaveTextContent(
      '2',
    )
    const cycleDetail = within(view.getByTestId(`cycle-detail-${CYCLES[0].id}`))
    expect(cycleDetail.getByText(/guarded experiment authorized/)).toBeInTheDocument()

    await user.click(experiment.getByRole('button', { name: /complete mock test/i }))
    experiment = within(view.getByTestId(`experiment-row-${change.id}`))
    expect(experiment.getByText('Winner ready')).toBeInTheDocument()
    expect(within(view.getByTestId('lane-held')).getByTestId('lane-count')).toHaveTextContent('2')
    expect(cycleDetail.getByText(/test complete, winner ready to publish/)).toBeInTheDocument()

    await user.click(experiment.getByRole('button', { name: /publish winner/i }))
    expect(view.queryByTestId(`experiment-row-${change.id}`)).toBeNull()
    expect(within(view.getByTestId('lane-deployed')).getByTestId('lane-count')).toHaveTextContent(
      '4',
    )
    expect(cycleDetail.getByText(/winner published and change applied/)).toBeInTheDocument()

    await user.click(view.getByRole('tab', { name: 'Memory' }))
    const monitoring = within(view.getByTestId(`memory-row-monitoring-${change.id}`))
    expect(monitoring.getByText(/outcome measurement is pending/i)).toBeInTheDocument()
  })

  it('remembers a declined proposal as a customer constraint', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByRole('tab', { name: 'Activity' }))
    await user.click(view.getByRole('button', { name: /decline a\/b test/i }))
    await user.click(view.getByRole('tab', { name: 'Memory' }))

    const declined = within(view.getByTestId('memory-group-declined'))
    expect(declined.getByRole('heading')).toHaveTextContent('Declined by you · 1')
    expect(declined.getByText(/saved as a customer constraint/i)).toBeInTheDocument()

    await user.click(declined.getByRole('button', { name: /reconsider/i }))
    expect(view.queryByTestId('memory-group-declined')).toBeNull()
    await user.click(view.getByRole('tab', { name: 'Activity' }))
    expect(view.getByRole('button', { name: /approve a\/b test/i })).toBeEnabled()
  })

  it('carries Shadow authority from Outcomes into Activity', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByTestId('agent-map-node-w8'))
    const detail = within(screen.getByTestId('agent-detail-panel'))
    await user.click(detail.getByRole('radio', { name: 'Shadow' }))
    await user.click(detail.getByRole('button', { name: 'Close' }))

    await user.click(view.getByRole('tab', { name: 'Activity' }))
    expect(view.getAllByText(/Password Reset is in Shadow mode/i)).not.toHaveLength(0)
    expect(view.getByRole('button', { name: /approve guarded test/i })).toBeDisabled()
    expect(view.getByRole('button', { name: /approve a\/b test/i })).toBeDisabled()
  })

  it('pauses the loop globally and reflects that state in Activity', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByRole('button', { name: 'Pause loop' }))
    await user.click(view.getByRole('tab', { name: 'Activity' }))
    expect(view.getByTestId('loop-diagram-root')).toHaveAttribute('data-loop-state', 'paused')
    expect(view.getByTestId('loop-ticker')).toHaveTextContent(
      'No new diagnostic passes or actions will run',
    )
  })

  it('disables proposal and experiment lifecycle actions while paused', async () => {
    resetPipelineStore({ decisions: { if4: 'approved' }, paused: true })
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByRole('tab', { name: 'Activity' }))

    expect(view.getByRole('button', { name: /approve a\/b test/i })).toBeDisabled()
    expect(view.getByRole('button', { name: /complete mock test/i })).toBeDisabled()
  })
})
