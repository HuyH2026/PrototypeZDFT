import { useId, useLayoutEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import { animate, MotionConfig } from 'motion/react'
import { Card } from '@/components/flora/Card'
import { useReducedMotion } from '@/lib/chart-motion'
import { cn } from '@/lib/cn'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'
import { useSelfImprovementPlans } from '@/features/ai-studio/self-improving/self-improvement-store'
import type { LevelData } from '../dashboard-data'
import { HealthHeroBand } from './HealthHeroBand'
import { HealthMetricCard } from './HealthMetricCard'

const EASE_SOFT = [0.33, 0.85, 0.4, 1] as const
const LAYOUT_TRANSITION = { duration: 0.26, ease: EASE_SOFT } as const

export function AgentHealthCard({ data }: { data: LevelData }) {
  // The design's only control: it reveals or hides the per-channel columns. It
  // does NOT re-scope the numbers — the previous card's channel filter is gone.
  const [showBreakdown, setShowBreakdown] = useState(true)
  const reducedMotion = useReducedMotion()
  const checkboxId = useId()
  const contentRef = useRef<HTMLDivElement>(null)
  const previousHeightRef = useRef<number | null>(null)
  const heightAnimationRef = useRef<{ stop: () => void } | null>(null)
  const { plans } = useSelfImprovementPlans()
  const activePlans = Object.values(plans)

  // Metric-card layout projection is transform-only, so it cannot reserve space
  // for the projected second row. Animate the Card's real height on the same
  // timeline to keep every later widget in this dashboard column below it.
  const setBreakdown = (next: boolean) => {
    if (!reducedMotion) {
      const card = contentRef.current?.parentElement
      if (card) previousHeightRef.current = card.getBoundingClientRect().height
    }
    setShowBreakdown(next)
  }

  useLayoutEffect(() => {
    const card = contentRef.current?.parentElement
    const previousHeight = previousHeightRef.current
    previousHeightRef.current = null
    if (!card || previousHeight === null || reducedMotion) return

    heightAnimationRef.current?.stop()
    card.style.height = 'auto'
    const nextHeight = card.getBoundingClientRect().height
    card.style.height = `${previousHeight}px`

    const animation = animate(card, { height: [previousHeight, nextHeight] }, LAYOUT_TRANSITION)
    heightAnimationRef.current = animation
    void animation.then(() => {
      if (heightAnimationRef.current !== animation) return
      card.style.height = 'auto'
      heightAnimationRef.current = null
    })
  }, [reducedMotion, showBreakdown])

  useLayoutEffect(() => {
    if (!reducedMotion) return
    heightAnimationRef.current?.stop()
    heightAnimationRef.current = null
    const card = contentRef.current?.parentElement
    if (card) card.style.height = 'auto'
  }, [reducedMotion])

  return (
    <MotionConfig reducedMotion="user">
      {/* Glass by default, like every other dashboard widget — this shell must not
          opt out with `flat`, or it reads as a different surface than Improved
          policies and its neighbors. The Card primitive carries no padding of its
          own, so the frame's 24px inset is declared here; the grid then starts 15px
          below the header's baseline. */}
      <Card data-testid="card-health" className="@container p-[24px]">
        <div ref={contentRef}>
          <div className="mb-[15px] flex items-center justify-between">
            <div className="flex items-center gap-[8px]">
              <Heart size={20} color="#724be8" aria-hidden />
              <h2 className="text-[18px] font-normal leading-[24px] tracking-[-0.45px] text-[#313131]">
                Overall agent health
              </h2>
            </div>
            <div className="flex items-center gap-[7px]">
              {/* The aggregate-health widget is exactly where "is anything
                  struggling?" belongs, so this opens the survey rather than the
                  page assistant. */}
              <AiTriggerButton
                scope="self-improving"
                mode="full"
                variant="ghost"
                label="Check agent health with AI"
              />
              <input
                id={checkboxId}
                type="checkbox"
                checked={showBreakdown}
                onChange={(e) => setBreakdown(e.target.checked)}
                className="size-[14px] shrink-0 accent-[#048c80]"
              />
              <label
                htmlFor={checkboxId}
                className="text-[12px] font-medium leading-[17px] tracking-[-0.085px] text-black"
              >
                Channel breakdown
              </label>
            </div>
          </div>
          {activePlans.length > 0 && (
            <p
              data-testid="health-self-improving"
              className="mb-[15px] text-[12px] font-medium leading-[17px] tracking-[-0.085px] text-[#724be8]"
            >
              {activePlans.length === 1
                ? `${activePlans[0].agentName} is on a self-improving plan — ${activePlans[0].weekLabel}`
                : `${activePlans.length} agents are on self-improving plans`}
            </p>
          )}
          {/* The hero intentionally sits outside the reflowing metric grid. Container
          queries, not the viewport, select one/two columns in expanded mode and
          two/four columns in compact mode as the card itself narrows. */}
          <div className="grid gap-y-[19px]">
            <HealthHeroBand digest={data.healthDigest} />
            <div
              data-testid="health-metric-grid"
              data-layout={showBreakdown ? 'expanded' : 'compact'}
              className={cn(
                'grid gap-x-[18px] gap-y-[19px]',
                showBreakdown
                  ? 'grid-cols-1 @[680px]:grid-cols-2'
                  : 'grid-cols-2 @[840px]:grid-cols-4',
              )}
            >
              {data.metrics.map((metric) => (
                <HealthMetricCard
                  key={metric.key}
                  metric={metric}
                  showBreakdown={showBreakdown}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </MotionConfig>
  )
}
