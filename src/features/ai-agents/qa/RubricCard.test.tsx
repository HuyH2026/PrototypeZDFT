import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RubricCard } from './RubricCard'
import { RUBRICS } from './rubrics-data'

const churn = RUBRICS[0]
const tone = RUBRICS.find((r) => r.excludedFromAverage)!

function renderCard(rubric = churn, enabled = true, onToggle = vi.fn(), onOpen?: () => void) {
  render(<RubricCard rubric={rubric} enabled={enabled} onToggle={onToggle} onOpen={onOpen} />)
  return within(screen.getByTestId(`rubric-card-${rubric.id}`))
}

describe('RubricCard', () => {
  it('shows the name, when it was last updated, and its definition', () => {
    const card = renderCard()
    expect(card.getByRole('heading', { name: churn.name })).toBeInTheDocument()
    expect(card.getByText(`Last updated on ${churn.updatedOn}`)).toBeInTheDocument()
    expect(card.getByText(/Analyze the conversation for signals/)).toBeInTheDocument()
  })

  it('stacks the segments it is scoped to below its channels', () => {
    const card = renderCard()
    expect(card.getByText('Widget')).toBeInTheDocument()
    expect(card.getByText('Headless')).toBeInTheDocument()
    expect(card.getByText('Riders')).toBeInTheDocument()
  })

  it('names a segment once even when several channels are scoped to it', () => {
    const card = renderCard({
      ...churn,
      channels: [
        { channel: 'Widget', segments: ['Riders'] },
        { channel: 'Voice', segments: ['Riders', 'Business Riders'] },
      ],
    })
    expect(card.getAllByText('Riders')).toHaveLength(1)
    expect(card.getByText('Business Riders')).toBeInTheDocument()
  })

  it('reports the enabled state through the switch', async () => {
    const onToggle = vi.fn()
    const card = renderCard(churn, true, onToggle)
    const toggle = card.getByRole('switch', { name: `Enable ${churn.name}` })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(card.getByText('On')).toBeInTheDocument()

    await userEvent.click(toggle)
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('reads Off when disabled', () => {
    const card = renderCard(churn, false)
    expect(card.getByRole('switch', { name: `Enable ${churn.name}` })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    expect(card.getByText('Off')).toBeInTheDocument()
  })

  it('badges the one rubric held out of the average', () => {
    expect(
      within(renderCard(tone).getByTestId('excluded-badge')).getByText('Excluded from Avg'),
    ).toBeInTheDocument()
    expect(renderCard().queryByTestId('excluded-badge')).toBeNull()
  })

  it('offers a per-rubric actions menu', () => {
    const card = renderCard()
    expect(card.getByRole('button', { name: `Actions for ${churn.name}` })).toBeInTheDocument()
  })

  it('opens the populated rubric detail from the row', async () => {
    const onOpen = vi.fn()
    const card = renderCard(churn, true, vi.fn(), onOpen)

    await userEvent.click(card.getByRole('button', { name: `Edit ${churn.name}` }))

    expect(onOpen).toHaveBeenCalledOnce()
  })
})
