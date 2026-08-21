// Voice ▸ CSAT (the rail's smiley slot): one panel with the design's two tabs.
// "SMS Message" — whether CSAT goes out after a call and the SMS copy itself.
// "CSAT survey" — the mobile survey: header logo, theme color, rating
// question, style tiles, the 1–5 scale labels, follow-up rules, and the
// thank-you message.
// From frames 130:74690 (SMS) and 132:80035 (CSAT). The CSAT frame's
// below-fold groups carry placeholder labels even in Figma; the copy here
// follows the survey preview's vocabulary. Presentational; edits bubble up via
// onCsatChange. The tab is controlled by the view because the centre preview
// swaps with it — the SMS tab previews a phone message, the survey tab the
// survey itself.
import { Smile, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { TONE_BADGE } from './CsatPanel'
import {
  VOICE_CSAT_COPY as COPY,
  type RailSection,
  type VoiceCsatConfig,
} from './config-data'
import { GroupLabel, Helper, PanelDivider, PanelShell, TextField, ToggleRow } from './panel-parts'

const SELECTED_BORDER = '#406cc4'
const SELECTED_BG = '#f3f6fb'

export type VoiceCsatTab = 'sms' | 'csat'

type VoiceCsatPanelProps = {
  csat: VoiceCsatConfig
  tab: VoiceCsatTab
  onTabChange: (tab: VoiceCsatTab) => void
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onCsatChange: (patch: Partial<VoiceCsatConfig>) => void
}

export function VoiceCsatPanel({
  csat,
  tab,
  onTabChange,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onCsatChange,
}: VoiceCsatPanelProps) {

  const header = (
    <div role="tablist" aria-label="Voice CSAT" className="flex border-b border-grey-200">
      {(['sms', 'csat'] as const).map((id) => {
        const selected = tab === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onTabChange(id)}
            className={`-mb-px flex-1 border-b-2 pb-2 text-[14px] leading-5 tracking-[-0.154px] ${
              selected ? 'border-black font-semibold text-black' : 'border-transparent text-grey-600'
            }`}
          >
            {COPY.tabs[id]}
          </button>
        )
      })}
    </div>
  )

  const setStepLabel = (value: number, label: string) =>
    onCsatChange({
      steps: csat.steps.map((s) => (s.value === value ? { ...s, label } : s)),
    })

  const setOption = (index: number, option: string) =>
    onCsatChange({
      followUpOptions: csat.followUpOptions.map((o, i) => (i === index ? option : o)),
    })

  const setResolutionOption = (index: number, option: string) =>
    onCsatChange({
      resolutionOptions: csat.resolutionOptions.map((o, i) => (i === index ? option : o)),
    })

  const styles = [
    { id: 'stars', label: COPY.csat.style.stars, glyph: <Star size={26} color="#f5c518" fill="#f5c518" strokeWidth={1.5} aria-hidden /> },
    { id: 'smiles', label: COPY.csat.style.smiles, glyph: <span className="text-[24px] leading-none" aria-hidden>😄</span> },
    { id: 'bw-smiles', label: COPY.csat.style.bw, glyph: <Smile size={26} className="text-grey-600" aria-hidden /> },
  ] as const

  return (
    <PanelShell
      header={header}
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      {tab === 'sms' ? (
        <>
          <div className="mt-6">
            <ToggleRow
              label={COPY.sms.toggle}
              checked={csat.on}
              onChange={() => onCsatChange({ on: !csat.on })}
              tone="teal"
            />
          </div>
          <div className="mt-6">
            <GroupLabel label={COPY.sms.availability} info />
            <label className="mt-2 flex items-center gap-2 text-[14px] leading-5 tracking-[-0.154px] text-black">
              <input
                type="checkbox"
                checked={csat.sendAfterNonResolved}
                onChange={() => onCsatChange({ sendAfterNonResolved: !csat.sendAfterNonResolved })}
                className="size-4 shrink-0 accent-accent-blue"
              />
              {COPY.sms.sendAfter}
            </label>
          </div>
          <div className="mt-6">
            <GroupLabel label={COPY.sms.message} />
            <textarea
              aria-label={COPY.sms.message}
              value={csat.smsMessage}
              onChange={(e) => onCsatChange({ smsMessage: e.target.value })}
              rows={5}
              className="mt-2 w-full resize-none rounded-lg border border-[#bcbdc5] bg-white px-3 py-2.5 text-[14px] leading-5 tracking-[-0.154px] text-black placeholder:text-grey-500"
            />
            <Helper>{COPY.sms.helper}</Helper>
          </div>
        </>
      ) : (
        <>
          {/* Header logo */}
          <div className="mt-6">
            <GroupLabel label={COPY.csat.logo.label} />
            <div className="mt-2 flex h-24 items-center justify-center rounded-lg border border-grey-200 bg-white">
              <span className="flex size-[60px] items-center justify-center rounded-full bg-black text-[20px] font-semibold text-white">
                Uber
              </span>
            </div>
            <Helper>{COPY.csat.logo.helper}</Helper>
            <Button variant="outline" size="sm" className="mt-3 w-full font-semibold">
              {COPY.csat.logo.action}
            </Button>
          </div>

          {/* Color */}
          <div className="mt-6">
            <GroupLabel label={COPY.csat.color.label} />
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#bcbdc5] bg-white px-3 py-2.5">
              <input
                type="text"
                aria-label={COPY.csat.color.field}
                value={csat.themeColor}
                onChange={(e) => onCsatChange({ themeColor: e.target.value })}
                className="min-w-0 flex-1 bg-transparent text-[14px] leading-5 tracking-[-0.154px] text-black outline-none"
              />
              <span
                aria-hidden
                className="size-5 shrink-0 rounded-full border border-grey-200"
                style={{ backgroundColor: csat.themeColor }}
              />
            </div>
          </div>

          <PanelDivider />

          {/* Rating question */}
          <div>
            <GroupLabel label={COPY.csat.question.label} />
            <div className="mt-2">
              <TextField
                label={COPY.csat.question.label}
                value={csat.question}
                onChange={(question) => onCsatChange({ question })}
              />
            </div>
            <Helper>{COPY.csat.question.helper}</Helper>
          </div>

          {/* Style */}
          <div className="mt-6">
            <GroupLabel label={COPY.csat.style.label} />
            <div className="mt-2 flex gap-2">
              {styles.map((style) => {
                const selected = csat.style === style.id
                return (
                  <button
                    key={style.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onCsatChange({ style: style.id })}
                    style={
                      selected
                        ? { borderColor: SELECTED_BORDER, backgroundColor: SELECTED_BG }
                        : undefined
                    }
                    className={`flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2 transition-colors duration-instant ease-soft ${
                      selected ? '' : 'border-grey-200 bg-white hover:bg-control-hover'
                    }`}
                  >
                    {style.glyph}
                    <span className="text-[12px] leading-4 tracking-[-0.1px] text-black">
                      {style.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Scale labels */}
          <ul className="mt-4 flex flex-col gap-3">
            {csat.steps.map((step) => {
              const badge = TONE_BADGE[step.tone]
              return (
                <li key={step.value} className="flex items-center gap-3">
                  <div className="flex w-[38px] shrink-0 items-center gap-1">
                    <span className="text-[14px] font-medium leading-5 text-black">
                      {step.value}
                    </span>
                    <Star size={20} color="#f5c518" fill="#f5c518" strokeWidth={1.5} aria-hidden />
                  </div>
                  <div className="flex-1">
                    <TextField
                      label={`Rating ${step.value} label`}
                      value={step.label}
                      onChange={(label) => setStepLabel(step.value, label)}
                      density="compact"
                    />
                  </div>
                  <span
                    className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-[-0.1px]"
                    style={{ backgroundColor: badge.bg, color: badge.fg }}
                  >
                    {badge.label}
                  </span>
                </li>
              )
            })}
          </ul>
          <Helper>{COPY.csat.scaleHelper}</Helper>

          <PanelDivider />

          {/* Reasons for rating */}
          <div>
            <GroupLabel label={COPY.csat.followUps.label} />
            <div className="mt-2 flex flex-col gap-3">
              <div>
                <label className="flex items-center gap-2 text-[14px] leading-5 tracking-[-0.154px] text-black">
                  <input
                    type="checkbox"
                    checked={csat.followUpNegativeNeutral}
                    onChange={() =>
                      onCsatChange({ followUpNegativeNeutral: !csat.followUpNegativeNeutral })
                    }
                    className="size-4 shrink-0 accent-accent-blue"
                  />
                  {COPY.csat.followUps.negativeNeutral}
                </label>
                <div className="mt-1 flex gap-1 pl-6">
                  {[TONE_BADGE.negative, TONE_BADGE.neutral].map((badge) => (
                    <span
                      key={badge.label}
                      className="rounded-full px-2 py-0.5 text-[12px] leading-4"
                      style={{ backgroundColor: badge.bg, color: badge.fg }}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[14px] leading-5 tracking-[-0.154px] text-black">
                  <input
                    type="checkbox"
                    checked={csat.followUpPositive}
                    onChange={() => onCsatChange({ followUpPositive: !csat.followUpPositive })}
                    className="size-4 shrink-0 accent-accent-blue"
                  />
                  {COPY.csat.followUps.positive}
                </label>
                <div className="mt-1 flex gap-1 pl-6">
                  <span
                    className="rounded-full px-2 py-0.5 text-[12px] leading-4"
                    style={{
                      backgroundColor: TONE_BADGE.positive.bg,
                      color: TONE_BADGE.positive.fg,
                    }}
                  >
                    {TONE_BADGE.positive.label}
                  </span>
                </div>
              </div>
            </div>
            {/* The question label carries the tone it applies to, at right. */}
            <div className="mt-4 flex items-center justify-between">
              <GroupLabel label={COPY.csat.followUps.questionLabel} />
              <span
                className="rounded-full px-2 py-0.5 text-[12px] leading-4"
                style={{
                  backgroundColor: TONE_BADGE.negative.bg,
                  color: TONE_BADGE.negative.fg,
                }}
              >
                {TONE_BADGE.negative.label}
              </span>
            </div>
            <textarea
              aria-label={COPY.csat.followUps.questionLabel}
              value={csat.followUpQuestion}
              onChange={(e) => onCsatChange({ followUpQuestion: e.target.value })}
              rows={3}
              className="mt-2 w-full resize-none rounded-lg border border-[#bcbdc5] bg-white px-3 py-2.5 text-[14px] leading-5 tracking-[-0.154px] text-black placeholder:text-grey-500"
            />
            <Helper>{COPY.csat.followUps.questionHelper}</Helper>
            <div className="mt-4">
              <GroupLabel label={COPY.csat.followUps.repliesLabel} />
              <OptionRows
                options={csat.followUpOptions}
                labelPrefix="Reason option"
                onEdit={setOption}
                onRemove={(index) =>
                  onCsatChange({
                    followUpOptions: csat.followUpOptions.filter((_, i) => i !== index),
                  })
                }
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full font-semibold"
                onClick={() =>
                  onCsatChange({ followUpOptions: [...csat.followUpOptions, ''] })
                }
              >
                + {COPY.csat.followUps.addReply}
              </Button>
            </div>
          </div>

          <PanelDivider />

          {/* Resolution confirmation */}
          <div>
            <GroupLabel label={COPY.csat.resolution.label} />
            <label className="mt-2 flex items-center gap-2 text-[14px] leading-5 tracking-[-0.154px] text-black">
              <input
                type="checkbox"
                checked={csat.resolution}
                onChange={() => onCsatChange({ resolution: !csat.resolution })}
                className="size-4 shrink-0 accent-accent-blue"
              />
              {COPY.csat.resolution.checkbox}
            </label>
            <div className="mt-4">
              <GroupLabel label={COPY.csat.resolution.questionLabel} />
              <div className="mt-2">
                <TextField
                  label={COPY.csat.resolution.questionLabel}
                  value={csat.resolutionQuestion}
                  onChange={(resolutionQuestion) => onCsatChange({ resolutionQuestion })}
                />
              </div>
              <Helper>{COPY.csat.resolution.questionHelper}</Helper>
            </div>
            <div className="mt-4">
              <GroupLabel label={COPY.csat.resolution.optionsLabel} />
              <OptionRows
                options={csat.resolutionOptions}
                labelPrefix="Resolution option"
                onEdit={setResolutionOption}
                onRemove={(index) =>
                  onCsatChange({
                    resolutionOptions: csat.resolutionOptions.filter((_, i) => i !== index),
                  })
                }
              />
            </div>
          </div>

          <PanelDivider />

          {/* Additional feedback */}
          <div>
            <GroupLabel label={COPY.csat.additionalFeedback.label} />
            <label className="mt-2 flex items-center gap-2 text-[14px] leading-5 tracking-[-0.154px] text-black">
              <input
                type="checkbox"
                checked={csat.openFeedback}
                onChange={() => onCsatChange({ openFeedback: !csat.openFeedback })}
                className="size-4 shrink-0 accent-accent-blue"
              />
              {COPY.csat.additionalFeedback.checkbox}
            </label>
          </div>

          {/* Confirmation message */}
          <div className="mt-6">
            <GroupLabel label={COPY.csat.confirmation.label} />
            <div className="mt-2">
              <TextField
                label={COPY.csat.confirmation.label}
                value={csat.confirmationMessage}
                onChange={(confirmationMessage) => onCsatChange({ confirmationMessage })}
              />
            </div>
            <Helper>{COPY.csat.confirmation.helper}</Helper>
          </div>
        </>
      )}
    </PanelShell>
  )
}

/** One "Selectable reasons" list: editable rows with a per-row remove button. */
function OptionRows({
  options,
  labelPrefix,
  onEdit,
  onRemove,
}: {
  options: string[]
  labelPrefix: string
  onEdit: (index: number, value: string) => void
  onRemove: (index: number) => void
}) {
  return (
    <ul className="mt-2 flex flex-col gap-2">
      {options.map((option, index) => (
        <li key={index} className="flex items-center gap-2">
          <div className="flex-1">
            <TextField
              label={`${labelPrefix} ${index + 1}`}
              value={option}
              onChange={(value) => onEdit(index, value)}
              density="compact"
            />
          </div>
          <button
            type="button"
            aria-label={`Remove ${option}`}
            onClick={() => onRemove(index)}
            className="flex size-8 items-center justify-center rounded text-ink-muted transition-colors duration-instant ease-soft hover:bg-control-hover"
          >
            <Trash2 size={18} aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  )
}
