import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown } from 'lucide-react'
import { useBrands } from '@/app/brand-context'
import { BrandAvatar } from '@/components/BrandMarkChip'
import { GardenIcon } from '@/components/garden-icon'
import { useAgentRoster } from '@/features/manage-agents/agent-roster-store'
import { cn } from '@/lib/cn'
import { useHoverIntent } from './useHoverIntent'

// Frame 1785:64372. The header's second slot switches AGENTS, using brands as
// group labels — brand rows are text, never controls, because brand selection
// belongs to the Manage agents filter. Picking an agent scopes the app to its
// brand, which is what keeps the two in agreement.

// Tints are the frame's literal values and have no tokens: the selected row is
// the Flora primary at 8%, the hover is the neutral at 8%.
const SELECTED = 'bg-[rgba(64,108,196,0.08)]'
const HOVER = 'hover:bg-[rgba(100,104,100,0.08)]'

const ITEM =
  'flex w-full cursor-pointer items-center gap-2 rounded-[4px] py-2 pl-3 pr-9 text-left outline-none transition-colors duration-instant ease-soft'

export function AgentSwitcher() {
  const { brands, currentBrand, currentAgentId, setCurrentAgent } = useBrands()
  const { agents } = useAgentRoster()
  const [clickOpen, setClickOpen] = useState(false)
  const { activeKey, open, scheduleClose } = useHoverIntent()

  // Derived, never stored twice (spec §2.1): the stored agent if it still exists,
  // else the first agent of the current scope — so the label can never name an
  // agent from a brand the page is no longer showing, and a deleted agent needs
  // no cleanup hook in the store.
  const scoped = currentBrand ? agents.filter((a) => a.brandId === currentBrand.id) : agents
  const activeAgent = agents.find((a) => a.id === currentAgentId) ?? scoped[0] ?? null

  // No agent in scope — an empty roster, or a brand filtered down to none. Either
  // way the only useful action is creating one, so the whole control becomes the
  // frame's underlined CTA and never opens a menu.
  if (activeAgent === null) {
    return (
      <Link
        to="/agent-setup/new"
        className="flex items-center gap-2 rounded-[12px] px-3 py-1.5 transition-colors duration-instant ease-soft hover:bg-control-hover"
      >
        <GardenIcon name="building-stroke" className="size-5 text-ink" />
        <span className="text-[14px] leading-[20px] tracking-[-0.154px] text-ink underline">
          Create your first agent
        </span>
        <ChevronDown size={16} className="text-ink" aria-hidden />
      </Link>
    )
  }

  const activeBrand = brands.find((brand) => brand.id === activeAgent.brandId)
  const isOpen = clickOpen || activeKey === 'agent-menu'

  // Brands with no agents are skipped, so an empty group header can never render.
  const groups = brands
    .map((brand) => ({ brand, members: agents.filter((a) => a.brandId === brand.id) }))
    .filter((group) => group.members.length > 0)

  return (
    <div className="relative">
      {/* Same radius as the hover overlay below, or the tint's corners cut inside it. */}
      <div className="flex items-center gap-2 rounded-[12px] px-3 py-1.5">
        {activeBrand && <BrandAvatar mark={activeBrand.mark} />}
        <span
          data-testid="current-agent"
          className="text-[14px] font-semibold leading-[20px] tracking-[-0.154px] text-ink"
        >
          {activeAgent.name}
        </span>
        <ChevronDown size={16} className="text-ink" aria-hidden />
      </div>

      <button
        aria-label="Switch agent"
        className="absolute inset-0 cursor-pointer rounded-[12px] outline-none transition-colors duration-instant ease-soft hover:bg-control-hover"
        onMouseEnter={() => open('agent-menu')}
        onMouseLeave={scheduleClose}
        onClick={() => setClickOpen((v) => !v)}
      />

      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 top-full z-[58] mt-1 w-[312px] rounded-[8px] border border-solid border-surface-border bg-white p-1 drop-shadow-[0px_16px_24px_rgba(12,12,13,0.16)]"
          onMouseEnter={() => open('agent-menu')}
          onMouseLeave={scheduleClose}
        >
          {groups.map((group, index) => (
            <div key={group.brand.id} className="flex flex-col gap-[2px]">
              {index > 0 && <div aria-hidden className="my-1 h-px w-full bg-flora-divider" />}

              {/* A label, not a control: brands are chosen on the Manage agents page. */}
              <div
                data-testid="switcher-brand-group"
                className="flex h-[26px] w-full items-center rounded-[4px] bg-bg-subtle px-[13px] text-[12px] leading-[16px] text-ink-muted"
              >
                {group.brand.name}
              </div>

              {group.members.map((agent) => (
                <button
                  key={agent.id}
                  role="menuitem"
                  aria-label={agent.name}
                  onClick={() => {
                    setCurrentAgent({ id: agent.id, brandId: agent.brandId })
                    setClickOpen(false)
                  }}
                  className={cn(ITEM, agent.id === activeAgent.id ? SELECTED : HOVER)}
                >
                  <BrandAvatar mark={group.brand.mark} />
                  <span className="truncate text-[14px] leading-[20px] tracking-[-0.154px] text-ink">
                    {agent.name}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
