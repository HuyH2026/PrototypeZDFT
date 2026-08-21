// Embed section: the two numbered steps for putting the widget on a site — the
// domain allowlist, then the generated script tag.
//
// The frame shows "Show API key in code snippet" checked while the snippet still
// reads “ENABLE TO REVEAL HERE”; that pairing can't both be true, so here the
// checkbox does what it says: checked reveals the key, unchecked leaves the
// placeholder. Keys are the same deterministic mocks the Headless tab uses.
//
// Not per-segment: the script is one embed for the site, which is why the
// preview says so instead of naming a segment (see isAllSegments).
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import {
  EMBED_COPY as COPY,
  EMBED_KEY_PLACEHOLDER,
  embedSnippetLines,
  nextApiKey,
  seedApiKey,
  type RailSection,
} from './config-data'
import { Footnote, GroupLabel, Helper, PanelShell } from './panel-parts'

// Syntax tints from the frame: the attribute name is bold black, a revealed key
// is teal, an unfilled value stays grey.
const SNIPPET_TONE = { attr: 'font-bold text-black', key: 'text-[#193d50]', muted: 'text-[#9194a0]' } as const

type EmbedPanelProps = {
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
}

export function EmbedPanel({ sections, trailingStart, activeSection, onSectionChange }: EmbedPanelProps) {
  const [domain, setDomain] = useState('')
  const [domains, setDomains] = useState<string[]>([])
  const [showKey, setShowKey] = useState(true)
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
          <span className="text-[14px] font-semibold leading-5 text-black">{COPY.allowlist.step}</span>
          <GroupLabel label={COPY.allowlist.label} />
        </div>
        <p className="mt-3 text-[14px] leading-5 tracking-[-0.154px] text-grey-800">{COPY.allowlist.helper}</p>
        <div className="mt-3 flex items-start gap-1">
          <div className="flex-1">
            <input
              type="text"
              aria-label={COPY.allowlist.label}
              value={domain}
              placeholder={COPY.allowlist.placeholder}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-lg border border-[#bcbdc5] bg-white px-4 py-2.5 text-[14px] leading-5 tracking-[-0.1px] text-black placeholder:text-grey-500"
            />
            <Footnote>{COPY.allowlist.footnote}</Footnote>
          </div>
          <button
            type="button"
            aria-label="Add domain"
            onClick={addDomain}
            className="mt-1 flex size-8 items-center justify-center rounded text-ink hover:bg-control-hover"
          >
            <Plus size={20} aria-hidden />
          </button>
        </div>
        {domains.length > 0 ? (
          <ul className="mt-1 flex flex-col gap-1">
            {domains.map((entry) => (
              <li key={entry} className="text-[12px] leading-[18px] text-grey-700">
                {entry}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <hr className="my-5 border-t border-grey-200" />

      {/* 2. Code snippet */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold leading-5 text-black">{COPY.snippet.step}</span>
          <GroupLabel label={COPY.snippet.label} />
        </div>
        <Button variant="primary" size="sm" className="font-semibold">
          {COPY.snippet.copy}
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 whitespace-nowrap text-[13px] leading-5 tracking-[-0.154px] text-grey-800">
          <input
            type="checkbox"
            checked={showKey}
            onChange={() => setShowKey((on) => !on)}
            className="size-4 accent-accent-blue"
          />
          {COPY.snippet.showKey}
        </label>
        <Button variant="outline" size="sm" className="font-semibold" onClick={() => setApiKey(nextApiKey())}>
          {COPY.snippet.refreshKey}
        </Button>
      </div>

      <Helper>{COPY.snippet.caption}</Helper>

      {/* The snippet wraps rather than scrolling sideways: the script tag is
          longer than the panel, and the frame shows it broken across lines. */}
      <pre className="mt-2 rounded-[16px] bg-[#f2f4f7] p-4 font-mono text-[11px] leading-5 text-black">
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
    </PanelShell>
  )
}
