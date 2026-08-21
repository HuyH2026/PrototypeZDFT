import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PreviewSettingsPanel } from './PreviewSettingsPanel'
import { SEED_EXCHANGE, respondAsUseCase, respondTo } from './preview-data'

function renderPanel(props: Partial<Parameters<typeof PreviewSettingsPanel>[0]> = {}) {
  const onLanguageChange = vi.fn()
  const onSegmentChange = vi.fn()
  render(
    <PreviewSettingsPanel
      exchanges={[SEED_EXCHANGE]}
      language="English"
      segment="All segments"
      onLanguageChange={onLanguageChange}
      onSegmentChange={onSegmentChange}
      {...props}
    />,
  )
  return { onLanguageChange, onSegmentChange }
}

describe('PreviewSettingsPanel', () => {
  it('heads the panel and says what traffic is being previewed', () => {
    renderPanel()
    expect(screen.getByText('Preview settings')).toBeInTheDocument()
    expect(screen.getByText('Currently previewing all “Live” traffic.')).toBeInTheDocument()
  })

  it('offers the two designed actions', () => {
    renderPanel()
    expect(screen.getByRole('button', { name: 'Select custom filters' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fill in Pre-defined context' })).toBeInTheDocument()
  })

  it('prints the conversation id and the selected language in the run card', () => {
    renderPanel({ language: 'Français' })
    const card = screen.getByTestId('preview-run-card')
    expect(within(card).getByText('5471e2cb-0347-41d6-85de-4ff6461f1642')).toBeInTheDocument()
    expect(within(card).getByText('Français')).toBeInTheDocument()
  })

  it('reports the language change to its owner', async () => {
    const { onLanguageChange } = renderPanel()
    await userEvent.selectOptions(screen.getByLabelText('Language'), 'Español')
    expect(onLanguageChange).toHaveBeenCalledWith('Español')
  })

  it('reports the segment change to its owner', async () => {
    const { onSegmentChange } = renderPanel()
    await userEvent.selectOptions(screen.getByLabelText('Segment'), 'Drivers')
    expect(onSegmentChange).toHaveBeenCalledWith('Drivers')
  })

  it('traces the detected use case, its state, confidence, and policy', () => {
    renderPanel()
    expect(screen.getByText('Update profile')).toBeInTheDocument()
    expect(screen.getByText('(Live)')).toBeInTheDocument()
    expect(screen.getByText('[Confidence score: High]')).toBeInTheDocument()
    expect(
      screen.getByText('Ask the customer for more details about what they want to update.'),
    ).toBeInTheDocument()
  })

  it('traces the conversation history for the exchange', () => {
    renderPanel()
    const trace = screen.getByTestId('preview-trace-card-0')
    expect(
      within(trace).getByText('Can you help me update the billing address on my account?'),
    ).toBeInTheDocument()
    expect(
      within(trace).getByText(
        'Thanks for reaching out! I can help you update the billing address on your account.',
      ),
    ).toBeInTheDocument()
  })

  it('reports an untriggered exchange as not having fired', () => {
    const missed = respondAsUseCase('what is the weather in Oslo', {
      name: 'Service cancellation',
      live: true,
      policyText: 'Offer 30 days free.',
      triggerPhrases: [],
      segmentScope: 'all segments',
    })
    renderPanel({ exchanges: [missed] })
    const trace = screen.getByTestId('preview-trace-card-0')
    expect(within(trace).getByText('Service cancellation')).toBeInTheDocument()
    expect(within(trace).getByText(/did not trigger/i)).toBeInTheDocument()
    expect(within(trace).getByText('[Confidence score: Low]')).toBeInTheDocument()
  })

  it('names the use case in the caption when the run is scoped to one', () => {
    renderPanel({ useCaseName: 'Service cancellation', useCaseScope: 'all segments' })
    expect(
      screen.getByText('Currently previewing the “Service cancellation” use case, all segments.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/all “Live” traffic/)).not.toBeInTheDocument()
  })

  it('hides the segment dropdown on a scoped run, which owns its own scope', () => {
    renderPanel({ useCaseName: 'Service cancellation', useCaseScope: 'all segments' })
    expect(screen.queryByLabelText('Segment')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Language')).toBeInTheDocument()
  })

  it('grows a trace card per exchange', () => {
    renderPanel({ exchanges: [SEED_EXCHANGE, respondTo('I forgot my password')] })
    expect(screen.getByTestId('preview-trace-card-0')).toBeInTheDocument()
    const second = screen.getByTestId('preview-trace-card-1')
    expect(within(second).getByText('Password Reset')).toBeInTheDocument()
    expect(within(second).getByText('I forgot my password')).toBeInTheDocument()
  })
})
