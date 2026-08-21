import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SlashMenu } from './SlashMenu'

const position = { left: 0, top: 0 }

describe('SlashMenu', () => {
  it('lists the Suggested and Components sections from the design', () => {
    render(<SlashMenu position={position} onChoose={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByRole('menu', { name: 'Insert into policy' })).toBeInTheDocument()
    expect(screen.getByText('Suggested')).toBeInTheDocument()
    expect(screen.getByText('Components')).toBeInTheDocument()
    ;['Action', 'Context variable', 'Agent', 'Article', 'Event', 'Classic Block (TBD)'].forEach(
      (label) => expect(screen.getByRole('menuitem', { name: label })).toBeInTheDocument(),
    )
    expect(screen.getAllByRole('menuitem', { name: 'Reroute' })).toHaveLength(2)
  })

  it('calls onChoose with the picked item', async () => {
    const onChoose = vi.fn()
    render(<SlashMenu position={position} onChoose={onChoose} onClose={vi.fn()} />)

    await userEvent.click(screen.getByRole('menuitem', { name: 'Action' }))
    expect(onChoose).toHaveBeenCalledWith(expect.objectContaining({ id: 'action', variant: 'action' }))
  })

  it('disables Classic Block, marked "(TBD)" in the design itself', async () => {
    const onChoose = vi.fn()
    render(<SlashMenu position={position} onChoose={onChoose} onClose={vi.fn()} />)

    const row = screen.getByRole('menuitem', { name: 'Classic Block (TBD)' })
    expect(row).toBeDisabled()
    await userEvent.click(row)
    expect(onChoose).not.toHaveBeenCalled()
  })

  it('closes on Escape', async () => {
    const onClose = vi.fn()
    render(<SlashMenu position={position} onChoose={vi.fn()} onClose={onClose} />)

    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on a click outside the menu', async () => {
    const onClose = vi.fn()
    render(
      <div>
        <button type="button">Elsewhere</button>
        <SlashMenu position={position} onChoose={vi.fn()} onClose={onClose} />
      </div>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not steal focus from the caret that opened it', () => {
    render(<SlashMenu position={position} onChoose={vi.fn()} onClose={vi.fn()} />)

    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    const prevented = !screen.getByRole('menu').dispatchEvent(event)
    expect(prevented).toBe(true)
  })
})
