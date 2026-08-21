// Serves /agent-setup/new — a full-app takeover, the same shell the Knowledge
// and AI QA drill-ins wear (see components/takeover-parts). It is still a child
// route of /agent-setup, so the roster stays mounted underneath and closing
// reveals it exactly as the user left it; what the takeover gives up is the
// chrome, which the earlier layer (frame 1833:90142) kept visible.
// No AI trigger and no assistant host of its own: the frame's header is Close
// and Save alone, and AppLayout already hosts the assistant beneath this layer.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Bot, Building2, Plus } from 'lucide-react'
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

// Frame 1844:116881: icon over label, nothing else — the tiles carry no
// description line, and their spacing matches the channel tiles below.
function ModeTile({
  label,
  Icon,
  color,
  selected,
  onSelect,
}: {
  label: string
  Icon: typeof Plus
  color: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex h-[120px] flex-col items-center justify-center gap-4 rounded-xl border border-flora-divider bg-white px-4 text-center outline-none transition-shadow"
      style={{ boxShadow: selected ? '0 0 0 2px #373a4d inset' : undefined }}
    >
      <span
        className="flex size-11 items-center justify-center rounded-[22px]"
        style={{ backgroundColor: color }}
      >
        <Icon size={22} className="text-white" strokeWidth={2} aria-hidden />
      </span>
      <span className="text-sm font-semibold leading-5 text-ink">{label}</span>
    </button>
  )
}

export function CreateAgentFlow() {
  const navigate = useNavigate()
  const { brands, addBrand, setCurrentAgent } = useBrands()
  const { createAgent } = useAgentRoster()

  const [brandMode, setBrandMode] = useState<'new' | 'existing' | null>(null)
  const [newBrandName, setNewBrandName] = useState('')
  const [existingBrandId, setExistingBrandId] = useState<string | null>(null)
  const [agentName, setAgentName] = useState('')
  const [channels, setChannels] = useState<Set<string>>(new Set())
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set([1]))

  const brandDone = brandMode === 'new' ? newBrandName.trim().length > 0 : existingBrandId !== null
  const nameDone = agentName.trim().length > 0
  const channelsDone = channels.size > 0
  const canSave = brandDone && nameDone && channelsDone

  // Reveal-once ledger: a completed step opens the next one, but only the first
  // time, so a step the user collapsed by hand stays collapsed.
  const revealed = useRef<Set<number>>(new Set())
  const reveal = useCallback((step: number) => {
    if (revealed.current.has(step)) return
    revealed.current.add(step)
    setOpenSteps((prev) => new Set(prev).add(step))
  }, [])
  useEffect(() => {
    if (brandDone) reveal(2)
  }, [brandDone, reveal])
  useEffect(() => {
    if (nameDone) reveal(3)
  }, [nameDone, reveal])

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
    const selected = Array.from(channels)
    const brandId =
      brandMode === 'new' ? addBrand(newBrandName.trim(), selected).id : existingBrandId
    if (!brandId) return
    // setCurrentAgent, not setCurrentBrand: it sets the brand too, and it leaves
    // the top bar naming the agent just created rather than whichever agent the
    // brand happened to have first.
    const agentId = createAgent({ brandId, name: agentName.trim(), channels: selected })
    setCurrentAgent({ id: agentId, brandId })
    navigate('/agent-setup')
  }

  return (
    <TakeoverSurface data-testid="screen-create-agent">
      {/* The takeover header, not the frame's own hairline lid: this is the
          fourth drill-in to wear it, and the centre cell names the agent as it
          is typed rather than repeating the action. Still Close and Save alone —
          no AI trigger. */}
      <TakeoverHeader
        mark={
          <TakeoverMark className="bg-[#048c80]">
            <Bot size={16} aria-hidden />
          </TakeoverMark>
        }
        label="Agent Directory"
        title={agentName.trim() || 'Create new agent'}
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

      {/* One full-width panel: the wizard is a single column of steps with
          nothing to put in a right rail. The panel is what scrolls — the header
          above it is laid out, not sticky. The centred block is 766px, the 680px
          content column plus the marker gutter to its left. */}
      <div className={`min-h-0 flex-1 overflow-y-auto px-10 pt-4 pb-10 ${TAKEOVER_PANEL}`}>
        <div className="mx-auto max-w-[766px]">
          <Step
            index={1}
            title="Brand"
            description="Create or select a brand, such as a department, region, or product line."
            done={brandDone}
            isOpen={openSteps.has(1)}
            onToggle={() => toggleStep(1)}
          >
            <div className="grid grid-cols-2 gap-4">
              <ModeTile
                label="Create new"
                Icon={Plus}
                color="#048c80"
                selected={brandMode === 'new'}
                onSelect={() => {
                  setBrandMode('new')
                  setExistingBrandId(null)
                }}
              />
              <ModeTile
                label="Select existing"
                Icon={Building2}
                color="#a5bae5"
                selected={brandMode === 'existing'}
                onSelect={() => {
                  setBrandMode('existing')
                  setNewBrandName('')
                }}
              />
            </div>

            {brandMode === 'new' && (
              <div className="mt-6">
                <label htmlFor="brand-name" className="block text-sm font-semibold text-ink">
                  Brand name
                </label>
                <input
                  id="brand-name"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Give your brand a name"
                  className={FIELD}
                />
              </div>
            )}

            {brandMode === 'existing' && (
              <div className="mt-6 flex flex-col gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => setExistingBrandId(brand.id)}
                    // Explicit, so the row is addressable by the brand name
                    // alone however the chip beside it changes.
                    aria-label={brand.name}
                    aria-pressed={existingBrandId === brand.id}
                    className="flex h-[56px] items-center gap-3 rounded-xl border border-flora-divider bg-white px-4 text-left outline-none"
                    style={{
                      boxShadow:
                        existingBrandId === brand.id ? '0 0 0 2px #373a4d inset' : undefined,
                    }}
                  >
                    <BrandMarkChip mark={brand.mark} />
                    <span className="text-sm leading-5 text-ink">{brand.name}</span>
                  </button>
                ))}
              </div>
            )}
          </Step>

          <Step
            index={2}
            title="Agent name"
            description="Name your agent based on what it will support."
            done={nameDone}
            isOpen={openSteps.has(2)}
            onToggle={() => toggleStep(2)}
          >
            <label htmlFor="agent-name" className="block text-sm font-semibold text-ink">
              Agent name
            </label>
            <input
              id="agent-name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Give your agent a name"
              className={FIELD}
            />
          </Step>

          <Step
            index={3}
            title="Channels"
            description="Choose the channels your agent will support. You can change them later."
            done={channelsDone}
            isOpen={openSteps.has(3)}
            onToggle={() => toggleStep(3)}
          >
            <ChannelPicker selected={channels} onToggle={toggleChannel} />
          </Step>
        </div>
      </div>
    </TakeoverSurface>
  )
}
