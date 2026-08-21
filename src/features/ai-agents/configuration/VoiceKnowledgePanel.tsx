// Voice ▸ Knowledge (the rail's lightbulb slot): the Knowledge Base panel for
// the voice channel — connect a knowledge source, the Knowledge Retrieval step,
// and the current connections with per-source on/off. Site-wide (not
// per-segment): the preview says "Enabled for all segments".
// From the frame "Explore-Voice-Unification" (124:70132). Presentational;
// connection toggles bubble up via onToggleConnection.
import { Plus } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import {
  VOICE_KNOWLEDGE_COPY as COPY,
  type KnowledgeConnection,
  type RailSection,
} from './config-data'
import { ConnectionMark } from './KnowledgePanel'
import { GroupLabel, Helper, PanelDivider, PanelShell, Toggle } from './panel-parts'

type VoiceKnowledgePanelProps = {
  connections: KnowledgeConnection[]
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onToggleConnection: (id: string) => void
}

export function VoiceKnowledgePanel({
  connections,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onToggleConnection,
}: VoiceKnowledgePanelProps) {
  return (
    <PanelShell
      title={COPY.title}
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      {/* Connect with knowledge base */}
      <div className="mt-4">
        <GroupLabel label={COPY.connect.label} />
        <Button variant="outline" size="sm" className="mt-2 w-full font-semibold">
          <Plus size={16} aria-hidden />
          {COPY.connect.action}
        </Button>
      </div>

      <PanelDivider />

      {/* Knowledge Retrieval */}
      <div>
        <GroupLabel label={COPY.retrieval.label} />
        <Button variant="outline" size="sm" className="mt-2 w-full font-semibold">
          {COPY.retrieval.action}
        </Button>
        <Helper>{COPY.retrieval.helper}</Helper>
      </div>

      <PanelDivider />

      {/* Current connections */}
      <div>
        <GroupLabel label={COPY.connections.label} />
        <ul className="mt-2 flex flex-col divide-y divide-[#e4e7f0]">
          {connections.map((connection) => (
            <li key={connection.id} className="flex items-center gap-2 py-3">
              <ConnectionMark mark={connection.mark} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] leading-[18px] text-black">{connection.title}</p>
                <p className="text-[12px] leading-[18px] tracking-[-0.1px] text-grey-700">
                  {connection.lastSync}
                </p>
              </div>
              {/* The voice frame draws plain teal toggles — no On/Off
                  micro-label, unlike the widget's Knowledge panel. */}
              <Toggle
                label={`${connection.title} enabled`}
                checked={connection.on}
                onChange={() => onToggleConnection(connection.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </PanelShell>
  )
}
