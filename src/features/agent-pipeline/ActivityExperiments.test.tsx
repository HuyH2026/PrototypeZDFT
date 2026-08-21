import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ALL_CHANGES, type Decisions } from './pipeline-data'
import { ActivityExperiments } from './ActivityExperiments'

const CHANGE = ALL_CHANGES.find((change) => change.id === 'if4')!

describe('ActivityExperiments', () => {
  it('progresses an authorized test to winner review', async () => {
    const onAdvance = vi.fn()
    const decisions: Decisions = { [CHANGE.id]: 'approved' }
    render(<ActivityExperiments changes={[CHANGE]} decisions={decisions} onAdvance={onAdvance} />)

    const row = within(screen.getByTestId(`experiment-row-${CHANGE.id}`))
    expect(row.getByText('Experiment running')).toBeInTheDocument()
    await userEvent.click(row.getByRole('button', { name: /complete mock test/i }))
    expect(onAdvance).toHaveBeenCalledWith(CHANGE.id, 'winner-ready')
  })

  it('publishes a winner only after review', async () => {
    const onAdvance = vi.fn()
    const decisions: Decisions = { [CHANGE.id]: 'winner-ready' }
    render(<ActivityExperiments changes={[CHANGE]} decisions={decisions} onAdvance={onAdvance} />)

    const row = within(screen.getByTestId(`experiment-row-${CHANGE.id}`))
    expect(row.getByText('Winner ready')).toBeInTheDocument()
    await userEvent.click(row.getByRole('button', { name: /publish winner/i }))
    expect(onAdvance).toHaveBeenCalledWith(CHANGE.id, 'applied')
  })

  it('blocks lifecycle progression while the loop is paused', async () => {
    const user = userEvent.setup()
    const onAdvance = vi.fn()
    render(
      <ActivityExperiments
        changes={[CHANGE]}
        decisions={{ [CHANGE.id]: 'approved' }}
        disabled
        onAdvance={onAdvance}
      />,
    )

    const action = screen.getByRole('button', { name: /complete mock test/i })
    expect(action).toBeDisabled()
    expect(screen.getByText(/resume the loop/i)).toBeInTheDocument()
    await user.click(action)
    expect(onAdvance).not.toHaveBeenCalled()
  })

  it('blocks a running experiment when its agent returns to Shadow mode', async () => {
    const user = userEvent.setup()
    const onAdvance = vi.fn()
    render(
      <ActivityExperiments
        changes={[CHANGE]}
        decisions={{ [CHANGE.id]: 'approved' }}
        getDisabledReason={() => `${CHANGE.agentName} is in Shadow mode.`}
        onAdvance={onAdvance}
      />,
    )

    const action = screen.getByRole('button', { name: /complete mock test/i })
    expect(action).toBeDisabled()
    expect(screen.getByText(/Shadow mode/i)).toBeInTheDocument()
    await user.click(action)
    expect(onAdvance).not.toHaveBeenCalled()
  })
})
