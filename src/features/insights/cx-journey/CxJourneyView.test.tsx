import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { BrandProvider } from '@/app/brand-context'
import { CxJourneyView } from './CxJourneyView'

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/insights/topics']}>
      <BrandProvider>
        <AiAssistantProvider>
          <CxJourneyView />
        </AiAssistantProvider>
      </BrandProvider>
    </MemoryRouter>,
  )
}

describe('CxJourneyView', () => {
  // The screen is the Insights ▸ Topics destination, so its heading names that
  // page rather than the component's own history.
  it('is headed "Topics", matching its subnav entry', () => {
    renderScreen()
    const view = within(screen.getByTestId('view-cx-journey'))
    expect(view.getByRole('heading', { name: 'Topics' })).toBeInTheDocument()
    expect(view.queryByRole('heading', { name: 'CX Journey' })).not.toBeInTheDocument()
  })

  it('opens the Topics dashboard directly without a nested tab switcher', () => {
    renderScreen()
    const view = within(screen.getByTestId('view-cx-journey'))
    expect(view.queryByRole('tablist', { name: 'Topic analysis views' })).not.toBeInTheDocument()
    expect(view.getByText('Top movers & recommendations')).toBeInTheDocument()
    expect(view.getByText('Overview')).toBeInTheDocument()
  })

  it('does not render the retired conversation overview on the Topics route', () => {
    renderScreen()
    const view = within(screen.getByTestId('view-cx-journey'))
    expect(view.queryByText('Total conversations (AI + Human)')).not.toBeInTheDocument()
    expect(view.queryByText('Agent efficiency & CSAT')).not.toBeInTheDocument()
    expect(view.queryByText('Trends (AI + Human)')).not.toBeInTheDocument()
  })

  it('does not duplicate the Automations destination', () => {
    renderScreen()
    const view = within(screen.getByTestId('view-cx-journey'))
    expect(view.queryByRole('tab', { name: 'Automation' })).not.toBeInTheDocument()
    expect(view.queryByText('Reactivate account')).not.toBeInTheDocument()
  })
})
