import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider, useAiAssistant } from '@/app/ai-assistant-context'
import { AiTriggerButton } from './AiTriggerButton'

function Harness() {
  const a = useAiAssistant()
  return <span data-testid="state">{`${a.isOpen}|${a.context.scope}`}</span>
}

function setup(props?: Parameters<typeof AiTriggerButton>[0]) {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AiAssistantProvider>
        <AiTriggerButton {...props} />
        <Harness />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
}

describe('AiTriggerButton', () => {
  it('opens the assistant with the given scope on click', async () => {
    setup({ scope: 'brand-setup' })
    const btn = screen.getByRole('button', { name: 'AI assistant' })
    expect(btn).not.toHaveAttribute('aria-pressed')
    await userEvent.click(btn)
    expect(screen.getByTestId('state')).toHaveTextContent('true|brand-setup')
    expect(btn).not.toHaveAttribute('aria-pressed')
  })

  it('opens the route-derived context when no scope is given', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'AI assistant' }))
    expect(screen.getByTestId('state')).toHaveTextContent('true|home')
  })

  it('honors a custom aria-label', () => {
    setup({ label: 'Draft description with AI' })
    expect(screen.getByRole('button', { name: 'Draft description with AI' })).toBeInTheDocument()
  })
})
