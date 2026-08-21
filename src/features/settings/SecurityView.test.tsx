import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { SecurityView } from './SecurityView'
import { REDACTION_AREAS, REDACTION_INTRO } from './security-data'

function renderView() {
  render(
    <MemoryRouter initialEntries={['/settings/security']}>
      <AiAssistantProvider>
        <SecurityView />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
  return within(screen.getByTestId('screen-security'))
}

describe('SecurityView', () => {
  it('titles the screen and its one section', () => {
    const view = renderView()
    expect(view.getByRole('heading', { level: 1, name: 'Security' })).toBeInTheDocument()
    expect(view.getByRole('heading', { level: 2, name: 'Data Redaction' })).toBeInTheDocument()
  })

  it('labels both columns of the redaction list', () => {
    const view = renderView()
    expect(view.getByText('Redaction')).toBeInTheDocument()
    expect(view.getByText('Area of redaction')).toBeInTheDocument()
  })

  it('lists every redaction area with its state and description', () => {
    const view = renderView()
    expect(view.getAllByTestId(/^redaction-row-/)).toHaveLength(REDACTION_AREAS.length)

    REDACTION_AREAS.forEach((area) => {
      const row = view.getByTestId(`redaction-row-${area.id}`)
      expect(within(row).getByText(area.name)).toBeInTheDocument()
      expect(within(row).getByText(area.state)).toBeInTheDocument()
      expect(within(row).getByText(area.description)).toBeInTheDocument()
    })
  })

  it('keeps the areas in the design’s order', () => {
    const view = renderView()
    const ids = view.getAllByTestId(/^redaction-row-/).map((el) => el.getAttribute('data-testid'))
    expect(ids).toEqual(REDACTION_AREAS.map((a) => `redaction-row-${a.id}`))
  })

  // The states are read-only in the design; a switch here would be invented UI.
  it('offers no control to change a redaction state', () => {
    const view = renderView()
    expect(view.queryByRole('switch')).toBeNull()
    expect(view.queryByRole('checkbox')).toBeNull()
  })

  it('links the trust site from the intro copy', () => {
    const view = renderView()
    const link = view.getByRole('link', { name: REDACTION_INTRO.linkLabel })
    expect(link).toHaveAttribute('href', REDACTION_INTRO.linkHref)
  })

  it('shows the support addresses as plain copy, not links', () => {
    const view = renderView()
    expect(
      view.getByText(/support@forethought\.ai and security@forethought\.ai/),
    ).toBeInTheDocument()
    expect(view.getAllByRole('link')).toHaveLength(1)
  })
})
