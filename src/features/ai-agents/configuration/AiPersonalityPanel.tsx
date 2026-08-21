// Sentiment section: the "AI Personality" form. Shared by the Widget and Voice
// tabs; Voice uses its own call-oriented intro while the three form sections
// remain shared. Presentational; every edit bubbles up via onPersonalityChange.
import {
  AI_PERSONALITY_COPY,
  TONE_PRESET_OPTIONS,
  type Personality,
  type RailSection,
} from './config-data'
import { Footnote, GroupLabel, Helper, PanelShell } from './panel-parts'

type AiPersonalityPanelProps = {
  personality: Personality
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onPersonalityChange: (patch: Partial<Personality>) => void
  /** Voice reads its own call-oriented intro. */
  channel?: 'widget' | 'voice'
}

export function AiPersonalityPanel({
  personality: p,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onPersonalityChange,
  channel = 'widget',
}: AiPersonalityPanelProps) {
  const c = AI_PERSONALITY_COPY
  const isVoice = channel === 'voice'

  const togglePreset = (preset: string) => {
    const next = p.tonePresets.includes(preset)
      ? p.tonePresets.filter((t) => t !== preset)
      : [...p.tonePresets, preset]
    onPersonalityChange({ tonePresets: next })
  }

  const textareaClass =
    'mt-2 w-full resize-none rounded-lg border border-grey-400 bg-white px-4 py-2.5 text-[14px] leading-5 text-ink placeholder:text-grey-500'

  return (
    <PanelShell
      title="AI Personality"
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      <p className="mt-4 text-[14px] leading-5 text-grey-800">{isVoice ? c.voiceIntro : c.intro}</p>

      {/* General Context */}
      <div className="mt-6">
        <GroupLabel label={c.generalContext.label} info />
        <Helper>{c.generalContext.helper}</Helper>
        <textarea
          aria-label={c.generalContext.label}
          rows={6}
          value={p.generalContext}
          placeholder={c.generalContext.placeholder}
          onChange={(e) => onPersonalityChange({ generalContext: e.target.value })}
          className={textareaClass}
        />
        <Footnote>{c.generalContext.footnote}</Footnote>
      </div>

      {/* Glossary */}
      <div className="mt-6">
        <GroupLabel label={c.glossary.label} info />
        <Helper>{c.glossary.helper}</Helper>
        <textarea
          aria-label={c.glossary.label}
          rows={6}
          value={p.glossary}
          placeholder={c.glossary.placeholder}
          onChange={(e) => onPersonalityChange({ glossary: e.target.value })}
          className={textareaClass}
        />
        <Footnote>{c.glossary.footnote}</Footnote>
      </div>

      {/* Tone of Voice */}
      <div className="mt-6">
        <GroupLabel label={c.tone.label} info />
        <Helper>{c.tone.helper}</Helper>

        <label className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-ink">
          <input
            type="checkbox"
            checked={p.toneUseFreeform}
            onChange={() => onPersonalityChange({ toneUseFreeform: !p.toneUseFreeform })}
            className="size-4 accent-accent-blue"
          />
          {c.tone.freeformCheckboxLabel}
        </label>
        <textarea
          aria-label={c.tone.label}
          rows={7}
          value={p.toneFreeform}
          placeholder={c.tone.placeholder}
          disabled={!p.toneUseFreeform}
          onChange={(e) => onPersonalityChange({ toneFreeform: e.target.value })}
          className={`${textareaClass} ${p.toneUseFreeform ? '' : 'opacity-50'}`}
        />
        <Footnote>{c.tone.footnote}</Footnote>

        <label className="mt-4 flex items-center gap-2 text-[14px] font-semibold text-ink">
          <input
            type="checkbox"
            checked={p.toneUsePresets}
            onChange={() => onPersonalityChange({ toneUsePresets: !p.toneUsePresets })}
            className="size-4 accent-accent-blue"
          />
          {c.tone.presetsCheckboxLabel}
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {TONE_PRESET_OPTIONS.map((preset) => {
            const selected = p.tonePresets.includes(preset)
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={selected}
                disabled={!p.toneUsePresets}
                onClick={() => togglePreset(preset)}
                className={`rounded-[20px] border bg-white px-4 py-1.5 text-[14px] text-grey-800 ${selected ? 'border-[#d2d3d8]' : 'border-grey-200'}`}
              >
                {preset}
              </button>
            )
          })}
        </div>
      </div>
    </PanelShell>
  )
}
