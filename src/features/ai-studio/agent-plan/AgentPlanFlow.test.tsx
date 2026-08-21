import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { BrandProvider } from '@/app/brand-context'
import { resetAgentStore, useAgentStore } from '@/features/ai-agents/agent-store'
import { resetRoster, useAgentRoster } from '@/features/manage-agents/agent-roster-store'
import { AgentPlanFlow } from './AgentPlanFlow'
import { BUILD_TRACE, BUILD_TRACE_STEP_MS, BUILD_TRACE_TOTAL_MS } from './plan-build-trace'

// The write lands on the Approve click, but the created *card* still waits for
// the trace to dwell on its last line, so anything asserted about the
// conversation after a build must clear the whole BUILD_TRACE_TOTAL_MS. Real
// timers throughout: fake timers deadlock userEvent in this toolchain.
const AFTER_TRACE = BUILD_TRACE_TOTAL_MS + 2000

function Probe() {
  const { agents } = useAgentStore()
  const { agents: roster } = useAgentRoster()
  const location = useLocation()
  // Only the created agent has an 'agent-' id; the seeds are w1/w2/w3/…
  const created = agents.find((a) => a.id.startsWith('agent-'))
  return (
    <div>
      <span data-testid="created">
        {created ? `${created.name}|on:${created.on}|blocks:${created.blocks.length}` : 'none'}
      </span>
      <span data-testid="roster">
        {roster.filter((a) => a.name === 'Service Cancellation').length}
      </span>
      <span data-testid="path">{location.pathname}</span>
    </div>
  )
}

function renderFlow(onClose = vi.fn()) {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/agent-builder']}>
      <BrandProvider>
        <AgentPlanFlow onClose={onClose} onNewConversation={() => {}} onBranch={() => {}} />
        <Probe />
      </BrandProvider>
    </MemoryRouter>,
  )
  return { user, onClose }
}

const canvas = () => screen.getByTestId('agent-plan-canvas')
const openSection = async (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(
    within(screen.getByTestId(`plan-section-${name}`)).getByRole('button', { expanded: false }),
  )

async function approveThePlan(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Review plan' }))
  await openSection(user, 'Plan overview')
  await openSection(user, 'Agent')
  await user.click(screen.getByRole('button', { name: 'Approve plan' }))
}

describe('AgentPlanFlow', () => {
  beforeEach(() => {
    resetAgentStore()
    resetRoster()
  })

  it('opens on the scripted conversation with no plan panel', () => {
    renderFlow()
    expect(
      screen.getByText(/cancellation requests are being handled entirely by human agents/),
    ).toBeInTheDocument()
    expect(screen.getByText('Service cancellation')).toBeInTheDocument()
    expect(screen.queryByTestId('agent-plan-canvas')).not.toBeInTheDocument()
  })

  it('opens the canvas from the artifact card', async () => {
    const { user } = renderFlow()
    await user.click(screen.getByRole('button', { name: 'Review plan' }))
    expect(canvas()).toBeInTheDocument()
    expect(within(canvas()).getByText('Agent ‘Service Cancellation’')).toBeInTheDocument()
  })

  it('writes a draft agent to both stores on approve, then runs the four-line trace', async () => {
    const { user } = renderFlow()
    await approveThePlan(user)

    // No waitFor: the approval is committed by the time the click resolves.
    expect(screen.getByTestId('created')).toHaveTextContent(
      'Service Cancellation|on:false|blocks:2',
    )
    expect(screen.getByTestId('roster')).toHaveTextContent('1')

    expect(screen.getByText(BUILD_TRACE[0])).toBeInTheDocument()
    expect(screen.queryByText(BUILD_TRACE[1])).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(BUILD_TRACE[3])).toBeInTheDocument(), {
      timeout: AFTER_TRACE,
    })
  }, 15000)

  // Finding 1: the user's committed action outranks the animation. These two
  // assert the agent exists inside the first 600ms of a 2400ms trace, which is
  // what makes any mid-trace teardown safe — the old write-at-the-end had
  // nothing in the stores yet at this point. Note they close the panel, which
  // does not stop the trace clock; the gesture that actually lost the agent was
  // unmounting the flow (the frame's close X, or a second Esc), and that one is
  // still uncovered.
  it('keeps the approved agent when Esc closes the panel mid-trace', async () => {
    const { user, onClose } = renderFlow()
    await approveThePlan(user)
    expect(screen.queryByText(BUILD_TRACE[1])).not.toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByTestId('agent-plan-canvas')).not.toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByTestId('created')).toHaveTextContent(
      'Service Cancellation|on:false|blocks:2',
    )
    expect(screen.getByTestId('roster')).toHaveTextContent('1')
  })

  it('keeps the approved agent when the canvas close X is used mid-trace', async () => {
    const { user } = renderFlow()
    await approveThePlan(user)
    expect(screen.queryByText(BUILD_TRACE[1])).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close plan' }))
    expect(screen.queryByTestId('agent-plan-canvas')).not.toBeInTheDocument()
    expect(screen.getByTestId('created')).toHaveTextContent(
      'Service Cancellation|on:false|blocks:2',
    )
    expect(screen.getByTestId('roster')).toHaveTextContent('1')
  })

  it('closes the canvas and posts the created card once the build finishes', async () => {
    const { user } = renderFlow()
    await approveThePlan(user)
    await waitFor(() => expect(screen.queryByTestId('agent-plan-canvas')).not.toBeInTheDocument(), {
      timeout: AFTER_TRACE,
    })
    expect(screen.getByText('Draft — not taking traffic')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open in Agent Builder' })).toBeInTheDocument()
  }, 15000)

  it('navigates to the created agent and closes the studio', async () => {
    const { user, onClose } = renderFlow()
    await approveThePlan(user)
    await waitFor(
      () =>
        expect(screen.getByRole('button', { name: 'Open in Agent Builder' })).toBeInTheDocument(),
      { timeout: AFTER_TRACE },
    )
    await user.click(screen.getByRole('button', { name: 'Open in Agent Builder' }))
    expect(screen.getByTestId('path').textContent).toMatch(/^\/agent-builder\/agent-\d+$/)
    expect(onClose).toHaveBeenCalled()
  }, 15000)

  it('sends a test run to the test suite', async () => {
    const { user, onClose } = renderFlow()
    await approveThePlan(user)
    await waitFor(
      () => expect(screen.getByRole('button', { name: 'Run a test' })).toBeInTheDocument(),
      { timeout: AFTER_TRACE },
    )
    await user.click(screen.getByRole('button', { name: 'Run a test' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/experiment/test-suite')
    expect(onClose).toHaveBeenCalled()
  }, 15000)

  it('follows a linked action reference out of the studio', async () => {
    const { user, onClose } = renderFlow()
    await user.click(screen.getByRole('button', { name: 'Review plan' }))
    await openSection(user, 'Agent')
    await user.click(screen.getByRole('button', { name: 'getAccountProfile (Browser agent)' }))
    expect(screen.getByTestId('path')).toHaveTextContent(
      '/agent-builder/actions/get-account-profile',
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('hands an ask-for-changes back to the composer, then re-opens the panel with both sections updated', async () => {
    const { user } = renderFlow()
    await user.click(screen.getByRole('button', { name: 'Review plan' }))
    await openSection(user, 'Plan overview')
    await openSection(user, 'Agent')
    await user.click(screen.getByRole('button', { name: 'Ask for changes' }))

    expect(screen.queryByTestId('agent-plan-canvas')).not.toBeInTheDocument()
    const composer = screen.getByPlaceholderText(
      'What can I help you with today?',
    ) as HTMLInputElement
    expect(composer.value).toBe('Change the retention offer to…')

    await user.click(screen.getByLabelText('Send message'))
    expect(screen.getByText(/Updated the plan/)).toBeInTheDocument()
    expect(canvas()).toBeInTheDocument()
    expect(
      within(screen.getByTestId('plan-section-Agent')).getByText('Updated'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve plan' })).toBeDisabled()
  })

  it('gives a later free-text message the ordinary canned reply', async () => {
    const { user } = renderFlow()
    const composer = screen.getByPlaceholderText('What can I help you with today?')
    await user.type(composer, 'what about voice?')
    await user.keyboard('{Enter}')
    expect(screen.getByText(/This is a preview build/)).toBeInTheDocument()
  })

  it('closes the panel on Esc, and the studio on the next Esc', async () => {
    const { user, onClose } = renderFlow()
    await user.click(screen.getByRole('button', { name: 'Review plan' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByTestId('agent-plan-canvas')).not.toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('writes the agent exactly once, however long the trace keeps firing', async () => {
    const { user } = renderFlow()
    await approveThePlan(user)
    expect(screen.getByTestId('created')).toHaveTextContent(
      'Service Cancellation|on:false|blocks:2',
    )
    // Run the trace out and then keep waiting: neither the clock nor the effect
    // that ends the build may mint a second agent.
    await waitFor(() => expect(screen.queryByTestId('agent-plan-canvas')).not.toBeInTheDocument(), {
      timeout: AFTER_TRACE,
    })
    await new Promise((r) => setTimeout(r, BUILD_TRACE_STEP_MS * 3))
    expect(screen.getByTestId('roster')).toHaveTextContent('1')
    expect(screen.getAllByText('Draft — not taking traffic')).toHaveLength(1)
  }, 15000)
})
