import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>Agent health</Card>)
    expect(screen.getByText('Agent health')).toBeInTheDocument()
  })

  it('is glass by default', () => {
    render(<Card data-testid="c">x</Card>)
    const el = screen.getByTestId('c')
    expect(el).not.toHaveAttribute('data-flat')
    // jsdom cannot evaluate backdrop-filter; assert the class contract instead.
    expect(el.className).toContain('backdrop-blur-[16px]')
  })

  it('drops the wash when flat', () => {
    render(<Card flat data-testid="c">x</Card>)
    const el = screen.getByTestId('c')
    expect(el).toHaveAttribute('data-flat', 'true')
    expect(el.className).toContain('bg-white')
    expect(el.className).not.toContain('backdrop-blur-[16px]')
  })

  it('merges a caller className', () => {
    render(<Card className="p-8" data-testid="c">x</Card>)
    expect(screen.getByTestId('c').className).toContain('p-8')
  })

  it('preserves both bg-transparent and the sheen gradient', () => {
    render(<Card data-testid="c">x</Card>)
    const el = screen.getByTestId('c')
    // The sheen is a background-image; bg-transparent is background-color.
    // If tailwind-merge wrongly treats them as conflicting, one drops.
    expect(el.className).toContain('bg-transparent')
    expect(el.className).toContain('bg-[image:var(--glass-card-sheen)]')
  })

  it('forwards its ref to the rendered card surface', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Card ref={ref}>Draggable card</Card>)

    expect(ref.current).toBe(screen.getByText('Draggable card'))
  })
})
