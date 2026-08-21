// Pixel-exact Zendesk Garden glyphs, rendered inline so they inherit size and
// color from Tailwind classes (the source SVGs use `currentColor`). This is the
// canonical icon source for the Garden/Flora design system — used where a
// design frame calls out a specific Garden icon, alongside the custom nav-rail
// SVGs in `nav-icons.tsx`. General chrome still uses lucide-react.
//
// SVGs are imported as raw markup via Vite's `?raw`; the wrapper is sized (e.g.
// `h-4 w-4`) and the inner <svg> is forced to fill it, so the source 16×16
// dimensions don't lock the render size.
import type { CSSProperties } from 'react'
import { cn } from '@/lib/cn'

import rocketStroke from '@zendeskgarden/svg-icons/src/16/rocket-stroke.svg?raw'
import userSoloStroke from '@zendeskgarden/svg-icons/src/16/user-solo-stroke.svg?raw'
import tagStroke from '@zendeskgarden/svg-icons/src/16/tag-stroke.svg?raw'
import chevronDownStroke from '@zendeskgarden/svg-icons/src/16/chevron-down-stroke.svg?raw'
import userGroupStroke from '@zendeskgarden/svg-icons/src/16/user-group-stroke.svg?raw'
import linkStroke from '@zendeskgarden/svg-icons/src/16/link-stroke.svg?raw'
import heartStroke from '@zendeskgarden/svg-icons/src/16/heart-stroke.svg?raw'
import checkBadgeStroke from '@zendeskgarden/svg-icons/src/16/check-badge-stroke.svg?raw'
import checkLgStroke from '@zendeskgarden/svg-icons/src/16/check-lg-stroke.svg?raw'
import smileyStroke from '@zendeskgarden/svg-icons/src/16/smiley-stroke.svg?raw'
import megaphoneStroke from '@zendeskgarden/svg-icons/src/16/megaphone-stroke.svg?raw'
import markupStroke from '@zendeskgarden/svg-icons/src/16/markup-stroke.svg?raw'
import speechBubbleStroke from '@zendeskgarden/svg-icons/src/16/speech-bubble-plain-stroke.svg?raw'
import speechBubbleLightningStroke from '@zendeskgarden/svg-icons/src/16/speech-bubble-lightning-bolt-stroke.svg?raw'
import phoneStroke from '@zendeskgarden/svg-icons/src/16/phone-stroke.svg?raw'
import mobilePhoneStroke from '@zendeskgarden/svg-icons/src/16/mobile-phone-stroke.svg?raw'
import creditCardStroke from '@zendeskgarden/svg-icons/src/16/credit-card-stroke.svg?raw'
import fileDocumentStroke from '@zendeskgarden/svg-icons/src/16/file-document-stroke.svg?raw'
import lightbulbStroke from '@zendeskgarden/svg-icons/src/16/lightbulb-stroke.svg?raw'
import downloadStroke from '@zendeskgarden/svg-icons/src/16/download-stroke.svg?raw'
import overflowStroke from '@zendeskgarden/svg-icons/src/16/overflow-stroke.svg?raw'
import infoStroke from '@zendeskgarden/svg-icons/src/16/info-stroke.svg?raw'
import xStroke from '@zendeskgarden/svg-icons/src/16/x-stroke.svg?raw'
import buildingStroke from '@zendeskgarden/svg-icons/src/16/building-stroke.svg?raw'
import microphoneOnStroke from '@zendeskgarden/svg-icons/src/16/microphone-on-stroke.svg?raw'
import plugStroke from '@zendeskgarden/svg-icons/src/16/plug-stroke.svg?raw'
import phoneCallInStroke from '@zendeskgarden/svg-icons/src/16/phone-call-in-stroke.svg?raw'
import phoneCallOutStroke from '@zendeskgarden/svg-icons/src/16/phone-call-out-stroke.svg?raw'
import eyeStroke from '@zendeskgarden/svg-icons/src/16/eye-stroke.svg?raw'
import eyeHideStroke from '@zendeskgarden/svg-icons/src/16/eye-hide-stroke.svg?raw'
import searchStroke from '@zendeskgarden/svg-icons/src/16/search-stroke.svg?raw'
import overflowVerticalStroke from '@zendeskgarden/svg-icons/src/16/overflow-vertical-stroke.svg?raw'
import arrowReverseStroke from '@zendeskgarden/svg-icons/src/16/arrow-reverse-stroke.svg?raw'
import filterStroke from '@zendeskgarden/svg-icons/src/16/filter-stroke.svg?raw'
import panelsStroke from '@zendeskgarden/svg-icons/src/16/panels-stroke.svg?raw'
import pencilStroke from '@zendeskgarden/svg-icons/src/16/pencil-stroke.svg?raw'
import shareStroke from '@zendeskgarden/svg-icons/src/16/share-stroke.svg?raw'
import sparkleStroke from '@zendeskgarden/svg-icons/src/16/sparkle-stroke.svg?raw'
import sunStroke from '@zendeskgarden/svg-icons/src/16/sun-stroke.svg?raw'
import moonStroke from '@zendeskgarden/svg-icons/src/16/moon-stroke.svg?raw'
import adjustStroke from '@zendeskgarden/svg-icons/src/16/adjust-stroke.svg?raw'
import playFill from '@zendeskgarden/svg-icons/src/16/play-fill.svg?raw'
import checkCircleFill from '@zendeskgarden/svg-icons/src/16/check-circle-fill.svg?raw'
import circleStroke from '@zendeskgarden/svg-icons/src/16/circle-stroke.svg?raw'

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
  'speech-bubble-stroke': speechBubbleStroke,
  'speech-bubble-lightning-stroke': speechBubbleLightningStroke,
  'phone-stroke': phoneStroke,
  'mobile-phone-stroke': mobilePhoneStroke,
  'credit-card-stroke': creditCardStroke,
  'file-document-stroke': fileDocumentStroke,
  'lightbulb-stroke': lightbulbStroke,
  'download-stroke': downloadStroke,
  'overflow-stroke': overflowStroke,
  'info-stroke': infoStroke,
  'x-stroke': xStroke,
  'building-stroke': buildingStroke,
  'check-lg-stroke': checkLgStroke,
  'microphone-on-stroke': microphoneOnStroke,
  'plug-stroke': plugStroke,
  'phone-call-in-stroke': phoneCallInStroke,
  'phone-call-out-stroke': phoneCallOutStroke,
  'eye-stroke': eyeStroke,
  'eye-hide-stroke': eyeHideStroke,
  'search-stroke': searchStroke,
  'overflow-vertical-stroke': overflowVerticalStroke,
  'arrow-reverse-stroke': arrowReverseStroke,
  'filter-stroke': filterStroke,
  'panels-stroke': panelsStroke,
  'pencil-stroke': pencilStroke,
  'share-stroke': shareStroke,
  'sparkle-stroke': sparkleStroke,
  'sun-stroke': sunStroke,
  'moon-stroke': moonStroke,
  'adjust-stroke': adjustStroke,
  'play-fill': playFill,
  'check-circle-fill': checkCircleFill,
  'circle-stroke': circleStroke,
} as const

export type GardenIconName = keyof typeof GARDEN_ICONS

type GardenIconProps = {
  name: GardenIconName
  /** Sizing/color classes for the wrapper; the inner <svg> fills it. */
  className?: string
  /** Inline style (e.g. a per-instance `color` brand tint the SVG inherits). */
  style?: CSSProperties
}

export function GardenIcon({ name, className, style }: GardenIconProps) {
  return (
    <span
      aria-hidden
      style={style}
      className={cn('inline-flex shrink-0 [&>svg]:block [&>svg]:size-full', className)}
      dangerouslySetInnerHTML={{ __html: GARDEN_ICONS[name] }}
    />
  )
}
