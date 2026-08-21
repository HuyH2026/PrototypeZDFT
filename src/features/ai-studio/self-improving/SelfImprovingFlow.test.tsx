import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import {
  resetSelfImprovementStore,
  useSelfImprovementPlans,
} from './self-improvement-store'
import { improvementTraceLines, IMPROVEMENT_TRACE_TOTAL_MS } from './self-improving-approval'
import { PASSWORD_RESET_PLAN } from './self-improving-data'
import { SelfImprovingFlow } from './SelfImprovingFlow'

const TRACE = improvementTraceLines(PASSWORD_RESET_PLAN)
// The write lands on the Approve click, but the confirmation card still waits for
// the trace to dwell on its last line. Real timers throughout: fake timers
// deadlock userEvent in this toolchain (see AgentPlanFlow.test.tsx).
const AFTER_TRACE = IMPROVEMENT_TRACE_TOTAL_MS + 2000

function Probe() {
  const { plans } = useSelfImprovementPlans()
  const location = useLocation()
  const entries = Object.values(plans)
  return (
    <div>
      <span data-testid="store">
        {entries.length === 0
          ? 'none'
          : entries
              .map((p) => `${p.agentId}|${p.weekLabel}|${p.autoApplied}|${p.awaitingApproval}`)
              .join(',')}
      </span>
      <span data-testid="path">{location.pathname}</span>
    </div>
  )
}

function renderFlow(onClose = vi.fn()) {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/agent-builder']}>
      <SelfImprovingFlow onClose={onClose} onNewConversation={() => {}} onBranch={() => {}} />
      <Probe />
    </MemoryRouter>,
  )
  return { user, onClose }
}

const canvas = () => screen.getByTestId('self-improving-canvas')
const expand = (user: ReturnType<typeof userEvent.setup>, key: string) =>
  user.click(
    within(screen.getByTestId(`improvement-section-${key}`)).getByRole('button', {
      expanded: false,
    }),
  )

async function approveThePlan(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Review plan' }))
  await expand(user, 'health')
  await expand(user, 'plan')
  await user.click(screen.getByRole('button', { name: 'Approve plan' }))
}

describe('SelfImprovingFlow', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetSelfImprovementStore()
  })

  it('opens on the scripted survey with no panel', () => {
    renderFlow()
    expect(screen.getByText(/Are any of them struggling\?/)).toBeInTheDocument()
    expect(screen.getByText('Self-improving Agent plan for Password Reset')).toBeInTheDocument()
    expect(screen.queryByTestId('self-improving-canvas')).not.toBeInTheDocument()
    expect(screen.getByTestId('store')).toHaveTextContent('none')
  })

  it('opens the panel from the artifact card', async () => {
    const { user } = renderFlow()
    await user.click(screen.getByRole('button', { name: 'Review plan' }))
    expect(canvas()).toBeInTheDocument()
    expect(within(canvas()).getByText('Agent ‘Password Reset’')).toBeInTheDocument()
  })

  it('writes one active plan on approve, then runs the four-line trace', async () => {
    const { user } = renderFlow()
    await approveThePlan(user)

    // No waitFor: the write is committed by the time the click resolves.
    expect(screen.getByTestId('store')).toHaveTextContent('w8|Week 1 of 4|4|2')

    expect(screen.getByText(TRACE[0])).toBeInTheDocument()
    expect(screen.queryByText(TRACE[1])).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(TRACE[3])).toBeInTheDocument(), {
      timeout: AFTER_TRACE,
    })
  }, 15000)

  it('keeps the plan when the panel is closed mid-trace', async () => {
    const { user, onClose } = renderFlow()
    await approveThePlan(user)
    await user.keyboard('{Escape}')
    expect(screen.queryByTestId('self-improving-canvas')).not.toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByTestId('store')).toHaveTextContent('w8|Week 1 of 4|4|2')
  })

  it('closes the panel and posts the confirmation once the trace finishes', async () => {
    const { user } = renderFlow()
    await approveThePlan(user)
    await waitFor(
      () => expect(screen.queryByTestId('self-improving-canvas')).not.toBeInTheDocument(),
      { timeout: AFTER_TRACE },
    )
    expect(
      screen.getByText('Week 1 of 4 · 4 auto-fixes live · 2 changes awaiting approval'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View plan' })).toBeInTheDocument()
  }, 15000)

  it('reopens the panel from View plan', async () => {
    const { user } = renderFlow()
    await approveThePlan(user)
    await waitFor(() => expect(screen.getByRole('button', { name: 'View plan' })).toBeInTheDocument(), {
      timeout: AFTER_TRACE,
    })
    await user.click(screen.getByRole('button', { name: 'View plan' }))
    expect(canvas()).toBeInTheDocument()
  }, 15000)

  it('writes exactly once, however many times Approve is pressed', async () => {
    const { user } = renderFlow()
    await approveThePlan(user)
    await waitFor(() => expect(screen.getByRole('button', { name: 'View plan' })).toBeInTheDocument(), {
      timeout: AFTER_TRACE,
    })
    // Reopening re-enables Approve — the gating sections are still read.
    await user.click(screen.getByRole('button', { name: 'View plan' }))
    await user.click(screen.getByRole('button', { name: 'Approve plan' }))
    expect(screen.getByTestId('store')).toHaveTextContent('w8|Week 1 of 4|4|2')
    expect(screen.getAllByRole('button', { name: 'View plan' })).toHaveLength(1)
  }, 15000)

  it('opens the agent in Agent Builder and closes the studio', async () => {
    const { user, onClose } = renderFlow()
    await approveThePlan(user)
    await waitFor(
      () => expect(screen.getByRole('button', { name: 'Open in Agent Builder' })).toBeInTheDocument(),
      { timeout: AFTER_TRACE },
    )
    await user.click(screen.getByRole('button', { name: 'Open in Agent Builder' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/agent-builder/w8')
    expect(onClose).toHaveBeenCalled()
  }, 15000)

  it('closes the panel on Esc, and the studio on the next Esc', async () => {
    const { user, onClose } = renderFlow()
    await user.click(screen.getByRole('button', { name: 'Review plan' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByTestId('self-improving-canvas')).not.toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('gives free text the ordinary canned reply', async () => {
    const { user } = renderFlow()
    await user.type(screen.getByPlaceholderText('What can I help you with today?'), 'what about voice?')
    await user.keyboard('{Enter}')
    expect(screen.getByText(/This is a preview build/)).toBeInTheDocument()
  })
})
