// Centre column of the Voice tab: the numbers this segment answers on, a line
// pointing at the panel, and the agent itself — the gradient ring around the
// Zendesk mark, with a call button beneath it.
//
// The ring is CSS, not an asset: a blurred conic gradient with a white disc
// punched out of the middle. Decorative, so it is aria-hidden.
import { Phone, User } from 'lucide-react'
import { ZendeskLogo } from '@/components/ZendeskLogo'
import { PREVIEW_COPY, type Segment, type VoiceCsatConfig } from './config-data'
import { PreviewHint } from './PreviewFrame'
import { CsatPreviewBody } from './preview-bodies'
import { PreviewScope } from './WidgetPreview'
import type { VoiceCsatTab } from './VoiceCsatPanel'

const RING = 'conic-gradient(from 210deg, #f6c4ab, #f3a9c0, #b6c9ea, #a9d7e8, #c9e5a8, #f6c4ab)'

// Site-wide voice sections — the preview says "Enabled for all segments"
// instead of naming one segment's numbers (frame "Enabled for all segments").
const ALL_SEGMENT_VOICE_SECTIONS = ['knowledge', 'install', 'api'] as const

export function VoicePreview({
  segment,
  section,
  csatTab,
}: {
  segment: Segment
  section: string
  /** Which CSAT tab the panel is on — the phone previews that half. */
  csatTab?: VoiceCsatTab
}) {
  const copy = PREVIEW_COPY.voice
  const hint =
    section === 'voice'
      ? copy.voiceHint
      : section === 'license'
        ? copy.privacyHint
        : section === 'mood'
          ? copy.csatHint
          : section === 'sentiment'
            ? copy.personalityHint
            : section === 'knowledge'
              ? copy.knowledgeHint
              : section === 'install'
                ? copy.fallbackHint
                : section === 'api'
                  ? copy.apiHint
                  : copy.segmentHint
  const previewNumbers = segment.voice.phoneNumbers.map((number) => number.replace(/[\s-]/g, ''))
  const allSegments = (ALL_SEGMENT_VOICE_SECTIONS as readonly string[]).includes(section)

  // The frames overlay the active message on the ring: the greeting for the
  // Voice section, the recording disclosure for Privacy.
  const bubble =
    section === 'voice'
      ? `“${segment.voice.settings.greeting}”`
      : section === 'license'
        ? segment.voice.privacy.disclaimer
        : null

  return (
    <div className="flex flex-1 flex-col items-center gap-8 pt-2">
      <PreviewScope
        label={segment.label}
        chips={previewNumbers}
        allSegments={allSegments}
        icon="phone-stroke"
      />
      {section === 'mood' ? (
        // The CSAT frames preview the customer's phone, not the ring: the SMS
        // tab shows the message as delivered; the survey tab shows the survey.
        csatTab === 'csat' ? (
          <CsatSurveyPhone mark={segment.widgetMark} csat={segment.voice.csat} />
        ) : (
          <SmsPhone segment={segment} />
        )
      ) : (
        <>
          <div className="max-w-[420px]">
            <PreviewHint>{hint}</PreviewHint>
          </div>
          <div className="relative mt-14">
            <VoiceOrb />
            {bubble ? (
              <div className="absolute left-1/2 top-[38%] z-10 w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-[46px] border border-white/40 bg-white/70 px-5 py-4 text-center text-[14px] leading-5 tracking-[-0.154px] text-black shadow-[0_0_40px_0_rgba(0,0,0,0.1)] backdrop-blur-[50px]">
                {bubble}
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * The phone shell the CSAT frames draw the customer's screen in: a plain
 * white handset with a home indicator. The survey tab adds its own dark
 * header inside.
 */
function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[650px] w-[382px] overflow-hidden rounded-2xl bg-white shadow-[0_11px_46px_0_rgba(0,0,0,0.05)]">
      {children}
      <div aria-hidden className="absolute bottom-2 left-1/2 h-[5px] w-[152px] -translate-x-1/2 rounded-full bg-grey-200" />
    </div>
  )
}

/** SMS tab preview: the survey invitation as it lands in the messages app. */
function SmsPhone({ segment }: { segment: Segment }) {
  const c = PREVIEW_COPY.voice.sms
  return (
    <PhoneShell>
      <div className="flex flex-col items-center pt-14">
        <span className="flex size-14 items-center justify-center rounded-full bg-grey-200 text-grey-500">
          <User size={28} aria-hidden />
        </span>
        <p className="mt-4 text-[12px] font-semibold leading-4 text-black">
          {segment.voice.phoneNumbers[0]}
        </p>
        <p className="mt-1 text-[12px] leading-4 text-grey-500">{c.testMessage}</p>
      </div>
      <div className="mx-5 mt-20 rounded-2xl bg-[#f7f7f7] px-4 py-4">
        <p className="text-[14px] leading-5 tracking-[-0.154px] text-black">
          {segment.voice.csat.smsMessage}
        </p>
        <p className="mt-2 text-[14px] leading-5 tracking-[-0.154px] text-accent-blue">
          {c.feedbackLink}
        </p>
      </div>
    </PhoneShell>
  )
}

/** CSAT tab preview: the survey on the phone, reusing the widget's body. */
function CsatSurveyPhone({ mark, csat }: { mark: string; csat: VoiceCsatConfig }) {
  return (
    <PhoneShell>
      <div className="flex h-16 items-center bg-black px-4">
        <span className="text-[11px] font-semibold text-white">{mark}</span>
      </div>
      <div className="px-6 py-5">
        <CsatPreviewBody
          csat={{
            style: csat.style,
            question: csat.question,
            steps: csat.steps,
          }}
        />
      </div>
    </PhoneShell>
  )
}

/**
 * The agent itself, and nothing else — decorative, so it is aria-hidden. Split
 * out from `VoiceOrb` because the Use cases preview draws its own Mute / Start
 * pair beneath the ring and must not carry a second call button.
 */
export function VoiceRing({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative flex size-[168px] items-center justify-center ${className ?? ''}`}
    >
      {/* The halo breathes behind the ring; the ring's own gradient swirls.
          Both stop under prefers-reduced-motion (see theme.css). */}
      <span className="absolute -inset-3 rounded-full blur-[14px] animate-orb-halo" style={{ background: RING }} />
      <span
        className="absolute inset-0 rounded-full blur-[7px] animate-orb-swirl"
        style={{ background: RING }}
      />
      <span className="absolute inset-[11px] rounded-full bg-[#fdfdfc]" />
      {/* `relative`, so the mark paints above the absolutely-positioned disc. */}
      <span className="relative">
        <ZendeskLogo size={58} color="#17494d" />
      </span>
    </span>
  )
}

/**
 * The Configuration preview's agent: the ring with a call button beneath it.
 * Nothing here is segment-scoped — only the scope row around it was.
 */
export function VoiceOrb({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-10 ${className ?? ''}`}>
      <VoiceRing />
      <button
        type="button"
        aria-label={PREVIEW_COPY.voice.call}
        className="flex size-14 items-center justify-center rounded-full bg-[#0d7a72] text-white shadow-[0_6px_18px_0_rgba(3,17,38,0.18)]"
      >
        <Phone size={22} aria-hidden />
      </button>
    </div>
  )
}
