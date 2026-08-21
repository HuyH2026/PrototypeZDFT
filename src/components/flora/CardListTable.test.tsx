import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CardListTable, CardListTableBody, CardListTableHeader } from './CardListTable'

function Fixture() {
  return (
    <CardListTable aria-label="Knowledge rules">
      <CardListTableHeader>Header</CardListTableHeader>
      <CardListTableBody>Body</CardListTableBody>
    </CardListTable>
  )
}

describe('CardListTable', () => {
  it('rounds the white body into the warm header shell', () => {
    render(<Fixture />)

    const body = screen.getByTestId('card-list-table-body')
    expect(body).toHaveClass('rounded-t-[24px]', 'overflow-hidden')
  })
})
