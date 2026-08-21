// The roadmap: three week rails, each with the chip that says whether its
// changes apply themselves, over one card per fix. The card pills are free text
// because the frame's cards share no schema — blast radius on three of them, an
// A/B test's parameters on another, a significance threshold on the last.
import { PlanChipView } from '../plan-parts/plan-chip'
import { PlanPill } from '../plan-parts/PlanPill'
import type { ImprovementWeek } from './self-improving-data'

export function ImprovementPlanSection({ weeks }: { weeks: ImprovementWeek[] }) {
  return (
    <div className="flex flex-col gap-5">
      {weeks.map((week) => (
        <section key={week.id} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h4 className="flex-1 text-[14px] font-semibold leading-5 text-ink">
              {`${week.label} — ${week.summary}`}
            </h4>
            <PlanChipView chip={week.chip} />
          </div>
          <div className="flex flex-col gap-2">
            {week.fixes.map((fix) => (
              <article
                key={fix.id}
                className="flex flex-col gap-2 rounded-xl border border-[#d2d9e5] bg-white/70 px-4 py-3"
              >
                <h5 className="text-[14px] font-semibold leading-5 text-ink">{fix.title}</h5>
                <p className="text-[13px] leading-5 text-grey-700">{fix.description}</p>
                <div className="flex flex-wrap items-center gap-1">
                  {fix.pills.map((pill) => (
                    <PlanPill key={pill}>{pill}</PlanPill>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
