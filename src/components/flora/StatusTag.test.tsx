import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusTag } from './StatusTag'

describe('StatusTag', () => {
  it('renders its label', () => {
    render(<StatusTag state="active">Active</StatusTag>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('pairs a surface with a foreground per state', () => {
    render(<StatusTag state="active" data-testid="t">Active</StatusTag>)
    const el = screen.getByTestId('t')
    expect(el).toHaveAttribute('data-state', 'active')
    expect(el.className).toContain('bg-green-100')
    expect(el.className).toContain('text-green-700')
  })

  it('uses the royal pair for ready', () => {
    render(<StatusTag state="ready" data-testid="t">Ready</StatusTag>)
    const el = screen.getByTestId('t')
    expect(el.className).toContain('bg-royal-100')
    expect(el.className).toContain('text-royal-700')
  })

  it('uses the warm neutral pill for neutral', () => {
    render(<StatusTag state="neutral" data-testid="t">Draft</StatusTag>)
    expect(screen.getByTestId('t').className).toContain('bg-tag-neutral')
  })

  it('shows a dot for most states', () => {
    render(<StatusTag state="attention">Attention</StatusTag>)
    expect(document.querySelector('[data-slot="status-dot"]')).not.toBeNull()
  })

  it('swaps the dot for a spinner while indexing', () => {
    render(<StatusTag state="indexing">Indexing</StatusTag>)
    expect(document.querySelector('[data-slot="status-dot"]')).toBeNull()
    expect(document.querySelector('[data-slot="status-spinner"]')).not.toBeNull()
  })
})
