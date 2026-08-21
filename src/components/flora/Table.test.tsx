import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Table, Thead, Tbody, Th, Td } from './Table'

function Fixture() {
  return (
    <Table>
      <Thead>
        <tr><Th>Agent</Th><Th>Conversations</Th></tr>
      </Thead>
      <Tbody>
        <tr><Td>Chewie</Td><Td>1,204</Td></tr>
      </Tbody>
    </Table>
  )
}

describe('Table', () => {
  it('renders headers and cells', () => {
    render(<Fixture />)
    expect(screen.getByRole('columnheader', { name: 'Agent' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Chewie' })).toBeInTheDocument()
  })

  it('wraps the table in a 24px shell on the warm header grey', () => {
    render(<Fixture />)
    const wrap = document.querySelector('[data-slot="table-wrap"]')
    expect(wrap).not.toBeNull()
    expect(wrap!.className).toContain('rounded-[24px]')
    expect(wrap!.className).toContain('bg-table-header-bg')
  })

  it('uses the Conversations table spacing by default', () => {
    render(<Fixture />)
    expect(screen.getByRole('columnheader', { name: 'Agent' })).toHaveClass('px-3.5', 'py-3.5')
    expect(screen.getByRole('cell', { name: 'Chewie' })).toHaveClass('px-3.5', 'py-3.5')
  })

  it('keeps thead transparent and tbody flush beneath it', () => {
    render(<Fixture />)
    const thead = document.querySelector('thead')!
    const tbody = document.querySelector('tbody')!
    // The binding rule: the shell's grey shows through the header strip, and
    // the white body starts flush beneath it.
    expect(thead.className).toContain('bg-transparent')
    expect(thead.className).not.toContain('shadow')
    expect(tbody.className).toContain('bg-white')
    expect(tbody.className).not.toContain('shadow')
  })

  it('rounds the outer cells of the first and last body rows', () => {
    render(<Fixture />)
    const tbody = document.querySelector('tbody')!

    expect(tbody).toHaveClass('[&_tr:first-child>td:first-child]:rounded-tl-[24px]')
    expect(tbody).toHaveClass('[&_tr:first-child>td:last-child]:rounded-tr-[24px]')
    expect(tbody).toHaveClass('[&_tr:last-child>td:first-child]:rounded-bl-[24px]')
    expect(tbody).toHaveClass('[&_tr:last-child>td:last-child]:rounded-br-[24px]')
  })

  it('marks rows clickable only when asked', () => {
    const { rerender } = render(<Fixture />)
    expect(document.querySelector('[data-slot="table-wrap"]')!.getAttribute('data-clickable-rows')).toBeNull()
    rerender(
      <Table clickableRows>
        <Tbody><tr><Td>x</Td></tr></Tbody>
      </Table>,
    )
    expect(document.querySelector('[data-slot="table-wrap"]')!).toHaveAttribute('data-clickable-rows', 'true')
  })

  it('applies row hover style on tbody', () => {
    render(<Fixture />)
    const tbody = document.querySelector('tbody')!
    // Row hover lives on tbody so it applies once per row rather than per cell.
    expect(tbody.className).toContain('[&_tr:hover>td]:bg-table-row-hover')
  })
})
