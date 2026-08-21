import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoiceCallStage } from './VoiceCallStage'

function renderStage(props: Partial<Parameters<typeof VoiceCallStage>[0]> = {}) {
  const onCall = vi.fn()
  const onMuteToggle = vi.fn()
  render(
    <VoiceCallStage
      direction="Inbound"
      state="idle"
      muted={false}
      onCall={onCall}
      onMuteToggle={onMuteToggle}
      {...props}
    />,
  )
  return { onCall, onMuteToggle }
}

describe('VoiceCallStage', () => {
  it('offers only Start under the agent before the call (frame 158:60717)', () => {
    renderStage()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    // Mute joins only once a call is running — the idle frame draws one button.
    expect(screen.queryByRole('button', { name: 'Mute' })).not.toBeInTheDocument()
    // The control is named in text beneath it, as the frame draws it.
    expect(screen.getAllByText('Start')).not.toHaveLength(0)
  })

  it('tells the caller how to begin, naming the direction', () => {
    renderStage()
    expect(screen.getByText('Click Start to begin the inbound call')).toBeInTheDocument()
  })

  it('follows the direction into the hint', () => {
    renderStage({ direction: 'Outbound' })
    expect(screen.getByText('Click Start to begin the outbound call')).toBeInTheDocument()
  })

  it('runs with Mute, End call and SMS CSAT (frame 147:172564)', async () => {
    const { onCall } = renderStage({ state: 'running' })
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mute' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'SMS CSAT' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'End call' }))
    expect(onCall).toHaveBeenCalledOnce()
    expect(screen.queryByText(/Click Start/)).not.toBeInTheDocument()
  })

  it('offers a rerun once the call has ended', () => {
    renderStage({ state: 'ended' })
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument()
    expect(screen.getByText(/call ended/i)).toBeInTheDocument()
  })

  it('starts the call when Start is pressed', async () => {
    const { onCall } = renderStage()
    await userEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(onCall).toHaveBeenCalledOnce()
  })

  it('reports mute as a toggle rather than a second call control', async () => {
    const { onMuteToggle } = renderStage({ state: 'running' })
    const mute = screen.getByRole('button', { name: 'Mute' })
    expect(mute).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(mute)
    expect(onMuteToggle).toHaveBeenCalledOnce()
  })

  it('says when the line is muted', () => {
    renderStage({ state: 'running', muted: true })
    expect(screen.getByRole('button', { name: 'Unmute' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('carries no call button of its own on the agent', () => {
    // The orb is decorative here; Start is the only way to place a call.
    renderStage()
    expect(screen.queryByRole('button', { name: 'Start a test call' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })
})
