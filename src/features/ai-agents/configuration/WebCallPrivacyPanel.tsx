// Web Call ▸ Privacy (the rail's document section): the consent prompt shown
// before a web call starts — the call-recording toggle, the prompt header
// field with its character-count footnote, the policy body textarea, and the
// call-to-action label field. All three text fields draw as placeholders in
// the frame, so empty values fall back to that copy here and in the preview's
// consent sheet.
//
// Presentational; every edit bubbles up via onPrivacyChange. From the frame
// "Explore-Voice-Unification" (135-144184).
import {
  WEBCALL_PRIVACY_COPY as COPY,
  type RailSection,
  type WebCallPrivacy,
} from './config-data'
import { Footnote, GroupLabel, PanelShell, ToggleRow } from './panel-parts'

type WebCallPrivacyPanelProps = {
  privacy: WebCallPrivacy
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onPrivacyChange: (patch: Partial<WebCallPrivacy>) => void
}

export function WebCallPrivacyPanel({
  privacy: p,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onPrivacyChange,
}: WebCallPrivacyPanelProps) {
  const fieldClass =
    'mt-2 w-full rounded-lg border border-[#bcbdc5] bg-white px-3 py-2.5 text-[14px] leading-5 tracking-[-0.154px] text-black outline-none placeholder:text-grey-500 focus:border-accent-blue'

  return (
    <PanelShell
      title={COPY.title}
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      <p className="mt-5 text-[14px] leading-5 tracking-[-0.154px] text-grey-800">{COPY.intro}</p>

      {/* Call recording */}
      <div className="mt-5">
        <GroupLabel label={COPY.recordingLabel} />
        <div className="mt-2">
          <ToggleRow
            label={COPY.recordingToggle}
            checked={p.recording}
            onChange={() => onPrivacyChange({ recording: !p.recording })}
            tone="teal"
          />
        </div>
      </div>

      {/* Prompt header */}
      <div className="mt-5">
        <GroupLabel label={COPY.promptHeader.label} />
        <input
          type="text"
          aria-label={COPY.promptHeader.label}
          value={p.promptHeader}
          placeholder={COPY.promptHeader.placeholder}
          onChange={(e) => onPrivacyChange({ promptHeader: e.target.value })}
          className={fieldClass}
        />
        <Footnote>{COPY.promptHeader.footnote}</Footnote>
      </div>

      {/* Privacy Policy body */}
      <div className="mt-5">
        <GroupLabel label={COPY.policyBody.label} />
        <textarea
          aria-label={COPY.policyBody.label}
          rows={4}
          value={p.policyBody}
          placeholder={COPY.policyBody.placeholder}
          onChange={(e) => onPrivacyChange({ policyBody: e.target.value })}
          className={`${fieldClass} resize-none`}
        />
      </div>

      {/* Call to action label */}
      <div className="mt-5">
        <GroupLabel label={COPY.ctaLabel.label} />
        <input
          type="text"
          aria-label={COPY.ctaLabel.label}
          value={p.ctaLabel}
          placeholder={COPY.ctaLabel.placeholder}
          onChange={(e) => onPrivacyChange({ ctaLabel: e.target.value })}
          className={fieldClass}
        />
      </div>
    </PanelShell>
  )
}
