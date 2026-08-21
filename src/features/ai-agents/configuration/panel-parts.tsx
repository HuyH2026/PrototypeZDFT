// The pieces every Configuration panel is built from: the glass shell that
// holds a scrolling form beside the section rail, and the form furniture the
// frames repeat (labels with their helper line, hairline fields, selects,
// checkboxes, and the teal toggle).
//
// Presentational only — nothing here holds state. Extracted so the six panels
// read as content rather than as six copies of the same markup.
import { useId, type ReactNode } from 'react'
import { Info } from 'lucide-react'
import { GardenIcon } from '@/components/garden-icon'
import { SectionRail } from './SectionRail'
import type { RailSection } from './config-data'

// Field border + helper greys come straight from the frames; they have no theme
// token (the Flora field tokens are a different, softer treatment).
const FIELD_BORDER = '#bcbdc5'
const HELPER = '#727583'
const FOOTNOTE = '#a6a9b2'
const TOGGLE_ON = '#048c80'

type PanelShellProps = {
  title?: string
  /** Rendered in place of `title` when a panel leads with something else (tabs). */
  header?: ReactNode
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  children: ReactNode
}

export function PanelShell({
  title,
  header,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  children,
}: PanelShellProps) {
  return (
    <div className="flex h-full w-[484px] shrink-0 overflow-hidden rounded-[24px] border border-[#f2f4f7] bg-white/80 shadow-[0_0_15px_0_rgba(0,0,0,0.04)] backdrop-blur-[50px]">
      <div className="flex-1 overflow-y-auto pb-8 pl-10 pr-9 pt-6">
        {header ??
          (title ? (
            <h2 className="text-[18px] leading-6 tracking-[-0.45px] text-black">{title}</h2>
          ) : null)}
        {children}
      </div>
      <SectionRail
        sections={sections}
        trailingStart={trailingStart}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
    </div>
  )
}

/** A group label, optionally followed by the frames' info glyph. */
export function GroupLabel({ label, info = false }: { label: string; info?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <p className="text-[14px] font-semibold leading-5 tracking-[-0.154px] text-black">{label}</p>
      {info ? <Info size={16} className="shrink-0 text-ink-muted" aria-hidden /> : null}
    </div>
  )
}

export function Helper({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 text-[12px] leading-[18px] tracking-[-0.1px]" style={{ color: HELPER }}>
      {children}
    </p>
  )
}

export function Footnote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 text-[12px] leading-[18px] tracking-[-0.1px]" style={{ color: FOOTNOTE }}>
      {children}
    </p>
  )
}

export function PanelDivider() {
  return <hr className="my-6 border-t border-grey-200" />
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  density = 'default',
  className = '',
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  density?: 'default' | 'compact'
  className?: string
}) {
  return (
    <input
      type="text"
      aria-label={label}
      value={value}
      placeholder={placeholder}
      readOnly={!onChange}
      onChange={(e) => onChange?.(e.target.value)}
      style={{ borderColor: FIELD_BORDER }}
      className={`w-full rounded-lg border bg-white tracking-[-0.1px] text-black placeholder:text-grey-500 ${
        density === 'compact'
          ? 'px-4 py-1.5 text-[12px] leading-5'
          : 'px-4 py-2.5 text-[14px] leading-5'
      } ${className}`}
    />
  )
}

export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange?: (value: string) => void
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ borderColor: FIELD_BORDER }}
        className="w-full appearance-none rounded-lg border bg-white py-2.5 pl-4 pr-9 text-[14px] leading-5 tracking-[-0.1px] text-black"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <GardenIcon
        name="chevron-down-stroke"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
      />
    </div>
  )
}

export function CheckRow({
  label,
  checked,
  onChange,
  disabled = false,
  children,
}: {
  label: string
  checked: boolean
  onChange?: () => void
  /** Locked rows (owned elsewhere, e.g. by a Policy) read as muted. */
  disabled?: boolean
  /** Inline content spliced into the label, e.g. the "After [2] user interactions" field. */
  children?: ReactNode
}) {
  const id = useId()
  return (
    <div className="flex items-center gap-1.5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={() => onChange?.()}
        className="size-3 shrink-0 accent-accent-blue"
      />
      {children ? (
        <div className="flex items-center gap-1.5 text-[12px] leading-5 tracking-[-0.154px] text-black">
          {children}
        </div>
      ) : (
        <label
          htmlFor={id}
          className={`text-[12px] leading-5 tracking-[-0.154px] ${disabled ? 'text-grey-600' : 'text-black'}`}
        >
          {label}
        </label>
      )}
    </div>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
  showState = false,
  /** Dark instead of teal — the frames use the neutral toggle for on/off headers. */
  tone = 'teal',
}: {
  label: string
  checked: boolean
  onChange?: () => void
  /** Adds the compact On/Off label used by the segment visibility control. */
  showState?: boolean
  tone?: 'teal' | 'neutral'
}) {
  const on = tone === 'neutral' ? '#2f3130' : TOGGLE_ON
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange?.()}
      className={`relative h-5 shrink-0 rounded-full transition-colors duration-instant ease-soft ${showState ? 'w-[42px]' : 'w-10'}`}
      style={{ backgroundColor: checked ? on : '#e4e7f0' }}
    >
      {showState ? (
        <span
          className={`absolute top-1/2 -translate-y-1/2 text-[9px] font-semibold leading-none ${checked ? 'left-1.5 text-white' : 'right-1.5 text-grey-700'}`}
        >
          {checked ? 'On' : 'Off'}
        </span>
      ) : null}
      <span
        className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-all duration-instant ease-soft ${checked ? (showState ? 'left-[26px]' : 'left-[23px]') : 'left-1'}`}
      />
    </button>
  )
}

/** A toggle with its label beside it, as the CSAT and Voice panels lead. */
export function ToggleRow({
  label,
  checked,
  onChange,
  showState = false,
  tone = 'neutral',
}: {
  label: string
  checked: boolean
  onChange?: () => void
  showState?: boolean
  tone?: 'teal' | 'neutral'
}) {
  return (
    <div className="flex items-center gap-2">
      <Toggle
        label={label}
        checked={checked}
        onChange={onChange}
        showState={showState}
        tone={tone}
      />
      <span className="text-[14px] leading-5 tracking-[-0.154px] text-grey-800">{label}</span>
    </div>
  )
}
