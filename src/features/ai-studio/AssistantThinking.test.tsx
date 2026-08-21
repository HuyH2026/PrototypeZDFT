import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssistantThinking } from './AssistantThinking'
import type { ThinkingPace } from './thinking-pace'

// Real timers, tiny values: fake timers deadlock userEvent in this toolchain
// (see the note atop AgentPlanFlow.test), so the block is driven by its own clock
// and observed with findBy*/waitFor.
const FAST: ThinkingPace = { lineMs: 30, tailMs: 30, quietMs: 60, userTurnMs: 30 }
// Slow enough that nothing can advance during a click.
const HELD: ThinkingPace = { lineMs: 5000, tailMs: 5000, quietMs: 5000, userTurnMs: 5000 }

describe('AssistantThinking', () => {
  it('reveals its reasoning one line at a time, then reports itself done', async () => {
    const onDone = vi.fn()
    render(
      <AssistantThinking
        lines={['Read the tickets.', 'Ranked the intents.']}
        pace={FAST}
        onDone={onDone}
      />,
    )

    expect(screen.getByText('Thinking')).toBeInTheDocument()
    expect(screen.queryByText('Read the tickets.')).not.toBeInTheDocument()

    expect(await screen.findByText('Read the tickets.')).toBeInTheDocument()
    expect(await screen.findByText('Ranked the intents.')).toBeInTheDocument()
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1))
  })

  it('thinks for one quiet beat, and lists nothing, when the reply scripts no reasoning', async () => {
    const onDone = vi.fn()
    render(<AssistantThinking lines={[]} pace={FAST} onDone={onDone} />)

    expect(screen.getByText('Thinking')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('skips to the answer when the reader clicks the label', async () => {
    const onDone = vi.fn()
    render(<AssistantThinking lines={['Read the tickets.']} pace={HELD} onDone={onDone} />)

    await userEvent.click(screen.getByRole('button', { name: 'Thinking' }))
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('announces itself so the wait is not silent to assistive tech', () => {
    render(<AssistantThinking lines={[]} pace={HELD} onDone={() => {}} />)
    expect(screen.getByRole('status')).toHaveTextContent('Thinking')
  })
})
