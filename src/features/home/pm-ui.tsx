// Shared, presentational PM UI primitives + palette. Extracted from
// PmDashboard.tsx so the dashboard AND the opportunity detail screen render
// the same donut / badges / tags without duplication or a circular import.
import { Bug, Sparkles } from 'lucide-react'
import { LIFECYCLE_LABEL, type LifecycleStageKey, type OppType } from './pm-data'

// Palette — mirror HomeScreen's inline dashboard hues (same hex values).
export const INK = '#2f3130'
export const INK_SOFT = '#2f3941'
export const MUTED = '#8b8e89'
export const BORDER = '#e2e0dd'
export const BLUE = '#1f73b7'
export const GREEN = '#0f8a5f'
export const AMBER = '#c8792b'
export const RED = '#c8402f'
export const PURPLE = '#724be8'

// --- Impact donut (deterministic, no chart lib) -----------------------------
export function ImpactDonut({ value }: { value: number }) {
  const r = 30, c = 2 * Math.PI * r
  const dash = (value / 100) * c
  const color = value >= 80 ? GREEN : value >= 60 ? BLUE : AMBER
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-label={`Impact ${value}`}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#efeeec" strokeWidth="8" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round" transform="rotate(-90 36 36)" />
      <text x="36" y="41" textAnchor="middle" fontSize="18" fontWeight="600" fill={INK}>{value}</text>
    </svg>
  )
}

// --- Stage badge ------------------------------------------------------------
export const STAGE_COLOR: Record<LifecycleStageKey, string> = {
  detected: MUTED,
  planned: PURPLE,
  'in-dev': GREEN,
  shipped: INK,
}

export function StageBadge({ stage }: { stage: LifecycleStageKey }) {
  const color = STAGE_COLOR[stage]
  return (
    <span className="flex h-[20px] items-center rounded-full px-2" style={{ backgroundColor: `${color}18` }}>
      <span className="text-[11px] font-semibold" style={{ color }}>{LIFECYCLE_LABEL[stage]}</span>
    </span>
  )
}

// --- Type tag (BUG / REQUEST) -----------------------------------------------
export function TypeTag({ type }: { type: OppType }) {
  const isBug = type === 'bug'
  const color = isBug ? RED : BLUE
  return (
    <span className="flex h-[20px] items-center gap-1 rounded-full px-2" style={{ backgroundColor: `${color}18` }}>
      {isBug ? <Bug size={11} color={color} /> : <Sparkles size={11} color={color} />}
      <span className="text-[10px] font-semibold uppercase tracking-[0.4px]" style={{ color }}>{isBug ? 'Bug' : 'Request'}</span>
    </span>
  )
}
