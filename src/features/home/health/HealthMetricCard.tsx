import { forwardRef } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { AnimatePresence, motion, useIsPresent } from 'motion/react'
import { AGENT_CHANNELS } from '@/lib/channel-meta'
import { cn } from '@/lib/cn'
import type { HealthMetric } from '../dashboard-data'

const INK = '#313131'
// The channel labels sit a step lighter than the card's body ink, so the brand-
// colored icon beside them carries the row. Both values come from the frame.
const LABEL = '#9194a0'
const HAIRLINE = '#eee'
const GOOD_FG = '#048c80'
const GOOD_BG = '#e6f4f2'
const BAD_FG = '#e53112'
const BAD_BG = '#fceae7'

const EASE_SOFT = [0.33, 0.85, 0.4, 1] as const
const LAYOUT_TRANSITION = { duration: 0.26, ease: EASE_SOFT } as const
const NO_TRANSITION = { duration: 0 } as const
const DETAIL_EXIT = { duration: 0.16, ease: EASE_SOFT } as const
const DETAIL_ENTER = { ...DETAIL_EXIT, delay: 0.1 } as const

type HealthMetricCardProps = {
  metric: HealthMetric
  showBreakdown: boolean
  reducedMotion?: boolean
}

type MetricBreakdownProps = {
  metric: HealthMetric
  animated: boolean
}

const MetricBreakdown = forwardRef<HTMLDivElement, MetricBreakdownProps>(function MetricBreakdown(
  { metric, animated },
  ref,
) {
  const isPresent = useIsPresent()
  const byKey = new Map(metric.byChannel.map((channel) => [channel.key, channel]))

  return (
    <motion.div
      ref={ref}
      data-testid="metric-breakdown"
      aria-hidden={isPresent ? undefined : true}
      className="ml-[22px] flex min-w-0 flex-1 items-start"
      initial={animated ? { opacity: 0 } : false}
      animate={{
        opacity: 1,
        transition: animated ? DETAIL_ENTER : NO_TRANSITION,
      }}
      exit={animated ? { opacity: 0, transition: DETAIL_EXIT } : undefined}
    >
      <div
        aria-hidden
        className="mr-[53px] mt-[4px] h-[111px] w-px shrink-0"
        style={{ backgroundColor: HAIRLINE }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-[9px]">
        {AGENT_CHANNELS.map(({ key, label, color, Icon }) => {
          const datum = byKey.get(key)
          if (!datum) return null
          return (
            <div key={key} className="flex h-[22px] items-center justify-between gap-2">
              <span className="flex items-center gap-[4px]" style={{ color: LABEL }}>
                <Icon size={17} aria-hidden style={{ color }} />
                <span className="text-[12.9px] font-normal leading-[17.19px]">{label}</span>
              </span>
              <span
                className="text-[15px] font-normal leading-[21.5px] tracking-[-0.1655px]"
                style={{ color: metric.accentColor ?? INK }}
              >
                {datum.value}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
})

export function HealthMetricCard({
  metric,
  showBreakdown,
  reducedMotion = false,
}: HealthMetricCardProps) {
  // The arrow shows which way the number moved; the color shows whether that
  // direction is good for this particular metric. Escalations falling is green.
  const good = metric.up === metric.goodWhenUp
  const Trend = metric.up ? TrendingUp : TrendingDown
  const layoutTransition = reducedMotion ? NO_TRANSITION : LAYOUT_TRANSITION

  return (
    <motion.div
      layout
      layoutDependency={showBreakdown}
      data-slot="health-metric"
      data-layout={showBreakdown ? 'expanded' : 'compact'}
      className="h-full overflow-clip border border-solid border-[#eee] bg-white p-[15px]"
      style={{ borderRadius: 16 }}
      transition={layoutTransition}
    >
      <motion.p
        layout="position"
        transition={layoutTransition}
        className="text-[14px] font-semibold leading-[20px] tracking-[-0.154px]"
        style={{ color: INK }}
      >
        {metric.label}
      </motion.p>
      <motion.div
        layout
        transition={layoutTransition}
        className={cn('relative flex', showBreakdown ? 'items-start' : 'mt-[10px] items-center')}
      >
        <motion.div
          layout
          transition={layoutTransition}
          data-slot="health-metric-summary"
          className={cn(
            'flex shrink-0',
            showBreakdown
              ? 'w-[127px] flex-col items-start pl-[22px] pt-[25px]'
              : 'min-w-0 flex-row items-center gap-[8px]',
          )}
        >
          <motion.p
            layout="position"
            transition={layoutTransition}
            data-testid="metric-value"
            className="text-[36px] font-normal leading-[44px] tracking-[0.396px]"
            style={{ color: metric.accentColor ?? INK }}
          >
            {metric.value}
          </motion.p>
          <motion.span
            layout="position"
            transition={layoutTransition}
            data-testid="metric-delta"
            className={cn(
              'flex h-[22px] items-center gap-[4px] rounded-[20px] px-[8px] py-[4px]',
              showBreakdown ? 'mt-[11px]' : 'mt-0',
            )}
            style={{
              color: good ? GOOD_FG : BAD_FG,
              backgroundColor: good ? GOOD_BG : BAD_BG,
            }}
          >
            <span className="sr-only">{metric.up ? 'up' : 'down'}</span>
            <span className="text-[12px] font-medium leading-[18px] tracking-[-0.1px]">
              {metric.delta}
            </span>
            <Trend size={16} aria-hidden data-testid={metric.up ? 'trend-up' : 'trend-down'} />
          </motion.span>
        </motion.div>

        {reducedMotion ? (
          showBreakdown ? (
            <MetricBreakdown metric={metric} animated={false} />
          ) : null
        ) : (
          <AnimatePresence initial={false} mode="popLayout">
            {showBreakdown && (
              <MetricBreakdown key={`${metric.key}-breakdown`} metric={metric} animated />
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  )
}
