import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { AiTriggerButton } from './AiTriggerButton'
import { AiAssistantHost } from './AiAssistantHost'

describe('default (topics) assistant body', () => {
  it('shows the quick-wins greeting when opened globally', async () => {
    render(
      <MemoryRouter initialEntries={['/knowledge']}>
        <AiAssistantProvider>
          <AiTriggerButton label="open" />
          <AiAssistantHost />
        </AiAssistantProvider>
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'open' }))
    expect(screen.getByText(/quick wins you can knock out today/i)).toBeInTheDocument()
  })

  it('navigates the suggestion carousel with prev/next wrapping', async () => {
    render(
      <MemoryRouter initialEntries={['/knowledge']}>
        <AiAssistantProvider>
          <AiTriggerButton label="open" />
          <AiAssistantHost />
        </AiAssistantProvider>
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'open' }))
    // Starts at 1 of 3
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
    // Next → 2
    await userEvent.click(screen.getByLabelText('Next suggestion'))
    expect(screen.getByText('2 of 3')).toBeInTheDocument()
    // Next → 3
    await userEvent.click(screen.getByLabelText('Next suggestion'))
    expect(screen.getByText('3 of 3')).toBeInTheDocument()
    // Next wraps → 1
    await userEvent.click(screen.getByLabelText('Next suggestion'))
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
    // Prev wraps → 3
    await userEvent.click(screen.getByLabelText('Previous suggestion'))
    expect(screen.getByText('3 of 3')).toBeInTheDocument()
  })
})
