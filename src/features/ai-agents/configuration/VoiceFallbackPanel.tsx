// Voice ▸ Fallback (the rail's install slot): connect a help desk, and the
// Fallback step that runs when Knowledge Retrieval finds nothing. Site-wide
// (not per-segment) — the preview says "Enabled for all segments".
// From the frame "Explore-Voice-Unification" (124:70683). Purely
// presentational; both actions are inert mock buttons.
import { Plus } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { VOICE_FALLBACK_COPY as COPY, type RailSection } from './config-data'
import { GroupLabel, Helper, PanelDivider, PanelShell } from './panel-parts'

type VoiceFallbackPanelProps = {
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
}

export function VoiceFallbackPanel({
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
}: VoiceFallbackPanelProps) {
  return (
    <PanelShell
      title={COPY.title}
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      {/* Connect Help Desk */}
      <div className="mt-4">
        <GroupLabel label={COPY.connect.label} />
        <Button variant="outline" size="sm" className="mt-2 w-full font-semibold">
          <Plus size={16} aria-hidden />
          {COPY.connect.action}
        </Button>
      </div>

      <PanelDivider />

      {/* Fallback */}
      <div>
        <GroupLabel label={COPY.fallback.label} />
        <Button variant="outline" size="sm" className="mt-2 w-full font-semibold">
          {COPY.fallback.action}
        </Button>
        <Helper>{COPY.fallback.helper}</Helper>
      </div>
    </PanelShell>
  )
}
