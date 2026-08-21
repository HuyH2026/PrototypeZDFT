import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { BrandProvider } from '@/app/brand-context'
import { AutomationsScreen } from './AutomationsScreen'

function renderScreen() {
  render(
    <MemoryRouter initialEntries={['/insights/automations']}>
      <BrandProvider>
        <AiAssistantProvider>
          <AutomationsScreen />
        </AiAssistantProvider>
      </BrandProvider>
    </MemoryRouter>,
  )
  return within(screen.getByTestId('screen-automations'))
}

describe('AutomationsScreen', () => {
  it('names the three gap views as tabs', () => {
    const view = renderScreen()
    expect(view.getByRole('heading', { name: 'Automation opportunities' })).toBeInTheDocument()
    expect(view.queryByRole('button', { name: 'Automation opportunities' })).not.toBeInTheDocument()
    expect(view.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Use case gaps',
      'Knowledge gaps',
      'Realized impact',
    ])
  })

  it('opens on Use case gaps', () => {
    const view = renderScreen()
    expect(view.getByTestId('view-use-case-gaps')).toBeInTheDocument()
    expect(view.getByText('6,908')).toBeInTheDocument()
    expect(view.getByRole('tab', { name: 'Use case gaps' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('switches among every Figma view', async () => {
    const user = userEvent.setup()
    const view = renderScreen()
    await user.click(view.getByRole('tab', { name: 'Knowledge gaps' }))
    expect(view.getByText('29,090')).toBeInTheDocument()
    await user.click(view.getByRole('tab', { name: 'Use case gaps' }))
    expect(view.getByText('6,908')).toBeInTheDocument()
    await user.click(view.getByRole('tab', { name: 'Realized impact' }))
    expect(view.getByText('Card ETA')).toBeInTheDocument()
  })

  it('closes Create Use case when leaving Use case gaps', async () => {
    const user = userEvent.setup()
    const view = renderScreen()

    await user.click(view.getByRole('tab', { name: 'Use case gaps' }))
    await user.click(view.getByText('Refund Request'))
    expect(screen.getByRole('dialog', { name: 'Create use case' })).toBeInTheDocument()

    await user.click(view.getByRole('tab', { name: 'Knowledge gaps' }))
    await user.click(view.getByRole('tab', { name: 'Use case gaps' }))
    expect(screen.queryByRole('dialog', { name: 'Create use case' })).not.toBeInTheDocument()
  })
})
