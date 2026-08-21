// Web Call ▸ CSAT (the rail's smiley section): the CSAT / Emojis tab pair —
// only CSAT is designed, so Emojis reads as the app's usual coming-soon
// placeholder — then the enable toggle, the availability checkboxes (the
// Policy-trigger row is locked on — the Policy owns it), the rating question
// with its character footnote, the scale select, the three style tiles
// (stars / emoji smiles / outline smiles), and the per-rating label rows with
// their sentiment badges.
//
// Same anatomy as the widget's CsatPanel with this frame's own copy, seeds
// and style set; the badges reuse the shared TONE_BADGE palette.
//
// The Emojis tab (frame 135-154344) is the enable toggle, the explainer, and
// the fixed emoji legend; the tab itself is lifted into ConfigurationView so
// the centre preview can swap the survey for the reaction sheet.
//
// Presentational; every edit bubbles up via onCsatChange. From the frames
// "Explore-Voice-Unification" (135-152791, 135-133944, 135-154344).
import { Plus, Smile, Star, Trash2 } from 'lucide-react'
import {
  WEBCALL_CSAT_COPY as COPY,
  type RailSection,
  type WebCallCsat,
  type WebCallCsatStyleId,
} from './config-data'
import { TONE_BADGE } from './CsatPanel'
import {
  CheckRow,
  Footnote,
  GroupLabel,
  PanelDivider,
  PanelShell,
  Select,
  TextField,
  ToggleRow,
} from './panel-parts'

/** The rating mark, drawn the way the chosen style draws it. */
function StyleGlyph({ style, size }: { style: WebCallCsatStyleId; size: number }) {
  if (style === 'stars') {
    return <Star size={size} color="#f5c518" fill="#f5c518" strokeWidth={1.5} aria-hidden />
  }
  if (style === 'smiles') {
    return (
      <span style={{ fontSize: size * 0.9, lineHeight: 1 }} aria-hidden>
        😍
      </span>
    )
  }
  return <Smile size={size} className="text-grey-600" aria-hidden />
}

function RatingRow({
  value,
  label,
  tone,
  style,
  onLabelChange,
}: {
  value: number
  label: string
  tone: keyof typeof TONE_BADGE
  style: WebCallCsatStyleId
  onLabelChange: (label: string) => void
}) {
  const badge = TONE_BADGE[tone]
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-[38px] shrink-0 items-center gap-1">
        <span className="text-[14px] font-medium leading-5 text-black">{value}</span>
        <StyleGlyph style={style} size={20} />
      </div>
      <div className="flex-1">
        <TextField
          label={`Rating ${value} label`}
          value={label}
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

/** A tone tag chip (Negative/Neutral/Positive) from the shared palette. */
function ToneTag({ tone }: { tone: keyof typeof TONE_BADGE }) {
  const badge = TONE_BADGE[tone]
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-[-0.1px]"
      style={{ backgroundColor: badge.bg, color: badge.fg }}
    >
      {badge.label}
    </span>
  )
}

/** The selectable-reasons editor: one input row + remove per reason, and the
 * stretched "+ Add option" pill appending a blank row. */
function ReasonList({
  reasons,
  onChange,
}: {
  reasons: string[]
  onChange: (reasons: string[]) => void
}) {
  return (
    <div className="mt-2 flex flex-col gap-2">
      {reasons.map((reason, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            aria-label={`Reason ${index + 1}`}
            value={reason}
            onChange={(e) =>
              onChange(reasons.map((r, i) => (i === index ? e.target.value : r)))
            }
            className="h-10 flex-1 rounded-lg border border-[#bcbdc5] bg-white px-3 text-[14px] leading-5 tracking-[-0.154px] text-black outline-none focus:border-accent-blue"
          />
          <button
            type="button"
            aria-label={`Remove reason ${index + 1}`}
            onClick={() => onChange(reasons.filter((_, i) => i !== index))}
            className="flex size-8 shrink-0 items-center justify-center rounded text-ink-muted transition-colors duration-instant ease-soft hover:bg-control-hover"
          >
            <Trash2 size={18} aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...reasons, ''])}
        className="flex h-8 w-full items-center justify-center gap-2 rounded-full border border-[#999b97] text-[12px] font-semibold leading-4 text-[#2f3130] transition-colors duration-instant ease-soft hover:bg-grey-100"
      >
        <Plus size={14} aria-hidden />
        {COPY.addOption}
      </button>
    </div>
  )
}

export type WebCallFeedbackTab = 'CSAT' | 'Emojis'

type WebCallCsatPanelProps = {
  csat: WebCallCsat
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onCsatChange: (patch: Partial<WebCallCsat>) => void
  /** Lifted so the preview can follow the active tab. */
  tab: WebCallFeedbackTab
  onTabChange: (tab: WebCallFeedbackTab) => void
}

export function WebCallCsatPanel({
  csat,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onCsatChange,
  tab,
  onTabChange,
}: WebCallCsatPanelProps) {

  const setStep = (value: number, label: string) =>
    onCsatChange({
      steps: csat.steps.map((s) => (s.value === value ? { ...s, label } : s)),
    })

  // The frame's underlined tab strip, like the Appearance panel's Theme/Avatar.
  const header = (
    <div role="tablist" aria-label="Feedback type" className="flex gap-6 border-b border-grey-200">
      {COPY.tabs.map((name) => {
        const selected = tab === name
        return (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onTabChange(name)}
            className={`-mb-px border-b-2 pb-2 text-[14px] leading-5 tracking-[-0.154px] ${
              selected
                ? 'border-black font-semibold text-black'
                : 'border-transparent text-grey-600'
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
      {tab === 'Emojis' ? (
        <>
          {/* Emojis (135-154344): enable toggle, explainer, fixed legend. */}
          <div className="mt-5">
            <ToggleRow
              label={csat.emojisOn ? COPY.emojis.toggleOn : COPY.emojis.toggleOff}
              checked={csat.emojisOn}
              onChange={() => onCsatChange({ emojisOn: !csat.emojisOn })}
              tone="teal"
            />
          </div>
          <p className="mt-5 text-[14px] leading-5 tracking-[-0.154px] text-grey-800">
            {COPY.emojis.body}
          </p>
          <ul className="mt-5 grid grid-cols-3 gap-2">
            {COPY.emojis.list.map((item) => (
              <li
                key={item.id}
                className="flex flex-col items-center gap-2 rounded-lg border border-grey-200 bg-white px-4 py-2"
              >
                <span className="flex size-10 items-center justify-center text-[32px] leading-none" aria-hidden>
                  {item.emoji}
                </span>
                <span className="text-[12px] leading-4 text-grey-600">{item.label}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="mt-5">
            <ToggleRow
              label={csat.on ? COPY.toggleOn : COPY.toggleOff}
              checked={csat.on}
              onChange={() => onCsatChange({ on: !csat.on })}
              tone="teal"
            />
          </div>

          {/* CSAT availability */}
          <div className="mt-5">
            <GroupLabel label={COPY.availability} />
            <div className="mt-3 flex flex-col gap-2">
              <CheckRow
                label={`${COPY.afterPrefix} N ${COPY.afterSuffix}`}
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
                label={COPY.viaHeader}
                checked={csat.viaHeader}
                onChange={() => onCsatChange({ viaHeader: !csat.viaHeader })}
              />
              <CheckRow
                label={COPY.onCallEnd}
                checked={csat.onCallEnd}
                onChange={() => onCsatChange({ onCallEnd: !csat.onCallEnd })}
              />
              {/* Owned by the Policy, so it is shown as on and left alone. */}
              <CheckRow label={COPY.onPolicyTrigger} checked={csat.onPolicyTrigger} disabled />
            </div>
          </div>

          <PanelDivider />

          {/* Rating question */}
          <div>
            <GroupLabel label={COPY.question} />
            <div className="mt-2">
              <TextField
                label={COPY.question}
                value={csat.question}
                onChange={(question) => onCsatChange({ question })}
              />
            </div>
            <Footnote>{COPY.questionFootnote}</Footnote>
          </div>

          {/* Scale */}
          <div className="mt-5">
            <GroupLabel label={COPY.scale} />
            <div className="mt-2">
              <Select
                label={COPY.scale}
                value={csat.scale}
                options={COPY.scaleOptions}
                onChange={(scale) => onCsatChange({ scale })}
              />
            </div>
          </div>

          {/* Style */}
          <div className="mt-5">
            <GroupLabel label={COPY.style} />
            <div className="mt-2 grid grid-cols-3 gap-2">
              {COPY.styles.map((option) => {
                const selected = option.id === csat.style
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onCsatChange({ style: option.id })}
                    className={`flex flex-col items-center gap-1 rounded-lg border bg-white py-2 transition-colors duration-instant ease-soft ${
                      selected ? 'border-accent-blue bg-[#f3f6fb]' : 'border-grey-200'
                    }`}
                  >
                    <span className="flex h-7 w-8 items-center justify-center">
                      <StyleGlyph style={option.id} size={24} />
                    </span>
                    <span
                      className={`whitespace-nowrap text-[12px] leading-4 ${selected ? 'font-semibold text-[#0c0c0d]' : 'text-grey-600'}`}
                    >
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Per-rating labels */}
          <div className="mt-5 flex flex-col gap-2">
            {csat.steps.map((step) => (
              <RatingRow
                key={step.value}
                value={step.value}
                label={step.label}
                tone={step.tone}
                style={csat.style}
                onLabelChange={(label) => setStep(step.value, label)}
              />
            ))}
          </div>
          <Footnote>{COPY.labelsFootnote}</Footnote>

          {/* Reasons for rating */}
          <div className="mt-5">
            <GroupLabel label={COPY.reasons.label} />
            <div className="mt-3 flex flex-col gap-3">
              <div>
                <CheckRow
                  label={COPY.reasons.low}
                  checked={csat.requestLow}
                  onChange={() => onCsatChange({ requestLow: !csat.requestLow })}
                />
                <div className="ml-6 mt-1.5 flex items-center gap-2">
                  <ToneTag tone="negative" />
                  <ToneTag tone="neutral" />
                </div>
              </div>
              <div>
                <CheckRow
                  label={COPY.reasons.high}
                  checked={csat.requestHigh}
                  onChange={() => onCsatChange({ requestHigh: !csat.requestHigh })}
                />
                <div className="ml-6 mt-1.5 flex items-center gap-2">
                  <ToneTag tone="positive" />
                </div>
              </div>
            </div>
          </div>

          {/* Question for low ratings */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <GroupLabel label={COPY.lowQuestion.label} />
              <ToneTag tone="negative" />
            </div>
            <textarea
              aria-label={COPY.lowQuestion.label}
              rows={3}
              value={csat.lowQuestion}
              onChange={(e) => onCsatChange({ lowQuestion: e.target.value })}
              className="mt-2 w-full resize-none rounded-lg border border-[#bcbdc5] bg-white px-3 py-2.5 text-[14px] leading-5 tracking-[-0.154px] text-black outline-none focus:border-accent-blue"
            />
            <Footnote>{COPY.lowQuestion.footnote}</Footnote>
          </div>

          {/* Selectable reasons (low ratings) */}
          <div className="mt-5">
            <GroupLabel label={COPY.selectableReasons} />
            <ReasonList
              reasons={csat.lowReasons}
              onChange={(lowReasons) => onCsatChange({ lowReasons })}
            />
          </div>

          <PanelDivider />

          {/* Resolution confirmation */}
          <div>
            <GroupLabel label={COPY.resolution.label} />
            <div className="mt-3">
              <CheckRow
                label={COPY.resolution.toggle}
                checked={csat.confirmResolution}
                onChange={() => onCsatChange({ confirmResolution: !csat.confirmResolution })}
              />
            </div>
          </div>

          {/* Question to confirm */}
          <div className="mt-5">
            <GroupLabel label={COPY.resolution.questionLabel} />
            <div className="mt-2">
              <TextField
                label={COPY.resolution.questionLabel}
                value={csat.confirmQuestion}
                onChange={(confirmQuestion) => onCsatChange({ confirmQuestion })}
              />
            </div>
            <Footnote>{COPY.lowQuestion.footnote}</Footnote>
          </div>

          {/* Selectable reasons (resolution) — the frame draws no add-option
              button under this pair. */}
          <div className="mt-5">
            <GroupLabel label={COPY.selectableReasons} />
            <div className="mt-2 flex flex-col gap-2">
              {csat.confirmReasons.map((reason, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    aria-label={`Resolution reason ${index + 1}`}
                    value={reason}
                    onChange={(e) =>
                      onCsatChange({
                        confirmReasons: csat.confirmReasons.map((r, i) =>
                          i === index ? e.target.value : r,
                        ),
                      })
                    }
                    className="h-10 flex-1 rounded-lg border border-[#bcbdc5] bg-white px-3 text-[14px] leading-5 tracking-[-0.154px] text-black outline-none focus:border-accent-blue"
                  />
                  <button
                    type="button"
                    aria-label={`Remove resolution reason ${index + 1}`}
                    onClick={() =>
                      onCsatChange({
                        confirmReasons: csat.confirmReasons.filter((_, i) => i !== index),
                      })
                    }
                    className="flex size-8 shrink-0 items-center justify-center rounded text-ink-muted transition-colors duration-instant ease-soft hover:bg-control-hover"
                  >
                    <Trash2 size={18} aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <PanelDivider />

          {/* Additional feedback */}
          <div>
            <GroupLabel label={COPY.additional.label} />
            <div className="mt-3">
              <CheckRow
                label={COPY.additional.toggle}
                checked={csat.openFeedback}
                onChange={() => onCsatChange({ openFeedback: !csat.openFeedback })}
              />
            </div>
          </div>

          {/* Confirmation message */}
          <div className="mt-5">
            <GroupLabel label={COPY.confirmation.label} />
            <div className="mt-2">
              <TextField
                label={COPY.confirmation.label}
                value={csat.confirmationMessage}
                onChange={(confirmationMessage) => onCsatChange({ confirmationMessage })}
              />
            </div>
            <Footnote>{COPY.confirmation.footnote}</Footnote>
          </div>
        </>
      )}
    </PanelShell>
  )
}
