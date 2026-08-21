// What the plan watches, on what rhythm, and what ends it.
import type { ImprovementPlan } from './self-improving-data'

export function MonitoringSection({ monitor }: { monitor: ImprovementPlan['monitor'] }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] leading-5 text-grey-700">{monitor.intro}</p>
      {monitor.groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1.5">
          <h4 className="text-[13px] font-semibold leading-5 text-ink">{group.title}</h4>
          <ul className="flex list-disc flex-col gap-1 ps-5 text-[13px] leading-5 text-grey-700">
            {group.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
      <div className="flex flex-col gap-1.5 border-t border-[#d2d9e5] pt-4">
        <h4 className="text-[13px] font-semibold leading-5 text-ink">{monitor.exitTitle}</h4>
        <ul className="flex flex-col gap-1">
          {monitor.exits.map((exit) => (
            <li key={exit.id} className="text-[13px] leading-5 text-grey-700">
              <span className="font-semibold text-ink">{exit.lead}</span>
              {` → ${exit.outcome}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
