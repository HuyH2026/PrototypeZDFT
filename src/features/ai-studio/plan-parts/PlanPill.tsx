// The pill a plan uses for the things a step touches — metrics in the
// create-agent overview, blast radius on a self-improving fix card.
//
// A soft fill rather than a hairline border, and deliberately so: these are
// labels, not controls, and a bordered pill reads as a button. The border came
// off in the plan panel's rebuild; this leaf carries that decision to both
// flows so neither can drift back to it.
import type { ReactNode } from 'react'

export function PlanPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-[#f1f4f9] px-2 py-0.5 text-[11px] font-medium tracking-[-0.1px] text-[#4a5a78]">
      {children}
    </span>
  )
}
