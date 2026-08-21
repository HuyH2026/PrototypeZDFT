// Card/grid view of the use-cases list — an alternate to AgentsTable, switched
// to from the toolbar's view toggle. No Figma reference exists for this
// state; the card shows name + Self-improving chip, type, the Activate
// toggle, and the first three of the active column set as stat lines.
import { Card } from '@/components/flora/Card'
import { PLAN_CHIP_STYLE } from '@/features/ai-studio/plan-parts/plan-chip'
import { useSelfImprovementPlans } from '@/features/ai-studio/self-improving/self-improvement-store'
import type { Agent } from './agent-builder-data'
import type { Column } from './AgentsTable'

const INK = '#2f3130'
const MUTED = '#8b8e89'
const GREEN = '#0f8a5f'
const SELF_IMPROVING_TINT = PLAN_CHIP_STYLE['active-check-ins']

function GridToggle({
  agent,
  on,
  onToggle,
}: {
  agent: Agent
  on: boolean
  onToggle: (id: string) => void
}) {
  if (agent.canToggle === false) {
    return (
      <span
        className="flex shrink-0 items-center gap-2"
        aria-label={`${agent.name} is ${on ? 'On' : 'Off'}`}
      >
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: on ? GREEN : '#c9c7c3' }}
          aria-hidden
        />
      </span>
    )
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`Activate ${agent.name}`}
      onClick={(e) => {
        e.stopPropagation()
        onToggle(agent.id)
      }}
      className="relative h-4 w-7 shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: on ? GREEN : '#c9c7c3' }}
    >
      <span
        className="absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all duration-instant ease-soft"
        style={{ left: on ? '14px' : '2px' }}
      />
    </button>
  )
}

export function AgentsGrid({
  agents,
  isOn,
  onToggle,
  onRowClick,
  columns,
}: {
  agents: Agent[]
  isOn: (a: Agent) => boolean
  onToggle: (id: string) => void
  onRowClick?: (id: string) => void
  columns: Column[]
}) {
  const { plans } = useSelfImprovementPlans()
  const statColumns = columns.slice(0, 3)

  return (
    <div data-testid="agents-grid" className="grid grid-cols-3 gap-4">
      {agents.map((a) => (
        <Card
          key={a.id}
          data-testid={`agent-card-${a.id}`}
          className={onRowClick ? 'cursor-pointer p-5' : 'p-5'}
          onClick={() => onRowClick?.(a.id)}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-[14px] font-medium" style={{ color: INK }}>
              {a.name}
              {plans[a.id] && (
                <span
                  className="shrink-0 rounded-2xl px-2 py-1 text-[11px] font-semibold tracking-[-0.1px]"
                  style={{ color: SELF_IMPROVING_TINT.fg, backgroundColor: SELF_IMPROVING_TINT.bg }}
                >
                  Self-improving
                </span>
              )}
            </span>
            <GridToggle agent={a} on={isOn(a)} onToggle={onToggle} />
          </div>
          <p className="mt-1 text-[13px]" style={{ color: MUTED }}>
            {a.type}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {statColumns.map((c) => (
              <div key={c.key} className="flex items-center justify-between text-[13px]">
                <span style={{ color: MUTED }}>{c.label}</span>
                <span style={{ color: INK }}>{c.render(a)}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
