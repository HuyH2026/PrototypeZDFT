// Web Call ▸ AI personality (the rail's heart/sentiment section): the enable toggle, the
// intro, and the General Context / Glossary / Tone of Voice textareas, each
// with an Example: placeholder and a "Keep it under 100 words" footnote, plus
// the "Select suggestions" checkbox gating the six tone-preset pills. Slimmer
// than the shared AiPersonalityPanel (Widget/Voice): no freeform/presets
// checkboxes — Tone of Voice is a plain textarea with the suggestions block
// below it.
//
// Presentational; every edit bubbles up via onPersonalityChange. From the
// frame "Explore-Voice-Unification" (135-142264).
import {
  TONE_PRESET_OPTIONS,
  WEBCALL_PERSONALITY_COPY as COPY,
  type RailSection,
  type WebCallPersonality,
} from './config-data'
import { Footnote, GroupLabel, Helper, PanelDivider, PanelShell, ToggleRow } from './panel-parts'

type WebCallPersonalityPanelProps = {
  personality: WebCallPersonality
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onPersonalityChange: (patch: Partial<WebCallPersonality>) => void
}

export function WebCallPersonalityPanel({
  personality: p,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onPersonalityChange,
}: WebCallPersonalityPanelProps) {
  const textareaClass =
    'mt-2 w-full resize-none rounded-lg border border-[#bcbdc5] bg-white px-3 py-2.5 text-[14px] leading-5 tracking-[-0.154px] text-black placeholder:text-grey-500'

  const toggleSuggestion = (preset: string) => {
    const next = p.suggestions.includes(preset)
      ? p.suggestions.filter((s) => s !== preset)
      : [...p.suggestions, preset]
    onPersonalityChange({ suggestions: next })
  }

  return (
    <PanelShell
      title={COPY.title}
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      <div className="mt-6">
        <ToggleRow
          label={p.enabled ? COPY.toggleOn : COPY.toggleOff}
          checked={p.enabled}
          onChange={() => onPersonalityChange({ enabled: !p.enabled })}
          tone="teal"
        />
      </div>
      <p className="mt-5 text-[14px] leading-5 tracking-[-0.154px] text-grey-800">{COPY.intro}</p>

      <PanelDivider />

      {/* General Context */}
      <div>
        <GroupLabel label={COPY.generalContext.label} info />
        <Helper>{COPY.generalContext.helper}</Helper>
        <textarea
          aria-label={COPY.generalContext.label}
          rows={5}
          value={p.generalContext}
          placeholder={COPY.generalContext.placeholder}
          onChange={(e) => onPersonalityChange({ generalContext: e.target.value })}
          className={textareaClass}
        />
        <Footnote>{COPY.generalContext.footnote}</Footnote>
      </div>

      <PanelDivider />

      {/* Glossary */}
      <div>
        <GroupLabel label={COPY.glossary.label} info />
        <Helper>{COPY.glossary.helper}</Helper>
        <textarea
          aria-label={COPY.glossary.label}
          rows={4}
          value={p.glossary}
          placeholder={COPY.glossary.placeholder}
          onChange={(e) => onPersonalityChange({ glossary: e.target.value })}
          className={textareaClass}
        />
        <Footnote>{COPY.glossary.footnote}</Footnote>
      </div>

      <PanelDivider />

      {/* Tone of Voice + the suggestions block */}
      <div>
        <GroupLabel label={COPY.tone.label} info />
        <Helper>{COPY.tone.helper}</Helper>
        <textarea
          aria-label={COPY.tone.label}
          rows={5}
          value={p.tone}
          placeholder={COPY.tone.placeholder}
          onChange={(e) => onPersonalityChange({ tone: e.target.value })}
          className={textareaClass}
        />
        <Footnote>{COPY.tone.footnote}</Footnote>
      </div>

      <div className="mt-5">
        <label className="flex items-center gap-2 text-[14px] leading-5 tracking-[-0.154px] text-ink">
          <input
            type="checkbox"
            checked={p.useSuggestions}
            onChange={() => onPersonalityChange({ useSuggestions: !p.useSuggestions })}
            className="size-4 accent-accent-blue"
          />
          {COPY.suggestionsLabel}
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {TONE_PRESET_OPTIONS.map((preset) => {
            const selected = p.suggestions.includes(preset)
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={selected}
                disabled={!p.useSuggestions}
                onClick={() => toggleSuggestion(preset)}
                className={`rounded-[20px] border bg-white px-4 py-1.5 text-[14px] leading-5 tracking-[-0.154px] text-grey-600 ${
                  selected ? 'border-[#d2d3d8]' : 'border-grey-200'
                } ${p.useSuggestions ? '' : 'opacity-60'}`}
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
