// Eight compact overview metrics from the Topics dashboard. Trend chips and
// supporting figures are optional so each card can mirror its Figma variant.
import { ArrowDownRight, ArrowUpRight, Info, Smile } from 'lucide-react'
import { TOPIC_STATS } from './topics-data'
import { Card } from '@/components/flora/Card'
import { cn } from '@/lib/cn'

function TrendChip({
  value,
  direction,
  tone,
}: {
  value: string
  direction: 'up' | 'down'
  tone: 'positive' | 'negative'
}) {
  const Icon = direction === 'up' ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-medium',
        tone === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
      )}
    >
      {value}
      <Icon className="size-3" />
    </span>
  )
}

export function TopicStatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {TOPIC_STATS.map((card) => (
        <Card key={card.title} flat className="relative min-h-[94px] rounded-[16px] p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="flex items-center gap-1 text-[12px] font-medium text-ink">
              {card.title}
              <Info className="size-3 text-ink-muted" />
            </p>
            {card.trend ? <TrendChip {...card.trend} /> : null}
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {card.sentiment ? (
                <span className="flex size-6 items-center justify-center rounded-full bg-green-100">
                  <Smile className="size-4 text-green-700" />
                </span>
              ) : null}
              <span className="text-[24px] font-semibold leading-none text-ink">{card.value}</span>
            </div>
            {card.share ? (
              <span className="pb-0.5 text-[16px] font-medium text-ink-muted">{card.share}</span>
            ) : null}
            {card.supporting ? (
              <span className="flex flex-col items-end pb-0.5 text-[10px] leading-4 text-ink-muted">
                {card.supporting.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  )
}
