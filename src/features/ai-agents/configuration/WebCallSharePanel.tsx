// Web Call ▸ Share (the rail's four-arrows section; the panel titles itself
// "API"): the Caller API key alone — masked with a reveal/copy pair, the
// stretched Refresh API key action (rotating the deterministic mock keys the
// embed panel shares), and the regeneration footnote ("wil" sic, transcribed).
// Site-wide, so the preview says "Enabled for all segments".
//
// Presentational; the reveal and key state are panel-local mocks. From the
// frame "Explore-Voice-Unification" (135-158264).
import { useState } from 'react'
import { GardenIcon } from '@/components/garden-icon'
import { CopyField } from './CopyField'
import {
  WEBCALL_SHARE_COPY as COPY,
  nextApiKey,
  seedApiKey,
  type RailSection,
} from './config-data'
import { Footnote, GroupLabel, PanelShell } from './panel-parts'

type WebCallSharePanelProps = {
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
}

export function WebCallSharePanel({
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
}: WebCallSharePanelProps) {
  const [revealed, setRevealed] = useState(false)
  const [apiKey, setApiKey] = useState(seedApiKey)

  return (
    <PanelShell
      title={COPY.title}
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      <div className="mt-5">
        <GroupLabel label={COPY.key.label} />
        <p className="mt-1 text-[14px] leading-5 tracking-[-0.154px] text-black">
          {COPY.key.helper}
        </p>

        <div className="mt-4 flex items-center gap-1">
          <span className="flex-1 text-[14px] leading-5 tracking-[-0.154px] text-grey-800">
            {revealed ? apiKey : COPY.key.masked}
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
            value={revealed ? apiKey : COPY.key.masked}
            variant="row"
            aria-label="Copy API key"
          />
        </div>

        <button
          type="button"
          onClick={() => setApiKey(nextApiKey())}
          className="mt-4 flex h-8 w-full items-center justify-center rounded-full border border-[#9c9a99] text-[14px] font-semibold text-ink transition-colors duration-instant ease-soft hover:bg-grey-100"
        >
          {COPY.key.refresh}
        </button>
        <Footnote>{COPY.key.refreshHelper}</Footnote>
      </div>
    </PanelShell>
  )
}
