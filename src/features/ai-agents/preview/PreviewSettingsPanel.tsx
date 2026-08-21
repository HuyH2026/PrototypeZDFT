// The Widget preview's right column: what the run is scoped to, then the trace
// the router produced for it — a run card, and one card per exchange.
//
// The chat itself lives on the left in the widget mock, so each card here carries
// the whole exchange: detection, policy, and the two utterances. (Voice has no
// chat pane, so `VoiceSettingsPanel` interleaves the transcript instead.)
import { useEffect, useRef } from 'react'
import {
  CARD,
  LABEL,
  MISSED,
  PanelSelect,
  PreviewPanelShell,
  SPEAKER,
  UTTERANCE,
  VALUE,
} from './PreviewPanelShell'
import {
  PREVIEW_CONVERSATION_ID,
  PREVIEW_LANGUAGES,
  PREVIEW_SEGMENTS,
  scopeCaption,
  type PreviewExchange,
} from './preview-data'

/** `Label: value` on one line, the way the frame prints the run's facts. */
function TraceLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex flex-wrap gap-1">
      <span className={LABEL}>{label}</span>
      <span className={VALUE}>{value}</span>
    </p>
  )
}

export function PreviewSettingsPanel({
  exchanges,
  language,
  segment,
  onLanguageChange,
  onSegmentChange,
  useCaseName,
  useCaseScope,
}: {
  exchanges: PreviewExchange[]
  language: string
  segment: string
  onLanguageChange: (value: string) => void
  onSegmentChange: (value: string) => void
  /** Set when the run is scoped to one use case (opened from its canvas). */
  useCaseName?: string
  /** That use case's own segment scope, which replaces the segment dropdown. */
  useCaseScope?: string
}) {
  // A scoped run's scope is the use case's, so it states it rather than offering
  // a segment picker that could contradict the policy being tested.
  const scoped = Boolean(useCaseName)
  const scope = scopeCaption({
    useCaseName,
    useCaseScope,
    qualifier: segment === PREVIEW_SEGMENTS[0] ? undefined : segment,
  })

  // The trace grows downward past the fold, so bring the newest card into view.
  // Guarded: jsdom has no scrollIntoView, and neither do older embedded webviews.
  const newest = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (exchanges.length > 1) newest.current?.scrollIntoView?.({ block: 'end' })
  }, [exchanges.length])

  return (
    <PreviewPanelShell
      scope={scope}
      controls={
        <>
          <PanelSelect
            label="Language"
            value={language}
            options={PREVIEW_LANGUAGES}
            onChange={onLanguageChange}
            icon="language"
          />
          {!scoped && (
            <PanelSelect
              label="Segment"
              value={segment}
              options={PREVIEW_SEGMENTS}
              onChange={onSegmentChange}
              icon="segment"
            />
          )}
        </>
      }
    >
      <div data-testid="preview-run-card" className={CARD}>
        <TraceLine label="Conversation ID:" value={PREVIEW_CONVERSATION_ID} />
        <TraceLine label="Language:" value={language} />
      </div>

      {exchanges.map((exchange, index) => (
        <div
          key={index}
          ref={index === exchanges.length - 1 ? newest : undefined}
          data-testid={`preview-trace-card-${index}`}
          className={`${CARD} flex flex-col gap-4`}
        >
          <div>
            <p className={LABEL}>Agent detection:</p>
            <p className="flex flex-wrap items-baseline gap-2">
              {/* A scoped run can report the use case *not* firing. Say so in the
                  amber rather than the green — nothing was resolved. */}
              <span className={exchange.triggered === false ? MISSED : SPEAKER}>
                <span className="underline">{exchange.detection}</span>{' '}
                <span>({exchange.status})</span>
                {exchange.triggered === false && <span> — did not trigger</span>}
              </span>
              <span className="text-[#d2d3d8]">[Confidence score: {exchange.confidence}]</span>
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className={LABEL}>Policy Description:</p>
            <p className={VALUE}>{exchange.policy}</p>
          </div>

          {/* `items-start` + a non-shrinking label, so a long utterance starts on
              the speaker's line and wraps beneath it — the frame's hanging indent.
              `flex-wrap` here would push the whole utterance to its own row. */}
          <div className="flex flex-col gap-1">
            <p className={LABEL}>Conversation History:</p>
            <p className="flex items-start gap-1">
              <span className={`${SPEAKER} shrink-0`}>User:</span>
              <span className={UTTERANCE}>{exchange.user}</span>
            </p>
            <p className="flex items-start gap-1">
              <span className={`${SPEAKER} shrink-0`}>Agent:</span>
              <span className={UTTERANCE}>{exchange.agent}</span>
            </p>
          </div>
        </div>
      ))}

      {exchanges.length === 0 && (
        <p className="text-[14px] leading-5 text-white/40">
          No trace yet — start a conversation to see how the router scores it.
        </p>
      )}
    </PreviewPanelShell>
  )
}
