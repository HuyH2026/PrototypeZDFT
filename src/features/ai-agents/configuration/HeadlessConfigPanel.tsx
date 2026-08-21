// Right column of the Headless tab: the shared rounded Configuration panel
// with API-key and A2A-connection sections. Knowledge & Personality remain
// decorative/deferred, mirroring the Widget and Voice rail behavior.
// Presentational — reveal/refresh bubble up via handlers.
import { Eye, EyeOff, IdCard, MessageSquarePlus, type LucideIcon } from 'lucide-react'
import { CopyField } from './CopyField'
import {
  A2A_AGENT_CARD_URL,
  A2A_MESSAGE_ENDPOINT,
  API_KEY_MASK,
  HEADLESS_RAIL_SECTIONS,
} from './config-data'
import { PanelShell } from './panel-parts'

type HeadlessConfigPanelProps = {
  apiKey: string
  revealed: boolean
  onToggleReveal: () => void
  onRefreshKey: () => void
  activeSection: string
  onSectionChange: (id: string) => void
}

function A2ARow({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: LucideIcon
  label: string
  value: string
  caption: string
}) {
  return (
    <div>
      <CopyField value={value} variant="light" aria-label={`Copy ${label}`}>
        <div className="w-[360px] max-w-full border-r border-[#f1efed] bg-[#fbfbfb] py-3 pl-4 pr-12">
          <div className="flex items-center gap-1.5">
            <Icon size={16} className="text-ink-muted" aria-hidden />
            <span className="text-[12px] font-medium text-black">{label}</span>
          </div>
          <p className="mt-2 break-all font-mono text-[12px] leading-[18px] tracking-[-0.1px] text-grey-800">
            {value}
          </p>
        </div>
      </CopyField>
      <p className="mt-2 text-[12px] leading-[18px] tracking-[-0.1px] text-grey-800">{caption}</p>
    </div>
  )
}

export function HeadlessConfigPanel({
  apiKey,
  revealed,
  onToggleReveal,
  onRefreshKey,
  activeSection,
  onSectionChange,
}: HeadlessConfigPanelProps) {
  return (
    <PanelShell
      title="Headless"
      sections={HEADLESS_RAIL_SECTIONS}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      {/* API key */}
      <div className="mt-5">
        <p className="text-[16px] font-semibold leading-[22px] text-black">API key</p>
        <p className="mt-3 text-[14px] leading-5 text-black">
          This API key is a unique identifier used for authenticating and authorizing access to an
          API.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[16px] leading-[22px] tracking-[-0.1px] text-black">
            {revealed ? apiKey : API_KEY_MASK}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={revealed ? 'Hide API key' : 'Show API key'}
              onClick={onToggleReveal}
              className="rounded p-1.5 text-ink-muted"
            >
              {revealed ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
            </button>
            <CopyField value={apiKey} variant="bare" aria-label="Copy API key" />
          </div>
        </div>
        <button
          type="button"
          onClick={onRefreshKey}
          className="mt-4 w-full rounded bg-[#ebf5f7] px-4 py-1.5 text-[14px] font-semibold text-[#193d50]"
        >
          Refresh API key
        </button>
        <p className="mt-4 text-[12px] leading-[18px] tracking-[-0.1px] text-grey-800">
          Clicking on 'Refresh' will make the system generate a new API token for setting up
          connection. Once regenerated, the previous token will be inaccessible.
        </p>
      </div>

      <hr className="my-6 border-t border-surface-border" />

      {/* A2A connection */}
      <div>
        <p className="text-[16px] font-semibold leading-[22px] text-black">A2A connection</p>
        <p className="mt-4 text-[14px] leading-5 text-black">
          Adds an agent card and message endpoint so other agents can discover, authenticate, and
          call yours automatically. Copy these into your A2A client.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <A2ARow
            icon={IdCard}
            label="Agent Card"
            value={A2A_AGENT_CARD_URL}
            caption="What your client reads to discover this agent."
          />
          <A2ARow
            icon={MessageSquarePlus}
            label="Message endpoint"
            value={A2A_MESSAGE_ENDPOINT}
            caption="Where the agent sends and streams messages."
          />
        </div>
      </div>
    </PanelShell>
  )
}
