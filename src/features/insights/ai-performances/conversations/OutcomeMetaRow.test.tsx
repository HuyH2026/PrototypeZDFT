import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OutcomeMetaRow } from './OutcomeMetaRow'
import { OUTCOME_TERM_META } from './outcome-model'

describe('OutcomeMetaRow', () => {
  it('renders nothing when its term is not in the contracted model', () => {
    const { container } = render(<OutcomeMetaRow term="deflection" value="Yes" model={['resolution']} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the label and value when its term is contracted', () => {
    render(<OutcomeMetaRow term="deflection" value="Yes" model={['deflection']} />)
    expect(screen.getByRole('button', { name: /Deflected/ })).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
  })

  it("shows the term's plain-language definition and a help-center link in the tooltip", () => {
    render(<OutcomeMetaRow term="resolution" value="Verified" model={['resolution']} />)
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(OUTCOME_TERM_META.resolution.definition)
    const link = screen.getByRole('link', { name: 'Learn more' })
    expect(link).toHaveAttribute('href', OUTCOME_TERM_META.resolution.helpHref)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
  })

  it('ties the tooltip to its trigger via aria-describedby', () => {
    render(<OutcomeMetaRow term="deflection" value="Yes" model={['deflection']} />)
    const trigger = screen.getByRole('button', { name: /Deflected/ })
    const tooltip = screen.getByRole('tooltip')
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id)
  })
})
