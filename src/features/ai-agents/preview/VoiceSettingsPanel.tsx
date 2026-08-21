// The Voice preview's right column (frame 87:90458).
//
// Voice has no chat pane — the left column is the agent itself — so the call
// transcript lives here, its bubbles interleaved with the detection cards the
// router produced. That is also why those cards print the detection alone: the
// utterances are already on screen, an inch above.
import { useEffect, useRef } from 'react'
import {
  CARD,
  LABEL,
  MISSED,
  PanelSelect,
  PreviewPanelShell,
  SPEAKER,
  VALUE,
} from './PreviewPanelShell'
import { PREVIEW_CONVERSATION_ID, scopeCaption, type PreviewUseCase } from './preview-data'
import { VOICE_NUMBERS, voiceTimeline, type VoiceTurn } from './voice-call'

const BUBBLE = 'px-4 py-3.5 text-[16px] leading-[22px] tracking-[-0.1px]'

/**
 * The corner an agent bubble meets its neighbour on flattens to 8px, which is how
 * the frame reads a run of turns from one speaker as a group. Written out in full
 * rather than as an override of `rounded-[24px]`: two competing radius utilities
 * would leave which one wins up to stylesheet order.
 */
function agentRadius(joinAbove: boolean, joinBelow: boolean): string {
  if (joinAbove && joinBelow) return 'rounded-l-[8px] rounded-r-[24px]'
  if (joinAbove) return 'rounded-tl-[8px] rounded-tr-[24px] rounded-b-[24px]'
  if (joinBelow) return 'rounded-t-[24px] rounded-br-[24px] rounded-bl-[8px]'
  return 'rounded-[24px]'
}

/** One spoken turn: the agent at the frame's fixed width, the caller hugging. */
function Bubble({
  speaker,
  joinAbove,
  joinBelow,
  children,
}: {
  speaker: 'agent' | 'user'
  joinAbove: boolean
  joinBelow: boolean
  children: string
}) {
  if (speaker === 'user') {
    return (
      <p className={`${BUBBLE} w-fit max-w-[500px] self-end rounded-[24px] bg-black text-white`}>
        {children}
      </p>
    )
  }
  return (
    <p
      className={`${BUBBLE} w-[500px] self-start bg-white text-black ${agentRadius(joinAbove, joinBelow)}`}
    >
      {children}
    </p>
  )
}

export function VoiceSettingsPanel({
  played,
  number,
  onNumberChange,
  useCase,
}: {
  /** The turns played so far — the whole script once the call has run. */
  played: VoiceTurn[]
  number: string
  onNumberChange: (value: string) => void
  /** Set when opened from a use case's canvas, as on the Widget channel. */
  useCase?: PreviewUseCase
}) {
  const items = voiceTimeline(played, useCase)

  // The call grows downward past the fold while it plays, so keep the newest turn
  // in view. Guarded: jsdom has no scrollIntoView, nor do older embedded webviews.
  const newest = useRef<HTMLParagraphElement | HTMLDivElement | null>(null)
  useEffect(() => {
    newest.current?.scrollIntoView?.({ block: 'end' })
  }, [items.length])

  let traces = 0

  return (
    <PreviewPanelShell
      scope={scopeCaption({
        useCaseName: useCase?.name,
        useCaseScope: useCase?.segmentScope,
        qualifier: number === VOICE_NUMBERS[0] ? undefined : number,
      })}
      controls={
        <PanelSelect
          label="Phone number"
          value={number}
          options={VOICE_NUMBERS}
          onChange={onNumberChange}
          icon="phone"
        />
      }
    >
      <div data-testid="preview-run-card" className={CARD}>
        <p className="flex flex-wrap gap-1">
          <span className={LABEL}>Conversation ID:</span>
          <span className={VALUE}>{PREVIEW_CONVERSATION_ID}</span>
        </p>
      </div>

      {/* Spacing is per item, not a container `gap`: turns inside a group sit 4px
          apart and everything else 16px, which is how the frame separates them. */}
      <div data-testid="preview-voice-transcript" className="flex flex-col">
        {items.map((item, index) => {
          const last = index === items.length - 1
          if (item.kind === 'turn') {
            return (
              <div
                key={index}
                ref={last ? newest : undefined}
                className={`flex flex-col ${index === 0 ? '' : item.joinAbove ? 'mt-1' : 'mt-4'}`}
              >
                <Bubble
                  speaker={item.turn.speaker}
                  joinAbove={item.joinAbove}
                  joinBelow={item.joinBelow}
                >
                  {item.turn.text}
                </Bubble>
              </div>
            )
          }

          const { exchange } = item
          return (
            <div
              key={index}
              ref={last ? newest : undefined}
              data-testid={`preview-trace-card-${traces++}`}
              className={`${CARD} mt-4 flex flex-col gap-1`}
            >
              <p className={LABEL}>Agent detection:</p>
              <p className="flex flex-wrap items-baseline gap-2">
                <span className={exchange.triggered === false ? MISSED : SPEAKER}>
                  <span className="underline">{exchange.detection}</span>{' '}
                  <span>({exchange.status})</span>
                  {exchange.triggered === false && <span> — did not trigger</span>}
                </span>
                <span className="text-[#d2d3d8]">[Confidence score: {exchange.confidence}]</span>
              </p>
            </div>
          )
        })}
      </div>
    </PreviewPanelShell>
  )
}
