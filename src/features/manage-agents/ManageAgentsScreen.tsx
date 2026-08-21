// Serves /agent-setup ("Manage agents"): where brands, agents, and channels are
// created. Intents are authored a level below, in /agent-builder/use-cases.
import { useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router'
import { CalendarDays, MessageSquare, ShieldCheck, TrendingUp } from 'lucide-react'
import { useBrands } from '@/app/brand-context'
import { useAiAssistant } from '@/app/ai-assistant-context'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'
import { PageHeader } from '@/components/flora/PageHeader'
import { useAgentRoster } from './agent-roster-store'
import { AgentRosterTable } from './AgentRosterTable'
import { BrandFilter } from './BrandFilter'
import { ManageAgentsEmpty } from './ManageAgentsEmpty'
import { MetricDonutCard } from './MetricDonutCard'
import {
  arPercent,
  conversationTotal,
  escalationPercent,
  formatCount,
  RAMPS,
  segments,
} from './roster-metrics'

// Module-level, not state: the assistant auto-opens once per session for an
// empty roster, so closing it stays closed even after a remount or a navigation
// back to this screen.
let autoOpened = false

// Test seam — resets the once-per-session flag between test cases.
export function __resetAutoOpen(): void {
  autoOpened = false
}

const DATE_RANGE = 'May 2, 2025 - Jun 1, 2025'

export function ManageAgentsScreen() {
  const { brands, currentBrand } = useBrands()
  const { agents, deleteAgent } = useAgentRoster()
  const { open } = useAiAssistant()
  const navigate = useNavigate()

  const isEmpty = agents.length === 0

  useEffect(() => {
    if (isEmpty && !autoOpened) {
      autoOpened = true
      open('manage-agents')
    }
  }, [isEmpty, open])

  const visible = currentBrand
    ? agents.filter((agent) => agent.brandId === currentBrand.id)
    : agents
  const groupBy = currentBrand ? 'agent' : 'brand'
  const brandName = (brandId: string) =>
    brands.find((brand) => brand.id === brandId)?.name ?? brandId

  const total = conversationTotal(visible)
  const ar = arPercent(visible)
  const escalations = escalationPercent(visible)

  return (
    <div
      data-testid="screen-manage-agents"
      className="h-full overflow-y-auto rounded-[26px] bg-white"
    >
      <PageHeader
        title="Agent Directory"
        // Kept on the empty state too: the auto-opened panel would otherwise be
        // unreopenable once closed. Its setup checklist already has its own
        // "Build with AI" entry for the create-agent flow, so this is the only
        // trigger in the header — matching every other screen, where the
        // sparkle sits alone in the corner and "Create new" lives in the
        // toolbar row above the table.
        actions={<AiTriggerButton scope="manage-agents" />}
      />

      <div className="px-16 pb-16">
        {!isEmpty && (
          <p className="mb-6 text-sm leading-5 text-ink-muted">
            Create and manage agents across brands and channels.
          </p>
        )}
        {isEmpty ? (
          <ManageAgentsEmpty />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              <MetricDonutCard
                title="Conversations"
                Icon={MessageSquare}
                mode="stacked"
                centerLabel={total > 0 ? formatCount(total) : null}
                segments={segments(visible, { groupBy, metric: 'conversations', brandName })}
                totalLabel={`Total • ${formatCount(total)}`}
                formatValue={formatCount}
                emptyTitle="No conversations yet"
                emptyBody="Data will appear once your agent starts having conversations."
                testId="metric-conversations"
              />
              <MetricDonutCard
                title="Automated resolutions (AR)"
                Icon={TrendingUp}
                mode="single"
                centerLabel={ar === null ? null : `${ar}%`}
                value={ar ?? 0}
                singleColor={RAMPS.ar[0]}
                segments={segments(visible, { groupBy, metric: 'ar', brandName })}
                formatValue={(value) => `${value}%`}
                emptyTitle="No data yet"
                emptyBody="Resolution data will appear after your agent has conversations."
                testId="metric-ar"
              />
              <MetricDonutCard
                title="Escalations"
                Icon={ShieldCheck}
                mode="single"
                centerLabel={escalations === null ? null : `${escalations}%`}
                value={escalations ?? 0}
                singleColor={RAMPS.escalations[0]}
                segments={segments(visible, { groupBy, metric: 'escalations', brandName })}
                formatValue={(value) => `${value}%`}
                emptyTitle="No data yet"
                emptyBody="Escalation data will appear when conversations are handed off."
                testId="metric-escalations"
              />
            </div>

            <div className="mt-10 mb-4 flex items-center gap-3">
              <span className="text-lg font-semibold leading-6 tracking-[-0.45px] text-ink">
                Agents
              </span>
              <BrandFilter />
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-full border border-surface-border bg-white px-3"
                >
                  <CalendarDays size={16} className="text-ink-muted" aria-hidden />
                  <span className="text-sm leading-5 text-ink">{DATE_RANGE}</span>
                </button>
                <Link
                  to="/agent-setup/new"
                  className="flex h-9 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold leading-5 whitespace-nowrap text-white"
                >
                  Create new
                </Link>
              </div>
            </div>

            <AgentRosterTable
              agents={visible}
              brands={brands}
              onDelete={deleteAgent}
              // The screen owns the navigation, as it does the delete: the table
              // stays presentational and needs no router of its own.
              onEdit={(id) => navigate(`/agent-setup/${id}`)}
            />
          </>
        )}
      </div>

      {/* /agent-setup/new mounts here and takes over the viewport, so this screen
          keeps its state while the create flow is open. It is `fixed`, so where
          in the tree it renders makes no difference to where it lands — it sits
          outside the padded column only because it owes it nothing. */}
      <Outlet />
    </div>
  )
}
