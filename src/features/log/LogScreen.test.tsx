import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { BrandProvider } from '@/app/brand-context'
import { LogScreen } from './LogScreen'
import { AUDIT_ENTRIES, ERROR_ENTRIES, API_ERROR_ENTRIES } from './log-data'

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/log']}>
      <BrandProvider>
        <AiAssistantProvider>
          <LogScreen />
        </AiAssistantProvider>
      </BrandProvider>
    </MemoryRouter>,
  )
}

describe('LogScreen', () => {
  it('renders the Logs title and the Change Logs tab by default', () => {
    renderScreen()
    const el = screen.getByTestId('screen-log')
    expect(within(el).getByRole('heading', { name: 'Logs' })).toBeInTheDocument()
    expect(within(el).getByRole('tab', { name: 'Change Logs' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(within(el).getByRole('table', { name: 'Change log' })).toBeInTheDocument()
    expect(
      within(el).getByText('See the history of changes made within this account.'),
    ).toBeInTheDocument()
    expect(within(el).getByText('User email')).toBeInTheDocument()
  })

  it('switches to Error Logs and shows the revised overview and table', async () => {
    const user = userEvent.setup()
    renderScreen()
    const el = screen.getByTestId('screen-log')
    await user.click(within(el).getByRole('tab', { name: 'Error Logs' }))
    expect(within(el).getByRole('tab', { name: 'Error Logs' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(within(el).queryByText('User email')).toBeNull()
    expect(within(el).getByText('Errors overview')).toBeInTheDocument()
    expect(within(el).getByText('5,492')).toBeInTheDocument()
    expect(within(el).getByText('Error type')).toBeInTheDocument()
    expect(within(el).getByText('User Impact')).toBeInTheDocument()
    expect(within(el).getByRole('table', { name: 'Error log' })).toBeInTheDocument()
  })

  it('renders every audit row by default', () => {
    renderScreen()
    const el = screen.getByTestId('screen-log')
    for (const entry of AUDIT_ENTRIES) {
      expect(within(el).getByTestId(`audit-row-${entry.id}`)).toBeInTheDocument()
    }
  })

  it('renders every error row with a severity badge after switching to Error Logs', async () => {
    const user = userEvent.setup()
    renderScreen()
    const el = screen.getByTestId('screen-log')
    await user.click(within(el).getByRole('tab', { name: 'Error Logs' }))
    for (const entry of ERROR_ENTRIES) {
      const row = within(el).getByTestId(`error-row-${entry.id}`)
      expect(row).toBeInTheDocument()
      // the severity badge label renders inside its row
      expect(within(row).getByText(entry.severity)).toBeInTheDocument()
    }
  })

  it('switches to API errors and shows the API error table', async () => {
    const user = userEvent.setup()
    renderScreen()
    const el = screen.getByTestId('screen-log')
    await user.click(within(el).getByRole('tab', { name: 'API errors' }))
    expect(within(el).getByRole('tab', { name: 'API errors' })).toHaveAttribute('aria-selected', 'true')
    expect(within(el).getByRole('table', { name: 'API error log' })).toBeInTheDocument()
    for (const entry of API_ERROR_ENTRIES) {
      expect(within(el).getByTestId(`api-error-row-${entry.id}`)).toBeInTheDocument()
    }
  })

  it('opens the Conversation Details drawer from an Error Logs row', async () => {
    const user = userEvent.setup()
    renderScreen()
    const el = screen.getByTestId('screen-log')
    await user.click(within(el).getByRole('tab', { name: 'Error Logs' }))
    await user.click(within(el).getByTestId('error-row-e1'))
    const dialog = screen.getByRole('dialog', { name: 'Conversation Details' })
    // The drawer preserves the conversation the log row points at.
    expect(within(dialog).getByTestId('conversation-identity')).toHaveTextContent(
      '3e732807-c2d0-4ce3-8b5e-c87c28abb701',
    )
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Conversation Details' })).not.toBeInTheDocument()
  })

  it('opens the Conversation Details drawer from an API errors row', async () => {
    const user = userEvent.setup()
    renderScreen()
    const el = screen.getByTestId('screen-log')
    await user.click(within(el).getByRole('tab', { name: 'API errors' }))
    await user.click(within(el).getByTestId('api-error-row-ae2'))
    const dialog = screen.getByRole('dialog', { name: 'Conversation Details' })
    expect(within(dialog).getByTestId('conversation-identity')).toHaveTextContent(
      '3e732807-c2d0-4ce3-8b5e-c87c28abb704',
    )
  })
})
