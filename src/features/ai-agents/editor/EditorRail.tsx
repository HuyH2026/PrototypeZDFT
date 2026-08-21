// The slim far-right tool rail (per Figma). A selectable set of glyphs; the
// "layers" item shows the Steps palette, any other selection hides it. Panels
// beyond Steps are not specced in the design, so they are intentionally empty.
// Voice use cases swap in a distinct rail (Figma 1886:74637 companion frame) —
// its 8 items aren't wired to panels yet either.
import {
  ListTree, BadgeCheck, Layers, Zap, FileText, Route,
  Rows3, Wand2, Table2, Sparkles, Webhook, Globe, LayoutTemplate,
  type LucideIcon,
} from 'lucide-react'
import type { ChannelKey } from '../agent-builder-data'

export type RailKey =
  | 'insights' | 'outline' | 'steps' | 'triggers' | 'notes'
  | 'routing' | 'cards' | 'enhance' | 'data' | 'ai'

export type VoiceRailKey =
  | 'insights' | 'comps' | 'actions' | 'articles'
  | 'reroutes' | 'events' | 'global' | 'templates'

const TOP: { key: RailKey; label: string; Icon: LucideIcon }[] = [
  { key: 'outline', label: 'Outline', Icon: ListTree },
  { key: 'insights', label: 'Insights', Icon: BadgeCheck },
]

const MID: { key: RailKey; label: string; Icon: LucideIcon }[] = [
  { key: 'steps', label: 'Steps', Icon: Layers },
  { key: 'triggers', label: 'Triggers', Icon: Zap },
  { key: 'notes', label: 'Notes', Icon: FileText },
  { key: 'routing', label: 'Routing', Icon: Route },
  { key: 'cards', label: 'Cards', Icon: Rows3 },
]

const BOTTOM: { key: RailKey; label: string; Icon: LucideIcon }[] = [
  { key: 'enhance', label: 'Enhance', Icon: Wand2 },
  { key: 'data', label: 'Data', Icon: Table2 },
  { key: 'ai', label: 'AI', Icon: Sparkles },
]

const VOICE: { key: VoiceRailKey; label: string; Icon: LucideIcon }[] = [
  { key: 'insights', label: 'Insights', Icon: BadgeCheck },
  { key: 'comps', label: 'Comps', Icon: Layers },
  { key: 'actions', label: 'Actions', Icon: Zap },
  { key: 'articles', label: 'Articles', Icon: FileText },
  { key: 'reroutes', label: 'Reroutes', Icon: Route },
  { key: 'events', label: 'Events', Icon: Webhook },
  { key: 'global', label: 'Global', Icon: Globe },
  { key: 'templates', label: 'Templates', Icon: LayoutTemplate },
]

function RailButton<K extends string>({
  item, selected, onSelect,
}: {
  item: { key: K; label: string; Icon: LucideIcon }
  selected: boolean
  onSelect: (k: K) => void
}) {
  const { Icon } = item
  return (
    <button
      type="button"
      aria-label={item.label}
      aria-pressed={selected}
      onClick={() => onSelect(item.key)}
      className="flex size-8 items-center justify-center rounded-lg"
      style={{
        backgroundColor: selected ? '#ebf5f7' : 'transparent',
        color: selected ? '#1f73b7' : '#404241',
      }}
    >
      <Icon size={16} aria-hidden />
    </button>
  )
}

export function EditorRail({
  channel,
  selected,
  onSelect,
}: {
  channel: ChannelKey
  selected: RailKey | VoiceRailKey
  onSelect: (k: RailKey | VoiceRailKey) => void
}) {
  return (
    // Positioned over the right edge of the content area (see AgentEditorScreen):
    // the design draws it as a floating column of glyphs with no rule and no
    // surface of its own — the hairline beside it belongs to whichever panel is
    // docked, not to the rail.
    <aside
      aria-label="Editor tools"
      className="absolute inset-y-0 right-2 flex w-16 flex-col items-center gap-2 py-5"
    >
      {channel === 'voice' ? (
        VOICE.map((item) => (
          <RailButton key={item.key} item={item} selected={selected === item.key} onSelect={onSelect} />
        ))
      ) : (
        <>
          {TOP.map((item) => (
            <RailButton key={item.key} item={item} selected={selected === item.key} onSelect={onSelect} />
          ))}
          <span className="my-1 h-px w-8 bg-surface-border" aria-hidden />
          {MID.map((item) => (
            <RailButton key={item.key} item={item} selected={selected === item.key} onSelect={onSelect} />
          ))}
          <span className="my-1 h-px w-8 bg-surface-border" aria-hidden />
          {BOTTOM.map((item) => (
            <RailButton key={item.key} item={item} selected={selected === item.key} onSelect={onSelect} />
          ))}
        </>
      )}
    </aside>
  )
}
