// Centre column of the Web Call tab. Two states, chosen by the active rail
// section:
// - Segments: the launch state — the saturated rainbow ring around the Zendesk
//   mark with a call button beneath ("Explore-Voice-Unification" 133-125597).
// - Appearance: the in-call card from the Theme frame (135-138214) — a dark
//   header (brand mark, the segment's header text, sparkle), the ring in its
//   new palette, the mic / reactions / hang-up controls and the Built with
//   Zendesk footer, with the customization hint inside the card.
//
// Both rings are CSS, not assets: a blurred conic gradient with a white disc
// punched out of the middle. Decorative, so they are aria-hidden.
import { Cloud, Layers, ShoppingBag, Smile, Snowflake, Star } from 'lucide-react'
import { GardenIcon } from '@/components/garden-icon'
import { ZendeskLogo } from '@/components/ZendeskLogo'
import {
  PREVIEW_COPY,
  WEBCALL_CSAT_COPY,
  WEBCALL_PRIVACY_COPY,
  isAllSegments,
  summarizeTags,
  type Segment,
} from './config-data'
import { PreviewHint } from './PreviewFrame'
import { PreviewScope } from './WidgetPreview'

// Launch-state ring, sampled off the segments frame (133-125597): saturated
// rainbow. No design tokens — genuine one-off.
const LAUNCH_RING =
  'conic-gradient(from 0deg, #f08bb0 0deg, #1f7a8c 80deg, #63b34f 140deg, #a8d95f 185deg, #6b8afd 235deg, #9b5de5 285deg, #f27d98 335deg, #f08bb0 360deg)'

// The Knowledge frame's floating vendor logos (135-156009) — baked image
// assets there, so these are the repo's vendor stand-in convention: lucide
// glyphs tinted to the sampled brand colours, absolutely positioned over the
// card. Decorative, rendered inside the aria-hidden card.
const KNOWLEDGE_LOGOS: { at: string; tint: string; icon: typeof Cloud }[] = [
  { at: 'left-[139px] top-[195px]', tint: '#00a1e0', icon: Cloud }, // Salesforce
  { at: 'left-[309px] top-[195px]', tint: '#065ad3', icon: Layers }, // Confluence
  { at: 'left-[219px] top-[233px]', tint: '#95bf47', icon: ShoppingBag }, // Shopify
  { at: 'left-[388px] top-[241px]', tint: '#29b5e8', icon: Snowflake }, // Zendesk (light blue)
]

// In-call ring, sampled off the Theme frame's "ring new colors" (135-139217):
// softer than the launch ring — salmon across the top and down the left, cyan
// on the right, green across the bottom, violet lower left.
const CALL_RING =
  'conic-gradient(from 0deg, #f2a3a0 0deg, #4fbecb 80deg, #74d489 160deg, #c780dd 230deg, #ef8d72 300deg, #f2a3a0 360deg)'

export function WebCallPreview({
  segment,
  section,
  moodTab = 'CSAT',
}: {
  segment: Segment
  section: string
  /** The CSAT panel's tab: Emojis swaps the survey for the reaction sheet. */
  moodTab?: 'CSAT' | 'Emojis'
}) {
  const tagSummary = summarizeTags(segment.tags)

  return (
    <div className="flex flex-1 flex-col items-center gap-8 pt-2">
      <PreviewScope
        label={segment.label}
        chips={tagSummary ? [tagSummary] : []}
        // The share and install (fallback) sections are site-wide too, but
        // neither id is in ALL_SEGMENT_SECTIONS (that list is shared with the
        // other channels).
        allSegments={isAllSegments(section) || section === 'share' || section === 'install'}
      />
      {section === 'appearance' ||
      section === 'voice' ||
      section === 'sentiment' ||
      section === 'privacy' ||
      section === 'code' ||
      section === 'share' ||
      section === 'install' ||
      section === 'knowledge' ||
      section === 'mood' ? (
        <WebCallCallCard
          segment={segment}
          variant={
            section === 'voice'
              ? 'voice'
              : section === 'sentiment'
                ? 'personality'
                : section === 'privacy'
                  ? 'privacy'
                  : section === 'code'
                    ? 'embed'
                    : section === 'share'
                      ? 'share'
                      : section === 'install'
                        ? 'fallback'
                        : section === 'knowledge'
                          ? 'knowledge'
                          : section === 'mood'
                            ? moodTab === 'Emojis'
                              ? 'emojis'
                              : 'csat'
                            : 'theme'
          }
        />
      ) : (
        <>
          <div className="max-w-[434px]">
            <PreviewHint className="text-[#8d59b1]">{PREVIEW_COPY.webcall.hint}</PreviewHint>
          </div>
          <WebCallOrb className="mt-10" />
        </>
      )}
    </div>
  )
}

/**
 * The web call agent's launch state, and nothing else — decorative, so it is
 * aria-hidden. A 164px ring with the mark at 60px, and the teal-emphasis call
 * button beneath it.
 */
export function WebCallOrb({ className }: { className?: string }) {
  return (
    <div aria-hidden className={`flex flex-col items-center gap-10 ${className ?? ''}`}>
      <span className="relative flex size-[164px] items-center justify-center">
        <span
          className="absolute inset-0 rounded-full blur-[7px]"
          style={{ background: LAUNCH_RING }}
        />
        <span className="absolute inset-[11px] rounded-full bg-[#fdfdfc]" />
        {/* `relative`, so the mark paints above the absolutely-positioned disc. */}
        <span className="relative">
          <ZendeskLogo size={60} color="#17494d" />
        </span>
      </span>
      <span
        className="flex size-14 items-center justify-center rounded-full text-white shadow-[0_6px_18px_0_rgba(3,17,38,0.18)]"
        style={{ backgroundColor: '#367a74' }}
      >
        <GardenIcon name="phone-stroke" className="h-[22px] w-[22px]" />
      </span>
    </div>
  )
}

/**
 * The in-call card from the Theme frame: 400×652, black header over a white
 * body. Decorative — the controls are the frame's static mock, so the whole
 * card is aria-hidden. The Voice frame (135-140107) swaps the hint copy and
 * overlays the call greeting as a speech bubble on the ring; the AI
 * personality frame (135-142264) swaps the hint again. The Privacy frame
 * (135-144184) dims the call area and overlays the consent prompt sheet, and
 * its hint is gradient text (accent → primary emphasis); the Embed frame
 * (135-158769) keeps the gradient hint without the sheet; the Share/Caller
 * API frame (135-158264) does the same with its own copy.
 */
function WebCallCallCard({
  segment,
  variant,
}: {
  segment: Segment
  variant:
    | 'theme'
    | 'voice'
    | 'personality'
    | 'privacy'
    | 'embed'
    | 'share'
    | 'fallback'
    | 'knowledge'
    | 'csat'
    | 'emojis'
}) {
  const gradientHint =
    variant === 'privacy' ||
    variant === 'embed' ||
    variant === 'share' ||
    variant === 'fallback' ||
    variant === 'knowledge'
  // Fallback and knowledge share the frame treatment: a fixed-height card, no
  // ring, bottom-pinned controls, and a multi-paragraph gradient hint. CSAT
  // is also fixed-height and ringless, but keeps the solid-purple hint and
  // draws the survey itself.
  const explainer = variant === 'fallback' || variant === 'knowledge'
  const ringless = explainer || variant === 'csat'
  const csat = segment.webcall.csat
  const explainerParagraphs =
    variant === 'fallback'
      ? PREVIEW_COPY.webcall.fallbackHint
      : PREVIEW_COPY.webcall.knowledgeHint
  const hint =
    variant === 'voice'
      ? PREVIEW_COPY.webcall.voiceHint
      : variant === 'personality'
        ? PREVIEW_COPY.webcall.personalityHint
        : variant === 'privacy'
          ? PREVIEW_COPY.webcall.privacyHint
          : variant === 'embed'
            ? PREVIEW_COPY.webcall.embedHint
            : variant === 'share'
              ? PREVIEW_COPY.webcall.shareHint
              : variant === 'csat' || variant === 'emojis'
                ? PREVIEW_COPY.webcall.csatHint
                : PREVIEW_COPY.webcall.hint
  const privacy = segment.webcall.privacy
  return (
    <div
      aria-hidden
      data-testid="webcall-card"
      className={`relative flex w-[400px] flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_12px_32px_0_rgba(12,12,13,0.10)] ${
        // The fallback card drops the ring and pins the controls to the frame's
        // fixed 652px height.
        ringless ? 'h-[652px]' : ''
      }`}
    >
      <div className="flex h-[60px] items-center justify-between bg-black px-5">
        <div className="flex items-center gap-2">
          {/* The frame's 28px black Uber avatar — indistinguishable from text
              on the black header, so it renders as the mark alone. */}
          <span className="text-[13px] font-semibold text-white">Uber</span>
          <span className="text-[14px] font-semibold text-white">
            {segment.webcall.theme.headerText}
          </span>
        </div>
        <GardenIcon name="sparkle-stroke" className="h-5 w-5 text-white" />
      </div>

      {variant === 'knowledge'
        ? KNOWLEDGE_LOGOS.map(({ at, tint, icon: Icon }) => (
            <span key={at} aria-hidden className={`absolute ${at} -translate-x-1/2 -translate-y-1/2`}>
              <Icon size={26} style={{ color: tint }} strokeWidth={1.8} />
            </span>
          ))
        : null}

      <div
        className={`flex flex-col items-center px-6 pb-0 pt-[30px] ${ringless ? 'flex-1' : ''}`}
      >
        {explainer ? (
          // The fallback/knowledge hints are gradient paragraphs with
          // blank-line gaps, non-italic 14px.
          <div
            className={`max-w-[350px] space-y-5 bg-clip-text text-center text-[14px] font-semibold leading-[20px] tracking-[-0.154px] text-transparent ${variant === 'knowledge' ? 'mt-[170px]' : ''}`}
            style={{ backgroundImage: 'linear-gradient(141deg, #8d59b1 20%, #406cc4 125%)' }}
          >
            {explainerParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <p
            className={`max-w-[350px] text-center text-[13px] font-semibold italic leading-[20px] ${
              gradientHint ? 'bg-clip-text text-transparent' : 'text-[#8d59b1]'
            }`}
            style={
              gradientHint
                ? { backgroundImage: 'linear-gradient(173deg, #8d59b1 20%, #406cc4 125%)' }
                : undefined
            }
          >
            {hint}
          </p>
        )}
        {ringless ? null : (
          <span className="relative mt-[36px] size-[220px]">
            <span
              className="absolute inset-0 rounded-full blur-[6px]"
              style={{ background: CALL_RING }}
            />
            <span className="absolute inset-[13px] rounded-full bg-white" />
            {variant === 'voice' ? (
              <span className="absolute left-1/2 top-1/2 w-[329px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white px-5 py-4 text-center text-[14px] leading-5 text-ink shadow-[0_8px_24px_0_rgba(12,12,13,0.12)]">
                {segment.webcall.voice.greeting}
              </span>
            ) : null}
          </span>
        )}

        {variant === 'csat' ? <CsatSurvey segment={segment} /> : null}

        <div className={`${ringless ? 'mt-auto' : 'mt-[126px]'} flex items-center gap-6`}>
          <span className="flex size-[60px] items-center justify-center rounded-full border border-[#e6e6e3] bg-white text-black">
            <GardenIcon name="microphone-on-stroke" className="h-[26px] w-[26px]" />
          </span>
          <span className="flex size-[60px] items-center justify-center rounded-full border border-[#e6e6e3] bg-white text-black">
            <GardenIcon name="smiley-stroke" className="h-[26px] w-[26px]" />
          </span>
          <span className="flex size-[60px] items-center justify-center rounded-full bg-[#e53112] text-white">
            <GardenIcon name="phone-stroke" className="h-7 w-7 rotate-[135deg]" />
          </span>
        </div>

        <div className="mb-3 mt-[21px] flex h-10 items-center gap-2 text-[12px] font-semibold text-[#737373]">
          <ZendeskLogo size={14} color="#0c0c0d" />
          {PREVIEW_COPY.webcall.footer}
        </div>
      </div>

      {/* The Privacy frame dims the call area and overlays the consent prompt
          sheet; empty fields fall back to their placeholder copy. */}
      {/* The Emojis tab overlays the reaction sheet on the ring card
          (135-154344); it hides when the feature is toggled off. */}
      {variant === 'emojis' && csat.emojisOn ? (
        <div
          data-testid="emoji-sheet"
          className="absolute inset-x-0 bottom-0 flex h-[204px] flex-col gap-11 rounded-t-[20px] border border-black/10 bg-white px-6 py-6 shadow-[0_0_1px_0_rgba(0,12,32,0.04),2px_5px_8px_0_rgba(3,17,38,0.11)]"
        >
          {[WEBCALL_CSAT_COPY.emojis.list.slice(0, 4), WEBCALL_CSAT_COPY.emojis.list.slice(4)].map(
            (row, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-between">
                {row.map((item) => (
                  <span
                    key={item.id}
                    aria-label={item.label}
                    role="img"
                    className="text-[36px] leading-none"
                  >
                    {item.emoji}
                  </span>
                ))}
              </div>
            ),
          )}
        </div>
      ) : null}

      {variant === 'privacy' ? (
        <>
          <span className="absolute inset-0 bg-white/70" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold leading-5 tracking-[-0.154px] text-black">
                {privacy.promptHeader || WEBCALL_PRIVACY_COPY.promptHeader.placeholder}
              </span>
              <GardenIcon name="x-stroke" className="h-5 w-5 text-black" />
            </div>
            <p className="text-[14px] leading-5 tracking-[-0.154px] text-black">
              {privacy.policyBody || WEBCALL_PRIVACY_COPY.policyBody.placeholder}
            </p>
            <span className="flex h-10 items-center justify-center rounded-[20px] bg-black px-[13px] text-[14px] font-medium leading-5 tracking-[-0.1px] text-white">
              {privacy.ctaLabel || WEBCALL_PRIVACY_COPY.ctaLabel.placeholder}
            </span>
          </div>
        </>
      ) : null}
    </div>
  )
}

/**
 * The CSAT survey drawn inside the card (frame 135-152791): the rating
 * question, the five-step scale in the configured style (the frame draws four
 * of five stars filled), then the follow-up with its reason chips. Binds to
 * the segment's webcall csat config; decorative inside the aria-hidden card.
 */
function CsatSurvey({ segment }: { segment: Segment }) {
  const csat = segment.webcall.csat
  return (
    <div className="mt-[60px] flex w-full flex-col items-center px-2">
      <p className="text-center text-[14px] leading-5 tracking-[-0.154px] text-black">
        {csat.question}
      </p>
      <div className="mt-5 flex items-start gap-5">
        {csat.steps.map((step, index) => (
          <span key={step.value} className="flex w-10 flex-col items-center gap-1">
            {csat.style === 'stars' ? (
              <Star
                size={32}
                color={index < 4 ? '#f5c518' : '#b7b7b3'}
                fill={index < 4 ? '#f5c518' : 'none'}
                strokeWidth={1.5}
                aria-hidden
              />
            ) : csat.style === 'smiles' ? (
              <span style={{ fontSize: 28, lineHeight: 1 }} aria-hidden>
                😍
              </span>
            ) : (
              <Smile size={32} className="text-grey-600" aria-hidden />
            )}
            <span className="text-[11px] leading-4 text-grey-600">{step.label}</span>
          </span>
        ))}
      </div>
      <hr className="my-5 w-full border-t border-grey-200" />
      <p className="whitespace-pre-line text-center text-[13px] leading-[18px] text-black">
        {PREVIEW_COPY.webcall.csatFollowUp}
      </p>
      <div className="mt-3 flex items-center gap-2">
        {PREVIEW_COPY.webcall.csatChips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-grey-200 bg-white px-3 py-1 text-[12px] leading-4 text-ink"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}
