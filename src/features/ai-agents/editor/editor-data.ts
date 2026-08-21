// Icon + color mappings for the editor palette and inline policy chips, plus the
// measurements the editor's layout is built on.
import {
  Code2, GitBranch, FileText, MessageSquare, LayoutGrid, Image as ImageIcon,
  SmilePlus, Paperclip, ListChecks, Layers, Zap, Variable, Bot, Newspaper,
  Route as Route2Icon, Mic as MicIcon,
  type LucideIcon,
} from 'lucide-react'
import type { StepType, ChipVariant } from '../agent-store'

// The design (Figma 1886:74637 / 74927 / 75467) docks one 419px panel on the
// right — Steps or AI Studio, both in the same slot — and centres a 668px
// document column in whatever space is left. Within that column the heading sits
// flush left and the prose and block cards are indented to the heading's text, so
// the whole document hangs off one line.
export const EDITOR_PANEL_W = 419
export const EDITOR_COLUMN_W = 668
// The heading's 24px sparkle badge plus its 8px gap: what the body indents by.
export const EDITOR_BODY_INDENT = 32

export const STEP_ICON: Record<StepType, LucideIcon> = {
  options: ListChecks,
  condition: GitBranch,
  form: FileText,
  text: MessageSquare,
  'dynamic-card': LayoutGrid,
  image: ImageIcon,
  csat: SmilePlus,
  attachment: Paperclip,
  code: Code2,
  'nested-policy': Layers,
  say: MicIcon,
}

// Tinted squircle behind each palette step icon, per the web-call policy
// detail's Steps panel (Explore-Voice-Unification 170:63332). `fg` is the
// glyph color, `bg` the tinted squircle.
export const STEP_BADGE: Record<StepType, { fg: string; bg: string }> = {
  options: { fg: '#17494d', bg: '#a3b7df' },
  condition: { fg: '#8a5a00', bg: '#ffea97' },
  'nested-policy': { fg: '#0f5550', bg: '#88fdf1' },
  form: { fg: '#3a2470', bg: '#af8ec7' },
  text: { fg: '#404241', bg: '#eae9e8' },
  'dynamic-card': { fg: '#1d5620', bg: '#d1f3c7' },
  image: { fg: '#4a521a', bg: '#d4dca0' },
  code: { fg: '#ffffff', bg: '#0c0c0d' },
  say: { fg: '#ffffff', bg: '#e58035' },
  // Not in the frame; keeps its legacy tint for the older widget surface.
  attachment: { fg: '#1f73b7', bg: '#e3f0f9' },
  csat: { fg: '#d6337c', bg: '#fce0ee' },
}

// ─── Voice steps ───
// The Voice policy detail (Explore-Voice-Unification 143:163114) docks a Steps
// panel whose step types differ from the Widget palette: Condition, Nested
// Policy, GoTo Component, Text, Code, Say. These are palette-only entries (they
// append to the shared canvas blocks), keyed to the closest existing StepType
// so the canvas + chip pipeline keeps working.
export type VoiceStep = {
  stepType: StepType
  label: string
  Icon: LucideIcon
  badge: { fg: string; bg: string }
}

export const VOICE_STEP_TYPES: VoiceStep[] = [
  { stepType: 'condition', label: 'Condition', Icon: GitBranch, badge: { fg: '#b8710a', bg: '#ffea97' } },
  { stepType: 'options', label: 'Nested Policy', Icon: Layers, badge: { fg: '#ffffff', bg: '#8d59b1' } },
  { stepType: 'dynamic-card', label: 'GoTo Component', Icon: Route2Icon, badge: { fg: '#ffffff', bg: '#2d7e55' } },
  { stepType: 'text', label: 'Text', Icon: MessageSquare, badge: { fg: '#404241', bg: '#dcdcda' } },
  { stepType: 'code', label: 'Code', Icon: Code2, badge: { fg: '#ffffff', bg: '#0c0c0d' } },
  { stepType: 'csat', label: 'Say', Icon: MicIcon, badge: { fg: '#ffffff', bg: '#e58035' } },
]

// Leading glyph for an inline policy chip, derived from its variant.
export const CHIP_ICON: Record<ChipVariant, LucideIcon> = {
  form: Layers,
  routing: GitBranch,
  event: Zap,
  action: Zap,
  trigger: MessageSquare,
  variable: Variable,
  agent: Bot,
  article: Newspaper,
}

// Chip tints per Figma: form = green, routing = purple, event = blue,
// action = filled dark, trigger = neutral. variable/agent/article carry the
// slash menu's own badge colors through into the chip it inserts, so the
// token stays visually traceable to the menu item that created it.
export const CHIP_STYLE: Record<ChipVariant, { text: string; border: string; bg: string }> = {
  form: { text: '#0f8a5f', border: '#0f8a5f', bg: '#0f8a5f14' },
  routing: { text: '#724be8', border: '#724be8', bg: '#724be814' },
  event: { text: '#1f73b7', border: '#1f73b7', bg: '#1f73b714' },
  action: { text: '#2f3130', border: '#e2e0dd', bg: '#ffffff' },
  trigger: { text: '#8b8e89', border: '#e2e0dd', bg: '#f4f3f1' },
  variable: { text: '#0f43a3', border: '#0f43a3', bg: '#0f43a314' },
  agent: { text: '#b920c7', border: '#b920c7', bg: '#b920c714' },
  article: { text: '#1472ff', border: '#1472ff', bg: '#1472ff14' },
}
