import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Lightbulb,
  MessageSquare,
  Plug,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { Card as FloraCard } from '@/components/flora/Card'
import {
  GREEN,
  INK,
  RED,
  ImpactDonut,
  StageBadge,
  TypeTag,
} from './pm-ui'
import { LIFECYCLE_LABEL } from './pm-data'
import {
  getOpportunityDetail,
  type AffectedCustomer,
  type DetailConversation,
  type DetailSegment,
  type OpportunityDetail,
} from './pm-detail-data'
import {
  PM_TOOL_LABEL,
  createPmIssueLink,
  loadPmIntegration,
  persistPmIntegration,
  type PmIntegration,
  type PmIssueLink,
} from './pm-integration'
import { PmActionDialog, type PmActionMode } from './PmActionDialog'

function MetricDivider() {
  return <div className="w-px shrink-0 bg-grey-300" aria-hidden="true" />
}

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-grey-300">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

function StatsStrip({ detail }: { detail: OpportunityDetail }) {
  const { opp } = detail
  const atRisk = opp.revenueState === 'at-risk'
  const revenueColor = atRisk ? RED : GREEN
  const volumeColor = opp.volumeGood ? GREEN : RED
  const leadSegment = detail.segments[0]

  return (
    <FloraCard className="grid min-h-[132px] grid-cols-[112px_1px_1fr_1px_1fr_1px_1fr] items-stretch gap-5 p-5">
      <div className="flex flex-col items-center justify-center">
        <ImpactDonut value={opp.impact} />
        <span className="mt-0.5 text-[11px] font-medium text-ink-muted">Priority score</span>
      </div>
      <MetricDivider />

      <div className="flex min-w-0 flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-ink-muted">Revenue</span>
          <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ color: revenueColor, backgroundColor: `${revenueColor}14` }}>
            {atRisk ? 'At risk' : 'Asking'}
          </span>
        </div>
        <span className="mt-1 text-[26px] font-semibold leading-7 text-ink">{opp.revenue}</span>
        <MiniBar pct={62} color={revenueColor} />
      </div>
      <MetricDivider />

      <div className="flex min-w-0 flex-col justify-center">
        <span className="text-[12px] font-medium text-ink-muted">Conversations · 10 wk</span>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[26px] font-semibold leading-7 text-ink">{detail.volumeCount}</span>
          <span className="flex items-center gap-0.5 text-[12px] font-semibold" style={{ color: volumeColor }}>
            {opp.volumeUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {opp.volumePct}
          </span>
        </div>
        <span className="mt-2 text-[11px] text-ink-muted">{opp.firstSeenLabel}</span>
      </div>
      <MetricDivider />

      <div className="flex min-w-0 flex-col justify-center">
        <span className="text-[12px] font-medium text-ink-muted">Customer concentration</span>
        <span className="mt-1 truncate text-[18px] font-semibold leading-6 text-ink">{leadSegment.label} · {leadSegment.pct}%</span>
        <span className="mt-2 text-[11px] text-ink-muted">{opp.customers} customers affected</span>
      </div>
    </FloraCard>
  )
}

function Narrative({ detail }: { detail: OpportunityDetail }) {
  const evidence = detail.opp.type === 'bug' ? detail.reproSteps : detail.signalEvidence
  const evidenceTitle = detail.opp.type === 'bug' ? 'Suggested reproduction steps' : 'Signal evidence'

  return (
    <section aria-labelledby="why-this-matters">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb size={19} color={INK} />
        <h2 id="why-this-matters" className="text-[18px] font-semibold text-ink">Why this matters</h2>
      </div>
      <p className="max-w-[920px] text-[14px] leading-6 text-ink">
        {detail.narrative.map((run, index) => (
          <span key={index} className={run.bold ? 'font-semibold' : 'font-normal'}>{run.text}</span>
        ))}
      </p>

      {evidence && evidence.length > 0 && (
        <FloraCard flat className="mt-4 rounded-[14px] p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.35px] text-ink-muted">{evidenceTitle}</p>
          {detail.opp.type === 'bug' ? (
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              {evidence.map((item) => <li key={item} className="text-[13px] leading-5 text-ink">{item}</li>)}
            </ol>
          ) : (
            <ul className="mt-2 grid grid-cols-2 gap-x-7 gap-y-2">
              {evidence.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] leading-5 text-ink">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-blue-700" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </FloraCard>
      )}
    </section>
  )
}

function ConversationCard({ conversation }: { conversation: DetailConversation }) {
  return (
    <FloraCard flat className="rounded-[14px] p-4">
      <p className="text-[14px] italic leading-6 text-ink">“{conversation.quote}”</p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <span className="text-[12px] font-medium text-ink-muted">
          {conversation.customer} · {conversation.revenueLabel} · {conversation.plan}
        </span>
        <button className="shrink-0 text-[12px] font-medium text-ink underline decoration-grey-500 underline-offset-2 outline-none">
          View conversation
        </button>
      </div>
    </FloraCard>
  )
}

function CustomerEvidence({ detail }: { detail: OpportunityDetail }) {
  return (
    <section aria-labelledby="customer-evidence">
      <div className="mb-4 flex items-center gap-3">
        <MessageSquare size={19} color={INK} />
        <h2 id="customer-evidence" className="text-[18px] font-semibold text-ink">Customer evidence</h2>
        <Button size="sm">View all {detail.totalConversations} conversations</Button>
      </div>
      <div className="flex flex-col gap-2">
        {detail.conversations.map((conversation) => (
          <ConversationCard key={conversation.id} conversation={conversation} />
        ))}
      </div>
    </section>
  )
}

function SegmentBar({ segment }: { segment: DetailSegment }) {
  return (
    <div className="grid grid-cols-[84px_1fr_176px] items-center gap-4">
      <span className="text-[13px] font-medium text-ink">{segment.label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-grey-300">
        <div className="h-full rounded-full bg-blue-700" style={{ width: `${segment.pct}%` }} />
      </div>
      <span className="text-right text-[12px] font-medium text-ink-muted">
        {segment.convoCount} conversations · {segment.revenue}
      </span>
    </div>
  )
}

function CustomerRow({ account }: { account: AffectedCustomer }) {
  return (
    <div className="grid grid-cols-[minmax(150px,1fr)_90px_minmax(190px,1fr)_90px] items-center gap-3 border-b border-grey-200 py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-grey-200 text-[11px] font-semibold text-ink">
          {account.name[0]}
        </div>
        <span className="truncate text-[13px] font-medium text-ink">{account.name}</span>
      </div>
      <span className="w-fit rounded-full bg-grey-200 px-2 py-0.5 text-[11px] font-medium text-ink">{account.plan}</span>
      <span className="text-[12px] text-ink-muted">Renewal · {account.renewalDate}</span>
      <span className="text-right text-[12px] font-semibold text-ink">{account.arrLabel}</span>
    </div>
  )
}

function AffectedCustomers({ detail }: { detail: OpportunityDetail }) {
  return (
    <section aria-labelledby="affected-customers">
      <div className="mb-4 flex items-center gap-2">
        <User size={19} color={INK} />
        <h2 id="affected-customers" className="text-[18px] font-semibold text-ink">Affected customers</h2>
      </div>

      <FloraCard flat className="rounded-[14px] p-4">
        <div className="flex flex-col gap-3">
          {detail.segments.map((segment) => <SegmentBar key={segment.key} segment={segment} />)}
        </div>
        <div className="my-4 h-px bg-grey-200" />
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-ink">{detail.opp.customers} customers affected</p>
          <p className="text-[12px] text-ink-muted">Highest-value accounts approaching renewal</p>
        </div>
        <div className="mt-2">
          {detail.affectedCustomers.map((account) => <CustomerRow key={account.id} account={account} />)}
        </div>
      </FloraCard>
    </section>
  )
}

function RecommendedAction({ detail, integration, onCreate, onBackToFeed }: {
  detail: OpportunityDetail
  integration: PmIntegration
  onCreate: () => void
  onBackToFeed: () => void
}) {
  const [dialogMode, setDialogMode] = useState<PmActionMode | null>(null)
  const connectedToolLabel = integration.tool ? PM_TOOL_LABEL[integration.tool] : null
  const issueLink = integration.linkedIssues[detail.opp.id]
  const linkedToolLabel = issueLink ? PM_TOOL_LABEL[issueLink.tool] : null

  return (
    <div className="relative overflow-visible rounded-[18px] border border-grey-200 bg-[linear-gradient(135deg,rgba(246,235,255,0.72),rgba(236,248,255,0.76)_52%,rgba(234,250,247,0.82))] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-ink-muted">Recommended next step</p>
          <p className="mt-1 text-[15px] font-semibold leading-5 text-ink">Turn this signal into owned product work</p>
        </div>
        <Sparkles size={17} color="#724be8" />
      </div>
      <p className="mt-3 text-[13px] leading-5 text-ink">{detail.suggestedAction}</p>

      <div className="mt-4 rounded-xl border border-white/80 bg-white/65 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-white"><Plug size={13} color={INK} /></span>
            <div>
              <p className="text-[11px] text-ink-muted">PM tool</p>
              <p className="text-[12px] font-semibold text-ink">{connectedToolLabel ? `${connectedToolLabel} connected` : 'Not connected'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {issueLink && linkedToolLabel ? (
          <Button className="w-full" variant="outline" onClick={() => setDialogMode('issue')}>
            <ExternalLink size={15} /> View {issueLink.key} in {linkedToolLabel}
          </Button>
        ) : integration.connected && connectedToolLabel ? (
          <Button className="w-full" variant="primary" onClick={onCreate}>
            <Plug size={15} /> Create in {connectedToolLabel}
          </Button>
        ) : (
          <div className="rounded-xl border border-grey-200 bg-white/65 p-3">
            <p className="text-[12px] leading-5 text-ink-muted">Connect a PM tool from the opportunity feed to create and track product work.</p>
            <Button className="mt-2 w-full" variant="outline" size="sm" onClick={onBackToFeed}>Back to opportunity feed</Button>
          </div>
        )}
        <Button className="w-full bg-white/55" variant="outline" onClick={() => setDialogMode('brief')}>
          <Sparkles size={15} /> Draft product brief
        </Button>
      </div>

      {dialogMode && (
        <PmActionDialog
          mode={dialogMode}
          opportunity={detail.opp}
          issueLink={dialogMode === 'issue' ? issueLink : undefined}
          suggestedAction={detail.suggestedAction}
          onClose={() => setDialogMode(null)}
        />
      )}

    </div>
  )
}

function LinkedWork({ detail, issueLink }: { detail: OpportunityDetail; issueLink?: PmIssueLink }) {
  const [dismissed, setDismissed] = useState(false)

  return (
    <FloraCard flat className="p-5">
      <p className="text-[13px] font-semibold text-ink">Linked work</p>
      {issueLink ? (
        <div className="mt-3 rounded-xl border border-grey-200 bg-grey-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-medium text-ink-muted">{PM_TOOL_LABEL[issueLink.tool]} issue</span>
            <span className="rounded-full bg-[#dff5ea] px-2 py-0.5 text-[10px] font-semibold text-[#0f6b4d]">Ready for triage</span>
          </div>
          <p className="mt-2 text-[15px] font-semibold text-ink">{issueLink.key}</p>
          <p className="mt-1 text-[12px] leading-5 text-ink-muted">Created from this opportunity with evidence and affected accounts attached.</p>
        </div>
      ) : detail.linkedSuggestion && !dismissed ? (
        <div className="relative mt-3 rounded-xl bg-[#fff3e4] p-4">
          <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full outline-none">
            <X size={13} color={INK} />
          </button>
          <p className="text-[12px] font-semibold text-ink">Possible related issue</p>
          <p className="mt-2 pr-5 text-[12px] leading-5 text-ink">{detail.linkedSuggestion.ref} {detail.linkedSuggestion.text}</p>
          <button className="mt-1 text-[12px] font-semibold text-ink underline underline-offset-2">Review issue</button>
        </div>
      ) : (
        <p className="py-8 text-center text-[12px] text-ink-muted">No issues linked yet</p>
      )}
    </FloraCard>
  )
}

function LifecycleTimeline({ detail }: { detail: OpportunityDetail }) {
  return (
    <FloraCard flat className="p-5">
      <p className="text-[13px] font-semibold text-ink">Lifecycle</p>
      <div className="relative mt-4 flex flex-col gap-5 pl-1 before:absolute before:bottom-4 before:left-[7px] before:top-2 before:w-px before:bg-grey-300">
        {detail.timeline.map((node) => {
          const current = node.stage === detail.opp.stage
          const complete = node.dateLabel !== null
          return (
            <div key={node.stage} className="relative flex items-center gap-4">
              <span className="z-[1] size-3.5 shrink-0 rounded-full border-2 border-white" style={{ backgroundColor: complete ? GREEN : '#d2d3d8' }} />
              <div>
                <span className={`text-[12px] font-medium ${current ? 'text-ink' : 'text-ink-muted'}`}>{LIFECYCLE_LABEL[node.stage]}</span>
                <span className="ml-2 text-[11px] text-ink-muted">{node.dateLabel ?? '—'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </FloraCard>
  )
}

export function OpportunityDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const detail = getOpportunityDetail(id)
  const [integration, setIntegration] = useState<PmIntegration>(() => loadPmIntegration())

  if (!detail) {
    return (
      <div data-testid="screen-opportunity-detail" className="flex h-full flex-col items-center justify-center gap-3 rounded-[26px] bg-white">
        <p className="text-[16px] font-semibold text-ink">Opportunity not found</p>
        <Link to="/" className="text-[14px] font-semibold text-blue-700 underline">Back to Dashboard</Link>
      </div>
    )
  }

  const createIssue = () => {
    setIntegration((current) => {
      const next = createPmIssueLink(current, detail.opp.id)
      persistPmIntegration(next)
      return next
    })
  }

  const { opp } = detail
  const issueLink = integration.linkedIssues[opp.id]

  return (
    <div data-testid="screen-opportunity-detail" className="h-full overflow-y-auto rounded-[26px] bg-white">
      <div className="sticky top-0 z-30 flex h-14 items-center border-b border-grey-200 bg-white/95 px-8 backdrop-blur-sm">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2 rounded-full px-2 py-1 text-[13px] font-semibold text-[#01567a] outline-none hover:bg-grey-100">
          <ArrowLeft size={18} />
          Product recommendations
        </button>
      </div>

      <div className="mx-auto max-w-[1360px] px-9 py-8">
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-ink-muted">Opportunity signal</p>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h1 className="text-[25px] font-semibold tracking-[-0.35px] text-ink">{opp.title}</h1>
            <TypeTag type={opp.type} />
            <StageBadge stage={opp.stage} />
          </div>
          <p className="mt-2 max-w-[860px] text-[13px] leading-5 text-ink-muted">{opp.description}</p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_330px] items-start gap-6">
          <div className="min-w-0 space-y-8">
            <StatsStrip detail={detail} />
            <Narrative detail={detail} />
            <CustomerEvidence detail={detail} />
            <AffectedCustomers detail={detail} />
          </div>

          <aside className="sticky top-[76px] flex flex-col gap-3">
            <RecommendedAction detail={detail} integration={integration} onCreate={createIssue} onBackToFeed={() => navigate('/')} />
            <LinkedWork detail={detail} issueLink={issueLink} />
            <LifecycleTimeline detail={detail} />
          </aside>
        </div>
      </div>
    </div>
  )
}
