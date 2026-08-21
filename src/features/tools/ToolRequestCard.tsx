// Top card on the Tool Detail screen: Endpoint URL + a request tab strip
// (Params/Header/Body/Authorization/Code — the only live piece) alongside a
// static Action name/description panel. Everything else is presentational.
import { useState } from 'react'
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/flora/Card'
import type { ToolAction } from './tools-data'

type RequestTab = 'Params' | 'Header' | 'Body' | 'Authorization' | 'Code'
const REQUEST_TABS: RequestTab[] = ['Params', 'Header', 'Body', 'Authorization', 'Code']

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-4 items-center justify-center rounded-full bg-[#3b998e] text-white">
        <Check size={11} strokeWidth={3} aria-hidden />
      </span>
      <span className="text-[14px] font-semibold text-black">{children}</span>
    </div>
  )
}

export function ToolRequestCard({ tool }: { tool: ToolAction }) {
  const [tab, setTab] = useState<RequestTab>('Params')

  return (
    <Card className="grid grid-cols-[2fr_1fr] gap-6 p-5">
      <div className="flex flex-col gap-4">
        <div>
          <SectionTitle>Endpoint URL</SectionTitle>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1 rounded-[20px] border border-flora-divider bg-white px-3 py-2 text-[12px] text-black"
            >
              {tool.method ?? 'GET'}
              <ChevronDown size={14} className="text-ink-muted" aria-hidden />
            </button>
            <Card flat className="min-w-0 flex-1 truncate px-3 py-2 text-[12px] text-grey-500">
              {tool.endpoint ?? 'Select method, enter endpoint then send'}
            </Card>
            <button
              type="button"
              className="rounded-[20px] px-4 py-2 text-[12px] font-semibold text-grey-400"
              style={{ backgroundColor: 'var(--color-grey-100)' }}
            >
              Send
            </button>
          </div>
        </div>

        <div role="tablist" className="flex items-center gap-4 border-b border-surface-border">
          {REQUEST_TABS.map((t) => {
            const active = t === tab
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t)}
                className={
                  active
                    ? '-mb-px border-b border-ink px-1 pb-2 text-[12px] text-black'
                    : 'px-1 pb-2 text-[12px] text-grey-500'
                }
              >
                {t}
              </button>
            )
          })}
        </div>

        {tab === 'Params' ? (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-4 text-[10px] font-semibold text-grey-700">
              <span>Key</span>
              <span>Value</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Card flat className="px-3 py-2 text-[12px] text-grey-500">
                {tool.inputParameters?.[0] ?? 'Key'}
              </Card>
              <div className="flex items-center gap-2">
                <Card flat className="flex-1 px-3 py-2 text-[12px] text-grey-500">
                  Enter value or select CV from the list
                </Card>
                <button type="button" aria-label="Remove parameter" className="text-ink-muted">
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
            </div>
            <button
              type="button"
              className="flex w-fit items-center gap-1.5 px-1 py-2 text-[12px] font-semibold text-grey-400"
            >
              <Plus size={14} aria-hidden />
              Add
            </button>
          </div>
        ) : (
          <div
            data-testid={`request-tab-${tab}`}
            className="flex h-24 items-center justify-center text-[13px] text-ink-muted"
          >
            {tab}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 border-l border-surface-border pl-6">
        <div className="flex items-center justify-between">
          <SectionTitle>Action name and description *</SectionTitle>
          <button type="button" aria-label="Collapse action panel">
            <ChevronUp size={16} className="text-ink-muted" aria-hidden />
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-black">Action name*</label>
          <Card flat className="px-3 py-2 text-[12px] text-grey-500">
            {tool.name}
          </Card>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-black">Description*</label>
          <Card flat className="min-h-[72px] px-3 py-2 text-[12px] text-grey-500">
            {tool.description}
          </Card>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-grey-500">Input parameters:</span>
          <span className="font-mono text-[11px] text-ink">
            {tool.inputParameters?.join(', ') || 'None'}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-grey-500">Output parameters:</span>
          <span className="font-mono text-[11px] text-ink">
            {tool.outputParameters?.join(', ') || 'None'}
          </span>
        </div>
        {tool.useCase ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-grey-500">In use:</span>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-[4px] bg-grey-100 px-2 py-1 text-[11px] text-grey-700">
              <span className="size-1.5 rounded-full bg-[#3b998e]" aria-hidden />
              {tool.useCase.replace(/ \+\d+$/, '')}
            </span>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
