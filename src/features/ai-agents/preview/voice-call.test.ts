import { describe, expect, it } from 'vitest'
import {
  VOICE_CALL,
  VOICE_DIRECTIONS,
  VOICE_NUMBERS,
  VOICE_TURN_MS,
  startHint,
  voiceTimeline,
} from './voice-call'
import type { PreviewUseCase } from './preview-data'

const cancellation: PreviewUseCase = {
  name: 'Service cancellation',
  live: true,
  policyText: 'Offer 30 days free before cancelling.',
  triggerPhrases: [],
  segmentScope: 'all segments',
}

describe('the scripted voice call', () => {
  it('opens on the recording notice and the agent introducing themselves', () => {
    expect(VOICE_CALL[0]).toMatchObject({
      speaker: 'agent',
      text: 'This call may be recorded for quality assurance and training purposes.',
    })
    expect(VOICE_CALL[1].text).toBe(
      'Hello, this is Jessica from customer support. How can I help you today?',
    )
  })

  it('detects on the caller stating their intent, not on every caller turn', () => {
    const detecting = VOICE_CALL.filter((turn) => turn.detect)
    expect(detecting).toHaveLength(1)
    expect(detecting[0].text).toBe('Update my account information.')
    // "One, two, three, four." continues the same use case; nothing is re-routed.
    expect(
      VOICE_CALL.find((turn) => turn.text === 'One, two, three, four.')?.detect,
    ).toBeUndefined()
  })

  it('never marks an agent turn as a detection point', () => {
    expect(VOICE_CALL.every((turn) => turn.speaker === 'user' || !turn.detect)).toBe(true)
  })

  it('offers the frame’s number as the first option, language included', () => {
    expect(VOICE_NUMBERS[0]).toBe('+1 415 444 2123 (English)')
    expect(VOICE_NUMBERS.every((number) => /\(.+\)$/.test(number))).toBe(true)
  })

  it('offers both call directions and paces the call for reading', () => {
    expect(VOICE_DIRECTIONS).toEqual(['Inbound', 'Outbound'])
    expect(VOICE_TURN_MS).toBeGreaterThan(200)
    expect(VOICE_TURN_MS).toBeLessThan(1000)
  })

  it('names the direction in the start hint', () => {
    expect(startHint('Inbound')).toBe('Click Start to begin the inbound call')
    expect(startHint('Outbound')).toBe('Click Start to begin the outbound call')
  })
})

describe('voiceTimeline', () => {
  it('is empty before the call starts', () => {
    expect(voiceTimeline([])).toEqual([])
  })

  it('renders each played turn as a bubble', () => {
    const items = voiceTimeline(VOICE_CALL.slice(0, 2))
    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({ kind: 'turn', turn: { speaker: 'agent' } })
  })

  it('follows a detecting turn with the trace card the router produced', () => {
    const items = voiceTimeline(VOICE_CALL.slice(0, 3))
    const trace = items[items.length - 1]
    expect(trace.kind).toBe('trace')
    // Derived from the shared script, so the two cannot drift apart.
    expect(trace.kind === 'trace' && trace.exchange).toMatchObject({
      detection: 'Update profile',
      status: 'Live',
      confidence: 'High',
    })
  })

  it('joins consecutive agent bubbles and leaves a lone one unjoined', () => {
    const items = voiceTimeline(VOICE_CALL.slice(0, 2))
    expect(items[0]).toMatchObject({ joinAbove: false, joinBelow: true })
    expect(items[1]).toMatchObject({ joinAbove: true, joinBelow: false })
  })

  it('does not join a bubble to one across a trace card', () => {
    const items = voiceTimeline(VOICE_CALL.slice(0, 4))
    const agentAfterTrace = items[items.length - 1]
    expect(agentAfterTrace).toMatchObject({
      kind: 'turn',
      joinAbove: false,
      joinBelow: false,
      turn: { speaker: 'agent' },
    })
  })

  it('does not join a caller bubble to the agent bubble above it', () => {
    const items = voiceTimeline(VOICE_CALL.slice(0, 3))
    const caller = items.find((item) => item.kind === 'turn' && item.turn.speaker === 'user')
    expect(caller).toMatchObject({ joinAbove: false, joinBelow: false })
  })

  it('groups only while the turns are actually on screen', () => {
    // Mid-playback the first agent bubble stands alone, and joins downward only
    // once the second one arrives.
    expect(voiceTimeline(VOICE_CALL.slice(0, 1))[0]).toMatchObject({ joinBelow: false })
  })

  it('attributes every detection to the scoped use case when there is one', () => {
    const items = voiceTimeline(VOICE_CALL.slice(0, 3), cancellation)
    const trace = items[items.length - 1]
    expect(trace.kind === 'trace' && trace.exchange).toMatchObject({
      detection: 'Service cancellation',
      triggered: false,
      confidence: 'Low',
    })
  })

  it('reports the scoped use case firing when the call is on its topic', () => {
    const onTopic = [{ speaker: 'user' as const, text: 'I want to cancel my plan', detect: true }]
    const items = voiceTimeline(onTopic, cancellation)
    expect(items[1].kind === 'trace' && items[1].exchange).toMatchObject({
      detection: 'Service cancellation',
      triggered: true,
      confidence: 'High',
    })
  })
})
