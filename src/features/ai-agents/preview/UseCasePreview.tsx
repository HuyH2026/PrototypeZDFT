// Use cases ▸ Preview: a full-screen overlay that runs the channel's live agents
// against a question and prints what the router did with it.
//
// Same anatomy as the Test Suite's preview (experiments/test-suite/TestCaseEditor):
// a dark backdrop over the whole app, a glass header pill, then the previewed
// agent on the left and the run's trace on the right. The backdrop is that
// screen's gradient rather than the frame's photo, so the app's two full-screen
// previews read as one system.
import { useEffect, useState } from 'react'
import { ArrowUp, ChevronDown, MessageSquare } from 'lucide-react'
import { AGENT_CHANNELS } from '@/lib/channel-meta'
import { Button } from '@/components/flora/Button'
import { PreviewFrame } from '../configuration/PreviewFrame'
import { CHANNELS, type ChannelKey } from '../agent-builder-data'
import { PreviewSettingsPanel } from './PreviewSettingsPanel'
import { PanelSelect, PreviewPanelShell } from './PreviewPanelShell'
import { VoiceCallStage, type CallState } from './VoiceCallStage'
import { VoiceSettingsPanel } from './VoiceSettingsPanel'
import { WebCallStage } from './WebCallStage'
import { VOICE_CALL, VOICE_DIRECTIONS, VOICE_NUMBERS, VOICE_TURN_MS } from './voice-call'
import {
  PREVIEW_COMPOSER_PLACEHOLDER,
  PREVIEW_GREETING,
  PREVIEW_LANGUAGES,
  PREVIEW_SEGMENTS,
  SEED_EXCHANGE,
  respondAsUseCase,
  respondTo,
  type PreviewExchange,
  type PreviewUseCase,
} from './preview-data'

const BACKDROP = 'radial-gradient(circle at 20% 100%, #22594f 0, #102735 38%, #0b1c2b 100%)'

/** The brand the widget mock wears — the roster's four agents are all Uber. */
const BRAND_MARK = 'Uber'
const BRAND_TITLE = 'Uber Rider Support'

function AgentBubble({ children }: { children: string }) {
  return (
    <div className="flex max-w-[85%] items-end gap-2 self-start">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-black text-[9px] font-semibold text-white">
        {BRAND_MARK}
      </span>
      <p className="rounded-[24px] bg-[#f2f4f7] px-4 py-2.5 text-[13px] leading-[19px] text-black">
        {children}
      </p>
    </div>
  )
}

function UserBubble({ children }: { children: string }) {
  return (
    <p className="max-w-[85%] self-end rounded-[24px] bg-black px-4 py-2.5 text-[13px] leading-[19px] text-white">
      {children}
    </p>
  )
}

/**
 * The header's centred direction pill. Voice only — it is what makes the frame's
 * "inbound call" wording a choice rather than a hardcoded word.
 */
function DirectionSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <select
        aria-label="Call direction"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none rounded-[20px] border border-[#1497c5] bg-transparent py-1.5 pl-3 pr-8 text-[14px] leading-5 tracking-[-0.1px] text-white outline-none"
      >
        {VOICE_DIRECTIONS.map((direction) => (
          <option key={direction} value={direction} className="bg-white text-ink">
            {direction}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        aria-hidden
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white"
      />
    </div>
  )
}

/** The chat mock: the greeting, then every exchange so far. */
function Conversation({ exchanges }: { exchanges: PreviewExchange[] }) {
  return (
    <div data-testid="preview-conversation" className="flex flex-1 flex-col justify-end gap-3">
      <AgentBubble>{PREVIEW_GREETING}</AgentBubble>
      {exchanges.map((exchange, index) => (
        <div key={index} className="flex flex-col gap-3">
          <UserBubble>{exchange.user}</UserBubble>
          <AgentBubble>{exchange.agent}</AgentBubble>
        </div>
      ))}
    </div>
  )
}

export function UseCasePreview({
  channel,
  useCase,
  onClose,
}: {
  channel: ChannelKey
  /**
   * Set when opened from a use case's canvas: every question is tested against
   * this one policy instead of the whole channel's router.
   */
  useCase?: PreviewUseCase
  onClose: () => void
}) {
  // Only the Widget channel can produce an exchange, and the seed is a Widget
  // transcript — the others open with an empty trace rather than describing a
  // conversation their channel never had. A scoped run starts empty for the same
  // reason: the seed names `Update profile`, not the use case being edited.
  const [exchanges, setExchanges] = useState<PreviewExchange[]>(
    channel === 'widget' && !useCase ? [SEED_EXCHANGE] : [],
  )
  const [language, setLanguage] = useState(PREVIEW_LANGUAGES[0])
  const [segment, setSegment] = useState(PREVIEW_SEGMENTS[0])
  const [question, setQuestion] = useState('')

  // Voice's own state. The call is a scripted playback rather than a transcript
  // printed all at once — "Click Start to begin the inbound call" promises
  // something that unfolds.
  const [direction, setDirection] = useState(VOICE_DIRECTIONS[0])
  const [number, setNumber] = useState(VOICE_NUMBERS[0])
  // Web Call's consent sheet covers the card until the visitor accepts (frame
  // 170:64552); accepting reveals the floating call controls.
  const [webcallAccepted, setWebcallAccepted] = useState(false)
  const [running, setRunning] = useState(false)
  const [played, setPlayed] = useState(0)
  const [muted, setMuted] = useState(false)
  // Derived, not stored: 'ended' is just "not running, but something was said",
  // and a third state variable could disagree with the other two.
  const callState: CallState = running ? 'running' : played === 0 ? 'idle' : 'ended'

  // Colour and glyph are canonical, but the title follows the channel *tab* the
  // user clicked, and the header must not contradict the control that opened
  // it. `email` has no AGENT_CHANNELS entry (the canonical taxonomy is the four
  // agent channels), so it falls back to the tab's own label and a neutral
  // chip.
  const meta = AGENT_CHANNELS.find((c) => c.key === channel)
  const channelLabel = CHANNELS.find((c) => c.key === channel)?.label ?? meta?.label ?? channel
  // Voice's frames (147:172564 / 158:60717) title the header "Voice" even when
  // the run is scoped — the settings panel's caption already names the use
  // case. The other channels keep the scoped name as the title.
  const label = channel === 'voice' ? channelLabel : (useCase?.name ?? channelLabel)

  // Escape closes, as it does on the app's other overlays — but not while a
  // dropdown holds focus, where Escape belongs to the open select.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if ((event.target as HTMLElement | null)?.tagName === 'SELECT') return
      onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // One turn at a time, cleared on unmount so closing mid-call cannot leave a
  // timer setting state on a gone component. The last turn stops the call from
  // inside the callback rather than from the effect body, which would be a
  // synchronous cascading render.
  useEffect(() => {
    if (!running || played >= VOICE_CALL.length) return
    const timer = setTimeout(() => {
      setPlayed(played + 1)
      if (played + 1 >= VOICE_CALL.length) setRunning(false)
    }, VOICE_TURN_MS)
    return () => clearTimeout(timer)
  }, [running, played])

  const send = () => {
    const asked = question.trim()
    if (!asked) return
    setExchanges((prev) => [...prev, useCase ? respondAsUseCase(asked, useCase) : respondTo(asked)])
    setQuestion('')
  }

  // Start and Restart both run the call from the top; End stops it where it is,
  // keeping the turns already spoken on screen.
  const onCall = () => {
    if (running) {
      setRunning(false)
      return
    }
    setPlayed(0)
    setRunning(true)
  }

  return (
    <div
      data-testid="use-case-preview"
      className="fixed inset-0 z-[80] flex flex-col gap-5 p-5 text-white"
      style={{ background: BACKDROP }}
    >
      <header className="relative flex h-16 shrink-0 items-center rounded-[26px] border border-white/20 bg-[rgba(5,20,28,0.3)] px-6 shadow-[0_5px_8px_0_rgba(3,17,38,0.11)]">
        <span
          className="flex size-8 items-center justify-center rounded-2xl"
          style={{ backgroundColor: meta?.color ?? '#646864' }}
        >
          {meta ? <meta.Icon size={18} aria-hidden /> : <MessageSquare size={18} aria-hidden />}
        </span>
        <h1 className="ml-3 text-[20px] font-semibold leading-7 tracking-[-0.1px]">{label}</h1>
        {channel === 'voice' && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <DirectionSelect value={direction} onChange={setDirection} />
          </div>
        )}
        <Button className="ml-auto bg-[#dcdcda] text-ink" size="sm" onClick={onClose}>
          Close
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_628px] items-stretch gap-6">
        <div className="flex min-h-0 items-center justify-center">
          {channel === 'widget' ? (
            <PreviewFrame
              mark={BRAND_MARK}
              title={BRAND_TITLE}
              accent="#000000"
              className="h-full max-h-[720px] w-[436px]"
              composer={
                <form
                  className="mx-4 mb-3 flex items-center gap-2 rounded-[21px] border border-[#bcbdc5] px-4 py-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    send()
                  }}
                >
                  <input
                    aria-label="Ask a question"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder={PREVIEW_COMPOSER_PLACEHOLDER}
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-[#a6a9b2]"
                  />
                  <button
                    type="submit"
                    aria-label="Send"
                    className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black text-white disabled:opacity-30"
                    disabled={question.trim().length === 0}
                  >
                    <ArrowUp size={14} aria-hidden />
                  </button>
                </form>
              }
            >
              <Conversation exchanges={exchanges} />
            </PreviewFrame>
          ) : channel === 'webcall' ? (
            <WebCallStage
              accepted={webcallAccepted}
              onAccept={() => setWebcallAccepted(true)}
            />
          ) : channel === 'voice' ? (
            <VoiceCallStage
              direction={direction}
              state={callState}
              muted={muted}
              onCall={onCall}
              onMuteToggle={() => setMuted((on) => !on)}
            />
          ) : (
            <p className="max-w-[320px] text-center text-[14px] leading-5 text-white/60">
              There is no preview for the {channelLabel} channel yet. Pick Widget, Web Call or
              Voice to run one.
            </p>
          )}
        </div>

        {channel === 'webcall' ? (
          // Web Call's panel is the shared shell with the phone-number select
          // (frame 170:64552); the frame shows no transcript body, so the body
          // stays empty — just the settings controls.
          <PreviewPanelShell
            scope="Web Call preview"
            controls={
              <PanelSelect
                label="Number"
                value={number}
                options={VOICE_NUMBERS}
                onChange={setNumber}
                icon="phone"
              />
            }
          >
            <p className="text-[14px] leading-5 text-white/40">
              Accept the terms on the left to start the call.
            </p>
          </PreviewPanelShell>
        ) : channel === 'voice' ? (
          <VoiceSettingsPanel
            played={VOICE_CALL.slice(0, played)}
            number={number}
            onNumberChange={setNumber}
            useCase={useCase}
          />
        ) : (
          <PreviewSettingsPanel
            exchanges={exchanges}
            language={language}
            segment={segment}
            onLanguageChange={setLanguage}
            onSegmentChange={setSegment}
            useCaseName={useCase?.name}
            useCaseScope={useCase?.segmentScope}
          />
        )}
      </div>
    </div>
  )
}
