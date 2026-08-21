// The 12-card metric grid on Agent Overview. The Figma spec defines two states:
// aggregate cards show only the headline, while the checked channel-breakdown
// state adds Widget / Email / Voice rows to the same cards.
import { type CSSProperties } from 'react'
import { Mail, MessageSquare, Phone, Smile } from 'lucide-react'
import { NEG, POS, type Delta, type StatCard, STAT_CARDS } from './ai-performances-data'
import { Card as FloraCard } from '@/components/flora/Card'
import { useInView } from '@/lib/use-in-view'

// Channel icons for the three breakdown rows, in fixed order.
const ROW_ICONS = [MessageSquare, Mail, Phone]
const ROW_COLORS = ['#BE297B', '#2F69C7', '#DF8600']

function DeltaText({ delta, className = '' }: { delta: Delta; className?: string }) {
  return (
    <span className={className} style={{ color: delta.up ? POS : NEG }}>
      {delta.label}
    </span>
  )
}

function Card({
  card,
  index,
  revealed,
  channelBreakdown,
}: {
  card: StatCard
  index: number
  revealed: boolean
  channelBreakdown: boolean
}) {
  return (
    <FloraCard
      data-testid="stat-card"
      // The grid arrives in reading order rather than as one block of 14 cards.
      // The stagger is capped: past the first row or two it stops reading as
      // sequence and starts reading as lag.
      style={{ '--rise': Math.min(index, 7) } as CSSProperties}
      // `opacity-0` until revealed, not simply "no animation": the keyframe's own
      // `from` state is what hides the card, so without it the card would paint,
      // then blink out as the animation was applied, then fade back in.
      className={`${revealed ? 'animate-rise-in' : 'opacity-0'} p-4`}
    >
      <p className="min-w-0 text-[13px] text-ink-muted">{card.title}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        {card.sentiment ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c9efd6]">
            <Smile className="h-5 w-5 text-[#2f8a4f]" />
          </span>
        ) : null}
        <span
          className="text-[28px] font-semibold leading-none"
          style={{ color: card.valueColor ?? undefined }}
        >
          {card.value}
        </span>
        {card.unit ? (
          <span className="text-[22px] font-semibold leading-none text-ink-muted">{card.unit}</span>
        ) : null}
        <DeltaText delta={card.delta} className="ml-auto self-start text-[13px]" />
      </div>
      {channelBreakdown ? (
        <div className="mt-4 flex flex-col gap-2">
          {card.rows.map((row, i) => {
            const Icon = ROW_ICONS[i]
            return (
              <div key={i} className="flex items-center text-[13px]">
                <Icon className="h-4 w-4" style={{ color: ROW_COLORS[i] }} />
                <span className="ml-3 text-ink">{row.value}</span>
                {row.delta ? (
                  <DeltaText delta={row.delta} className="ml-auto" />
                ) : (
                  <span className="ml-auto text-ink-muted">n/a</span>
                )}
              </div>
            )
          })}
        </div>
      ) : null}
    </FloraCard>
  )
}

export function StatCards({
  channelBreakdown = true,
}: {
  channelBreakdown?: boolean
  onInvestigate?: (findingId: string) => void
}) {
  // Half the grid sits below the fold on arrival, so the reveal waits for the
  // scroll rather than playing to an empty room.
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STAT_CARDS.map((card, i) => (
        <Card
          key={card.title}
          card={card}
          index={i}
          revealed={inView}
          channelBreakdown={channelBreakdown}
        />
      ))}
    </div>
  )
}
