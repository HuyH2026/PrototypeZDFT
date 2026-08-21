// The roster table. Columns are constant whether or not an agent has data — a
// metric-less agent renders 'n/a' / '—' rather than dropping the column, so the
// table does not reflow as data arrives (see the spec's Deviations).
import { Fragment, useState } from 'react'
import { ArrowDownUp, MoreVertical } from 'lucide-react'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import { BrandMarkChip } from '@/components/BrandMarkChip'
import { ConfirmDeleteDialog } from '@/features/ai-agents/ConfirmDeleteDialog'
import { channelMeta } from '@/lib/channel-meta'
import type { Brand } from '@/types'
import { formatCount } from './roster-metrics'
import type { AgentHealth, RosterAgent } from './roster-data'

const HEALTH_META: Record<AgentHealth, { label: string; color: string }> = {
  good: { label: 'Good', color: '#0f8a5f' },
  'new-insights': { label: 'New insights', color: '#1f73b7' },
  'needs-attention': { label: 'Needs attention', color: '#c8402f' },
}

const COLUMN_COUNT = 7

function ChannelStack({ channels }: { channels: string[] }) {
  return (
    <span className="flex items-center">
      {channels.map((label, index) => {
        const { color, Icon, display } = channelMeta(label)
        return (
          <span
            key={label}
            title={display}
            className={`flex size-6 items-center justify-center rounded-full ${index === 0 ? '' : '-ml-2'}`}
            style={{ backgroundColor: color, boxShadow: '0 0 0 2px #ffffff' }}
          >
            <Icon size={12} className="text-white" strokeWidth={2} aria-hidden />
          </span>
        )
      })}
    </span>
  )
}

function HealthPill({ health }: { health: AgentHealth | null }) {
  if (health === null) return <span className="text-ink-muted">—</span>
  const { label, color } = HEALTH_META[health]
  return (
    <span
      className="inline-flex h-[22px] items-center gap-1.5 rounded-full px-2"
      style={{ backgroundColor: `${color}18` }}
    >
      <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[12px] font-semibold leading-4" style={{ color }}>
        {label}
      </span>
    </span>
  )
}

// Groups in brand order, then any agent whose brand is unknown, so a row can
// never silently disappear from the table.
function groupAgents(agents: RosterAgent[], brands: Brand[]) {
  const groups: { key: string; name: string; mark: Brand['mark']; agents: RosterAgent[] }[] = []
  for (const brand of brands) {
    const owned = agents.filter((agent) => agent.brandId === brand.id)
    if (owned.length > 0)
      groups.push({ key: brand.id, name: brand.name, mark: brand.mark, agents: owned })
  }
  const known = new Set(brands.map((brand) => brand.id))
  const orphans = agents.filter((agent) => !known.has(agent.brandId))
  for (const agent of orphans) {
    const existing = groups.find((group) => group.key === agent.brandId)
    if (existing) existing.agents.push(agent)
    else
      groups.push({
        key: agent.brandId,
        name: agent.brandId,
        mark: { label: agent.brandId, bg: '#646864' },
        agents: [agent],
      })
  }
  return groups
}

export function AgentRosterTable({
  agents,
  brands,
  onDelete,
  onEdit,
}: {
  agents: RosterAgent[]
  brands: Brand[]
  onDelete: (id: string) => void
  /** Drills into the edit takeover. The screen owns the navigation, as with onDelete. */
  onEdit: (id: string) => void
}) {
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<RosterAgent | null>(null)

  // Closing the menu is part of drilling in: the editor renders over a roster
  // that stays mounted, and this menu has no dismiss-on-outside-click, so a menu
  // left open would still be there when the editor closes.
  const edit = (id: string) => {
    setMenuFor(null)
    onEdit(id)
  }
  const groups = groupAgents(agents, brands)
  // The table shell is `overflow-y-hidden` (it has to be: `overflow-x-auto`
  // forces a value on the other axis), so a menu that opens downward from near
  // the bottom is clipped rather than overflowing. At four items the menu stands
  // ~152px tall against a ~61px row, so the last two rows both have to open
  // upward — one row's worth of space below is not enough.
  const flipUp = new Set(
    groups
      .flatMap((group) => group.agents)
      .slice(-2)
      .map((agent) => agent.id),
  )

  return (
    <>
      <Table>
        <Thead>
          <tr>
            <Th>
              <span className="inline-flex items-center gap-1.5">
                Agents
                <ArrowDownUp size={14} className="text-grey-600" aria-hidden />
              </span>
            </Th>
            <Th>Channels</Th>
            <Th>Health</Th>
            <Th>
              <span className="inline-flex items-center gap-1.5">
                AR
                <ArrowDownUp size={14} className="text-grey-600" aria-hidden />
              </span>
            </Th>
            <Th>
              <span className="inline-flex items-center gap-1.5">
                Conversations
                <ArrowDownUp size={14} className="text-grey-600" aria-hidden />
              </span>
            </Th>
            <Th>Insights</Th>
            <Th className="w-10" aria-label="Row actions" />
          </tr>
        </Thead>
        <Tbody>
          {groups.map((group) => (
            <Fragment key={group.key}>
              <tr>
                <Td colSpan={COLUMN_COUNT} className="bg-white py-2">
                  <span className="text-[12px] font-semibold leading-4 tracking-[0.2px] text-ink-muted">
                    Brand • {group.name}
                  </span>
                </Td>
              </tr>
              {group.agents.map((agent) => (
                <tr
                  key={agent.id}
                  onClick={() => edit(agent.id)}
                  className="cursor-pointer"
                  // The row is not the accessible affordance — the name button
                  // below is. This handler is the pointer convenience the design
                  // asks for, so it is not given a role of its own.
                >
                  <Td>
                    <span className="flex items-center gap-2">
                      <BrandMarkChip mark={group.mark} size={20} />
                      <button
                        type="button"
                        // Prefixed so the name a screen reader announces says
                        // what the control does; the visible name is contained
                        // in it, so the two still agree.
                        aria-label={`Edit ${agent.name}`}
                        onClick={(event) => {
                          // Would otherwise reach the row handler too and drill
                          // in twice.
                          event.stopPropagation()
                          edit(agent.id)
                        }}
                        className="text-left font-semibold text-ink outline-none hover:underline"
                      >
                        {agent.name}
                      </button>
                    </span>
                  </Td>
                  <Td>
                    <ChannelStack channels={agent.channels} />
                  </Td>
                  <Td>
                    <HealthPill health={agent.health} />
                  </Td>
                  <Td className="text-ink">{agent.ar === null ? 'n/a' : `${agent.ar}%`}</Td>
                  <Td className="text-ink">
                    {agent.conversations === null ? 'n/a' : formatCount(agent.conversations)}
                  </Td>
                  <Td>
                    {agent.insightCount > 0 ? (
                      <button
                        type="button"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex h-[26px] items-center rounded-full border border-surface-border px-2.5 text-[12px] font-semibold leading-4 text-ink"
                      >
                        View {agent.insightCount}
                      </button>
                    ) : null}
                  </Td>
                  {/* Every control in this cell stops the row handler: opening
                      the menu, or picking an item from it, must not also drill
                      into the agent. */}
                  <Td className="relative" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      aria-label={`Row actions for ${agent.name}`}
                      onClick={() =>
                        setMenuFor((current) => (current === agent.id ? null : agent.id))
                      }
                      className="flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-control-hover"
                    >
                      <MoreVertical size={16} aria-hidden />
                    </button>
                    {menuFor === agent.id && (
                      <div
                        role="menu"
                        data-side={flipUp.has(agent.id) ? 'top' : 'bottom'}
                        className={`absolute right-2 z-20 w-[160px] rounded-lg border border-surface-border bg-white py-1 shadow-[0px_16px_12px_rgba(10,13,14,0.16)] ${flipUp.has(agent.id) ? 'bottom-full' : 'top-full'}`}
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => edit(agent.id)}
                          className="w-full px-3 py-2 text-left text-sm leading-5 text-ink hover:bg-bg-subtle"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => setMenuFor(null)}
                          className="w-full px-3 py-2 text-left text-sm leading-5 text-ink hover:bg-bg-subtle"
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => setMenuFor(null)}
                          className="w-full px-3 py-2 text-left text-sm leading-5 text-ink hover:bg-bg-subtle"
                        >
                          Deactivate
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuFor(null)
                            setPendingDelete(agent)
                          }}
                          className="w-full px-3 py-2 text-left text-sm leading-5 text-[#c0392b] hover:bg-bg-subtle"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </Fragment>
          ))}
        </Tbody>
      </Table>

      {pendingDelete && (
        <ConfirmDeleteDialog
          count={1}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            onDelete(pendingDelete.id)
            setPendingDelete(null)
          }}
        />
      )}
    </>
  )
}
