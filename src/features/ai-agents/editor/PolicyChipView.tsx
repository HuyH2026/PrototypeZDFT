// One inline entity chip in the policy prose: a read-only token of icon + label,
// as the design draws it (Figma 1886:75770 and siblings). It carries no delete
// control — chips come and go with the prose around them, not by a per-chip ×.
import type { PolicyChip } from '../agent-store'
import { CHIP_STYLE, CHIP_ICON } from './editor-data'

export function PolicyChipView({ chip }: { chip: PolicyChip }) {
  const style = CHIP_STYLE[chip.variant]
  const Icon = CHIP_ICON[chip.variant]
  return (
    <span
      className="mx-0.5 inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded-md border px-2 py-px align-[1px] text-[13px] font-medium leading-5"
      style={{ color: style.text, borderColor: style.border, backgroundColor: style.bg }}
    >
      <Icon size={13} strokeWidth={1.8} aria-hidden />
      {chip.label}
    </span>
  )
}
