// Voice ▸ Voice segment: the segment's voice agent — its name, the numbers it
// answers on, the names it introduces itself with, where it hands off, which
// intent inbound calls start in, and whether it's the default segment.
// Presentational; edits bubble up via onVoiceChange.
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { GardenIcon } from '@/components/garden-icon'
import { CopyField } from './CopyField'
import {
  VOICE_INTENT_OPTIONS,
  VOICE_SEGMENT_COPY as COPY,
  type RailSection,
  type Segment,
  type VoiceConfig,
} from './config-data'
import { GroupLabel, Helper, PanelShell, Select, TextField, ToggleRow } from './panel-parts'

type VoiceSegmentPanelProps = {
  segment: Segment
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onNameChange: (name: string) => void
  onToggleEnabled: () => void
  onToggleDefault: () => void
  onVoiceChange: (patch: Partial<VoiceConfig>) => void
}

export function VoiceSegmentPanel({
  segment,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onNameChange,
  onToggleEnabled,
  onToggleDefault,
  onVoiceChange,
}: VoiceSegmentPanelProps) {
  const voice = segment.voice

  const removeNumber = (number: string) =>
    onVoiceChange({ phoneNumbers: voice.phoneNumbers.filter((n) => n !== number) })

  return (
    <PanelShell
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      <ToggleRow
        label={COPY.enabledLabel}
        checked={segment.enabled}
        onChange={onToggleEnabled}
        showState
        tone="teal"
      />
      <h2 className="mt-7 text-[18px] leading-6 tracking-[-0.45px] text-black">{COPY.title}</h2>
      <p className="mt-4 text-[14px] leading-5 tracking-[-0.154px] text-grey-800">{COPY.intro}</p>

      {/* Segment name */}
      <div className="mt-6">
        <GroupLabel label={COPY.segmentName.label} />
        <Helper>{COPY.segmentName.helper}</Helper>
        <div className="mt-2">
          <TextField label={COPY.segmentName.label} value={segment.name} onChange={onNameChange} />
        </div>
      </div>

      {/* Phone numbers */}
      <div className="mt-6">
        <GroupLabel label={COPY.phone.label} />
        <Helper>
          {COPY.phone.helperLead} <span className="text-accent-blue">{COPY.phone.helperLink}</span>
        </Helper>
        <ul className="mt-3 flex flex-col gap-1">
          {voice.phoneNumbers.map((number) => (
            <li key={number} className="flex items-center gap-2">
              <span className="flex-1 text-[14px] leading-5 tracking-[-0.154px] text-grey-800">
                {number}
              </span>
              <CopyField value={number} variant="row" aria-label={`Copy ${number}`} />
              <button
                type="button"
                aria-label={`Remove ${number}`}
                onClick={() => removeNumber(number)}
                className="flex size-8 items-center justify-center rounded text-ink-muted transition-colors duration-instant ease-soft hover:bg-control-hover"
              >
                <Trash2 size={18} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="mt-3 font-semibold">
          <Plus size={16} aria-hidden />
          {COPY.phone.action}
        </Button>
      </div>

      {/* Company name */}
      <div className="mt-6">
        <GroupLabel label={COPY.companyName} />
        <div className="mt-3">
          <TextField
            label={COPY.companyName}
            value={voice.companyName}
            onChange={(companyName) => onVoiceChange({ companyName })}
          />
        </div>
      </div>

      {/* Voice agent name */}
      <div className="mt-6">
        <GroupLabel label={COPY.aiAgentName} />
        <div className="mt-3">
          <TextField
            label={COPY.aiAgentName}
            value={voice.aiAgentName}
            onChange={(aiAgentName) => onVoiceChange({ aiAgentName })}
          />
        </div>
      </div>

      {/* Default handoff number */}
      <div className="mt-6">
        <GroupLabel label={COPY.handoff.label} />
        <Helper>{COPY.handoff.helper}</Helper>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#bcbdc5] bg-white px-3 py-2.5">
          <span aria-hidden className="text-[14px] leading-5">
            🇺🇸
          </span>
          <input
            type="text"
            aria-label={COPY.handoff.label}
            value={voice.handoffNumber}
            placeholder={COPY.handoff.placeholder}
            onChange={(e) => onVoiceChange({ handoffNumber: e.target.value })}
            className="min-w-0 flex-1 bg-transparent text-[14px] leading-5 tracking-[-0.154px] text-black outline-none placeholder:text-grey-500"
          />
          <GardenIcon name="chevron-down-stroke" className="h-4 w-4 shrink-0 text-ink-muted" />
        </div>
      </div>

      <hr className="my-6 border-t border-grey-200" />

      {/* Initial intent for inbound calls */}
      <div>
        <div className="flex items-center gap-1">
          <span className="flex items-center justify-center rounded-xl border-[0.75px] border-[#e4e7f0] bg-[#e6f4f2] p-1">
            <GardenIcon name="phone-call-in-stroke" className="h-4 w-4 text-[#007f74]" />
          </span>
          <p className="text-[14px] font-semibold leading-5 tracking-[-0.154px] text-black">
            {COPY.intent.label}
          </p>
        </div>
        <div className="mt-4">
          <Select
            label={COPY.intent.label}
            value={voice.initialIntent}
            options={VOICE_INTENT_OPTIONS}
            onChange={(initialIntent) => onVoiceChange({ initialIntent })}
          />
        </div>
      </div>

      {/* Set as default — the helper runs the full panel width under the row. */}
      <div className="mt-6">
        <label className="flex items-center gap-2 text-[14px] font-semibold leading-5 tracking-[-0.154px] text-ink">
          <input
            type="checkbox"
            checked={segment.isDefault}
            onChange={onToggleDefault}
            className="size-4 shrink-0 accent-accent-blue"
          />
          {COPY.default.label}
        </label>
        <Helper>{COPY.default.helper}</Helper>
      </div>
    </PanelShell>
  )
}
