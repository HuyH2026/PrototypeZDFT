import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatCards } from './StatCards'

describe('StatCards', () => {
  it('renders the Figma summary set without status-pill overlays', () => {
    render(<StatCards />)

    expect(screen.getAllByTestId('stat-card')).toHaveLength(12)
    expect(screen.getByText('Automated resolutions (AR)')).toBeInTheDocument()
    expect(screen.getByText('Escalations')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Needs attention for|Improved for/ })).not.toBeInTheDocument()
  })

  it('removes the per-channel rows in aggregate mode', () => {
    render(<StatCards channelBreakdown={false} />)

    expect(screen.queryByText('300,000')).not.toBeInTheDocument()
    expect(screen.queryByText('100,000')).not.toBeInTheDocument()
  })
})
