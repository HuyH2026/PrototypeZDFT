// Three estimates and the sentence that justifies them. Nothing here is
// editable: letting a user retype a projection would misrepresent it as one
// (spec Decision 6), which is also why this section never gates approval.
import { Sparkles } from 'lucide-react'
import type { AgentPlan } from './agent-plan-data'

export function PlanImpactSection({ impact }: { impact: AgentPlan['impact'] }) {
  return (
    <div className="flex flex-col gap-3.5">
      {/* One grid for all three stats — captions across row 1, values across row
          2, notes across row 3 — rather than three independent stacks. The stacks
          let each column set its own heights, so "Cancellation-related tickets"
          wrapping to two lines pushed its 23% a whole line below the ~68% beside
          it: three numbers at three different baselines, the most visible flaw in
          the panel. Each row now measures to its tallest cell, so the numbers
          share one line however the captions wrap. */}
      <div className="grid grid-cols-3 items-baseline gap-x-3 gap-y-1.5">
        {impact.stats.map((stat) => (
          <p
            key={`${stat.caption}-caption`}
            className="text-[12px] font-medium leading-[17px] text-[#727583]"
          >
            {stat.caption}
          </p>
        ))}
        {impact.stats.map((stat) => (
          <p key={`${stat.caption}-value`} className="flex items-baseline text-ink">
            <span className="text-[32px] font-medium leading-none tracking-[-0.6px]">
              {stat.value}
            </span>
            <span className="ms-0.5 text-[15px] font-medium text-[#727583]">{stat.unit}</span>
          </p>
        ))}
        {impact.stats.map((stat) => (
          <p
            key={`${stat.caption}-note`}
            className="text-[11px] font-medium leading-[16px] text-[#9194a0]"
          >
            {stat.note}
          </p>
        ))}
      </div>

      {/* The narrative is the assistant's reasoning for the three numbers, so it
          reads as its own aside rather than as fine print under a rule. */}
      <div className="flex gap-2.5 rounded-2xl bg-[#f4f8fb] px-3.5 py-3">
        <Sparkles size={15} className="mt-0.5 shrink-0 text-[#01567a]" aria-hidden />
        <p className="text-[13px] leading-[20px] text-[#4a5568]">{impact.narrative}</p>
      </div>
    </div>
  )
}
