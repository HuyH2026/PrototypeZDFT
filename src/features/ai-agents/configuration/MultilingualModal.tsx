// Voice ▸ Voice, "Multilingual settings" modal (frame 149-182251, whose
// backdrop is this voice channel screen): the 🌸 Large modal — 1038×840 over
// the black/60 scrim, header with Save + close, then one bordered grid: a 48px
// column-header row (language-hiragana + Enabled languages, mic + Voice) over
// 73px language rows (flag, dropdown, trash) and the voice catalog. Picking a
// voice assigns it to the currently selected language row; Save writes the
// languages back to the segment's voice settings.
//
// Rendered through a portal: PanelShell's backdrop-blur makes it a containing
// block for fixed-position descendants, which would trap the modal inside the
// side panel.
//
// A mock: the overlay is panel-local state, and nothing leaves the screen.
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Languages, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { GardenIcon } from '@/components/garden-icon'
import {
  VOICE_LANGUAGE_OPTIONS,
  VOICE_OPTIONS,
  VOICE_SETTINGS_COPY as COPY,
  type VoiceLanguage,
} from './config-data'
import { VoiceOptionCard } from './VoiceSettingsPanel'

type MultilingualModalProps = {
  languages: VoiceLanguage[]
  onSave: (languages: VoiceLanguage[]) => void
  onClose: () => void
}

export function MultilingualModal({ languages, onSave, onClose }: MultilingualModalProps) {
  const [rows, setRows] = useState<VoiceLanguage[]>(languages)
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '')
  const [query, setQuery] = useState('')

  const voices = VOICE_OPTIONS.filter((v) =>
    v.name.toLowerCase().includes(query.trim().toLowerCase()),
  )
  const selected = rows.find((r) => r.id === selectedId)

  const removeRow = (id: string) => {
    const next = rows.filter((r) => r.id !== id)
    setRows(next)
    if (selectedId === id) setSelectedId(next[0]?.id ?? '')
  }

  const addRow = () => {
    const unused = VOICE_LANGUAGE_OPTIONS.find(
      (option) => !rows.some((r) => r.label === option || r.label.startsWith(option)),
    )
    if (!unused) return
    const id = unused.toLowerCase()
    setRows([...rows, { id, flag: '🌐', label: unused, voice: VOICE_OPTIONS[0].name }])
    setSelectedId(id)
  }

  const assignVoice = (voiceName: string) => {
    if (!selected) return
    setRows(rows.map((r) => (r.id === selected.id ? { ...r, voice: voiceName } : r)))
  }

  return createPortal(
    // The frame's 🌸 Backdrop scrim samples to ~black/60 over the app.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={COPY.multilingual.link}
        className="flex h-[840px] max-h-[94vh] w-[1038px] max-w-[94vw] flex-col rounded-2xl bg-white px-10 pb-10 pt-6 shadow-[0_24px_64px_0_rgba(12,12,13,0.24)]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold leading-6 tracking-[-0.45px] text-black">
            {COPY.multilingual.link}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onSave(rows)
                onClose()
              }}
              className="h-10 rounded-full bg-[#2f3130] px-5 text-[14px] font-semibold text-white transition-colors duration-instant ease-soft hover:bg-black"
            >
              {COPY.multilingual.save}
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-lg text-ink transition-colors duration-instant ease-soft hover:bg-grey-100"
            >
              <X size={20} aria-hidden />
            </button>
          </div>
        </div>
        <p className="mt-7 text-[14px] leading-5 tracking-[-0.154px] text-ink">
          {COPY.multilingual.modalIntro}
        </p>

        {/* The bordered grid: one header row spanning both columns. */}
        <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-grey-200">
          <div className="flex h-12 shrink-0 items-stretch border-b border-grey-200 text-[14px] font-semibold text-ink">
            <div className="flex w-[51%] items-center gap-2 border-r border-grey-200 px-5">
              <Languages size={20} aria-hidden />
              {COPY.multilingual.languagesColumn}
              <ChevronDown size={16} aria-hidden className="text-grey-600" />
            </div>
            <div className="flex flex-1 items-center gap-2 px-5">
              <GardenIcon name="microphone-on-stroke" className="h-5 w-5" />
              {COPY.multilingual.voiceColumn}
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* Enabled languages — picking a row targets it for voice assignment. */}
            <div className="flex w-[51%] flex-col border-r border-grey-200">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="flex h-[73px] shrink-0 items-center gap-3 border-b border-grey-200 px-5"
                >
                  <span aria-hidden className="w-6 text-[22px] leading-8">
                    {row.flag}
                  </span>
                  <button
                    type="button"
                    aria-pressed={row.id === selectedId}
                    aria-label={`Edit voice for ${row.label}`}
                    onClick={() => setSelectedId(row.id)}
                    className={`flex h-10 flex-1 items-center justify-between rounded-lg border px-3 text-left text-[14px] text-ink transition-colors duration-instant ease-soft ${
                      row.id === selectedId
                        ? 'border-accent-blue bg-[#f3f6fb]'
                        : 'border-[#bcbdc5] bg-white'
                    }`}
                  >
                    {row.label}
                    <ChevronDown size={16} aria-hidden className="text-grey-600" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${row.label}`}
                    onClick={() => removeRow(row.id)}
                    className="flex size-10 items-center justify-center rounded-lg text-grey-600 transition-colors duration-instant ease-soft hover:bg-grey-100 hover:text-ink"
                  >
                    <Trash2 size={20} aria-hidden />
                  </button>
                </div>
              ))}
              <div className="px-5 pt-3">
                <button
                  type="button"
                  onClick={addRow}
                  className="flex h-8 w-full items-center justify-center gap-1.5 rounded-full border border-[#9c9a99] text-[14px] font-semibold text-ink transition-colors duration-instant ease-soft hover:bg-grey-100"
                >
                  <Plus size={14} aria-hidden />
                  {COPY.multilingual.addLanguage}
                </button>
              </div>
            </div>

            {/* Voice catalog */}
            <div className="flex min-h-0 flex-1 flex-col gap-3 p-5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    aria-hidden
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-600"
                  />
                  <input
                    type="search"
                    aria-label="Search voices"
                    placeholder={COPY.picker.searchPlaceholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[#bcbdc5] bg-white pl-9 pr-3 text-[14px] text-ink outline-none placeholder:text-grey-600 focus:border-accent-blue [&::-webkit-search-cancel-button]:hidden"
                  />
                </div>
                <button
                  type="button"
                  className="flex h-10 w-[105px] items-center justify-center gap-1.5 rounded-lg border border-[#bcbdc5] bg-white text-[14px] font-semibold text-ink transition-colors duration-instant ease-soft hover:bg-grey-100"
                >
                  <SlidersHorizontal size={14} aria-hidden />
                  {COPY.picker.filter}
                  <GardenIcon name="chevron-down-stroke" className="h-3.5 w-3.5" />
                </button>
              </div>
              <ul className="flex min-h-0 flex-col gap-2 overflow-y-auto">
                {voices.map((voice) => (
                  <li key={voice.id}>
                    <VoiceOptionCard
                      name={voice.name}
                      description={voice.description}
                      selected={selected?.voice === voice.name}
                      onSelect={() => assignVoice(voice.name)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
