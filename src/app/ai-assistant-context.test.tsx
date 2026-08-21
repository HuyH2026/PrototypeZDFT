import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider, useAiAssistant } from './ai-assistant-context'

function Probe() {
  const a = useAiAssistant()
  return (
    <div>
      <span data-testid="state">{`${a.isOpen}|${a.mode}|${a.context.scope}`}</span>
      <span data-testid="prompt">{a.context.prompt ?? ''}</span>
      <span data-testid="conversation-title">{a.context.conversation?.title ?? ''}</span>
      <button onClick={() => a.open('brand-setup')}>open-setup</button>
      <button onClick={() => a.open()}>open-default</button>
      <button onClick={() => a.open(undefined, 'full')}>open-full</button>
      <button onClick={() => a.toggle('manage-agents')}>toggle-list</button>
      <button onClick={() => a.expand()}>expand</button>
      <button onClick={() => a.collapse()}>collapse</button>
      <button onClick={() => a.close()}>close</button>
      <button onClick={() => a.open('ai-performance-reopens', 'full', { prompt: 'Seeded summary text' })}>
        open-seeded
      </button>
      <button
        onClick={() =>
          a.open('ai-performance-reopens', 'full', {
            prompt: 'Seeded summary text',
            conversation: {
              title: 'Tickets reopened',
              messages: [{ id: 'seed-assistant', role: 'assistant', text: 'Reopens are up.' }],
            },
          })
        }
      >
        open-seeded-conversation
      </button>
    </div>
  )
}

function setup() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AiAssistantProvider>
        <Probe />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
  return screen.getByTestId('state')
}

describe('useAiAssistant', () => {
  it('starts closed with the default context', () => {
    const state = setup()
    expect(state).toHaveTextContent('false|panel|default')
  })

  it('open(scope) opens in panel mode with that context', async () => {
    const state = setup()
    await userEvent.click(screen.getByText('open-setup'))
    expect(state).toHaveTextContent('true|panel|brand-setup')
  })

  it('open while open replaces the context instead of closing', async () => {
    const state = setup()
    await userEvent.click(screen.getByText('open-setup'))
    await userEvent.click(screen.getByText('open-default'))
    expect(state).toHaveTextContent('true|panel|home')
  })

  it('toggle opens then closes', async () => {
    const state = setup()
    await userEvent.click(screen.getByText('toggle-list'))
    expect(state).toHaveTextContent('true|panel|manage-agents')
    await userEvent.click(screen.getByText('toggle-list'))
    expect(state).toHaveTextContent('false|panel')
  })

  it('expand switches mode; collapse and close reset it', async () => {
    const state = setup()
    await userEvent.click(screen.getByText('open-setup'))
    await userEvent.click(screen.getByText('expand'))
    expect(state).toHaveTextContent('true|full|brand-setup')
    await userEvent.click(screen.getByText('collapse'))
    expect(state).toHaveTextContent('true|panel|brand-setup')
    await userEvent.click(screen.getByText('expand'))
    await userEvent.click(screen.getByText('close'))
    expect(state).toHaveTextContent('false|panel')
  })

  it('open(scope, "full") opens directly in full mode', async () => {
    const state = setup()
    await userEvent.click(screen.getByText('open-full'))
    expect(state).toHaveTextContent('true|full|home')
  })

  it('collapse closes entirely when full was opened directly (no panel behind it)', async () => {
    const state = setup()
    await userEvent.click(screen.getByText('open-full'))
    await userEvent.click(screen.getByText('collapse'))
    expect(state).toHaveTextContent('false|panel')
  })

  it('collapse returns to the panel when full was expanded from a panel', async () => {
    const state = setup()
    await userEvent.click(screen.getByText('open-setup'))
    await userEvent.click(screen.getByText('expand'))
    await userEvent.click(screen.getByText('collapse'))
    expect(state).toHaveTextContent('true|panel|brand-setup')
  })

  it('expand is a no-op while closed', async () => {
    const state = setup()
    await userEvent.click(screen.getByText('expand'))
    expect(state).toHaveTextContent('false|panel|default')
  })

  it('throws when used outside the provider', () => {
    function Bare() {
      useAiAssistant()
      return null
    }
    expect(() => render(<Bare />)).toThrow(/AiAssistantProvider/)
  })
})

describe('useAiAssistant keyboard shortcut', () => {
  it('toggles the assistant on Meta+K', async () => {
    const state = setup()
    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(state).toHaveTextContent('true|panel|home')
    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(state).toHaveTextContent('false|panel')
  })

  it('toggles on Control+K too', async () => {
    const state = setup()
    await userEvent.keyboard('{Control>}k{/Control}')
    expect(state).toHaveTextContent('true|panel|home')
  })

  it('ignores the shortcut while typing in a text input', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AiAssistantProvider>
          <Probe />
          <input aria-label="field" />
        </AiAssistantProvider>
      </MemoryRouter>,
    )
    const state = screen.getAllByTestId('state')[0]
    const field = screen.getByLabelText('field')
    field.focus()
    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(state).toHaveTextContent('false|panel|default')
  })
})

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AiAssistantProvider>
        <Probe />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
  return screen.getByTestId('state')
}

describe('route-derived scope', () => {
  it('open() with no scope primes from the current route', async () => {
    const state = renderAt('/agent-builder/actions')
    await userEvent.click(screen.getByText('open-default')) // calls open() with no scope
    expect(state).toHaveTextContent('true|panel|tools')
  })

  it('⌘K with no scope primes from the current route', async () => {
    const state = renderAt('/insights/automations')
    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(state).toHaveTextContent('true|panel|orchestrator')
  })

  it('an explicit scope still overrides the route', async () => {
    const state = renderAt('/agent-builder/actions')
    await userEvent.click(screen.getByText('open-setup')) // calls open('brand-setup')
    expect(state).toHaveTextContent('true|panel|brand-setup')
  })

  it('unknown route falls back to default', async () => {
    const state = renderAt('/knowledge')
    await userEvent.click(screen.getByText('open-default'))
    expect(state).toHaveTextContent('true|panel|default')
  })

  it('open(scope, "full", seed) seeds context.prompt for that open', async () => {
    setup()
    await userEvent.click(screen.getByText('open-seeded'))
    expect(screen.getByTestId('state')).toHaveTextContent('true|full|ai-performance-reopens')
    expect(screen.getByTestId('prompt')).toHaveTextContent('Seeded summary text')
  })

  it('a later seedless open resets context.prompt to the scope default', async () => {
    setup()
    await userEvent.click(screen.getByText('open-seeded'))
    await userEvent.click(screen.getByText('open-setup')) // open('brand-setup'), no seed
    expect(screen.getByTestId('prompt')).toHaveTextContent(
      'Help me choose the right channels for this brand',
    )
  })
})

describe('open() with a conversation seed', () => {
  it('sets context.conversation when seeded', async () => {
    setup()
    await userEvent.click(screen.getByText('open-seeded-conversation'))
    expect(screen.getByTestId('conversation-title')).toHaveTextContent('Tickets reopened')
  })

  it('a later seedless open clears context.conversation', async () => {
    setup()
    await userEvent.click(screen.getByText('open-seeded-conversation'))
    await userEvent.click(screen.getByText('open-setup')) // open('brand-setup'), no seed
    expect(screen.getByTestId('conversation-title')).toHaveTextContent('')
  })

  it('open(scope, "full", { prompt }) with no conversation leaves it unset', async () => {
    setup()
    await userEvent.click(screen.getByText('open-seeded')) // existing prompt-only trigger
    expect(screen.getByTestId('conversation-title')).toHaveTextContent('')
  })
})
