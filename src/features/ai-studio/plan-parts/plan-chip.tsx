// The one chip tint table both plan panels read. It lived in
// agent-plan/PlanSection.tsx until the self-improving panel needed three more
// tints and the same rendering; a second copy would have let the two flows drift
// apart on colours the frames share.
export type PlanChipKey =
  // Create-agent: review state (see agent-plan/plan-review-state.ts).
  | 'needs-approval'
  | 'reviewed'
  | 'updated'
  | 'estimated'
  // Self-improving: authored plan semantics (see self-improving/self-improving-data.ts).
  | 'critical'
  | 'tracking'
  | 'active-check-ins'
  | 'auto-applied'

// Green-200/800 for anything settled, pink for anything waiting, the editor's
// amber pair for a section the assistant has since rewritten, red-200/800 for a
// critical diagnosis, blue-200/800 for live tracking, and the purple this app
// already uses for Voice and the Home health heart for active check-ins (it is
// the one pair with no Figma variable behind it).
//
// `bg` is no longer what a section's chip fills with — see PlanChipView — but it
// stays in the table because the Agent Builder row chip is a filled pill and
// reads its pair from here.
export const PLAN_CHIP_STYLE: Record<PlanChipKey, { label: string; fg: string; bg: string }> = {
  'needs-approval': { label: 'Needs approval', fg: '#bc2f7c', bg: '#f7ddec' },
  reviewed: { label: 'Reviewed', fg: '#0a6b62', bg: '#c3e3e1' },
  estimated: { label: 'Estimated', fg: '#0a6b62', bg: '#c3e3e1' },
  updated: { label: 'Updated', fg: '#b8710a', bg: '#ffdfa2' },
  critical: { label: 'Critical', fg: '#831c0a', bg: '#f9cec6' },
  tracking: { label: 'Tracking', fg: '#1b5996', bg: '#d8ecff' },
  'active-check-ins': { label: 'Active check-ins', fg: '#724be8', bg: '#e2d9ff' },
  'auto-applied': { label: 'Auto-applied', fg: '#0a6b62', bg: '#c3e3e1' },
}

// A dot and a coloured label rather than a filled pill: pills stacked down a
// narrow panel shouted louder than the section names they annotate. That was
// true of the create-agent panel's four sections and is more so of the
// self-improving panel's six.
export function PlanChipView({ chip }: { chip: PlanChipKey }) {
  const style = PLAN_CHIP_STYLE[chip]
  return (
    <span
      className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold tracking-[-0.1px]"
      style={{ color: style.fg }}
    >
      <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: style.fg }} />
      {style.label}
    </span>
  )
}
