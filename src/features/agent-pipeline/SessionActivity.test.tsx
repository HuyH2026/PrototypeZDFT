import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FINDINGS } from './cockpit-data'
import { SessionActivity } from './SessionActivity'

describe('SessionActivity', () => {
  it('keeps an applied Outcomes action visible without claiming measurement is complete', () => {
    const finding = FINDINGS[0]
    render(
      <SessionActivity events={[{ finding, state: 'applied', agentNames: ['Password Reset'] }]} />,
    )

    const row = within(screen.getByTestId(`session-activity-${finding.id}`))
    expect(row.getByText('Applied · measuring')).toBeInTheDocument()
    expect(row.getByText(/measurement is still pending/i)).toBeInTheDocument()
    expect(row.getByText(/projected resolution/i)).toBeInTheDocument()
  })

  it('stays out of the Activity view before any Outcomes action occurs', () => {
    const { container } = render(<SessionActivity events={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
