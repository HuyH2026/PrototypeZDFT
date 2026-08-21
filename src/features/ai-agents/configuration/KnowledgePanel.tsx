// Knowledge section: what the AI reads from. Three groups — the retrieval step,
// the coaching that shapes how it searches, and the
// connected knowledge sources with a per-source on/off.
//
// Not per-segment: the connections apply to every segment, which is why the
// preview says so instead of naming one (see isAllSegments in config-data).
import { Cloud, Link2, Plus, Table2 } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { KNOWLEDGE_COPY as COPY, type KnowledgeConnection, type RailSection } from './config-data'
import { GroupLabel, PanelShell, Toggle } from './panel-parts'

// Vendor stand-ins: lucide glyphs tinted to the vendor's brand colour, the same
// convention the Integrations table uses (settings/IntegrationLogo) rather than
// committing vendor artwork. Exported for the voice Knowledge Base panel, which
// renders the same connections list.
export function ConnectionMark({ mark }: { mark: KnowledgeConnection['mark'] }) {
  if (mark === 'salesforce') {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
        <Cloud size={20} style={{ color: '#00a1e0' }} strokeWidth={2} />
      </span>
    )
  }
  if (mark === 'airtable') {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
        <Table2 size={19} style={{ color: '#fcb400' }} />
      </span>
    )
  }
  return (
    <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
      <Link2 size={18} className="text-ink-muted" />
    </span>
  )
}

type KnowledgePanelProps = {
  connections: KnowledgeConnection[]
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onToggleConnection: (id: string) => void
}

export function KnowledgePanel({
  connections,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onToggleConnection,
}: KnowledgePanelProps) {
  return (
    <PanelShell
      title={COPY.title}
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      <p className="mt-4 text-[14px] leading-5 text-grey-800">{COPY.intro}</p>

      {/* Knowledge Retrieval */}
      <div className="mt-5">
        <GroupLabel label={COPY.retrieval.label} />
        <Button variant="outline" size="sm" className="mt-2 w-full font-semibold">
          {COPY.retrieval.action}
        </Button>
        <p className="mt-1 text-[12px] leading-[18px] tracking-[-0.1px] text-grey-600">
          {COPY.retrieval.helper}
        </p>
      </div>

      {/* Knowledge coaching */}
      <div className="mt-4">
        <GroupLabel label={COPY.coaching.label} />
        <Button variant="outline" size="sm" className="mt-2 w-full font-semibold">
          <Plus size={16} aria-hidden />
          {COPY.coaching.action}
        </Button>
        <p className="mt-1 text-[12px] leading-[18px] tracking-[-0.1px] text-grey-600">
          {COPY.coaching.helper}
        </p>
      </div>

      {/* Connected knowledge */}
      <div className="mt-4">
        <GroupLabel label={COPY.connected.label} />
        <Button variant="outline" size="sm" className="mt-2 w-full font-semibold">
          <Plus size={16} aria-hidden />
          {COPY.connected.action}
        </Button>
        <ul className="mt-3 flex flex-col divide-y divide-[#e4e7f0]">
          {connections.map((connection) => (
            <li key={connection.id} className="flex items-center gap-2 py-3">
              <ConnectionMark mark={connection.mark} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] leading-[18px] text-black">{connection.title}</p>
                <p className="text-[12px] leading-[18px] tracking-[-0.1px] text-grey-700">
                  {connection.lastSync}
                </p>
              </div>
              <Toggle
                label={`${connection.title} enabled`}
                checked={connection.on}
                onChange={() => onToggleConnection(connection.id)}
                showState
              />
            </li>
          ))}
        </ul>
      </div>
    </PanelShell>
  )
}
