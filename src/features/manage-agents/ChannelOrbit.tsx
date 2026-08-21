// The empty state's decorative illustration: channel bubbles orbiting a brand.
// Purely presentational and aria-hidden — it shows no data and is not driven by
// the roster. Ring diameters and bubble offsets are measured from the Figma
// frame (Mange Agents_Empty-01) inside a 736 x 327 box; ring strokes are
// authored hairlines fading outward.
import { Building2 } from 'lucide-react'
import { channelMeta } from '@/lib/channel-meta'
import { cn } from '@/lib/cn'

const BOX_W = 736
const BOX_H = 327

const RINGS: { diameter: number; color: string }[] = [
  { diameter: 172.8, color: 'rgba(226,224,221,1)' },
  { diameter: 245.3, color: 'rgba(226,224,221,0.7)' },
  { diameter: 327.1, color: 'rgba(226,224,221,0.45)' },
]

// x/y are the bubble's top-left corner inside the box, in px.
const BUBBLES: { label: string; x: number; y: number; size: number; opacity: number }[] = [
  { label: 'Web Widget', x: 179, y: 48, size: 66, opacity: 1 },
  { label: 'Slack', x: 205, y: 177, size: 38, opacity: 1 },
  { label: 'API', x: 455, y: 187, size: 66, opacity: 1 },
  { label: 'Email', x: 578, y: 137, size: 43, opacity: 0.7 },
  { label: 'WhatsApp', x: 308, y: 25, size: 36, opacity: 1 },
  { label: 'Facebook Messenger', x: 96, y: 220, size: 54, opacity: 1 },
  { label: 'LINE', x: 709, y: 96, size: 34, opacity: 0.45 },
  { label: 'Inbound Voice', x: 4, y: 130, size: 36, opacity: 0.3 },
  { label: 'Web Call', x: 451, y: 26, size: 51, opacity: 1 },
]

const CENTRE = { x: 317, y: 121, size: 95 }

export function ChannelOrbit({ className }: { className?: string }) {
  return (
    <div
      data-testid="channel-orbit"
      aria-hidden="true"
      className={cn('relative shrink-0', className)}
      style={{ width: BOX_W, height: BOX_H }}
    >
      {RINGS.map((ring) => (
        <span
          key={ring.diameter}
          className="absolute top-1/2 left-1/2 rounded-full border"
          style={{
            width: ring.diameter,
            height: ring.diameter,
            marginLeft: -ring.diameter / 2,
            marginTop: -ring.diameter / 2,
            borderColor: ring.color,
          }}
        />
      ))}

      {BUBBLES.map((bubble) => {
        const { color, Icon } = channelMeta(bubble.label)
        return (
          <span
            key={bubble.label}
            className="absolute flex items-center justify-center rounded-full"
            style={{
              left: bubble.x,
              top: bubble.y,
              width: bubble.size,
              height: bubble.size,
              backgroundColor: color,
              opacity: bubble.opacity,
            }}
          >
            <Icon size={Math.round(bubble.size * 0.42)} className="text-white" strokeWidth={2} />
          </span>
        )
      })}

      <span
        className="absolute flex items-center justify-center rounded-full"
        style={{
          left: CENTRE.x,
          top: CENTRE.y,
          width: CENTRE.size,
          height: CENTRE.size,
          backgroundColor: '#724be8',
        }}
      >
        <Building2 size={Math.round(CENTRE.size * 0.38)} className="text-white" strokeWidth={2} />
      </span>
    </div>
  )
}
