import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders a button with its label', () => {
    render(<Button>Create AI agent</Button>)
    expect(screen.getByRole('button', { name: 'Create AI agent' })).toBeInTheDocument()
  })

  it('defaults to the outline variant at medium size', () => {
    render(<Button>x</Button>)
    const el = screen.getByRole('button')
    expect(el).toHaveAttribute('data-variant', 'outline')
    expect(el.className).toContain('min-h-10')
  })

  it('uses the dark neutral for primary, not blue', () => {
    render(<Button variant="primary">x</Button>)
    const el = screen.getByRole('button')
    expect(el).toHaveAttribute('data-variant', 'primary')
    expect(el.className).toContain('bg-flora-fg')
  })

  it('is a pill at every size', () => {
    const { rerender } = render(<Button size="sm">x</Button>)
    expect(screen.getByRole('button').className).toContain('rounded-full')
    expect(screen.getByRole('button').className).toContain('min-h-8')
    rerender(<Button size="lg">x</Button>)
    expect(screen.getByRole('button').className).toContain('rounded-full')
    expect(screen.getByRole('button').className).toContain('min-h-12')
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>x</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire when disabled', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>x</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('preserves all three hover/active color classes for primary variant', () => {
    render(<Button variant="primary">x</Button>)
    const el = screen.getByRole('button')
    expect(el.className).toContain('bg-flora-fg')
    expect(el.className).toContain('hover:bg-[#1a1c1b]')
    expect(el.className).toContain('active:bg-[#0d0e0d]')
  })
})
