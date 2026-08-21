// The '/' command menu's static content (Figma 94:90785): a "Suggested" row
// above a "Components" list. Icons are derived from CHIP_ICON by variant, so
// a menu row and the chip it inserts always show the same glyph — Classic
// Block has no chip variant (its behavior is marked "(TBD)" in the design
// itself), so it carries its own icon and stays inert.
import { Blocks, type LucideIcon } from 'lucide-react'
import type { ChipVariant } from '../agent-store'

export type SlashMenuItem = {
  id: string
  label: string
  badgeColor: string
  variant: ChipVariant | null
  icon?: LucideIcon
}

export type SlashMenuSection = {
  label: string
  items: SlashMenuItem[]
}

const REROUTE: SlashMenuItem = {
  id: 'reroute',
  label: 'Reroute',
  badgeColor: '#1f866a',
  variant: 'routing',
}

export const SLASH_MENU_SECTIONS: SlashMenuSection[] = [
  { label: 'Suggested', items: [{ ...REROUTE, id: 'suggested-reroute' }] },
  {
    label: 'Components',
    items: [
      { id: 'action', label: 'Action', badgeColor: '#1472ff', variant: 'action' },
      REROUTE,
      {
        id: 'context-variable',
        label: 'Context variable',
        badgeColor: '#0f43a3',
        variant: 'variable',
      },
      { id: 'agent', label: 'Agent', badgeColor: '#b920c7', variant: 'agent' },
      { id: 'article', label: 'Article', badgeColor: '#1472ff', variant: 'article' },
      { id: 'event', label: 'Event', badgeColor: '#079db7', variant: 'event' },
      {
        id: 'classic-block',
        label: 'Classic Block (TBD)',
        badgeColor: '#61670b',
        variant: null,
        icon: Blocks,
      },
    ],
  },
]
