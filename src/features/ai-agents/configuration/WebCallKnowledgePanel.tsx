// Web Call ▸ Knowledge (the rail's lightbulb section; panel titled "Knowledge
// base"): connect a knowledge base, build the retrieval flow, and the current
// connections with per-source on/off toggles. The connections are the shared
// KNOWLEDGE_CONNECTIONS rows the Widget and Voice knowledge panels list, and
// the marks come from the shared ConnectionMark (vendor stand-ins, the repo's
// convention). Both actions are inert mock buttons. Not per-segment: the
// preview says "Enabled for all segments".
//
// Presentational; toggles bubble up via onToggleConnection. From the frame
// "Explore-Voice-Unification" (135-156009).
import { Plus } from 'lucide-react'
import {
  WEBCALL_KNOWLEDGE_COPY as COPY,
  type KnowledgeConnection,
  type RailSection,
} from './config-data'
import { ConnectionMark } from './KnowledgePanel'
import { GroupLabel, Helper, PanelDivider, PanelShell, Toggle } from './panel-parts'

type WebCallKnowledgePanelProps = {
  connections: KnowledgeConnection[]
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onToggleConnection: (id: string) => void
}

// The frame's small outline pill: h-8, border #999b97, 12px semibold label.
const actionClass =
  'flex h-8 w-full items-center justify-center gap-2 rounded-full border border-[#999b97] text-[12px] font-semibold leading-4 text-[#2f3130] transition-colors duration-instant ease-soft hover:bg-grey-100'

export function WebCallKnowledgePanel({
  connections,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onToggleConnection,
}: WebCallKnowledgePanelProps) {
  return (
    <PanelShell
      title={COPY.title}
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      {/* Connect with knowledge base */}
      <div className="mt-5">
        <GroupLabel label={COPY.connectLabel} />
        <button type="button" className={`${actionClass} mt-2`}>
          <Plus size={16} aria-hidden />
          {COPY.connectAction}
        </button>
      </div>

      <PanelDivider />

      {/* Knowledge Retrieval */}
      <div>
        <GroupLabel label={COPY.retrieval.label} />
        <button type="button" className={`${actionClass} mt-2`}>
          {COPY.retrieval.action}
        </button>
        <Helper>{COPY.retrieval.helper}</Helper>
      </div>

      <PanelDivider />

      {/* Current connections — bare teal toggles, no ON/OFF state text. */}
      <div>
        <GroupLabel label={COPY.connectionsLabel} />
        <ul className="mt-4 flex flex-col divide-y divide-grey-200">
          {connections.map((connection) => (
            <li key={connection.id} className="flex items-center gap-2 py-3">
              <ConnectionMark mark={connection.mark} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] leading-5 tracking-[-0.1px] text-[#0c0c0d]">
                  {connection.title}
                </p>
                <p className="text-[14px] leading-5 tracking-[-0.1px] text-grey-600">
                  {connection.lastSync}
                </p>
              </div>
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
