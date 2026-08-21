// Left column of the Web Call preview (frame 170:64552): the web-call device
// card — black agent header, the gradient voice ring, and the Privacy Policy
// consent sheet over the bottom until it is accepted.
//
// The frame ALSO draws a floating 60px control row (menu / mood-smile / red
// hang-up) at card-y 532 — squarely behind the consent sheet, which covers it,
// so it is omitted rather than rendered invisible (see comment in
// WebCallStage.test).
import { Expand, Mic, PhoneOff, Smile } from 'lucide-react'
import { GardenIcon } from '@/components/garden-icon'

// The frame's "ring new colors" group: a 220px gradient ring with a soft halo.
// Sampled from the frame's render.
const RING = 'conic-gradient(from 210deg, #dfa493, #c4a7cf, #9dbfe0, #7ec9a5, #a8cf97, #dfa493)'

/** The frame's consent sheet: title, body, black Accept Terms pill. */
function ConsentSheet({ onAccept }: { onAccept: () => void }) {
  return (
    <div
      data-testid="webcall-consent"
      className="absolute inset-x-0 bottom-0 flex flex-col gap-6 rounded-2xl bg-white p-6 text-ink"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold leading-5 tracking-[-0.154px] text-black">
          Privacy Policy
        </h3>
        {/* Decorative in the frame (the sheet is modal — only Accept dismisses
            it), so the ✕ carries no handler. */}
        <span aria-hidden className="text-[18px] leading-6 text-black">
          ✕
        </span>
      </div>
      <p className="text-[14px] leading-5 tracking-[-0.154px] text-black">
        This call may be recorded for quality assurance and training purposes.
      </p>
      <button
        type="button"
        onClick={onAccept}
        className="flex h-10 w-full items-center justify-center rounded-[20px] bg-black text-[14px] font-medium leading-5 tracking-[-0.1px] text-white"
      >
        Accept Terms
      </button>
    </div>
  )
}

export function WebCallStage({
  accepted,
  onAccept,
  onHangUp,
}: {
  /** Consent accepted — the sheet lifts and the call controls show. */
  accepted: boolean
  onAccept: () => void
  /** The red hang-up ends the mock call; no call actually runs. */
  onHangUp?: () => void
}) {
  return (
    <div
      data-testid="webcall-stage"
      className="relative h-full max-h-[700px] w-[400px] overflow-hidden rounded-2xl bg-white shadow-[0_11.46px_45.84px_0_rgba(0,0,0,0.05)]"
    >
      {/* Black agent header: Uber mark + (sic) "RIder Support", license and
          minimize icons — per the frame. */}
      <div className="flex h-[60px] items-center justify-between bg-black px-5">
        <span className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white ring-1 ring-white/20">
            Uber
          </span>
          {/* The frame's copy, capitalisation included. */}
          <span className="text-[14px] leading-5 tracking-[-0.154px] text-white">
            RIder Support
          </span>
        </span>
        <span className="flex items-center gap-2 text-white">
          <GardenIcon name="file-document-stroke" className="size-5" />
          <Expand size={20} aria-hidden />
        </span>
      </div>

      {/* The voice ring, centred in the card's upper half per the frame. */}
      <div className="flex h-[452px] items-center justify-center">
        <span aria-hidden className="relative flex size-[220px] items-center justify-center">
          <span
            className="absolute -inset-10 rounded-full opacity-60 blur-[42px] animate-orb-halo"
            style={{ background: RING }}
          />
          <span
            className="absolute inset-0 rounded-full animate-orb-swirl"
            style={{
              background: RING,
              // Punch the centre out so only a thin band of the gradient shows.
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 7px), black calc(100% - 6px))',
              WebkitMask:
                'radial-gradient(farthest-side, transparent calc(100% - 7px), black calc(100% - 6px))',
            }}
          />
        </span>
      </div>

      {/* Floating controls, revealed when the consent sheet lifts (the frame
          draws them behind it): menu-mic, mood-smile, red hang-up. */}
      {accepted && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-6">
          <button
            type="button"
            aria-label="Open menu"
            className="flex size-[60px] items-center justify-center rounded-full border border-[#d2d3d8] bg-white text-[#404241]"
          >
            <Mic size={26} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Send reaction"
            className="flex size-[60px] items-center justify-center rounded-full border border-[#d2d3d8] bg-white text-[#404241]"
          >
            <Smile size={26} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Hang up"
            onClick={onHangUp}
            className="flex size-[60px] items-center justify-center rounded-full bg-[#e53112] text-white"
          >
            <PhoneOff size={26} aria-hidden />
          </button>
        </div>
      )}

      {!accepted && <ConsentSheet onAccept={onAccept} />}
    </div>
  )
}
