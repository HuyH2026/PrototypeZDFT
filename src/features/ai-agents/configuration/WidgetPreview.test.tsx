import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WidgetPreview } from './WidgetPreview'
import { VoicePreview, VoiceRing } from './VoicePreview'
import { PREVIEW_COPY, SEED_SEGMENTS, VOICE_SEED_SEGMENTS, seedCsat } from './config-data'

const riders = SEED_SEGMENTS[0]
const business = SEED_SEGMENTS[2]

function renderWidget(section = 'segments', segment = riders) {
  render(<WidgetPreview segment={segment} section={section} csat={segment.csat} />)
}

describe('WidgetPreview', () => {
  it('shows the widget title in the header, plus the composer and footer', () => {
    renderWidget()
    expect(screen.getByText('Uber Rider Support')).toBeInTheDocument()
    expect(screen.getByText('Ask a question…')).toBeInTheDocument()
    expect(screen.getByText(/Built with Zendesk/)).toBeInTheDocument()
  })

  it('scopes the preview to the segment and its tags', () => {
    renderWidget()
    expect(screen.getByText(/'Riders'/)).toBeInTheDocument()
    expect(screen.getByText('rider_app, ios, +2')).toBeInTheDocument()
  })

  it('shows the Business riders identity, scope, and blue treatment', () => {
    renderWidget('segments', business)
    expect(screen.getByText(/'Business riders'/)).toBeInTheDocument()
    expect(screen.getByText('business_profile')).toBeInTheDocument()
    expect(screen.getByText('Uber Business Rider')).toBeInTheDocument()
    expect(
      screen.getByText('Uber Business Rider').closest('[data-slot="widget-preview-header"]'),
    ).toHaveStyle({
      backgroundColor: '#2047b9',
    })
    expect(screen.getByText(PREVIEW_COPY.chat.user)).toHaveStyle({ backgroundColor: '#2047b9' })
  })

  it('previews the sample conversation for the segments section', () => {
    renderWidget()
    expect(screen.getByText(/Bonjour, Hola, Hello and welcome!/)).toBeInTheDocument()
  })

  it('previews the CSAT survey for the mood section', () => {
    renderWidget('mood')
    expect(screen.getByText('How would you rate your experience today?')).toBeInTheDocument()
    expect(screen.getByText('Terrible')).toBeInTheDocument()
    expect(screen.getByText('Excellent')).toBeInTheDocument()
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('follows the panel’s question and labels into the survey preview', () => {
    const segment = { ...riders, csat: { ...seedCsat(), question: 'Rate us?' } }
    render(<WidgetPreview segment={segment} section="mood" csat={segment.csat} />)
    expect(screen.getByText('Rate us?')).toBeInTheDocument()
  })

  it('says the knowledge and embed sections apply to every segment', () => {
    renderWidget('knowledge')
    expect(screen.getByText('Enabled for all segments')).toBeInTheDocument()
    expect(screen.queryByText(/'Riders'/)).not.toBeInTheDocument()
  })

  it('previews quick replies for the embed section', () => {
    renderWidget('code')
    expect(screen.getByText('Hi there! How can I help you today?')).toBeInTheDocument()
    expect(screen.getByText('Pricing/Quote')).toBeInTheDocument()
  })
})

describe('VoicePreview', () => {
  it('scopes to the segment’s phone numbers and points at the panel', () => {
    render(<VoicePreview segment={VOICE_SEED_SEGMENTS[0]} section="segments" />)
    expect(screen.getByText(/'Riders English'/)).toBeInTheDocument()
    expect(screen.getByText('+13331234567')).toBeInTheDocument()
    expect(screen.getByText(/Configure voice segment, phone number/)).toBeInTheDocument()
  })

  it('changes its hint on the sentiment section', () => {
    render(<VoicePreview segment={VOICE_SEED_SEGMENTS[0]} section="sentiment" />)
    expect(screen.getByText('Set the personality for your Voice AI Agent.')).toBeInTheDocument()
  })

  it('offers a call button', () => {
    render(<VoicePreview segment={VOICE_SEED_SEGMENTS[0]} section="segments" />)
    expect(screen.getByRole('button', { name: 'Start a test call' })).toBeInTheDocument()
  })
})

describe('VoiceRing', () => {
  it('is the agent on its own, with no control of its own', () => {
    // The Use cases preview draws its own Mute / Start pair beneath the ring, so
    // it needs the visual without Configuration's call button.
    render(<VoiceRing />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
