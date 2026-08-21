// Left column of the Voice preview: the agent, what to do next, and the call
// controls (frames 147:172564 running / 158:60717 idle-outbound).
//
// The orb here is NOT Configuration's `VoiceRing`: these frames draw a dark
// disc with the white Zendesk mark and a crisp thin gradient ring, where the
// Configuration orb is a blurred ring alone. The ring still swirls and the
// glow still breathes (theme.css `animate-orb-*`), both compositor-only.
import { Mic, MicOff, Phone, PhoneOff, Play, Smile } from 'lucide-react'
import { ZendeskLogo } from '@/components/ZendeskLogo'
import { startHint } from './voice-call'

export type CallState = 'idle' | 'running' | 'ended'

const RING = 'conic-gradient(from 210deg, #f6c4ab, #f3a9c0, #b6c9ea, #a9d7e8, #c9e5a8, #f6c4ab)'

/**
 * The frame's orb: a 164px gradient ring ~5px thick around a dark centre, the
 * white mark inside, and a soft copy of the ring blurred behind it. Only the
 * gradient layers rotate — the disc and the mark stay put.
 */
function PreviewOrb() {
  return (
    <span aria-hidden className="relative flex size-[164px] items-center justify-center">
      <span
        className="absolute -inset-4 rounded-full opacity-70 blur-[18px] animate-orb-halo"
        style={{ background: RING }}
      />
      <span
        className="absolute inset-0 rounded-full animate-orb-swirl"
        style={{
          background: RING,
          // Punch the centre out so only a 5px ring of the gradient shows.
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 5px))',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 5px))',
        }}
      />
      {/* The frame's disc is solid dark, so the breathing halo behind it must
          not bleed through — an opaque cover inside the ring, then the mark. */}
      <span className="absolute inset-[5px] rounded-full bg-[#0d1c28]" />
      <span className="relative">
        <ZendeskLogo size={60} color="#ffffff" />
      </span>
    </span>
  )
}

// One `shadow-[…]` carrying all three layers: two arbitrary shadow classes would
// both compile to `box-shadow` and the later rule would silently drop the other.
const CIRCLE =
  'flex size-[60px] items-center justify-center rounded-full ' +
  'shadow-[0_7px_5px_0_rgba(0,0,0,0.05),inset_0_-1px_1px_0_rgba(255,255,255,0.1),inset_0_1px_1px_0_rgba(255,255,255,0.25)]'

/** A 60px round control with its name beneath it, as the frame labels them. */
function CallControl({
  label,
  className,
  pressed,
  onClick,
  children,
}: {
  label: string
  className: string
  pressed?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        onClick={onClick}
        className={`${CIRCLE} ${className}`}
      >
        {children}
      </button>
      <span className="text-[14px] leading-5 tracking-[-0.1px] text-white">{label}</span>
    </div>
  )
}

const CAPTION: Record<CallState, (direction: string) => string> = {
  idle: startHint,
  // The running frame draws no caption under the orb — the call speaks for
  // itself in the transcript column.
  running: () => '',
  ended: () => 'Call ended. Click Restart to run it again.',
}

const PRIMARY: Record<CallState, string> = {
  idle: 'Start',
  running: 'End call',
  ended: 'Restart',
}

export function VoiceCallStage({
  direction,
  state,
  muted,
  onCall,
  onMuteToggle,
  onSendCsat,
}: {
  direction: string
  state: CallState
  muted: boolean
  /** Start, End call or Restart — whichever the current state offers. */
  onCall: () => void
  onMuteToggle: () => void
  /** Frame 147:172564's third control while a call runs: text the CSAT survey. */
  onSendCsat?: () => void
}) {
  const running = state === 'running'
  const caption = CAPTION[state](direction)

  return (
    <div className="flex flex-col items-center">
      <PreviewOrb />
      {/* Fixed height so the controls below never shift when the caption
          appears (idle/ended) or empties (running). */}
      <p className="mt-8 h-5 text-center text-[14px] leading-5 tracking-[-0.1px] text-white">
        {caption}
      </p>

      <div className="mt-14 flex items-start gap-11">
        {running && (
          <CallControl
            label={muted ? 'Unmute' : 'Mute'}
            pressed={muted}
            onClick={onMuteToggle}
            className="bg-white/20 text-white backdrop-blur-[44px]"
          >
            {muted ? <MicOff size={26} aria-hidden /> : <Mic size={26} aria-hidden />}
          </CallControl>
        )}
        <CallControl
          label={PRIMARY[state]}
          onClick={onCall}
          // The frame's Start is the azure emphasis tag fill with a play glyph;
          // only the running state turns the primary control red.
          className={running ? 'bg-red-700 text-white' : 'bg-[#3191ea] text-white'}
        >
          {running ? (
            <PhoneOff size={26} aria-hidden />
          ) : state === 'ended' ? (
            <Phone size={26} aria-hidden />
          ) : (
            <Play size={26} aria-hidden className="translate-x-[1px]" />
          )}
        </CallControl>
        {running && (
          <CallControl
            label="SMS CSAT"
            onClick={() => onSendCsat?.()}
            className="bg-white/20 text-white backdrop-blur-[44px]"
          >
            <Smile size={26} aria-hidden />
          </CallControl>
        )}
      </div>
    </div>
  )
}
