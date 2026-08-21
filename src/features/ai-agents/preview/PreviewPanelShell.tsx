// The right column both previews share: the heading, what the run is scoped to,
// the frame's two inert action pills, the controls row, then the body below a
// divider. Widget and Voice differ in their controls and in their body — Widget
// picks a language and a segment and lists trace cards; Voice picks a number and
// interleaves the call transcript with them — so those two are slots.
//
// The dark panel's own scale lives here too, since both bodies print in it.
import { useState, type ReactNode } from 'react'
import { ChevronDown, Languages, ListFilterPlus, Phone, Variable } from 'lucide-react'
import { GardenIcon } from '@/components/garden-icon'
import { PREVIEW_SETTINGS_ACTIONS } from './preview-data'

export const LABEL = 'text-[#e8e9eb]'
export const VALUE = 'text-[#44c2ee]'
export const SPEAKER = 'text-[#00f18d]'
export const UTTERANCE = 'text-[#ff9990]'
/** A use case that did not fire — amber, not the resolved green. */
export const MISSED = 'text-[#f5b544]'
export const CARD =
  'rounded-[12px] border border-[#545767] bg-[#1d2033] px-4 py-3 font-mono text-[14px] leading-[22px]'

/**
 * One of the frame's two inert pill actions. The current voice frames
 * (147:172564 / 158:60717) draw them as the emphasis button — light `#dcdcda`
 * fill, dark label — not the dark/cyan pair the widget frame once had.
 */
function SettingsAction({ label, icon }: { label: string; icon: 'filter' | 'variable' }) {
  return (
    <button
      type="button"
      className="flex h-8 w-full items-center justify-center gap-2 rounded-full bg-[#dcdcda] px-3 text-[12px] font-semibold leading-4 text-[#19191a]"
    >
      {icon === 'filter' ? (
        <ListFilterPlus size={16} aria-hidden />
      ) : (
        <Variable size={16} aria-hidden />
      )}
      {label}
    </button>
  )
}

const CONTROL_ICONS = {
  language: Languages,
  phone: Phone,
} as const

/** A dark-mode dropdown: native select under the frame's pill, icon either side. */
export function PanelSelect({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  icon: 'language' | 'segment' | 'phone'
}) {
  const Icon = icon === 'segment' ? null : CONTROL_ICONS[icon]
  return (
    <div className="relative flex-1">
      {Icon ? (
        <Icon
          size={18}
          aria-hidden
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-white"
        />
      ) : (
        <GardenIcon
          name="tag-stroke"
          className="pointer-events-none absolute left-2.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white"
        />
      )}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-[26px] border border-[#576f92] bg-transparent py-1.5 pl-9 pr-8 text-[14px] leading-5 tracking-[-0.1px] text-white outline-none"
      >
        {options.map((option) => (
          // Dark panel, but the popup list is drawn by the OS — give the options
          // an explicit light pair so they are legible in either OS theme.
          <option key={option} value={option} className="bg-white text-ink">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white"
      />
    </div>
  )
}

export function PreviewPanelShell({
  scope,
  controls,
  children,
}: {
  scope: string
  controls: ReactNode
  children: ReactNode
}) {
  // Local-only; the frame (147:172564) shows it under the controls. Nothing
  // reads it — it is the mock's affordance for opting the next call into real
  // ticket creation.
  const [createTickets, setCreateTickets] = useState(false)
  return (
    <section
      data-testid="preview-settings-panel"
      className="flex min-h-0 flex-col gap-5 overflow-hidden rounded-[26px] bg-[rgba(5,20,28,0.5)] p-6 shadow-[0_8px_16px_0_rgba(3,17,38,0.11)]"
    >
      <h2 className="text-[16px] font-semibold leading-5 tracking-[-0.1px] text-white">
        Preview settings
      </h2>

      <div className="flex flex-col gap-3">
        <p className="text-[14px] leading-5 tracking-[-0.1px] text-[#9194a0]">{scope}</p>
        <SettingsAction label={PREVIEW_SETTINGS_ACTIONS[0]} icon="filter" />
        <SettingsAction label={PREVIEW_SETTINGS_ACTIONS[1]} icon="variable" />
        <div className="flex gap-2">{controls}</div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={createTickets}
              onChange={(event) => setCreateTickets(event.target.checked)}
              className="size-4 rounded border-[#8b8e89] bg-transparent"
            />
            <span className="text-[14px] leading-5 tracking-[-0.1px] text-[#dcdcda]">
              Create real tickets
            </span>
          </label>
          <p className="mt-1 text-[12px] leading-4 text-[#b7b7b3]">
            Enable to create real tickets that reach your agents. Takes effect on your next call.
          </p>
        </div>
      </div>

      <hr className="border-t border-white/15" />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">{children}</div>
    </section>
  )
}
