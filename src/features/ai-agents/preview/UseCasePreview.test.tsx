import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UseCasePreview } from './UseCasePreview'
import { PREVIEW_GREETING, SEED_EXCHANGE } from './preview-data'
import type { ChannelKey } from '../agent-builder-data'

function renderPreview(channel: ChannelKey = 'widget') {
  const onClose = vi.fn()
  render(<UseCasePreview channel={channel} onClose={onClose} />)
  return { onClose }
}

const cancellation = {
  name: 'Service cancellation',
  live: true,
  policyText: 'Reveal Form: Cancellation Diagnostic Survey to identify the root cause.',
  triggerPhrases: [],
  segmentScope: 'all segments',
}

function renderScoped(useCase = cancellation) {
  const onClose = vi.fn()
  render(<UseCasePreview channel="widget" useCase={useCase} onClose={onClose} />)
  return { onClose }
}

describe('UseCasePreview scoped to a use case', () => {
  it('titles the use case while keeping the channel chip', () => {
    renderScoped()
    const header = screen.getByRole('banner')
    expect(within(header).getByText('Service cancellation')).toBeInTheDocument()
    expect(within(header).queryByText('Widget')).not.toBeInTheDocument()
  })

  it('opens with an empty trace rather than another use case’s transcript', () => {
    renderScoped()
    expect(screen.queryByTestId('preview-trace-card-0')).not.toBeInTheDocument()
    expect(
      within(screen.getByTestId('preview-conversation')).queryByText(SEED_EXCHANGE.user),
    ).not.toBeInTheDocument()
    expect(screen.getByText(PREVIEW_GREETING)).toBeInTheDocument()
  })

  it('names the use case in the scope caption', () => {
    renderScoped()
    expect(
      screen.getByText('Currently previewing the “Service cancellation” use case, all segments.'),
    ).toBeInTheDocument()
  })

  it('fires the use case for a matching question and shows its own policy', async () => {
    renderScoped()
    await userEvent.type(screen.getByLabelText('Ask a question'), 'I want to cancel my plan{enter}')
    const trace = screen.getByTestId('preview-trace-card-0')
    expect(within(trace).getByText('Service cancellation')).toBeInTheDocument()
    expect(within(trace).getByText('[Confidence score: High]')).toBeInTheDocument()
    expect(within(trace).getByText(cancellation.policyText)).toBeInTheDocument()
    expect(within(trace).queryByText(/did not trigger/i)).not.toBeInTheDocument()
  })

  it('reports a question the use case does not cover as not triggered', async () => {
    renderScoped()
    await userEvent.type(screen.getByLabelText('Ask a question'), 'what is the weather{enter}')
    const trace = screen.getByTestId('preview-trace-card-0')
    expect(within(trace).getByText(/did not trigger/i)).toBeInTheDocument()
    expect(within(trace).getByText('[Confidence score: Low]')).toBeInTheDocument()
  })

  it('never attributes an exchange to a different use case', async () => {
    renderScoped()
    await userEvent.type(screen.getByLabelText('Ask a question'), 'I forgot my password{enter}')
    const trace = screen.getByTestId('preview-trace-card-0')
    expect(within(trace).getByText('Service cancellation')).toBeInTheDocument()
    expect(within(trace).queryByText('Password Reset')).not.toBeInTheDocument()
  })

  it('shows a draft use case as a draft', async () => {
    renderScoped({ ...cancellation, live: false })
    await userEvent.type(screen.getByLabelText('Ask a question'), 'cancel my plan{enter}')
    expect(
      within(screen.getByTestId('preview-trace-card-0')).getByText('(Draft)'),
    ).toBeInTheDocument()
  })
})

describe('UseCasePreview', () => {
  it('names the active channel in its header', () => {
    renderPreview()
    expect(within(screen.getByRole('banner')).getByText('Widget')).toBeInTheDocument()
  })

  it('follows the channel tab’s own label rather than the canonical name', () => {
    // `email` has no canonical AGENT_CHANNELS entry; the header must agree
    // with the tab the user clicked.
    renderPreview('email')
    expect(within(screen.getByRole('banner')).getByText('Email')).toBeInTheDocument()
  })

  it('names the Web Call channel on its own tab', () => {
    // `webcall` is Web Call again — the tab and the canonical taxonomy agree.
    renderPreview('webcall')
    expect(within(screen.getByRole('banner')).getByText('Web Call')).toBeInTheDocument()
  })

  it('opens on the greeting and the seed exchange', () => {
    renderPreview()
    const chat = screen.getByTestId('preview-conversation')
    expect(within(chat).getByText(PREVIEW_GREETING)).toBeInTheDocument()
    expect(within(chat).getByText(SEED_EXCHANGE.user)).toBeInTheDocument()
    expect(within(chat).getByText(SEED_EXCHANGE.agent)).toBeInTheDocument()
  })

  it('closes when Close is pressed', async () => {
    const { onClose } = renderPreview()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes on Escape, like the app’s other overlays', async () => {
    const { onClose } = renderPreview()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not close on Escape while a dropdown has focus', async () => {
    // Escape in an open native select should dismiss the select, not the overlay.
    const { onClose } = renderPreview()
    screen.getByLabelText('Language').focus()
    await userEvent.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('answers a typed question in the chat and extends the trace', async () => {
    renderPreview()
    await userEvent.type(screen.getByLabelText('Ask a question'), 'I forgot my password{enter}')

    const chat = screen.getByTestId('preview-conversation')
    expect(within(chat).getByText('I forgot my password')).toBeInTheDocument()
    expect(within(chat).getByText(/I have sent a reset link/)).toBeInTheDocument()

    const trace = screen.getByTestId('preview-trace-card-1')
    expect(within(trace).getByText('Password Reset')).toBeInTheDocument()
  })

  it('clears the composer after sending', async () => {
    renderPreview()
    const input = screen.getByLabelText('Ask a question')
    await userEvent.type(input, 'I forgot my password{enter}')
    expect(input).toHaveValue('')
  })

  it('ignores an empty submission', async () => {
    renderPreview()
    await userEvent.type(screen.getByLabelText('Ask a question'), '   {enter}')
    expect(screen.queryByTestId('preview-trace-card-1')).not.toBeInTheDocument()
  })

  it('rewrites the trace’s language when the dropdown changes', async () => {
    renderPreview()
    await userEvent.selectOptions(screen.getByLabelText('Language'), 'Deutsch')
    expect(within(screen.getByTestId('preview-run-card')).getByText('Deutsch')).toBeInTheDocument()
  })

  it('scrolls the newest trace card into view after a send', async () => {
    // jsdom does not implement scrollIntoView; define it so the call is observable.
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    renderPreview()
    await userEvent.type(screen.getByLabelText('Ask a question'), 'cancel my plan{enter}')
    expect(scrollIntoView).toHaveBeenCalled()
  })

  it('says so plainly on a channel with no designed preview', () => {
    renderPreview('headless')
    expect(screen.getByText(/no preview/i)).toBeInTheDocument()
    expect(screen.queryByLabelText('Ask a question')).not.toBeInTheDocument()
  })

  it('keeps the settings panel on every channel', () => {
    for (const channel of ['widget', 'voice', 'webcall', 'headless', 'email'] as ChannelKey[]) {
      const { unmount } = render(<UseCasePreview channel={channel} onClose={() => {}} />)
      expect(screen.getByTestId('preview-settings-panel')).toBeInTheDocument()
      unmount()
    }
  })
})

describe('UseCasePreview on the Voice channel', () => {
  it('places a call instead of typing, and waits to be told to', () => {
    renderPreview('voice')
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    // Idle offers only Start (frame 158:60717); Mute joins once the call runs.
    expect(screen.queryByRole('button', { name: 'Mute' })).not.toBeInTheDocument()
    expect(screen.getByText('Click Start to begin the inbound call')).toBeInTheDocument()
    expect(screen.queryByLabelText('Ask a question')).not.toBeInTheDocument()
    // Configuration's orb carries its own call button; this screen must not, or
    // there would be two ways to place the same call.
    expect(screen.queryByRole('button', { name: 'Start a test call' })).not.toBeInTheDocument()
  })

  it('picks a number rather than a language and a segment', () => {
    renderPreview('voice')
    expect(screen.getByLabelText('Phone number')).toBeInTheDocument()
    expect(screen.queryByLabelText('Language')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Segment')).not.toBeInTheDocument()
  })

  it('shows no transcript and no trace until the call starts', () => {
    renderPreview('voice')
    expect(screen.queryByTestId('preview-trace-card-0')).not.toBeInTheDocument()
    expect(screen.getByTestId('preview-voice-transcript')).toBeEmptyDOMElement()
  })

  it('plays the call turn by turn once Start is pressed', async () => {
    renderPreview('voice')
    await userEvent.click(screen.getByRole('button', { name: 'Start' }))

    expect(
      await screen.findByText(
        'This call may be recorded for quality assurance and training purposes.',
      ),
    ).toBeInTheDocument()
    // The router's detection lands where the caller states their intent.
    expect(
      await screen.findByTestId('preview-trace-card-0', {}, { timeout: 4000 }),
    ).toHaveTextContent('Update profile')
    expect(
      await screen.findByText(
        /Alright, I’m pulling up your information now/,
        {},
        { timeout: 4000 },
      ),
    ).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Restart' })).toBeInTheDocument()
  })

  it('offers End while the call runs, and keeps what played', async () => {
    renderPreview('voice')
    await userEvent.click(screen.getByRole('button', { name: 'Start' }))
    const first = await screen.findByText(
      'This call may be recorded for quality assurance and training purposes.',
    )

    await userEvent.click(screen.getByRole('button', { name: 'End call' }))
    expect(first).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument()
  })

  it('mutes the line without ending the call', async () => {
    renderPreview('voice')
    await userEvent.click(screen.getByRole('button', { name: 'Start' }))
    await userEvent.click(screen.getByRole('button', { name: 'Mute' }))
    expect(screen.getByRole('button', { name: 'Unmute' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'End call' })).toBeInTheDocument()
  })

  it('switches the call direction from the header', async () => {
    renderPreview('voice')
    await userEvent.selectOptions(screen.getByLabelText('Call direction'), 'Outbound')
    expect(screen.getByText('Click Start to begin the outbound call')).toBeInTheDocument()
  })

  it('offers no direction control on a channel that has no call', () => {
    renderPreview()
    expect(screen.queryByLabelText('Call direction')).not.toBeInTheDocument()
  })
})

describe('UseCasePreview on the Web Call channel', () => {
  it('runs the web-call card: black agent header behind a Privacy Policy sheet', () => {
    renderPreview('webcall')
    const stage = screen.getByTestId('webcall-stage')
    // The frame's header copy, capitalisation included (sic).
    expect(within(stage).getByText('RIder Support')).toBeInTheDocument()
    const sheet = within(stage).getByTestId('webcall-consent')
    expect(within(sheet).getByText('Privacy Policy')).toBeInTheDocument()
    expect(
      within(sheet).getByText(
        'This call may be recorded for quality assurance and training purposes.',
      ),
    ).toBeInTheDocument()
    expect(within(sheet).getByRole('button', { name: 'Accept Terms' })).toBeInTheDocument()
    // The frame draws the floating controls behind the sheet — hidden until it
    // lifts.
    expect(within(stage).queryByRole('button', { name: 'Hang up' })).not.toBeInTheDocument()
    // No chat composer, no Start button: the web-call preview is not the voice
    // call.
    expect(screen.queryByLabelText('Ask a question')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
  })

  it('lifts the consent sheet on Accept Terms, revealing the call controls', async () => {
    renderPreview('webcall')
    await userEvent.click(screen.getByRole('button', { name: 'Accept Terms' }))
    expect(screen.queryByTestId('webcall-consent')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hang up' })).toBeInTheDocument()
  })

  it('picks a phone number in the settings panel, not a language or segment', () => {
    renderPreview('webcall')
    expect(screen.getByLabelText('Number')).toBeInTheDocument()
    expect(screen.queryByLabelText('Language')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Segment')).not.toBeInTheDocument()
  })

  it('attributes a scoped voice call to the use case being edited', async () => {
    render(
      <UseCasePreview
        channel="voice"
        useCase={{ ...cancellation, name: 'Winback offer' }}
        onClose={() => {}}
      />,
    )
    // The header titles the channel (frame 147:172564); the scope caption and
    // the trace card are what name the use case being edited.
    expect(within(screen.getByRole('banner')).getByText('Voice')).toBeInTheDocument()
    expect(screen.getByText(/Winback offer/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Start' }))
    const trace = await screen.findByTestId('preview-trace-card-0', {}, { timeout: 4000 })
    expect(within(trace).getByText('Winback offer')).toBeInTheDocument()
    expect(within(trace).getByText(/did not trigger/i)).toBeInTheDocument()
  })
})
