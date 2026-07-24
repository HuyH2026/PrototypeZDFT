import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyField } from './CopyField'

describe('CopyField', () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
  })

  it('copies its value and shows Copied feedback', async () => {
    render(<CopyField value="hello-value" aria-label="Copy hello">code body</CopyField>)
    const btn = screen.getByRole('button', { name: 'Copy hello' })
    await userEvent.click(btn)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello-value')
    expect(await screen.findByText('Copied')).toBeInTheDocument()
  })

  it('renders its children', () => {
    render(<CopyField value="x">the body text</CopyField>)
    expect(screen.getByText('the body text')).toBeInTheDocument()
  })
})
