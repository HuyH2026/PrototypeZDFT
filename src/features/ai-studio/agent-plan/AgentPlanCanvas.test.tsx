import { useReducer } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentPlanCanvas } from './AgentPlanCanvas'
import { INITIAL_PLAN_REVIEW, planReviewReducer } from './plan-review-state'
import { BUILD_TRACE } from './plan-build-trace'

function Harness(props: Partial<Parameters<typeof AgentPlanCanvas>[0]> = {}) {
  const [state, dispatch] = useReducer(planReviewReducer, INITIAL_PLAN_REVIEW)
  return (
    <AgentPlanCanvas
      state={state}
      onToggleSection={(section) => dispatch({ type: 'toggle', section })}
      onEdit={(fieldId, text, original) => dispatch({ type: 'edit', fieldId, text, original })}
      onApprove={() => {}}
      onAskForChanges={() => {}}
      onClose={() => {}}
      {...props}
    />
  )
}

const section = (name: string) => screen.getByTestId(`plan-section-${name}`)

describe('AgentPlanCanvas', () => {
  it('names the plan and its four sections, all collapsed', () => {
    render(<Harness />)
    expect(screen.getByText('Create new agent plan')).toBeInTheDocument()
    expect(screen.getByText('Agent ‘Service Cancellation’')).toBeInTheDocument()
    for (const name of ['Plan overview', 'Impact', 'Agent', 'AI thinking']) {
      expect(within(section(name)).getByRole('button', { expanded: false })).toBeInTheDocument()
    }
    // Collapsed means no body: the first overview step is not on screen yet.
    expect(screen.queryByText('Identify cancellation intent')).not.toBeInTheDocument()
  })

  it('starts with Impact estimated and the two gating sections needing approval', () => {
    render(<Harness />)
    expect(within(section('Impact')).getByText('Estimated')).toBeInTheDocument()
    expect(within(section('Plan overview')).getByText('Needs approval')).toBeInTheDocument()
    expect(within(section('Agent')).getByText('Needs approval')).toBeInTheDocument()
    expect(within(section('AI thinking')).queryByText(/approval|Reviewed/)).not.toBeInTheDocument()
  })

  it('expands the overview and flips its chip to Reviewed once collapsed again', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(within(section('Plan overview')).getByRole('button', { expanded: false }))
    expect(screen.getByText('Identify cancellation intent')).toBeInTheDocument()
    expect(screen.getByText('Escalate VIP accounts and edge cases')).toBeInTheDocument()
    expect(screen.getAllByText('Deflection rate').length).toBeGreaterThan(1)
    await user.click(within(section('Plan overview')).getByRole('button', { expanded: true }))
    expect(within(section('Plan overview')).getByText('Reviewed')).toBeInTheDocument()
  })

  it('opens one section at a time', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(within(section('Plan overview')).getByRole('button', { expanded: false }))
    await user.click(within(section('Impact')).getByRole('button', { expanded: false }))
    expect(screen.queryByText('Identify cancellation intent')).not.toBeInTheDocument()
    expect(screen.getByText('Projected deflection')).toBeInTheDocument()
    expect(screen.getByText('vs 14 min human avg')).toBeInTheDocument()
  })

  it('renders the structured policy, its chips and both block previews', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(within(section('Agent')).getByRole('button', { expanded: false }))
    expect(screen.getByText('Agent job')).toBeInTheDocument()
    expect(screen.getByText(/Reveal form below to determine customer’s cancellation reasons\./)).toBeInTheDocument()
    expect(screen.getByText('Retention Routing')).toBeInTheDocument()
    expect(screen.getByText('CSAT Survey')).toBeInTheDocument()
    // Both embedded cards.
    expect(screen.getByText('Cancellation reason')).toBeInTheDocument()
    expect(screen.getByText('Do you want a 30 day free trial?')).toBeInTheDocument()
  })

  it('links the one real action and promises the rest', async () => {
    const user = userEvent.setup()
    const onOpenAction = vi.fn()
    render(<Harness onOpenAction={onOpenAction} />)
    await user.click(within(section('Agent')).getByRole('button', { expanded: false }))
    await user.click(screen.getByRole('button', { name: 'getAccountProfile (Browser agent)' }))
    expect(onOpenAction).toHaveBeenCalledWith('get-account-profile')
    expect(screen.getAllByText('will be created').length).toBe(4)
  })

  it('renders the six thinking steps read-only', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(within(section('AI thinking')).getByRole('button', { expanded: false }))
    // The number lives in the timeline node, so the title line is the sentence
    // and the step's label is there for assistive tech rather than in the prose.
    expect(screen.getByText('Load context before greeting')).toBeInTheDocument()
    expect(screen.getByText('Close and write to analytics')).toBeInTheDocument()
    expect(screen.getByText('Step 1')).toBeInTheDocument()
    expect(screen.getByText('Step 6')).toBeInTheDocument()
    expect(screen.getAllByText('$is_vip')).toHaveLength(2)
    expect(document.querySelectorAll('[contenteditable="true"]')).toHaveLength(0)
  })

  it('disables Approve with its reason until both gating sections are read', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    render(<Harness onApprove={onApprove} />)
    const approve = () => screen.getByRole('button', { name: 'Approve plan' })
    expect(approve()).toBeDisabled()
    expect(screen.getByText('Review Plan overview and Agent to approve')).toBeInTheDocument()
    await user.click(within(section('Plan overview')).getByRole('button', { expanded: false }))
    expect(screen.getByText('Review Agent to approve')).toBeInTheDocument()
    await user.click(within(section('Agent')).getByRole('button', { expanded: false }))
    expect(approve()).toBeEnabled()
    expect(screen.queryByText(/to approve$/)).not.toBeInTheDocument()
    await user.click(approve())
    expect(onApprove).toHaveBeenCalledTimes(1)
  })

  it('counts an inline edit next to Approve', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(within(section('Plan overview')).getByRole('button', { expanded: false }))
    const title = screen.getByText('Identify cancellation intent')
    await user.click(title)
    // contentEditable commits on blur; jsdom fires blur on tab-away.
    title.textContent = 'Spot cancellation intent'
    await user.tab()
    expect(screen.getByText('1 edit')).toBeInTheDocument()
  })

  it('reports Ask for changes and Close to its owner', async () => {
    const user = userEvent.setup()
    const onAskForChanges = vi.fn()
    const onClose = vi.fn()
    render(<Harness onAskForChanges={onAskForChanges} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Ask for changes' }))
    await user.click(screen.getByRole('button', { name: 'Close plan' }))
    expect(onAskForChanges).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('replaces the sections with the build trace, revealing as many lines as it is told', () => {
    render(<Harness building traceStep={2} />)
    expect(screen.queryByTestId('plan-section-Plan overview')).not.toBeInTheDocument()
    expect(screen.getByText(BUILD_TRACE[0])).toBeInTheDocument()
    expect(screen.getByText(BUILD_TRACE[1])).toBeInTheDocument()
    expect(screen.queryByText(BUILD_TRACE[2])).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve plan' })).toBeDisabled()
  })
})
