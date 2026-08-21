// Generated policy tab body: a collapsible "Generated actions"
// list of API tool cards that folds down to named pills, and a "Generated
// policy" text card. Collapse state is local; nothing here talks to a backend.
import { useState } from 'react'
import { ChevronUp, Zap } from 'lucide-react'
import type { GeneratedUseCaseDetail } from './automation-insights-data'
import { Card } from '@/components/flora/Card'

/** `lookup_charge` reads as "Lookup charge" on the collapsed pills. */
const humanize = (name: string) => {
  const words = name.replace(/_/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function GeneratedUseCaseTab({ detail }: { detail: GeneratedUseCaseDetail }) {
  const [actionsOpen, setActionsOpen] = useState(true)
  return (
    <div className="flex flex-col gap-6">
      {/* Generated actions */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-black">Generated actions:</p>
          <button
            type="button"
            aria-label="Toggle generated actions"
            aria-expanded={actionsOpen}
            onClick={() => setActionsOpen((v) => !v)}
            className="rounded p-1 text-ink-muted"
          >
            <ChevronUp size={16} className={actionsOpen ? '' : 'rotate-180'} aria-hidden />
          </button>
        </div>
        {actionsOpen ? (
          <div className="flex flex-col gap-3">
            {detail.tools.map((tool) => (
              <Card flat key={tool.name} className="bg-white/80 p-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-2xl bg-[#1472ff]">
                    <Zap size={16} className="text-white" aria-hidden />
                  </span>
                  <p className="flex-1 text-[14px] font-medium text-black">{tool.name}</p>
                  <span className="rounded bg-grey-100 px-1 py-0.5 text-[12px] text-black">
                    {tool.kind}
                  </span>
                </div>
                <div className="flex flex-col gap-1 pl-10 pt-2">
                  <p className="text-[12px] leading-[18px] text-grey-800">{tool.description}</p>
                  <p className="text-[12px] text-ink-muted">Input:</p>
                  <p className="font-mono text-[12px] text-black">{tool.input}</p>
                  <p className="text-[12px] text-ink-muted">Output:</p>
                  <p className="font-mono text-[12px] text-black">{tool.output}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {detail.tools.map((tool) => (
              <span
                key={tool.name}
                className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-2.5 py-1.5 text-[14px] text-black"
              >
                <Zap size={14} className="text-[#1472ff]" aria-hidden />
                {humanize(tool.name)}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Generated policy */}
      <section className="flex flex-col gap-4">
        <p className="text-[12px] font-semibold text-black">Generated policy</p>
        <div className="flex flex-col gap-4 rounded-[20px] bg-[#f9f8f7] p-4">
          <p className="text-[22px] leading-7 text-black">{detail.policy.title}</p>
          <p className="whitespace-pre-wrap text-[14px] leading-[22px] text-black">
            {detail.policy.body}
          </p>
        </div>
      </section>
    </div>
  )
}
