// Voice ▸ Voice (the rail's microphone section): the inbound call greeting,
// the default language, the AI voice picker with its search + auto-language
// toggle, and the speaking-speed slider. The panel leads with the frame's
// Voice / Sounds tabs. With auto language switching ON, the picker gives way
// to the multilingual table + modal (frame 100:51381); the Sounds tab holds
// the wait-time effect picker (frame 100:50547).
//
// Presentational; every edit bubbles up via onSettingsChange. From the frame
// "Explore-Voice-Unification" (124-62727).
import { useState } from 'react'
import { Button } from '@/components/flora/Button'
import { GardenIcon } from '@/components/garden-icon'
import {
  VOICE_LANGUAGE_OPTIONS,
  VOICE_OPTIONS,
  VOICE_SETTINGS_COPY as COPY,
  VOICE_SOUND_EFFECTS,
  type RailSection,
  type VoiceSettings,
} from './config-data'
import { MultilingualModal } from './MultilingualModal'
import {
  GroupLabel,
  Helper,
  PanelDivider,
  PanelShell,
  Select,
  Toggle,
  ToggleRow,
} from './panel-parts'

// Frame colours without a theme token: the selected voice card's blue tint and
// the card blurb's helper grey. Exported for the multilingual modal, which
// renders the same catalog.
export const VOICE_CARD_COLORS = { border: '#406cc4', bg: '#f3f6fb', blurb: '#727583' } as const

/** One voice-catalog row: play tile, name + blurb, selection glyph at right. */
export function VoiceOptionCard({
  name,
  description,
  selected,
  onSelect,
}: {
  name: string
  description: string
  selected: boolean
  onSelect?: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      style={
        selected
          ? { borderColor: VOICE_CARD_COLORS.border, backgroundColor: VOICE_CARD_COLORS.bg }
          : undefined
      }
      className={`flex w-full items-center gap-2 rounded-lg border bg-white py-3 pl-2 pr-4 text-left transition-colors duration-instant ease-soft ${
        selected ? '' : 'border-grey-200 hover:bg-control-hover'
      }`}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-[#0c0c0d] text-white">
        <GardenIcon name="play-fill" className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1 text-[14px] leading-5 tracking-[-0.1px]">
        <span className="font-semibold text-black">{name}</span>{' '}
        <span style={{ color: VOICE_CARD_COLORS.blurb }}>{description}</span>
      </span>
      <GardenIcon
        name={selected ? 'check-circle-fill' : 'circle-stroke'}
        className="h-5 w-5 shrink-0"
        style={{ color: selected ? VOICE_CARD_COLORS.border : '#b7b7b3' }}
      />
    </button>
  )
}

type VoiceSettingsPanelProps = {
  settings: VoiceSettings
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onSettingsChange: (patch: Partial<VoiceSettings>) => void
}

export function VoiceSettingsPanel({
  settings,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onSettingsChange,
}: VoiceSettingsPanelProps) {
  const [tab, setTab] = useState<'voice' | 'sounds'>('voice')
  const [multilingualOpen, setMultilingualOpen] = useState(false)

  const query = settings.voiceQuery.trim().toLowerCase()
  const voices = VOICE_OPTIONS.filter((v) => v.name.toLowerCase().includes(query))

  const header = (
    <div role="tablist" aria-label="Voice settings" className="flex gap-6 border-b border-grey-200">
      {(['voice', 'sounds'] as const).map((id) => {
        const selected = tab === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 pb-2 text-[14px] leading-5 tracking-[-0.154px] ${
              selected
                ? 'border-black font-semibold text-black'
                : 'border-transparent text-grey-600'
            }`}
          >
            {COPY.tabs[id]}
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
      {tab === 'sounds' ? (
        <>
          <div className="mt-6">
            <ToggleRow
              label={settings.soundOn ? COPY.sounds.toggleOn : COPY.sounds.toggleOff}
              checked={settings.soundOn}
              onChange={() => onSettingsChange({ soundOn: !settings.soundOn })}
              tone="teal"
            />
          </div>
          <p className="mt-4 text-[14px] leading-5 tracking-[-0.154px] text-black">
            {COPY.sounds.body}
          </p>
          <hr className="my-5 border-t border-grey-200" />
          <div>
            <GroupLabel label={COPY.sounds.label} />
            <ul className="mt-2 flex flex-col gap-2">
              {VOICE_SOUND_EFFECTS.map((effect) => {
                const selected = settings.soundEffect === effect.id
                return (
                  <li key={effect.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onSettingsChange({ soundEffect: effect.id })}
                      style={
                        selected
                          ? {
                              borderColor: VOICE_CARD_COLORS.border,
                              backgroundColor: VOICE_CARD_COLORS.bg,
                            }
                          : undefined
                      }
                      className={`flex w-full items-center gap-2 rounded-lg border bg-white py-3 pl-2 pr-4 text-left transition-colors duration-instant ease-soft ${
                        selected ? '' : 'border-grey-200 hover:bg-control-hover'
                      }`}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-[#0c0c0d] text-white">
                        <GardenIcon name="play-fill" className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1 text-[14px] leading-5 tracking-[-0.154px]">
                        <span className="font-semibold text-[#0c0c0d]">{effect.name}</span>{' '}
                        <span className="text-grey-600">{effect.description}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      ) : (
        <>
          {/* Inbound call greeting */}
          <div className="mt-6">
            <div className="flex items-center gap-1">
              <span className="flex items-center justify-center rounded-xl border-[0.75px] border-[#e4e7f0] bg-[#e6f4f2] p-1">
                <GardenIcon name="phone-call-in-stroke" className="h-4 w-4 text-[#007f74]" />
              </span>
              <p className="text-[14px] font-semibold leading-5 tracking-[-0.154px] text-black">
                {COPY.greeting.label}
              </p>
            </div>
            <Helper>
              {COPY.greeting.helperLead}
              <span className="font-semibold">{COPY.greeting.helperEmphasis}</span>
            </Helper>
            <textarea
              aria-label={COPY.greeting.label}
              value={settings.greeting}
              onChange={(e) => onSettingsChange({ greeting: e.target.value })}
              rows={3}
              className="mt-3 w-full resize-none rounded-lg border border-[#bcbdc5] bg-white px-3 py-2.5 text-[14px] leading-5 tracking-[-0.154px] text-black placeholder:text-grey-500"
            />
          </div>

          <PanelDivider />

          {/* Default language */}
          <div>
            <GroupLabel label={COPY.language.label} info />
            <Helper>{COPY.language.helper}</Helper>
            <div className="mt-3">
              <Select
                label={COPY.language.label}
                value={settings.defaultLanguage}
                options={VOICE_LANGUAGE_OPTIONS}
                onChange={(defaultLanguage) => onSettingsChange({ defaultLanguage })}
              />
            </div>
          </div>

          {/* AI voice picker — or, with auto language switching on, the
              multilingual table (frame 100:51381). */}
          <div className="mt-6">
            {settings.autoLanguageSwitching ? (
              <div className="flex items-center justify-between">
                <GroupLabel label={COPY.picker.label} />
                <button
                  type="button"
                  onClick={() => setMultilingualOpen(true)}
                  className="text-[14px] leading-5 tracking-[-0.154px] text-accent-blue"
                >
                  {COPY.multilingual.link}
                </button>
              </div>
            ) : (
              <GroupLabel label={COPY.picker.label} />
            )}
            <div className="mt-2 flex items-center gap-2">
              <Toggle
                label={
                  settings.autoLanguageSwitching ? COPY.picker.autoOn : COPY.picker.autoOff
                }
                checked={settings.autoLanguageSwitching}
                onChange={() =>
                  onSettingsChange({ autoLanguageSwitching: !settings.autoLanguageSwitching })
                }
              />
              <span className="text-[14px] leading-5 tracking-[-0.154px] text-grey-800">
                {settings.autoLanguageSwitching ? COPY.picker.autoOn : COPY.picker.autoOff}
              </span>
              <GardenIcon name="info-stroke" className="h-4 w-4 shrink-0 text-ink-muted" />
            </div>
            {settings.autoLanguageSwitching ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full font-semibold"
                  onClick={() => setMultilingualOpen(true)}
                >
                  {COPY.multilingual.action}
                </Button>
                <div className="mt-3 overflow-hidden rounded-2xl border border-[#e8eaec]">
                  <div className="flex items-center bg-[#f6f6f6] px-4 py-2.5">
                    <span className="flex-1 text-[14px] font-medium leading-5 text-[#293238]">
                      {COPY.multilingual.languagesColumn}
                    </span>
                    <span className="w-[100px] text-[14px] font-medium leading-5 text-[#293238]">
                      {COPY.multilingual.voiceColumn}
                    </span>
                  </div>
                  <ul className="bg-white">
                    {settings.languages.map((language) => (
                      <li
                        key={language.id}
                        className="flex items-center border-b border-[#eae9e8] px-4 py-2.5 last:border-b-0"
                      >
                        <span className="flex flex-1 items-center gap-2 text-[14px] leading-5 tracking-[-0.154px] text-black">
                          <span aria-hidden>{language.flag}</span>
                          {language.label}
                        </span>
                        <span className="w-[100px] text-[14px] leading-5 tracking-[-0.154px] text-black">
                          {language.voice}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
            <>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-[#bcbdc5] bg-white px-3">
                <GardenIcon name="search-stroke" className="h-4 w-4 shrink-0 text-ink-muted" />
                <input
                  type="search"
                  aria-label={COPY.picker.searchPlaceholder}
                  value={settings.voiceQuery}
                  placeholder={COPY.picker.searchPlaceholder}
                  onChange={(e) => onSettingsChange({ voiceQuery: e.target.value })}
                  className="min-w-0 flex-1 bg-transparent text-[14px] leading-5 tracking-[-0.154px] text-black outline-none placeholder:text-grey-500"
                />
              </div>
              <button
                type="button"
                aria-pressed
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-[#bcbdc5] bg-white px-3 text-[14px] leading-5 tracking-[-0.154px] text-black"
              >
                <GardenIcon name="adjust-stroke" className="h-4 w-4 text-ink-muted" />
                {COPY.picker.filter}
                <GardenIcon name="chevron-down-stroke" className="h-4 w-4 text-ink-muted" />
              </button>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {voices.map((voice) => (
                <li key={voice.id}>
                  <VoiceOptionCard
                    name={voice.name}
                    description={voice.description}
                    selected={voice.id === settings.voiceId}
                    onSelect={() => onSettingsChange({ voiceId: voice.id })}
                  />
                </li>
              ))}
            </ul>
            </>
            )}
          </div>

          <PanelDivider />

          {/* Voice speed */}
          <div>
            <GroupLabel label={COPY.speed.label} />
            <Helper>{COPY.speed.helper}</Helper>
            <input
              type="range"
              aria-label={COPY.speed.label}
              min={0}
              max={100}
              step={1}
              value={settings.voiceSpeed}
              onChange={(e) => onSettingsChange({ voiceSpeed: Number(e.target.value) })}
              className="mt-3 w-full accent-ink"
            />
            <div className="mt-1 flex items-start justify-between text-[12px] leading-4 text-grey-600">
              <span>{COPY.speed.scale[0]}</span>
              <span className="text-center">{COPY.speed.scale[1]}</span>
              <span className="text-right">{COPY.speed.scale[2]}</span>
            </div>
          </div>
        </>
      )}
      {multilingualOpen ? (
        <MultilingualModal
          languages={settings.languages}
          onSave={(languages) => onSettingsChange({ languages })}
          onClose={() => setMultilingualOpen(false)}
        />
      ) : null}
    </PanelShell>
  )
}
