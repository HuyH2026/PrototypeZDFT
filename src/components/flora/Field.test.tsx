import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Field, TextArea } from './Field'

describe('Field', () => {
  it('renders an input that accepts typing', async () => {
    render(<Field aria-label="Agent name" />)
    const input = screen.getByLabelText('Agent name')
    await userEvent.type(input, 'Chewie')
    expect(input).toHaveValue('Chewie')
  })

  it('uses the hairline border and soft lift, not a hard outline', () => {
    render(<Field aria-label="n" />)
    const el = screen.getByLabelText('n')
    expect(el.className).toContain('border-field-border')
    expect(el.className).toContain('shadow-field')
    expect(el.className).toContain('rounded-field')
  })

  it('renders a textarea', async () => {
    render(<TextArea aria-label="Instructions" />)
    const el = screen.getByLabelText('Instructions')
    await userEvent.type(el, 'Be brief')
    expect(el).toHaveValue('Be brief')
  })
})
