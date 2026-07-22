// The 12-card metric grid on the AI Performances overview. Each card shows a
// headline metric with a period-over-period delta, then a per-channel breakdown
// (widget / email / voice) with its own delta per row.
import { Mail, MessageSquare, Phone, Smile } from 'lucide-react'
import { NEG, POS, type Delta, type StatCard, STAT_CARDS } from './ai-performances-data'

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

function Card({ card }: { card: StatCard }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-4">
      <p className="text-[13px] text-ink-muted">{card.title}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        {card.sentiment ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c9efd6]">
            <Smile className="h-5 w-5 text-[#2f8a4f]" />
          </span>
        ) : null}
        <span className="text-[32px] font-semibold leading-none" style={{ color: card.valueColor ?? undefined }}>
          {card.value}
        </span>
        {card.unit ? <span className="text-[26px] font-semibold leading-none text-ink-muted">{card.unit}</span> : null}
        <DeltaText delta={card.delta} className="ml-auto self-start text-[13px]" />
      </div>
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
    </div>
  )
}

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STAT_CARDS.map((card) => (
        <Card key={card.title} card={card} />
      ))}
    </div>
  )
}
