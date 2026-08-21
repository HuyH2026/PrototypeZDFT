import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoiceSettingsPanel } from './VoiceSettingsPanel'
import { VOICE_CALL, VOICE_NUMBERS } from './voice-call'
import type { PreviewUseCase } from './preview-data'

function renderPanel(props: Partial<Parameters<typeof VoiceSettingsPanel>[0]> = {}) {
  const onNumberChange = vi.fn()
  render(
    <VoiceSettingsPanel
      played={VOICE_CALL}
      number={VOICE_NUMBERS[0]}
      onNumberChange={onNumberChange}
      {...props}
    />,
  )
  return { onNumberChange }
}

const cancellation: PreviewUseCase = {
  name: 'Service cancellation',
  live: true,
  policyText: 'Offer 30 days free before cancelling.',
  triggerPhrases: [],
  segmentScope: 'all segments',
}

describe('VoiceSettingsPanel', () => {
  it('keeps the shared panel furniture', () => {
    renderPanel()
    expect(screen.getByText('Preview settings')).toBeInTheDocument()
    expect(screen.getByText('Currently previewing all “Live” traffic.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select custom filters' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fill in Pre-defined context' })).toBeInTheDocument()
  })

  it('picks a number instead of a language and a segment', () => {
    renderPanel()
    expect(screen.getByLabelText('Phone number')).toHaveValue(VOICE_NUMBERS[0])
    // The number carries its language, so neither of the Widget's two controls
    // belongs here.
    expect(screen.queryByLabelText('Language')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Segment')).not.toBeInTheDocument()
  })

  it('reports a number change to its owner', async () => {
    const { onNumberChange } = renderPanel()
    await userEvent.selectOptions(screen.getByLabelText('Phone number'), VOICE_NUMBERS[2])
    expect(onNumberChange).toHaveBeenCalledWith(VOICE_NUMBERS[2])
  })

  it('names a non-default number in the scope caption', () => {
    renderPanel({ number: VOICE_NUMBERS[2] })
    expect(
      screen.getByText(`Currently previewing all “Live” traffic for ${VOICE_NUMBERS[2]}.`),
    ).toBeInTheDocument()
  })

  it('prints the conversation id and no language line — the number carries it', () => {
    renderPanel()
    const card = screen.getByTestId('preview-run-card')
    expect(within(card).getByText('5471e2cb-0347-41d6-85de-4ff6461f1642')).toBeInTheDocument()
    expect(within(card).queryByText(/Language:/)).not.toBeInTheDocument()
  })

  it('interleaves the call transcript with the trace', () => {
    renderPanel()
    const transcript = screen.getByTestId('preview-voice-transcript')
    expect(
      within(transcript).getByText(
        'This call may be recorded for quality assurance and training purposes.',
      ),
    ).toBeInTheDocument()
    expect(within(transcript).getByText('Update my account information.')).toBeInTheDocument()
    expect(
      within(transcript).getByText(/Alright, I’m pulling up your information now/),
    ).toBeInTheDocument()
  })

  it('traces the detection only — the transcript is right beside it', () => {
    renderPanel()
    const trace = screen.getByTestId('preview-trace-card-0')
    expect(within(trace).getByText('Update profile')).toBeInTheDocument()
    expect(within(trace).getByText('(Live)')).toBeInTheDocument()
    expect(within(trace).getByText('[Confidence score: High]')).toBeInTheDocument()
    // Repeating the utterances under the bubbles that already say them would be
    // noise; so would a policy the caller never sees.
    expect(within(trace).queryByText(/Policy Description/)).not.toBeInTheDocument()
    expect(within(trace).queryByText(/Conversation History/)).not.toBeInTheDocument()
  })

  it('traces one detection, not one per caller turn', () => {
    renderPanel()
    expect(screen.getByTestId('preview-trace-card-0')).toBeInTheDocument()
    expect(screen.queryByTestId('preview-trace-card-1')).not.toBeInTheDocument()
  })

  it('shows nothing but the run card before the call starts', () => {
    renderPanel({ played: [] })
    expect(screen.getByTestId('preview-run-card')).toBeInTheDocument()
    expect(screen.queryByTestId('preview-trace-card-0')).not.toBeInTheDocument()
    expect(screen.getByTestId('preview-voice-transcript')).toBeEmptyDOMElement()
  })

  it('grows as the call plays', () => {
    renderPanel({ played: VOICE_CALL.slice(0, 2) })
    expect(screen.queryByText('Update my account information.')).not.toBeInTheDocument()
    expect(
      screen.getByText('Hello, this is Jessica from customer support. How can I help you today?'),
    ).toBeInTheDocument()
  })

  it('attributes the detection to the use case on a scoped run', () => {
    renderPanel({ useCase: cancellation })
    expect(
      screen.getByText('Currently previewing the “Service cancellation” use case, all segments.'),
    ).toBeInTheDocument()
    const trace = screen.getByTestId('preview-trace-card-0')
    expect(within(trace).getByText('Service cancellation')).toBeInTheDocument()
    expect(within(trace).getByText(/did not trigger/i)).toBeInTheDocument()
    expect(within(trace).queryByText('Update profile')).not.toBeInTheDocument()
  })

  it('scrolls the newest turn into view as the call plays', () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    renderPanel()
    expect(scrollIntoView).toHaveBeenCalled()
  })
})
