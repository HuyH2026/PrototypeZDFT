import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResolutionsTimeSeriesCard } from './ResolutionsTimeSeriesCard'
import { DEFAULT_EXPERIMENT_DETAIL } from './results-data'

describe('ResolutionsTimeSeriesCard', () => {
  it('uses the shared chart controls and switches between line and bar views', async () => {
    const user = userEvent.setup()
    render(<ResolutionsTimeSeriesCard series={DEFAULT_EXPERIMENT_DETAIL.resolutionsSeries} />)

    const line = screen.getByRole('button', { name: 'Line view' })
    const bar = screen.getByRole('button', { name: 'Bar view' })

    expect(line).toHaveAttribute('aria-pressed', 'true')
    expect(bar).toHaveAttribute('aria-pressed', 'false')

    await user.click(bar)
    expect(bar).toHaveAttribute('aria-pressed', 'true')
    expect(line).toHaveAttribute('aria-pressed', 'false')
  })
})
