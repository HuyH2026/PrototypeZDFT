import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RowActionsButton, RowToggle, SegmentChip } from './list-parts'
import { segmentColor } from './segment-colors'

describe('segmentColor', () => {
  it('gives each known segment its swatch', () => {
    expect(segmentColor('Riders')).toBe('#ff70c6')
    expect(segmentColor('Business Riders')).toBe('#85beff')
  })

  // AI QA's frame writes "Business Riders", Knowledge's writes "Business riders".
  // The same segment must get the same swatch either way.
  it('ignores the casing the frames disagree on', () => {
    expect(segmentColor('Business riders')).toBe(segmentColor('Business Riders'))
    expect(segmentColor('riders')).toBe(segmentColor('Riders'))
  })

  it('falls back to a neutral for an unknown segment', () => {
    expect(segmentColor('Airport partners')).toBe('#c9c7c3')
  })
})

describe('SegmentChip', () => {
  it('names the segment', () => {
    render(<SegmentChip label="Riders" />)
    expect(screen.getByText('Riders')).toBeInTheDocument()
  })
})

describe('RowToggle', () => {
  it('reports its state and reads On', async () => {
    const onToggle = vi.fn()
    render(<RowToggle label="Activate Clarification" on onToggle={onToggle} />)

    const toggle = screen.getByRole('switch', { name: 'Activate Clarification' })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('On')).toBeInTheDocument()

    await userEvent.click(toggle)
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('reads Off when off', () => {
    render(<RowToggle label="Activate Clarification" on={false} onToggle={vi.fn()} />)
    expect(screen.getByRole('switch', { name: 'Activate Clarification' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    expect(screen.getByText('Off')).toBeInTheDocument()
  })
})

describe('RowActionsButton', () => {
  it('is labelled for the row it acts on', () => {
    render(<RowActionsButton label="Actions for Clarification" />)
    expect(screen.getByRole('button', { name: 'Actions for Clarification' })).toBeInTheDocument()
  })
})
