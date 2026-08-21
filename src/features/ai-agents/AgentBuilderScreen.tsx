// Agent Builder — the Use cases landing screen. The selected channel and list
// tab are local view state; use-case content and activation live in the store.
// Git sync is the one column backed by a second store: it is mocked per
// brand+channel, so the screen owns the repo connection for the channel on
// screen and hands the table only what a row needs.
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Calendar, ChevronDown, Download, LayoutGrid, List, Plus, Search, Trash2, X } from 'lucide-react'
import { CHANNELS, type CallDirection, type ChannelKey } from './agent-builder-data'
import { MetricStrip } from './MetricStrip'
import {
  AgentsTable,
  DEFAULT_COLUMNS,
  VOICE_COLUMNS,
  VOICE_OUTBOUND_COLUMNS,
  WEBCALL_COLUMNS,
} from './AgentsTable'
import { AgentsGrid } from './AgentsGrid'
import { useAgentStore } from './agent-store'
import { CreateAgentPanel } from './CreateAgentPanel'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { UseCasePreview } from './preview/UseCasePreview'
import { useGitSyncStore } from './git-sync-store'
import { ConnectRepoDialog } from './ConnectRepoDialog'
import { GitSyncPanel } from './GitSyncPanel'
import { brandScopeKey, useBrands } from '@/app/brand-context'
import { PageHeader } from '@/components/flora/PageHeader'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'

type AgentTab = 'all' | 'active' | 'subagents'

const AGENT_TABS: { key: AgentTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active use cases' },
  { key: 'subagents', label: 'Active subflows' },
]

const DIRECTION_TABS: { key: CallDirection; label: string }[] = [
  { key: 'inbound', label: 'Inbound' },
  { key: 'outbound', label: 'Outbound' },
]

export function AgentBuilderScreen() {
  const navigate = useNavigate()
  const store = useAgentStore()
  const [channelKey, setChannelKey] = useState<ChannelKey>('widget')
  const [tab, setTab] = useState<AgentTab>('all')
  const [voiceDirection, setVoiceDirection] = useState<CallDirection>('inbound')
  const [creating, setCreating] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [panelAgentId, setPanelAgentId] = useState<string | null>(null)
  const [tableView, setTableView] = useState<'list' | 'grid'>('list')

  const git = useGitSyncStore()
  const { currentBrand } = useBrands()
  // 'all-brands' is a real scope: git sync is mocked per brand+channel, and the
  // top bar's All brands selection needs a key of its own.
  const brandKey = brandScopeKey(currentBrand)
  const connection = git.getConnection(brandKey, channelKey)
  // Resolved from the store rather than held in state, so a sync or an edit
  // behind the panel is reflected in it.
  const panelAgent = panelAgentId ? store.getAgent(panelAgentId) : undefined

  const channel = CHANNELS.find((c) => c.key === channelKey)!

  // Derive agents from store, filtered by current channel (and, for Voice,
  // by the Inbound/Outbound tab).
  const channelAgents = store.agents.filter((a) => {
    if (a.channel !== channelKey) return false
    if (channelKey === 'voice') return a.callDirection === voiceDirection
    return true
  })
  const activeMetrics =
    channelKey === 'voice' && voiceDirection === 'outbound' ? channel.outboundMetrics! : channel.metrics
  const activeColumns =
    channelKey === 'voice'
      ? // Voice's two directions are different tables (frame 112:51124):
        // Outbound prints the use-case id, segment chips and voicemail counts.
        voiceDirection === 'outbound'
        ? VOICE_OUTBOUND_COLUMNS
        : VOICE_COLUMNS
      : channelKey === 'webcall'
        ? WEBCALL_COLUMNS
        : DEFAULT_COLUMNS

  const visibleAgents = useMemo(
    () =>
      channelAgents.filter((a) => {
        if (tab === 'active') return a.on
        if (tab === 'subagents') return a.isSubflow
        return true
      }),
    [channelAgents, tab],
  )

  // Selection only ever references currently-visible rows, so reset it whenever
  // the channel or tab changes (which changes what's visible).
  const clearSelection = () => setSelected(new Set())
  const selectChannel = (key: ChannelKey) => {
    setChannelKey(key)
    clearSelection()
    // The sync panel names one row's repo files, and the repo connection is
    // per channel — leaving it open across a switch would caption it with the
    // wrong channel's connection.
    setPanelAgentId(null)
    setVoiceDirection('inbound')
  }
  const selectTab = (key: AgentTab) => {
    setTab(key)
    clearSelection()
  }
  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const toggleAll = () =>
    setSelected((prev) => {
      const allSelected = visibleAgents.length > 0 && visibleAgents.every((a) => prev.has(a.id))
      return allSelected ? new Set() : new Set(visibleAgents.map((a) => a.id))
    })
  const confirmDelete = () => {
    store.deleteAgents([...selected])
    clearSelection()
    setConfirmingDelete(false)
  }

  return (
    <div data-testid="view-agent-builder" className="h-full overflow-y-auto">
      <PageHeader
        title="Use cases"
        titleMeta={<span>May 2, 2026 - Jun 01, 2026</span>}
        middle={
          <div
            role="tablist"
            aria-label="Channel"
            className="grid min-w-[530px] grid-cols-5 rounded-full bg-grey-100 p-1"
          >
            {CHANNELS.map((c) => {
              const active = c.key === channelKey
              return (
                <button
                  key={c.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectChannel(c.key)}
                  className={
                    active
                      ? 'rounded-full bg-white px-5 py-1.5 text-[13px] font-semibold text-ink shadow-sm'
                      : 'rounded-full px-5 py-1.5 text-[13px] font-medium text-ink-muted'
                  }
                >
                  {c.label}
                </button>
              )
            })}
          </div>
        }
        actions={
          // One progressive AI entry: start in the contextual panel, where
          // the user can expand into the full Studio only when they need it.
          // The agent-health survey is deliberately not a second trigger
          // here — nor on Agent Overview, which had one and lost it for the
          // same reason. It is reached from Home's agent-health card and from
          // the Studio itself (its landing row, or the sidebar's Start group
          // from anywhere inside it).
          <AiTriggerButton scope="agent-builder" label="Ask AI about this page" />
        }
      />

      <div className="px-16 pb-16">
        {channelKey === 'voice' && (
          <div
            role="tablist"
            aria-label="Call direction"
            className="mb-6 inline-flex items-center rounded-full bg-grey-100 p-1"
          >
            {DIRECTION_TABS.map((d) => {
              const active = d.key === voiceDirection
              return (
                <button
                  key={d.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setVoiceDirection(d.key)}
                  className={
                    active
                      ? 'rounded-full bg-white px-5 py-1.5 text-[13px] font-semibold text-ink shadow-sm'
                      : 'rounded-full px-5 py-1.5 text-[13px] font-medium text-ink-muted'
                  }
                >
                  {d.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Metric strip */}
        <div className="mb-8">
          <MetricStrip metrics={activeMetrics} />
        </div>

        {/* Use-case tabs */}
        <div
          role="tablist"
          aria-label="Use cases"
          className="mb-6 inline-flex items-center rounded-full bg-grey-100 p-1"
        >
          {AGENT_TABS.map((t) => {
            const active = t.key === tab
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(t.key)}
                className={
                  active
                    ? 'rounded-full bg-white px-5 py-1.5 text-[13px] font-semibold text-ink shadow-sm'
                    : 'rounded-full px-5 py-1.5 text-[13px] font-medium text-ink-muted'
                }
              >
                {t.label}
              </button>
            )
          })}
          <button
            type="button"
            aria-label="Add tab"
            className="ml-1 flex size-7 items-center justify-center rounded-full text-ink-muted hover:bg-control-hover"
          >
            <Plus size={14} aria-hidden />
          </button>
        </div>

        {/* Toolbar (inert affordances) */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-surface-border px-3 py-1.5">
              <Search size={14} className="text-ink-muted" aria-hidden />
              <input
                type="text"
                placeholder="Search"
                className="w-40 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-surface-border px-3 py-1.5 text-[13px] text-ink"
            >
              <Calendar size={14} className="text-ink-muted" aria-hidden />
              May 02, 2026 - Jun 01, 2026
              <ChevronDown size={14} className="text-ink-muted" aria-hidden />
            </button>
            <button
              type="button"
              className="rounded-full border border-surface-border px-3 py-1.5 text-[13px] text-ink"
            >
              All filters
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Download"
              className="flex size-9 items-center justify-center rounded-full border border-surface-border text-ink-muted"
            >
              <Download size={14} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setPreviewing(true)}
              className="rounded-full border border-surface-border px-4 py-1.5 text-[13px] font-medium text-ink"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-semibold text-white"
            >
              New Use Case
            </button>
            <div className="flex items-center gap-1 rounded-full border border-surface-border p-1">
              <button
                type="button"
                aria-label="List view"
                aria-pressed={tableView === 'list'}
                onClick={() => setTableView('list')}
                className={
                  tableView === 'list'
                    ? 'flex size-7 items-center justify-center rounded-full bg-grey-100 text-ink'
                    : 'flex size-7 items-center justify-center rounded-full text-ink-muted'
                }
              >
                <List size={14} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={tableView === 'grid'}
                onClick={() => setTableView('grid')}
                className={
                  tableView === 'grid'
                    ? 'flex size-7 items-center justify-center rounded-full bg-grey-100 text-ink'
                    : 'flex size-7 items-center justify-center rounded-full text-ink-muted'
                }
              >
                <LayoutGrid size={14} aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {/* Selection action bar (shown when ≥1 row selected) */}
        {selected.size > 0 && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-surface-border bg-[#f4f3f1] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Clear selection"
                onClick={clearSelection}
                className="text-ink-muted hover:text-ink"
              >
                <X size={16} aria-hidden />
              </button>
              <span className="text-[13px] font-medium text-ink">{selected.size} selected</span>
            </div>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-white"
              style={{ backgroundColor: '#c0392b' }}
            >
              <Trash2 size={14} aria-hidden />
              Delete
            </button>
          </div>
        )}

        {/* Use cases table / grid */}
        {tableView === 'grid' ? (
          <AgentsGrid
            agents={visibleAgents}
            isOn={(a) => a.on}
            onToggle={(id) => store.toggleAgent(id)}
            onRowClick={(id) => navigate(`/agent-builder/${id}`)}
            columns={activeColumns}
          />
        ) : (
          <AgentsTable
            agents={visibleAgents}
            isOn={(a) => a.on}
            onToggle={(id) => store.toggleAgent(id)}
            onRowClick={(id) => navigate(`/agent-builder/${id}`)}
            selectedIds={selected}
            onToggleSelect={toggleSelect}
            onToggleAll={toggleAll}
            columns={activeColumns}
            gitSync={{
              getState: git.getSyncState,
              connected: Boolean(connection),
              onSync: git.syncAgent,
              onOpenPanel: (id) => setPanelAgentId(id),
              onConnectRepo: () => setConnectOpen(true),
            }}
          />
        )}

        {confirmingDelete && (
          <ConfirmDeleteDialog
            count={selected.size}
            onCancel={() => setConfirmingDelete(false)}
            onConfirm={confirmDelete}
          />
        )}

        {/* Keyed by channel so switching channels behind the overlay cannot leave
            a run whose trace belongs to the channel you left. */}
        {previewing && (
          <UseCasePreview
            key={channelKey}
            channel={channelKey}
            onClose={() => setPreviewing(false)}
          />
        )}

        {creating && (
          <CreateAgentPanel
            channel={channelKey}
            direction={channelKey === 'voice' ? voiceDirection : undefined}
            onClose={() => setCreating(false)}
            onCreate={(fields) => {
              const id = store.createAgent(fields)
              setCreating(false)
              navigate(`/agent-builder/${id}`)
            }}
          />
        )}

        {connectOpen && (
          <ConnectRepoDialog
            brandName={currentBrand?.name ?? 'All brands'}
            channelLabel={channel.label}
            onCancel={() => setConnectOpen(false)}
            onConnect={(repo) => {
              git.connectRepo(brandKey, channelKey, repo)
              setConnectOpen(false)
            }}
          />
        )}

        {/* Both gates matter: the panel previews the files a connection would
            hold, so it cannot open for a channel whose repo was disconnected
            underneath it. */}
        {panelAgent && connection && (
          <GitSyncPanel
            agent={panelAgent}
            connection={connection}
            state={git.getSyncState(panelAgent.id)}
            onSync={git.syncAgent}
            onDisconnect={() => {
              git.disconnectRepo(brandKey, channelKey)
              setPanelAgentId(null)
            }}
            onClose={() => setPanelAgentId(null)}
          />
        )}
      </div>
    </div>
  )
}
