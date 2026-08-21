// The three Test Suite stat cards. A `meter` stat draws the frame's 60-tick bar
// filled in proportion to its percentage; a `ratio` stat sets the passing figure
// in the success teal beside the total. Presentational — no backend.
import { Info } from 'lucide-react'
import { Card } from '@/components/flora/Card'
import { RUN_STATS, TEST_SUITE_STATS, type TestSuiteStat } from './test-suite-data'

const TEAL = '#048c80'

// The frame draws exactly 60 ticks, which is also why 63% lands on 38 filled and
// 2% on a single one.
const TICKS = 60

function Meter({ percent }: { percent: number }) {
  const filled = Math.round((percent / 100) * TICKS)
  return (
    // Decorative: the adjacent value already states the percentage. The 60 ticks
    // are a fixed 300px wide, so a narrow card clips the unfilled tail at its
    // padding edge rather than letting the bar run into the card's stroke.
    <div aria-hidden className="flex min-w-0 flex-1 items-center gap-[3px] overflow-hidden">
      {Array.from({ length: TICKS }, (_, i) => (
        <span
          key={i}
          className={i < filled ? 'h-[18px] w-[2px]' : 'h-[18px] w-[2px] bg-grey-300'}
          style={i < filled ? { backgroundColor: TEAL } : undefined}
        />
      ))}
    </div>
  )
}

function StatCard({ stat }: { stat: TestSuiteStat }) {
  return (
    // Flat, not glass: the frame's cards are plain strokes on the white page, and
    // three washes in a row would staircase.
    <Card
      flat
      className="min-w-0 flex-1 overflow-clip rounded-[24px] border-grey-300 px-[22px] pb-[22px] pt-[18px]"
    >
      <div className="flex items-center gap-[5px]">
        <p className="text-[14px] font-semibold leading-5 tracking-[-0.154px] text-ink">
          {stat.label}
        </p>
        <Info size={16} className="shrink-0 text-ink-muted" aria-hidden />
      </div>
      {stat.kind === 'ratio' ? (
        <div className="mt-4 flex items-center gap-1.5 text-[26px] font-semibold leading-8 tracking-[0.354px]">
          <span style={{ color: TEAL }}>{stat.passing}</span>
          <span className="text-ink">/ {stat.total}</span>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-[14px]">
          <span className="text-[26px] font-semibold leading-8 tracking-[0.354px] text-ink">
            {stat.percent}%
          </span>
          <Meter percent={stat.percent} />
        </div>
      )}
    </Card>
  )
}

export function TestSuiteStatCards() {
  return (
    <div data-testid="test-suite-stats" className="flex items-start gap-[18px]">
      {TEST_SUITE_STATS.map((s) => (
        <StatCard key={s.key} stat={s} />
      ))}
    </div>
  )
}

export function RunStatCards() {
  return (
    <div data-testid="run-stats" className="flex items-start gap-[18px]">
      {RUN_STATS.map((stat) => (
        <Card
          key={stat.key}
          flat
          className="min-w-0 flex-1 rounded-[24px] border-grey-300 px-[22px] pb-[22px] pt-[18px]"
        >
          <div className="flex items-center gap-[5px]">
            <p className="text-[14px] font-semibold leading-5 text-ink">{stat.label}</p>
            <Info size={16} className="text-ink-muted" aria-hidden />
          </div>
          <div className="mt-4 flex items-baseline gap-2 text-[26px] font-semibold leading-8">
            <span style={{ color: stat.tone === 'danger' ? '#e53112' : TEAL }}>{stat.value}</span>
            {'detail' in stat ? (
              <span className="text-[22px] text-grey-700">{stat.detail}</span>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  )
}
