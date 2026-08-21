// The scorecard: six signals, each against its target, and the narrative that
// says why an agent this far off needs a plan rather than a nudge.
//
// `tone` is authored, not derived (spec Decision 1). All six miss their targets;
// the frame reddens three. The red is the app's own --red-700 rather than the
// Critical chip's #831c0a, which is a chip foreground and reads as maroon at
// this size.
import { Frown } from 'lucide-react'
import type { HealthStat, ImprovementPlan } from './self-improving-data'

function StatValue({ stat }: { stat: HealthStat }) {
  const tone = stat.tone === 'critical' ? 'text-red-700' : 'text-ink'
  if (stat.glyph === 'frown') {
    return <Frown size={28} className={tone} aria-label="Negative" />
  }
  return (
    <p className={`flex items-end ${tone}`}>
      <span className="text-[28px] font-medium leading-[30px] tracking-[-0.1px]">{stat.value}</span>
      {stat.unit && <span className="text-[14px] font-medium leading-[30px]">{stat.unit}</span>}
    </p>
  )
}

export function HealthEvaluationSection({ health }: { health: ImprovementPlan['health'] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-x-2.5 gap-y-4">
        {health.stats.map((stat) => (
          <div key={stat.key} className="flex flex-col gap-1.5">
            <p className="text-[12px] font-medium leading-[18px] text-grey-700">{stat.caption}</p>
            <StatValue stat={stat} />
            <p className="text-[12px] font-medium leading-[18px] text-grey-700">{stat.target}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 border-t border-[#d2d9e5] pt-4">
        <h4 className="text-[14px] font-semibold leading-5 text-ink">{health.caseTitle}</h4>
        <p className="text-[13px] leading-5 text-grey-700">{health.caseIntro}</p>
        <ul className="flex list-disc flex-col gap-1 ps-5 text-[13px] leading-5 text-grey-700">
          {health.caseCauses.map((cause) => (
            <li key={cause}>{cause}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
