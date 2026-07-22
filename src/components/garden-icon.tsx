// Pixel-exact Zendesk Garden glyphs, rendered inline so they inherit size and
// color from Tailwind classes (the source SVGs use `currentColor`). This is the
// canonical icon source for the Garden/Flora design system — used where a
// design frame calls out a specific Garden icon, alongside the custom nav-rail
// SVGs in `nav-icons.tsx`. General chrome still uses lucide-react.
//
// SVGs are imported as raw markup via Vite's `?raw`; the wrapper is sized (e.g.
// `h-4 w-4`) and the inner <svg> is forced to fill it, so the source 16×16
// dimensions don't lock the render size.
import { cn } from '@/lib/cn'

import rocketStroke from '@zendeskgarden/svg-icons/src/16/rocket-stroke.svg?raw'
import userSoloStroke from '@zendeskgarden/svg-icons/src/16/user-solo-stroke.svg?raw'
import tagStroke from '@zendeskgarden/svg-icons/src/16/tag-stroke.svg?raw'
import chevronDownStroke from '@zendeskgarden/svg-icons/src/16/chevron-down-stroke.svg?raw'
import userGroupStroke from '@zendeskgarden/svg-icons/src/16/user-group-stroke.svg?raw'
import linkStroke from '@zendeskgarden/svg-icons/src/16/link-stroke.svg?raw'
import heartStroke from '@zendeskgarden/svg-icons/src/16/heart-stroke.svg?raw'
import checkBadgeStroke from '@zendeskgarden/svg-icons/src/16/check-badge-stroke.svg?raw'
import smileyStroke from '@zendeskgarden/svg-icons/src/16/smiley-stroke.svg?raw'
import megaphoneStroke from '@zendeskgarden/svg-icons/src/16/megaphone-stroke.svg?raw'
import markupStroke from '@zendeskgarden/svg-icons/src/16/markup-stroke.svg?raw'
import globeStroke from '@zendeskgarden/svg-icons/src/16/globe-stroke.svg?raw'
import speechBubbleStroke from '@zendeskgarden/svg-icons/src/16/speech-bubble-plain-stroke.svg?raw'
import microphoneStroke from '@zendeskgarden/svg-icons/src/16/microphone-on-stroke.svg?raw'
import phoneStroke from '@zendeskgarden/svg-icons/src/16/phone-stroke.svg?raw'

export const GARDEN_ICONS = {
  'rocket-stroke': rocketStroke,
  'user-solo-stroke': userSoloStroke,
  'tag-stroke': tagStroke,
  'chevron-down-stroke': chevronDownStroke,
  'user-group-stroke': userGroupStroke,
  'link-stroke': linkStroke,
  'heart-stroke': heartStroke,
  'check-badge-stroke': checkBadgeStroke,
  'smiley-stroke': smileyStroke,
  'megaphone-stroke': megaphoneStroke,
  'markup-stroke': markupStroke,
  'globe-stroke': globeStroke,
  'speech-bubble-stroke': speechBubbleStroke,
  'microphone-stroke': microphoneStroke,
  'phone-stroke': phoneStroke,
} as const

export type GardenIconName = keyof typeof GARDEN_ICONS

type GardenIconProps = {
  name: GardenIconName
  /** Sizing/color classes for the wrapper; the inner <svg> fills it. */
  className?: string
}

export function GardenIcon({ name, className }: GardenIconProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 [&>svg]:block [&>svg]:size-full', className)}
      dangerouslySetInnerHTML={{ __html: GARDEN_ICONS[name] }}
    />
  )
}
