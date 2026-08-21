// Web Call ▸ Voice (frame 135-140107): the call greeting textarea, the default
// language dropdown, the auto language switching toggle, a searchable voice
// catalog (Sarah Curious selected over the frame's repeated Tim placeholders),
// and the Voice speed slider (refined in 134-131906). When auto switching is
// on (135-132858), the catalog swaps for the enabled-languages box and the
// Multilingual settings button, which opens WebCallMultilingualDialog
// (149-182251). Presentational — every edit bubbles up via handlers; the
// search query and dialog open state are panel-local (ephemeral UI state).
import { useState } from 'react'
import { Check, Play, Search, SlidersHorizontal } from 'lucide-react'
import { GardenIcon } from '@/components/garden-icon'
import { cn } from '@/lib/cn'
import {
  WEBCALL_LANGUAGES,
  WEBCALL_MULTILINGUAL,
  WEBCALL_VOICES,
  WEBCALL_VOICE_COPY as COPY,
  type RailSection,
  type Segment,
  type WebCallVoice,
  type WebCallVoiceOption,
} from './config-data'
import { GroupLabel, Helper, PanelShell } from './panel-parts'
import { WebCallMultilingualDialog } from './WebCallMultilingualDialog'

type WebCallVoicePanelProps = {
  segment: Segment
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onVoiceChange: (patch: Partial<WebCallVoice>) => void
}

export function WebCallVoicePanel({
  segment,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onVoiceChange,
}: WebCallVoicePanelProps) {
  const [query, setQuery] = useState('')
  const [multilingualOpen, setMultilingualOpen] = useState(false)
  const voice = segment.webcall.voice
  const voices = WEBCALL_VOICES.filter((v) =>
    v.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <PanelShell
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      <h2 className="text-[18px] font-semibold leading-6 tracking-[-0.45px] text-black">
        {COPY.title}
      </h2>

      {/* The frame stacks these groups 20px apart, 8px label-to-content. */}
      <div className="mt-5 flex flex-col gap-5">
        {/* Call greeting */}
        <div>
          <GroupLabel label={COPY.greeting.label} />
          <Helper>{COPY.greeting.helper}</Helper>
          <textarea
            aria-label={COPY.greeting.label}
            value={voice.greeting}
            onChange={(e) => onVoiceChange({ greeting: e.target.value })}
            rows={3}
            className="mt-2 h-20 w-full resize-none rounded-lg border border-[#b7b7b3] bg-white px-3 py-2.5 text-[14px] leading-5 tracking-[-0.154px] text-ink outline-none focus:border-accent-blue"
          />
        </div>

        <Divider />

        {/* Select default language */}
        <div>
          <GroupLabel label={COPY.language.label} info />
          <Helper>{COPY.language.helper}</Helper>
          <div className="relative mt-2">
            <select
              aria-label={COPY.language.label}
              value={voice.language}
              onChange={(e) => onVoiceChange({ language: e.target.value })}
              className="h-10 w-full appearance-none rounded-lg border border-[#bcbdc5] bg-white px-3 text-[14px] tracking-[-0.154px] text-ink outline-none focus:border-accent-blue"
            >
              {WEBCALL_LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
            <GardenIcon
              name="chevron-down-stroke"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink"
            />
          </div>
        </div>

        {/* Voice */}
        <div>
          <GroupLabel label={COPY.voiceLabel} />
          <div className="mt-2 flex items-center gap-2">
            {/* The frame's small toggle: white track, dark knob. */}
            <button
              type="button"
              role="switch"
              aria-checked={voice.autoLanguageSwitching}
              aria-label={COPY.autoSwitching(voice.autoLanguageSwitching)}
              onClick={() =>
                onVoiceChange({ autoLanguageSwitching: !voice.autoLanguageSwitching })
              }
              className={cn(
                'flex h-5 w-10 items-center rounded-full border px-0.5 transition-colors duration-instant ease-soft',
                voice.autoLanguageSwitching
                  ? 'justify-end border-transparent bg-[#367a74]'
                  : 'justify-start border-grey-400 bg-white',
              )}
            >
              <span
                className={cn(
                  'size-4 rounded-full',
                  voice.autoLanguageSwitching ? 'bg-white' : 'bg-[#2f3130]',
                )}
              />
            </button>
            <span className="text-[14px] font-semibold text-ink">
              {COPY.autoSwitching(voice.autoLanguageSwitching)}
            </span>
            <GardenIcon name="info-stroke" className="h-4 w-4 text-grey-600" />
          </div>

          {voice.autoLanguageSwitching ? (
            // On: the catalog swaps for the enabled-languages box and the
            // Multilingual settings button (frame 135-132858).
            <div className="mt-3 flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setMultilingualOpen(true)}
                className="h-8 w-full rounded-full border border-[#9c9a99] text-[14px] font-semibold text-ink transition-colors duration-instant ease-soft hover:bg-grey-100"
              >
                {COPY.multilingual.button}
              </button>
              <div
                data-testid="multilingual-box"
                className="overflow-hidden rounded-lg border border-grey-200 bg-white"
              >
                <div className="grid grid-cols-2 border-b border-grey-200 px-3 py-2 text-[13px] font-semibold text-ink">
                  <span>{COPY.multilingual.enabledLanguages}</span>
                  <span>{COPY.multilingual.voice}</span>
                </div>
                {WEBCALL_MULTILINGUAL.map((row) => (
                  <div
                    key={row.language}
                    className="grid grid-cols-2 border-b border-grey-200 px-3 py-2.5 text-[13px] last:border-b-0"
                  >
                    <span className="flex items-center gap-2 text-ink">
                      <span aria-hidden>{row.flag}</span>
                      {row.language}
                      {row.isDefault ? ' (default)' : ''}
                    </span>
                    <span className="text-ink">{row.voice}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Search + filter */}
              <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                aria-hidden
                className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-600"
              />
              <input
                type="search"
                aria-label="Search voices"
                placeholder={COPY.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#bcbdc5] bg-white pl-9 pr-3 text-[14px] text-ink outline-none placeholder:text-grey-600 focus:border-accent-blue [&::-webkit-search-cancel-button]:hidden"
              />
            </div>
            <button
              type="button"
              className="flex h-10 w-[100px] items-center justify-center gap-1.5 rounded-lg border border-[#bcbdc5] bg-white text-[14px] font-semibold text-ink transition-colors duration-instant ease-soft hover:bg-grey-100"
            >
              <SlidersHorizontal size={14} aria-hidden />
              {COPY.filterAll}
              <GardenIcon name="chevron-down-stroke" className="h-3.5 w-3.5" />
            </button>
          </div>

              {/* The voice catalog */}
              <div className="mt-3 flex flex-col gap-2">
                {voices.map((option) => (
                  <VoiceOptionRow
                    key={option.id}
                    option={option}
                    selected={voice.voiceId === option.id}
                    onSelect={() => onVoiceChange({ voiceId: option.id })}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <Divider />

        {/* Voice speed — slider + Slowest/Normal/Fastest scale. */}
        <div>
          <GroupLabel label={COPY.speed.label} />
          <Helper>{COPY.speed.helper}</Helper>
          <p className="mt-4 text-[14px] font-semibold leading-5 tracking-[-0.154px] text-black">
            {COPY.speed.sliderLabel}
          </p>
          <input
            type="range"
            aria-label={COPY.speed.sliderLabel}
            min={0}
            max={100}
            step={1}
            value={voice.speed}
            onChange={(e) => onVoiceChange({ speed: Number(e.target.value) })}
            className="mt-2 w-full accent-accent-blue"
          />
          <div className="mt-1 flex justify-between text-[12px] text-grey-600">
            <span>{COPY.speed.slowest}</span>
            <span>{COPY.speed.normal}</span>
            <span>{COPY.speed.fastest}</span>
          </div>
        </div>
      </div>

      {multilingualOpen ? (
        <WebCallMultilingualDialog onClose={() => setMultilingualOpen(false)} />
      ) : null}
    </PanelShell>
  )
}

/** A catalog row: play button, bold name + grey description, radio on the
 *  right. Shared with the Multilingual settings dialog's voice column. */
export function VoiceOptionRow({
  option,
  selected,
  onSelect,
}: {
  option: WebCallVoiceOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-label={option.name}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors duration-instant ease-soft',
        selected
          ? 'border-accent-blue bg-[#f3f6fb]'
          : 'border-grey-200 bg-white hover:border-grey-400',
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
        <Play size={12} fill="currentColor" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-[14px] leading-5">
        <span className="font-semibold text-ink">{option.name}</span>{' '}
        <span className="text-grey-600">{option.description}</span>
      </span>
      {selected ? (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-blue text-white">
          <Check size={12} strokeWidth={3} aria-hidden />
        </span>
      ) : (
        <span className="size-5 shrink-0 rounded-full border border-grey-300 bg-white" />
      )}
    </button>
  )
}

function Divider() {
  return <div className="h-px bg-grey-200" />
}
