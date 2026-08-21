// Mood section: the CSAT survey's configuration — when it is offered, what it
// asks, which scale it is drawn with, and what each rating is called. The panel
// leads with a CSAT / Quick Feedback tab pair; only CSAT is designed, so Quick
// Feedback reads as the app's usual coming-soon placeholder.
//
// Presentational — every edit bubbles up via onCsatChange.
import { useState } from 'react'
import { Heart, Smile, Star } from 'lucide-react'
import {
  CSAT_COPY as COPY,
  CSAT_SCALE_OPTIONS,
  CSAT_STYLES,
  type CsatConfig,
  type CsatStyle,
  type RailSection,
  type RatingStep,
  type RatingTone,
} from './config-data'
import {
  CheckRow,
  GroupLabel,
  PanelDivider,
  PanelShell,
  Select,
  TextField,
  ToggleRow,
} from './panel-parts'

// Badge palette per sentiment, from the frame.
// Exported for the voice CSAT panel, which badges its scale steps the same way.
export const TONE_BADGE: Record<RatingTone, { bg: string; fg: string; label: string }> = {
  negative: { bg: '#ffd8cc', fg: '#d82c0d', label: 'Negative' },
  neutral: { bg: '#e8e9eb', fg: '#545767', label: 'Neutral' },
  positive: { bg: '#e8f6f1', fg: '#1f866a', label: 'Positive' },
}

/** The scale's mark, drawn the way the chosen style draws it. */
function StyleGlyph({ style, size }: { style: CsatStyle; size: number }) {
  if (style.id === 'stars') {
    return <Star size={size} color="#f5c518" fill="#f5c518" strokeWidth={1.5} aria-hidden />
  }
  if (style.id === 'hearts') {
    return <Heart size={size} color="#ed4264" fill="#ed4264" strokeWidth={1.5} aria-hidden />
  }
  if (style.kind === 'outline') return <Smile size={size} className="text-grey-600" aria-hidden />
  if (style.kind === 'numeral') {
    return (
      <span className="font-medium text-grey-600" style={{ fontSize: size * 0.55 }} aria-hidden>
        {style.value}
      </span>
    )
  }
  return (
    <span style={{ fontSize: size * 0.85, lineHeight: 1 }} aria-hidden>
      {style.value}
    </span>
  )
}

function RatingRow({
  step,
  style,
  onLabelChange,
}: {
  step: RatingStep
  style: CsatStyle
  onLabelChange: (label: string) => void
}) {
  const badge = TONE_BADGE[step.tone]
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-[38px] shrink-0 items-center gap-1">
        <span className="text-[14px] font-medium leading-5 text-black">{step.value}</span>
        <StyleGlyph style={style} size={20} />
      </div>
      <div className="flex-1">
        <TextField
          label={`Rating ${step.value} label`}
          value={step.label}
          onChange={onLabelChange}
          density="compact"
        />
      </div>
      <span
        className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-[-0.1px]"
        style={{ backgroundColor: badge.bg, color: badge.fg }}
      >
        {badge.label}
      </span>
    </div>
  )
}

type CsatPanelProps = {
  csat: CsatConfig
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onCsatChange: (patch: Partial<CsatConfig>) => void
}

export function CsatPanel({
  csat,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onCsatChange,
}: CsatPanelProps) {
  const [tab, setTab] = useState<'CSAT' | 'Quick Feedback'>('CSAT')
  const style = CSAT_STYLES.find((s) => s.id === csat.style) ?? CSAT_STYLES[0]

  const setStep = (value: number, label: string) =>
    onCsatChange({ steps: csat.steps.map((s) => (s.value === value ? { ...s, label } : s)) })

  const header = (
    <div role="tablist" aria-label="Feedback type" className="flex items-center gap-2">
      {COPY.tabs.map((name) => {
        const active = name === tab
        return (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setTab(name as 'CSAT' | 'Quick Feedback')}
            className={`px-3 py-2 text-[16px] leading-6 tracking-[-0.1px] ${
              active ? 'border-b-2 border-[#01567a] text-black' : 'text-grey-500'
            }`}
          >
            {name}
          </button>
        )
      })}
    </div>
  )

  return (
    <PanelShell
      header={header}
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      {tab === 'Quick Feedback' ? (
        <div className="mt-10 text-center">
          <p className="text-[14px] font-medium text-ink">Quick Feedback</p>
          <p className="mt-2 text-[12px] text-ink-muted">Coming soon</p>
        </div>
      ) : (
        <>
          <div className="mt-5">
            <ToggleRow
              label={COPY.toggleLabel}
              checked={csat.on}
              onChange={() => onCsatChange({ on: !csat.on })}
              showState
              tone="teal"
            />
          </div>

          {/* Availability */}
          <div className="mt-5">
            <GroupLabel label={COPY.availability} />
            <div className="mt-3 flex flex-col gap-1.5">
              <CheckRow
                label={`${COPY.afterPrefix} ${csat.afterInteractionsCount} ${COPY.afterSuffix}`}
                checked={csat.afterInteractions}
                onChange={() => onCsatChange({ afterInteractions: !csat.afterInteractions })}
              >
                <span>{COPY.afterPrefix}</span>
                <input
                  type="text"
                  aria-label="User interactions before CSAT"
                  value={csat.afterInteractionsCount}
                  onChange={(e) => onCsatChange({ afterInteractionsCount: e.target.value })}
                  className="w-8 rounded-lg border border-[#bcbdc5] bg-white px-1.5 py-1 text-center text-[12px] text-black"
                />
                <span>{COPY.afterSuffix}</span>
              </CheckRow>
              <CheckRow
                label={COPY.viaWidgetHeader}
                checked={csat.viaWidgetHeader}
                onChange={() => onCsatChange({ viaWidgetHeader: !csat.viaWidgetHeader })}
              />
              <CheckRow
                label={COPY.onLiveChatEnd}
                checked={csat.onLiveChatEnd}
                onChange={() => onCsatChange({ onLiveChatEnd: !csat.onLiveChatEnd })}
              />
              {/* Owned by the Policy, so it is shown as on and left alone. */}
              <CheckRow label={COPY.onPolicyTrigger} checked={csat.onPolicyTrigger} disabled />
            </div>
          </div>

          {/* Rating question */}
          <div className="mt-6">
            <GroupLabel label={COPY.question} />
            <div className="mt-3">
              <TextField
                label={COPY.question}
                value={csat.question}
                onChange={(question) => onCsatChange({ question })}
              />
            </div>
          </div>

          {/* Scale */}
          <div className="mt-4">
            <p className="mb-1.5 text-[14px] font-medium leading-5 text-black">{COPY.scale}</p>
            <Select
              label={COPY.scale}
              value={csat.scale}
              options={CSAT_SCALE_OPTIONS}
              onChange={(scale) => onCsatChange({ scale })}
            />
          </div>

          {/* Style */}
          <div className="mt-4">
            <p className="mb-2 text-[14px] font-medium leading-5 text-black">{COPY.style}</p>
            <div className="grid grid-cols-3 gap-2">
              {CSAT_STYLES.map((option) => {
                const selected = option.id === csat.style
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onCsatChange({ style: option.id })}
                    className={`flex flex-col items-center rounded-lg border bg-white px-3 py-1 ${
                      selected ? 'border-[#01567a]' : 'border-[#e8e9eb]'
                    }`}
                  >
                    <span className="flex h-7 w-8 items-center justify-center">
                      <StyleGlyph style={option} size={26} />
                    </span>
                    {/* nowrap keeps the six cards the same height — "Animated
                        smiles" is the only label that would wrap. */}
                    <span
                      className={`whitespace-nowrap text-[10px] font-semibold leading-3 ${selected ? 'text-black' : 'text-grey-500'}`}
                    >
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <PanelDivider />

          {/* Per-rating labels */}
          <div className="flex flex-col gap-1">
            {csat.steps.map((step) => (
              <RatingRow
                key={step.value}
                step={step}
                style={style}
                onLabelChange={(label) => setStep(step.value, label)}
              />
            ))}
          </div>
        </>
      )}
    </PanelShell>
  )
}
