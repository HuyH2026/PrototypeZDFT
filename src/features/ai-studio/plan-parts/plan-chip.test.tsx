import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PLAN_CHIP_STYLE, PlanChipView, type PlanChipKey } from './plan-chip'

const KEYS: PlanChipKey[] = [
  'needs-approval',
  'reviewed',
  'updated',
  'estimated',
  'critical',
  'tracking',
  'active-check-ins',
  'auto-applied',
]

describe('plan-chip', () => {
  it('styles every chip key with a label and a colour pair', () => {
    for (const key of KEYS) {
      const style = PLAN_CHIP_STYLE[key]
      expect(style.label.length).toBeGreaterThan(0)
      expect(style.fg).toMatch(/^#[0-9a-f]{6}$/)
      expect(style.bg).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  // The three tints the self-improving panel adds, transcribed from its frames.
  it('carries the self-improving tints', () => {
    expect(PLAN_CHIP_STYLE.critical).toEqual({ label: 'Critical', fg: '#831c0a', bg: '#f9cec6' })
    expect(PLAN_CHIP_STYLE.tracking).toEqual({ label: 'Tracking', fg: '#1b5996', bg: '#d8ecff' })
    expect(PLAN_CHIP_STYLE['active-check-ins']).toEqual({
      label: 'Active check-ins',
      fg: '#724be8',
      bg: '#e2d9ff',
    })
  })

  // Reused rather than duplicated: the frames give Auto-applied the same pair the
  // create-agent panel already uses for Reviewed.
  it('gives Auto-applied the same green pair as Reviewed', () => {
    expect(PLAN_CHIP_STYLE['auto-applied'].fg).toBe(PLAN_CHIP_STYLE.reviewed.fg)
    expect(PLAN_CHIP_STYLE['auto-applied'].bg).toBe(PLAN_CHIP_STYLE.reviewed.bg)
    expect(PLAN_CHIP_STYLE['auto-applied'].label).toBe('Auto-applied')
  })

  it('renders the chip label', () => {
    render(<PlanChipView chip="needs-approval" />)
    expect(screen.getByText('Needs approval')).toBeInTheDocument()
  })
})
