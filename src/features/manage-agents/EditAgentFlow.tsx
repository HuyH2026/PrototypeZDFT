// Serves /agent-setup/:agentId — the roster's edit drill-in, wearing the same
// takeover shell as the create wizard next door (see components/takeover-parts).
// Like it, this is a *child* route of /agent-setup, so the roster stays mounted
// underneath and Close reveals it exactly as the user left it.
//
// Two of the wizard's three steps: name and channels. Brand is chosen once, at
// create time — moving an agent between brands would re-scope its metrics and
// its git-sync target, so it is shown here as context, not as a control.
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { Bot } from 'lucide-react'
import { useBrands } from '@/app/brand-context'
import { BrandMarkChip } from '@/components/BrandMarkChip'
import { Button } from '@/components/flora/Button'
import {
  TAKEOVER_PANEL,
  TakeoverHeader,
  TakeoverMark,
  TakeoverSurface,
} from '@/components/takeover-parts'
import { useAgentRoster } from './agent-roster-store'
import { ChannelPicker, FIELD, Step } from './flow-parts'
import type { RosterAgent } from './roster-data'

function sameChannels(a: string[], b: Set<string>): boolean {
  return a.length === b.size && a.every((label) => b.has(label))
}

export function EditAgentFlow() {
  const { agentId } = useParams()
  const { agents } = useAgentRoster()
  const agent = agents.find((candidate) => candidate.id === agentId)

  // A stale deep link — the agent was deleted, or the id was never real. Bounce
  // rather than render an empty form that would save a phantom on submit.
  if (!agent) return <Navigate to="/agent-setup" replace />

  // Keyed by id so the form re-initialises if the route swaps one agent for
  // another without unmounting.
  return <EditAgentForm key={agent.id} agent={agent} />
}

function EditAgentForm({ agent }: { agent: RosterAgent }) {
  const navigate = useNavigate()
  const { brands, setCurrentAgent } = useBrands()
  const { updateAgent } = useAgentRoster()

  const [name, setName] = useState(agent.name)
  const [channels, setChannels] = useState<Set<string>>(() => new Set(agent.channels))
  // Both steps open from the start: unlike the wizard there is nothing to
  // reveal — every field already has a value the user came here to change.
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set([1, 2]))

  const brand = brands.find((candidate) => candidate.id === agent.brandId)
  const nameDone = name.trim().length > 0
  const channelsDone = channels.size > 0
  const changed = name.trim() !== agent.name || !sameChannels(agent.channels, channels)
  const canSave = nameDone && channelsDone && changed

  const toggleStep = (step: number) =>
    setOpenSteps((prev) => {
      const next = new Set(prev)
      if (next.has(step)) next.delete(step)
      else next.add(step)
      return next
    })

  const toggleChannel = (label: string) =>
    setChannels((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })

  const handleSave = () => {
    if (!canSave) return
    updateAgent(agent.id, { name: name.trim(), channels: Array.from(channels) })
    // As in the create flow: leaves the top bar naming the agent just edited,
    // and re-scopes the page to its brand.
    setCurrentAgent({ id: agent.id, brandId: agent.brandId })
    navigate('/agent-setup')
  }

  return (
    <TakeoverSurface data-testid="screen-edit-agent">
      <TakeoverHeader
        mark={
          <TakeoverMark className="bg-[#048c80]">
            <Bot size={16} aria-hidden />
          </TakeoverMark>
        }
        label="Agent Directory"
        title={name.trim() || agent.name}
      >
        <Button variant="outline" onClick={() => navigate('/agent-setup')}>
          Close
        </Button>
        {/* The frame's disabled Save is grey on grey, not a dimmed dark pill, so
            it overrides flora's default `disabled:opacity-50`. */}
        <Button
          variant="primary"
          disabled={!canSave}
          onClick={handleSave}
          className="disabled:border-transparent disabled:bg-[rgba(100,104,100,0.08)] disabled:text-[#8b8e89] disabled:opacity-100"
        >
          Save
        </Button>
      </TakeoverHeader>

      <div className={`min-h-0 flex-1 overflow-y-auto px-10 pt-4 pb-10 ${TAKEOVER_PANEL}`}>
        <div className="mx-auto max-w-[766px]">
          {/* Read-only brand, in the marker gutter's column so it reads as a
              caption over the steps rather than as a fourth step. */}
          <div className="flex items-center gap-2 pt-6">
            <span className="text-[12px] font-semibold leading-4 tracking-[0.2px] text-ink-muted">
              Brand
            </span>
            {brand ? <BrandMarkChip mark={brand.mark} size={20} /> : null}
            <span className="text-sm leading-5 text-ink">{brand?.name ?? agent.brandId}</span>
          </div>

          <Step
            index={1}
            title="Agent name"
            description="Name your agent based on what it will support."
            done={nameDone}
            isOpen={openSteps.has(1)}
            onToggle={() => toggleStep(1)}
          >
            <label htmlFor="agent-name" className="block text-sm font-semibold text-ink">
              Agent name
            </label>
            <input
              id="agent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Give your agent a name"
              className={FIELD}
            />
          </Step>

          <Step
            index={2}
            title="Channels"
            description="Add or remove the channels your agent supports."
            done={channelsDone}
            isOpen={openSteps.has(2)}
            onToggle={() => toggleStep(2)}
          >
            <ChannelPicker selected={channels} onToggle={toggleChannel} />
          </Step>
        </div>
      </div>
    </TakeoverSurface>
  )
}
