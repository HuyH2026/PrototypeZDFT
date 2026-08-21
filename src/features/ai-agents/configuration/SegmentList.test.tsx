import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SegmentList } from './SegmentList'
import { SEED_SEGMENTS } from './config-data'

describe('SegmentList', () => {
  it('renders a "New segment" button and one row per segment label', () => {
    render(<SegmentList segments={SEED_SEGMENTS} selectedId="riders" onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: /new segment/i })).toBeInTheDocument()
    expect(screen.getByText('Riders')).toBeInTheDocument()
    expect(screen.getByText('One members')).toBeInTheDocument()
    expect(screen.getByText('Business riders')).toBeInTheDocument()
  })

  it('lists the short label, not the editable segment name', () => {
    render(<SegmentList segments={SEED_SEGMENTS} selectedId="riders" onSelect={() => {}} />)
    expect(screen.queryByText('Uber One')).not.toBeInTheDocument()
  })

  it('marks the selected row via aria-pressed', () => {
    render(<SegmentList segments={SEED_SEGMENTS} selectedId="riders" onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: 'Riders' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /One members/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('calls onSelect with the segment id when a row is clicked', async () => {
    const onSelect = vi.fn()
    render(<SegmentList segments={SEED_SEGMENTS} selectedId="riders" onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: /One members/ }))
    expect(onSelect).toHaveBeenCalledWith('one-members')
  })
})
