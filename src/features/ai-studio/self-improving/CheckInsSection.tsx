// The scheduled reads: what gets looked at, and how often. Figma draws tabler
// glyphs; these are their lucide equivalents (spec Decision 4).
import { Activity, ListChecks, TestTubeDiagonal, Wrench, type LucideIcon } from 'lucide-react'
import type { CheckIn, CheckInGlyph } from './self-improving-data'

const CHECK_IN_ICON: Record<CheckInGlyph, LucideIcon> = {
  wrench: Wrench,
  'test-tube': TestTubeDiagonal,
  signal: Activity,
  checklist: ListChecks,
}

export function CheckInsSection({ checkIns }: { checkIns: CheckIn[] }) {
  return (
    <ul className="flex flex-col">
      {checkIns.map((checkIn, index) => {
        const Icon = CHECK_IN_ICON[checkIn.glyph]
        return (
          <li
            key={checkIn.id}
            className={`flex items-center gap-3 py-3 ${
              index === 0 ? 'pt-0' : 'border-t border-[#d2d9e5]'
            }`}
          >
            <Icon size={18} className="shrink-0 text-[#385075]" aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[14px] font-semibold leading-5 text-ink">{checkIn.title}</span>
              <span className="text-[13px] leading-5 text-grey-700">{checkIn.description}</span>
            </div>
            <span className="shrink-0 text-[12px] font-semibold leading-[18px] text-grey-700">
              {checkIn.cadence}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
