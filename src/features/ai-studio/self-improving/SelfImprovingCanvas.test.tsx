import { useReducer } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PASSWORD_RESET_PLAN } from './self-improving-data'
import { improvementTraceLines } from './self-improving-approval'
import {
  improvementReviewReducer,
  INITIAL_IMPROVEMENT_REVIEW,
} from './improvement-review-state'
import { SelfImprovingCanvas } from './SelfImprovingCanvas'

const TRACE = improvementTraceLines(PASSWORD_RESET_PLAN)

function Harness(props: Partial<Parameters<typeof SelfImprovingCanvas>[0]> = {}) {
  const [state, dispatch] = useReducer(improvementReviewReducer, INITIAL_IMPROVEMENT_REVIEW)
  return (
    <SelfImprovingCanvas
      state={state}
      onToggleSection={(section) => dispatch({ type: 'toggle', section })}
      onApprove={() => {}}
      onClose={() => {}}
      {...props}
    />
  )
}

const section = (key: string) => screen.getByTestId(`improvement-section-${key}`)
const header = (key: string) => within(section(key)).getByRole('button')
const expand = (user: ReturnType<typeof userEvent.setup>, key: string) =>
  user.click(within(section(key)).getByRole('button', { expanded: false }))

describe('SelfImprovingCanvas', () => {
  it('names the plan and its six sections, all collapsed', () => {
    render(<Harness />)
    expect(screen.getByTestId('self-improving-canvas')).toBeInTheDocument()
    expect(screen.getByText('Self-improving agent plan')).toBeInTheDocument()
    expect(screen.getByText('Agent ‘Password Reset’')).toBeInTheDocument()
    for (const key of ['overview', 'health', 'plan', 'monitor', 'validate', 'guardrails']) {
      expect(within(section(key)).getByRole('button', { expanded: false })).toBeInTheDocument()
    }
    // Collapsed means no body.
    expect(screen.queryByText('Evaluate agent health')).not.toBeInTheDocument()
  })

  // Decision 2: the count comes from the weeks, so the heading cannot contradict
  // what is listed beneath it.
  it('derives the week count into the plan section heading', () => {
    render(<Harness />)
    expect(within(section('plan')).getByText('Self-improving plan • 4 weeks')).toBeInTheDocument()
  })

  it('carries the authored chips, and none on the overview', () => {
    render(<Harness />)
    expect(within(header('health')).getByText('Critical')).toBeInTheDocument()
    expect(within(header('plan')).getByText('Needs approval')).toBeInTheDocument()
    expect(within(header('monitor')).getByText('Tracking')).toBeInTheDocument()
    expect(within(header('validate')).getByText('Active check-ins')).toBeInTheDocument()
    expect(within(header('guardrails')).getByText('Auto-applied')).toBeInTheDocument()
    expect(within(section('overview')).queryByText(/Critical|Tracking|approval/)).not.toBeInTheDocument()
  })

  it('hides a section’s own chip while it is open', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await expand(user, 'health')
    expect(within(header('health')).queryByText('Critical')).not.toBeInTheDocument()
    expect(screen.getByText('The case for a self-improving agent')).toBeInTheDocument()
  })

  it('opens one section at a time', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await expand(user, 'overview')
    expect(screen.getByText('Evaluate agent health')).toBeInTheDocument()
    await expand(user, 'guardrails')
    expect(screen.queryByText('Evaluate agent health')).not.toBeInTheDocument()
    expect(screen.getByText('Auto-apply threshold')).toBeInTheDocument()
  })

  it('shows the scorecard when the health section is read', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await expand(user, 'health')
    expect(screen.getByText('Health Score')).toBeInTheDocument()
    expect(screen.getByText('target ≤15%')).toBeInTheDocument()
    expect(screen.getByLabelText('Negative')).toBeInTheDocument()
  })

  it('disables Approve with its reason until both gating sections are read', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    render(<Harness onApprove={onApprove} />)
    const approve = () => screen.getByRole('button', { name: 'Approve plan' })
    expect(approve()).toBeDisabled()
    expect(
      screen.getByText('Review Agent health evaluation and Self-improving plan to approve'),
    ).toBeInTheDocument()
    await expand(user, 'health')
    expect(screen.getByText('Review Self-improving plan to approve')).toBeInTheDocument()
    await expand(user, 'plan')
    expect(approve()).toBeEnabled()
    expect(screen.queryByText(/to approve$/)).not.toBeInTheDocument()
    await user.click(approve())
    expect(onApprove).toHaveBeenCalledTimes(1)
  })

  it('does not enable Approve from the four non-gating sections', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    for (const key of ['overview', 'monitor', 'validate', 'guardrails']) {
      await expand(user, key)
    }
    expect(screen.getByRole('button', { name: 'Approve plan' })).toBeDisabled()
  })

  it('replaces the sections with the activation trace, revealing as many lines as it is told', () => {
    render(<Harness activating traceStep={2} />)
    expect(screen.queryByTestId('improvement-section-health')).not.toBeInTheDocument()
    expect(screen.getByTestId('improvement-activation-trace')).toBeInTheDocument()
    expect(screen.getByText(TRACE[0])).toBeInTheDocument()
    expect(screen.getByText(TRACE[1])).toBeInTheDocument()
    expect(screen.queryByText(TRACE[2])).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve plan' })).toBeDisabled()
  })

  it('reports Close to its owner', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Close plan' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
