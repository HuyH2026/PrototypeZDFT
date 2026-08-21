// Voice ▸ API (the rail's plug slot): the Caller API — the masked API key with
// reveal/copy, the refresh action, and the context variables passed to the
// phone system. Site-wide (not per-segment); the panel owns its mock state
// locally (reveal, the variables list) since nothing else reads it.
// From the frame "Explore-Voice-Unification" (124:71146).
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { GardenIcon } from '@/components/garden-icon'
import { CopyField } from './CopyField'
import { VOICE_API_COPY as COPY, type RailSection } from './config-data'
import { GroupLabel, Helper, PanelDivider, PanelShell } from './panel-parts'

type VoiceApiPanelProps = {
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
}

export function VoiceApiPanel({
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
}: VoiceApiPanelProps) {
  const [revealed, setRevealed] = useState(false)
  const [variables, setVariables] = useState<string[]>([...COPY.variables.seeded])

  const addVariable = () => {
    const next = COPY.variables.pool.find((v) => !variables.includes(v))
    if (next) setVariables([...variables, next])
  }

  return (
    <PanelShell
      title={COPY.title}
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      {/* API key */}
      <div className="mt-4">
        <GroupLabel label={COPY.key.label} />
        <Helper>
          {COPY.key.helperLead}
          <span className="font-semibold">{COPY.key.helperEmphasis}</span>
        </Helper>
        <div className="mt-3 flex items-center gap-2">
          <span className="flex-1 text-[14px] leading-5 tracking-[-0.154px] text-grey-800">
            {revealed ? COPY.key.revealed : COPY.key.masked}
          </span>
          <button
            type="button"
            aria-label={revealed ? 'Hide API key' : 'Reveal API key'}
            aria-pressed={revealed}
            onClick={() => setRevealed(!revealed)}
            className="flex size-8 items-center justify-center rounded text-ink-muted transition-colors duration-instant ease-soft hover:bg-control-hover"
          >
            <GardenIcon name={revealed ? 'eye-hide-stroke' : 'eye-stroke'} className="h-4 w-4" />
          </button>
          <CopyField
            value={revealed ? COPY.key.revealed : COPY.key.masked}
            variant="row"
            aria-label="Copy API key"
          />
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full font-semibold">
          {COPY.key.refresh}
        </Button>
        <Helper>{COPY.key.refreshHelper}</Helper>
      </div>

      <PanelDivider />

      {/* Context variables */}
      <div>
        <GroupLabel label={COPY.variables.label} />
        <Helper>{COPY.variables.helper}</Helper>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex h-10 flex-1 items-center justify-between rounded-lg border border-[#bcbdc5] bg-white px-3">
            <span className="text-[14px] leading-5 tracking-[-0.154px] text-grey-500">
              {COPY.variables.placeholder}
            </span>
            <GardenIcon name="chevron-down-stroke" className="h-4 w-4 shrink-0 text-ink-muted" />
          </div>
          <button
            type="button"
            aria-label={COPY.variables.add}
            onClick={addVariable}
            className="flex size-8 items-center justify-center rounded text-ink-muted transition-colors duration-instant ease-soft hover:bg-control-hover"
          >
            <Plus size={18} aria-hidden />
          </button>
        </div>
        <ul className="mt-3 flex flex-col gap-1">
          {variables.map((variable) => (
            <li key={variable} className="flex items-center gap-2">
              <span className="flex-1 text-[14px] leading-5 tracking-[-0.154px] text-grey-800">
                {variable}
              </span>
              <button
                type="button"
                aria-label={`Remove ${variable}`}
                onClick={() => setVariables(variables.filter((v) => v !== variable))}
                className="flex size-8 items-center justify-center rounded text-ink-muted transition-colors duration-instant ease-soft hover:bg-control-hover"
              >
                <Trash2 size={18} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </PanelShell>
  )
}
