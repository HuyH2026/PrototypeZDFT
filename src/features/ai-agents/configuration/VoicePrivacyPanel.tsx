// Voice ▸ Privacy (the rail's license slot): call-recording toggle and the
// disclosure played before a call, with per-direction tiles (inbound /
// outbound) selecting which disclaimer the textarea edits.
// From the frame "Explore-Voice-Unification" (124:67675). Presentational;
// edits bubble up via onPrivacyChange.
import { GardenIcon } from '@/components/garden-icon'
import {
  VOICE_PRIVACY_COPY as COPY,
  type RailSection,
  type VoicePrivacyConfig,
} from './config-data'
import { GroupLabel, Helper, PanelShell, ToggleRow } from './panel-parts'

// The selected direction tile's treatment, shared with the voice picker cards.
const SELECTED_BORDER = '#406cc4'
const SELECTED_BG = '#f3f6fb'

type VoicePrivacyPanelProps = {
  privacy: VoicePrivacyConfig
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onPrivacyChange: (patch: Partial<VoicePrivacyConfig>) => void
}

export function VoicePrivacyPanel({
  privacy,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onPrivacyChange,
}: VoicePrivacyPanelProps) {
  const sides = [
    { id: 'inbound', label: COPY.disclaimer.inbound, icon: 'phone-call-in-stroke' },
    { id: 'outbound', label: COPY.disclaimer.outbound, icon: 'phone-call-out-stroke' },
  ] as const

  return (
    <PanelShell
      title={COPY.title}
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      <p className="mt-4 text-[14px] leading-5 tracking-[-0.154px] text-grey-800">{COPY.intro}</p>

      {/* Call recording */}
      <div className="mt-6">
        <GroupLabel label={COPY.recording.label} />
        <div className="mt-2">
          <ToggleRow
            label={COPY.recording.toggle}
            checked={privacy.recording}
            onChange={() => onPrivacyChange({ recording: !privacy.recording })}
            tone="teal"
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6">
        <GroupLabel label={COPY.disclaimer.label} />
        <Helper>{COPY.disclaimer.helper}</Helper>
        <label className="mt-3 flex items-center gap-2 text-[14px] leading-5 tracking-[-0.154px] text-black">
          <input
            type="checkbox"
            checked={privacy.playDisclaimer}
            onChange={() => onPrivacyChange({ playDisclaimer: !privacy.playDisclaimer })}
            className="size-4 shrink-0 accent-accent-blue"
          />
          {COPY.disclaimer.checkbox}
        </label>
        <div className="mt-3 flex gap-4">
          {sides.map((side) => {
            const selected = privacy.side === side.id
            return (
              <button
                key={side.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onPrivacyChange({ side: side.id })}
                style={
                  selected
                    ? { borderColor: SELECTED_BORDER, backgroundColor: SELECTED_BG }
                    : undefined
                }
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg border px-4 py-2 transition-colors duration-instant ease-soft ${
                  selected ? '' : 'border-grey-200 bg-white hover:bg-control-hover'
                }`}
              >
                <GardenIcon name={side.icon} className="h-6 w-6 text-ink" />
                <span className="text-[12px] leading-4 tracking-[-0.1px] text-black">
                  {side.label}
                </span>
              </button>
            )
          })}
        </div>
        <textarea
          aria-label={COPY.disclaimer.field}
          value={privacy.disclaimer}
          onChange={(e) => onPrivacyChange({ disclaimer: e.target.value })}
          rows={5}
          className="mt-3 w-full resize-none rounded-lg border border-[#bcbdc5] bg-white px-3 py-2.5 text-[14px] leading-5 tracking-[-0.154px] text-black placeholder:text-grey-500"
        />
      </div>
    </PanelShell>
  )
}
