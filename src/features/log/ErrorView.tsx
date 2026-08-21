// Error Logs body: overview heading and account filters, severity cards, then
// the error-specific toolbar and table. Each row opens the Conversation
// Details drawer for the conversation the error occurred in.
import { useState } from 'react'
import { AuditToolbar } from './AuditToolbar'
import { ErrorOverview } from './ErrorOverview'
import { ErrorToolbar } from './ErrorToolbar'
import { ErrorTable } from './ErrorTable'
import type { ErrorEntry } from './log-data'
import { detailForConversationId, type ConvDetail } from '@/features/insights/ai-performances/conversations/conversations-data'
import { ConversationDetailPanel } from '@/features/insights/ai-performances/conversations/ConversationDetailPanel'

export function ErrorView() {
  const [selected, setSelected] = useState<ConvDetail | null>(null)
  const open = (entry: ErrorEntry) => setSelected(detailForConversationId(entry.conversationId) ?? null)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[20px] font-semibold text-ink">
          Errors overview <span className="font-normal text-grey-500">Last 24 hours</span>
        </h2>
        <span className="text-[13px] text-ink-muted">Error logs are stored for 30 days.</span>
      </div>
      <AuditToolbar />
      <ErrorOverview />
      <div className="flex flex-col gap-4">
        <ErrorToolbar />
        <ErrorTable onOpen={open} />
      </div>
      {selected && <ConversationDetailPanel detail={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
