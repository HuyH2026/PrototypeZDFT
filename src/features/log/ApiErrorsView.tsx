// API errors tab body: the same drawer entry point as Error Logs, scoped to
// failed outbound API calls. No overview cards — the severity rollup on the
// Error Logs tab is error-specific.
import { useState } from 'react'
import { ErrorToolbar } from './ErrorToolbar'
import { ApiErrorTable } from './ApiErrorTable'
import type { ApiErrorEntry } from './log-data'
import { detailForConversationId, type ConvDetail } from '@/features/insights/ai-performances/conversations/conversations-data'
import { ConversationDetailPanel } from '@/features/insights/ai-performances/conversations/ConversationDetailPanel'

export function ApiErrorsView() {
  const [selected, setSelected] = useState<ConvDetail | null>(null)
  const open = (entry: ApiErrorEntry) => setSelected(detailForConversationId(entry.conversationId) ?? null)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[20px] font-semibold text-ink">
          API errors <span className="font-normal text-grey-500">Last 24 hours</span>
        </h2>
        <span className="text-[13px] text-ink-muted">Error logs are stored for 30 days.</span>
      </div>
      <div className="flex flex-col gap-4">
        <ErrorToolbar />
        <ApiErrorTable onOpen={open} />
      </div>
      {selected && <ConversationDetailPanel detail={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
