import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { PASSWORD_RESET_PLAN } from '@/features/ai-studio/self-improving/self-improving-data'
import { activePlanFromImprovementPlan } from '@/features/ai-studio/self-improving/self-improving-approval'
import { resetSelfImprovementStore } from '@/features/ai-studio/self-improving/self-improvement-store'
import { DATA } from '../dashboard-data'
import { AgentHealthCard } from './AgentHealthCard'

function stubReducedMotion(matches: boolean) {
  const listeners = new Set<() => void>()
  const list = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => list),
  )
}

// The card now carries an AI trigger, so it needs the assistant context — and
// that provider reads the location.
function renderCard() {
  return render(
    <MemoryRouter>
      <AiAssistantProvider>
        <AgentHealthCard data={DATA.platform} />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
  resetSelfImprovementStore()
})

describe('AgentHealthCard', () => {
  it('renders the card title', () => {
    renderCard()
    expect(screen.getByText('Overall agent health')).toBeInTheDocument()
  })

  it('renders the hero digest', () => {
    renderCard()
    expect(screen.getByText('Amazing!')).toBeInTheDocument()
    expect(screen.getByText('Agent health')).toBeInTheDocument()
  })

  it('renders all four metrics', () => {
    renderCard()
    expect(screen.getAllByTestId('metric-value')).toHaveLength(4)
    for (const label of ['Resolution rate', 'CSAT', 'Escalations', 'Avg handle time']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('shows the channel breakdown by default', () => {
    renderCard()
    expect(screen.getAllByTestId('metric-breakdown')).toHaveLength(4)
    expect(screen.getByRole('checkbox', { name: /channel breakdown/i })).toBeChecked()
  })

  it('hides exiting channel details from assistive tech while the cards condense', async () => {
    stubReducedMotion(false)
    const user = userEvent.setup()
    const { container } = renderCard()
    const box = screen.getByRole('checkbox', { name: /channel breakdown/i })
    const exiting = screen.getAllByTestId('metric-breakdown')

    await user.click(box)

    expect(screen.getByTestId('health-metric-grid')).toHaveAttribute('data-layout', 'compact')
    expect(
      container.querySelectorAll('[data-slot="health-metric"][data-layout="compact"]'),
    ).toHaveLength(4)
    for (const detail of exiting) expect(detail).toHaveAttribute('aria-hidden', 'true')
    await waitForElementToBeRemoved(exiting)

    expect(screen.queryAllByTestId('metric-breakdown')).toHaveLength(0)
    expect(screen.getAllByTestId('metric-value')).toHaveLength(4)
    expect(screen.getAllByTestId('metric-delta')).toHaveLength(4)

    await user.click(box)

    expect(screen.getByTestId('health-metric-grid')).toHaveAttribute('data-layout', 'expanded')
    expect(screen.getAllByTestId('metric-breakdown')).toHaveLength(4)
  })

  it('removes channel details immediately when reduced motion is preferred', async () => {
    stubReducedMotion(true)
    const user = userEvent.setup()
    renderCard()
    const exiting = screen.getAllByTestId('metric-breakdown')

    await user.click(screen.getByRole('checkbox', { name: /channel breakdown/i }))

    expect(screen.getByTestId('health-metric-grid')).toHaveAttribute('data-layout', 'compact')
    expect(screen.queryAllByTestId('metric-breakdown')).toHaveLength(0)
    for (const detail of exiting) expect(detail.isConnected).toBe(false)
  })

  it('scopes each channel value to its own metric card', () => {
    renderCard()
    // Cards render in the base data order: res, csat, esc, aht.
    const cards = screen.getAllByTestId('metric-breakdown')
    expect(within(cards[0]).getByText('87%')).toBeInTheDocument() // res / Web Call
    expect(within(cards[1]).getByText('4.9')).toBeInTheDocument() // csat / Voice
  })
})

describe('AgentHealthCard self-improving plans', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetSelfImprovementStore()
  })

  it('says nothing when no agent is on a plan', () => {
    renderCard()
    expect(screen.queryByTestId('health-self-improving')).not.toBeInTheDocument()
  })

  it('names the one agent on a plan and the week it is in', () => {
    resetSelfImprovementStore({ w8: activePlanFromImprovementPlan(PASSWORD_RESET_PLAN) })
    renderCard()
    expect(screen.getByTestId('health-self-improving')).toHaveTextContent(
      'Password Reset is on a self-improving plan — Week 1 of 4',
    )
  })

  it('pluralises past one', () => {
    const first = activePlanFromImprovementPlan(PASSWORD_RESET_PLAN)
    resetSelfImprovementStore({
      w8: first,
      w4: { ...first, agentId: 'w4', agentName: 'Login Help' },
    })
    renderCard()
    expect(screen.getByTestId('health-self-improving')).toHaveTextContent(
      '2 agents are on self-improving plans',
    )
  })

  it('offers the health survey from the card header', () => {
    renderCard()
    expect(
      screen.getByRole('button', { name: 'Check agent health with AI' }),
    ).toBeInTheDocument()
  })
})
