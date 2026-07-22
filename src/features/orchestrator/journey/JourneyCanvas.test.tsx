// src/features/orchestrator/journey/JourneyCanvas.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { JourneyCanvas } from './JourneyCanvas'

describe('JourneyCanvas', () => {
  beforeEach(() => {
    try { window.localStorage?.clear() } catch { /* no localStorage */ }
  })

  it('renders the seeded nodes for a1 (Start event + an action description)', () => {
    render(<JourneyCanvas automationId="a1" />)
    expect(screen.getByText('On Event: Cart abandoned')).toBeInTheDocument()
    expect(screen.getByText('Call customers with abandoned carts')).toBeInTheDocument()
  })

  it('renders the node palette and can close it', () => {
    render(<JourneyCanvas automationId="a1" />)
    expect(screen.getByText('Nodes')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Close node palette'))
    expect(screen.queryByText('Nodes')).toBeNull()
  })

  it('can reopen the palette after closing', () => {
    render(<JourneyCanvas automationId="a1" />)
    fireEvent.click(screen.getByLabelText('Close node palette'))
    fireEvent.click(screen.getByLabelText('Open node palette'))
    expect(screen.getByText('Nodes')).toBeInTheDocument()
  })
})
