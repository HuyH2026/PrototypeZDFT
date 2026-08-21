// The scripted inbound call the Voice preview plays, and the timeline the right
// panel renders from it.
//
// Voice has no chat pane — the left column is the agent itself — so the
// transcript lives inside the settings panel, bubbles and detection cards in one
// column (frame 87:90458). `voiceTimeline` is what interleaves them.
import {
  respondAsUseCase,
  respondTo,
  type PreviewExchange,
  type PreviewUseCase,
} from './preview-data'

/** One spoken turn. `detect` marks where the frame draws a detection card. */
export type VoiceTurn = {
  speaker: 'agent' | 'user'
  text: string
  /**
   * Set where the router *picks* a use case, not on every caller turn — the
   * frame traces "Update my account information." and leaves the digits that
   * follow it untraced, because they continue the same use case.
   */
  detect?: boolean
}

/** Transcribed from the frame, curly punctuation included. */
export const VOICE_CALL: VoiceTurn[] = [
  {
    speaker: 'agent',
    text: 'This call may be recorded for quality assurance and training purposes.',
  },
  {
    speaker: 'agent',
    text: 'Hello, this is Jessica from customer support. How can I help you today?',
  },
  { speaker: 'user', text: 'Update my account information.', detect: true },
  {
    speaker: 'agent',
    text: 'Thanks for letting me know you’d like to update your account information. To get started, could you please provide the last four digits of your account number? This helps me pull up your current details safely.',
  },
  { speaker: 'user', text: 'One, two, three, four.' },
  {
    speaker: 'agent',
    text: 'Alright, I’m pulling up your information now—just a moment while I check on that for you.',
  },
]

/**
 * The numbers this agent answers on. Each carries its language, which is why the
 * Voice panel has one dropdown where the Widget's has two.
 */
export const VOICE_NUMBERS = [
  '+1 415 444 2123 (English)',
  '+1 415 444 2124 (Español)',
  '+44 20 7946 0318 (English)',
  '+49 30 5678 1290 (Deutsch)',
]

export const VOICE_DIRECTIONS = ['Inbound', 'Outbound']

/** How long each turn holds before the next arrives — a call, not a paste. */
export const VOICE_TURN_MS = 450

export function startHint(direction: string): string {
  // No trailing period — frame 158:60717's caption ends on "call".
  return `Click Start to begin the ${direction.toLowerCase()} call`
}

/** A bubble, or the detection card that follows one. */
export type VoiceItem =
  | {
      kind: 'turn'
      turn: VoiceTurn
      /** Whether the neighbouring item is a bubble from the same speaker. */
      joinAbove: boolean
      joinBelow: boolean
    }
  | { kind: 'trace'; exchange: PreviewExchange }

/**
 * Interleave the turns played so far with the detections they produced.
 *
 * Grouping is computed over what is *on screen*, so a bubble stands alone until
 * its neighbour actually arrives — and a detection card between two agent turns
 * breaks the group, as the frame draws it.
 */
export function voiceTimeline(played: VoiceTurn[], useCase?: PreviewUseCase): VoiceItem[] {
  const items: VoiceItem[] = []
  for (const turn of played) {
    items.push({ kind: 'turn', turn, joinAbove: false, joinBelow: false })
    if (turn.detect) {
      items.push({
        kind: 'trace',
        exchange: useCase ? respondAsUseCase(turn.text, useCase) : respondTo(turn.text),
      })
    }
  }

  return items.map((item, index) => {
    if (item.kind !== 'turn') return item
    const sameSpeaker = (neighbour: VoiceItem | undefined) =>
      neighbour?.kind === 'turn' && neighbour.turn.speaker === item.turn.speaker
    return {
      ...item,
      joinAbove: sameSpeaker(items[index - 1]),
      joinBelow: sameSpeaker(items[index + 1]),
    }
  })
}
