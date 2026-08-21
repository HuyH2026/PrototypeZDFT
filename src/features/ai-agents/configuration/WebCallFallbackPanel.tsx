// Web Call ▸ Fallback (the rail's install/download section): connect a help
// desk, build the fallback flow, and the current connections list (a seeded
// Salesforce row with the teal "connected" dot). Both actions are inert mock
// buttons — nothing leaves the screen. Site-wide, so the preview says
// "Enabled for all segments".
//
// Presentational. From the frame "Explore-Voice-Unification" (135-157699).
import { Plus } from 'lucide-react'
import { IntegrationLogo } from '@/features/settings/IntegrationLogo'
import { WEBCALL_FALLBACK_COPY as COPY, type RailSection } from './config-data'
import { GroupLabel, Helper, PanelDivider, PanelShell } from './panel-parts'

type WebCallFallbackPanelProps = {
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
}

// The frame's small outline pill: h-8, border #999b97, 12px semibold label,
// nearly full width.
const actionClass =
  'flex h-8 w-full items-center justify-center gap-2 rounded-full border border-[#999b97] text-[12px] font-semibold leading-4 text-[#2f3130] transition-colors duration-instant ease-soft hover:bg-grey-100'

export function WebCallFallbackPanel({
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
}: WebCallFallbackPanelProps) {
  return (
    <PanelShell
      title={COPY.title}
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      {/* Connect Help Desk */}
      <div className="mt-5">
        <GroupLabel label={COPY.connectLabel} />
        <button type="button" className={`${actionClass} mt-2`}>
          <Plus size={16} aria-hidden />
          {COPY.connectAction}
        </button>
      </div>

      <PanelDivider />

      {/* Fallback */}
      <div>
        <GroupLabel label={COPY.fallbackLabel} />
        <button type="button" className={`${actionClass} mt-2`}>
          {COPY.fallbackAction}
        </button>
        <Helper>{COPY.fallbackHelper}</Helper>
      </div>

      <PanelDivider />

      {/* Current connections */}
      <div>
        <GroupLabel label={COPY.connectionsLabel} />
        <ul className="mt-4 flex flex-col gap-2">
          {COPY.connections.map((name) => (
            <li key={name} className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center [&>span]:scale-75">
                <IntegrationLogo logo="salesforce" />
              </span>
              {/* The frame's 8px status dot samples to teal emphasis #367a74. */}
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-[#367a74]" />
              <span className="flex-1 text-[14px] font-medium leading-5 tracking-[-0.1px] text-[#0c0c0d]">
                {name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </PanelShell>
  )
}
