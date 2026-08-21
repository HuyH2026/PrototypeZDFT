// The far-right 64px icon rail shared by every Configuration panel. Each button
// selects a customization section; the rail is what swaps the panel body, so
// every panel renders this same rail. The Widget and Voice tabs pass different
// section lists (and different trailing groups) — see config-data.
import { GardenIcon } from '@/components/garden-icon'
import type { RailSection } from './config-data'

type SectionRailProps = {
  sections: RailSection[]
  /** Section id the divider is drawn above; omit for no divider. */
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
}

export function SectionRail({ sections, trailingStart, activeSection, onSectionChange }: SectionRailProps) {
  return (
    <div className="flex w-[64px] shrink-0 flex-col items-center gap-2 border-l border-[#eaeaea] px-2 py-5">
      {sections.map((section) => {
        const active = section.id === activeSection
        return (
          <div key={section.id} className="contents">
            {section.id === trailingStart ? <span className="my-1 w-[30px] border-t border-grey-200" /> : null}
            <button
              type="button"
              aria-label={section.label}
              aria-pressed={active}
              onClick={() => onSectionChange(section.id)}
              className={`flex size-8 items-center justify-center rounded-lg ${active ? 'bg-[#e4eaf6] text-[#193d50]' : 'text-ink-muted'}`}
            >
              <GardenIcon name={section.icon} className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
