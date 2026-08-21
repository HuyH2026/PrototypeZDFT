// Web Call ▸ Embed (the rail's code section; the panel titles itself "API"):
// the domain allowlist the Solve web call can be installed on, then the
// auto-generated script tag with its show-key checkbox and refresh action.
// Same anatomy as the widget's EmbedPanel — both render the shared
// embedSnippetLines from config-data — with this frame's own details: a seeded
// forethought.ai row with a remove action, the checkbox off (the snippet
// reads “ENABLE TO REVEAL HERE”), and the key value tinted primary blue.
//
// Not per-segment (one embed for the site): the preview says "Enabled for all
// segments" (ALL_SEGMENT_SECTIONS). The panel owns its mock state locally.
// From the frame "Explore-Voice-Unification" (135-158769).
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import {
  EMBED_KEY_PLACEHOLDER,
  WEBCALL_API_COPY as COPY,
  embedSnippetLines,
  nextApiKey,
  seedApiKey,
  type RailSection,
} from './config-data'
import { Footnote, GroupLabel, Helper, PanelShell } from './panel-parts'

// Syntax tints from this frame: attribute names bold black, the API-key value
// primary blue (even masked), the ft-Age value grey.
const SNIPPET_TONE = { attr: 'font-bold text-black', key: 'text-[#406cc4]', muted: 'text-[#9194a0]' } as const

type WebCallApiPanelProps = {
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
}

export function WebCallApiPanel({
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
}: WebCallApiPanelProps) {
  const [domain, setDomain] = useState('')
  const [domains, setDomains] = useState<string[]>([...COPY.allowlist.seeded])
  // The frame draws the checkbox off with the masked placeholder showing.
  const [showKey, setShowKey] = useState(false)
  const [apiKey, setApiKey] = useState(seedApiKey)

  const lines = embedSnippetLines(showKey ? `"${apiKey}"` : EMBED_KEY_PLACEHOLDER)

  const addDomain = () => {
    const trimmed = domain.trim()
    if (!trimmed) return
    setDomains((list) => [...list, trimmed])
    setDomain('')
  }

  return (
    <PanelShell
      title={COPY.title}
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      {/* 1. Domain allowlist */}
      <div className="mt-5">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold leading-5 text-black">
            {COPY.allowlist.step}
          </span>
          <GroupLabel label={COPY.allowlist.label} />
        </div>
        <Helper>{COPY.allowlist.helper}</Helper>

        <ul className="mt-4 flex flex-col gap-4">
          {domains.map((entry) => (
            <li key={entry} className="flex items-center justify-between">
              <span className="text-[14px] leading-5 tracking-[-0.154px] text-[#0c0c0d]">
                {entry}
              </span>
              <button
                type="button"
                aria-label={`Remove ${entry}`}
                onClick={() => setDomains((list) => list.filter((d) => d !== entry))}
                className="flex size-8 items-center justify-center rounded text-ink-muted transition-colors duration-instant ease-soft hover:bg-control-hover"
              >
                <Trash2 size={18} aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            aria-label={COPY.allowlist.label}
            value={domain}
            placeholder={COPY.allowlist.placeholder}
            onChange={(e) => setDomain(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-[#b7b7b3] bg-white px-3 text-[14px] leading-5 tracking-[-0.154px] text-black outline-none placeholder:text-grey-500 focus:border-accent-blue"
          />
          <button
            type="button"
            aria-label={COPY.allowlist.add}
            onClick={addDomain}
            className="flex size-8 items-center justify-center rounded text-ink transition-colors duration-instant ease-soft hover:bg-control-hover"
          >
            <Plus size={20} aria-hidden />
          </button>
        </div>
        <Footnote>{COPY.allowlist.footnote}</Footnote>
      </div>

      {/* 2. Code Snippet */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold leading-5 text-black">
              {COPY.snippet.step}
            </span>
            <GroupLabel label={COPY.snippet.label} />
          </div>
          <Button variant="outline" size="sm" className="font-semibold">
            {COPY.snippet.copy}
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-[14px] leading-5 tracking-[-0.154px] text-[#2f3130]">
            <input
              type="checkbox"
              checked={showKey}
              onChange={() => setShowKey((on) => !on)}
              className="size-4 accent-accent-blue"
            />
            {COPY.snippet.showKey}
          </label>
          <button
            type="button"
            onClick={() => setApiKey(nextApiKey())}
            className="text-[14px] font-semibold leading-5 tracking-[-0.154px] text-ink transition-colors duration-instant ease-soft hover:text-black"
          >
            {COPY.snippet.refreshKey}
          </button>
        </div>

        <Helper>{COPY.snippet.caption}</Helper>
        {/* The snippet wraps rather than scrolling sideways, as in EmbedPanel. */}
        <pre className="mt-2 rounded-lg bg-grey-100 p-4 font-mono text-[12px] leading-5 text-black">
          <code>
            {lines.map((line, index) => (
              <span key={index} className="block whitespace-pre-wrap break-words">
                {'  '.repeat(line.indent)}
                {line.parts.map((part, partIndex) => (
                  <span key={partIndex} className={part.tone ? SNIPPET_TONE[part.tone] : undefined}>
                    {part.text}
                  </span>
                ))}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </PanelShell>
  )
}
