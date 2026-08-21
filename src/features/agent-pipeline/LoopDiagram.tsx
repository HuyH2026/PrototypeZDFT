// The outer loop, drawn. Ported from a supplied React component
// (ai-agent-pipeline.tsx) with its subject replaced: the trigger is a scheduled
// wake rather than a user query, the vector search is the loop's memory, and the
// outputs are the four outcome lanes (agent-pipeline spec, Decision 1).
//
// Palette lives in CSS custom properties on the root, not in the JSX, so the
// whole card can be re-themed by swapping variable values (Decision 4).
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { LANES, LANE_LABEL, type Cycle, type LoopConfig, type OutcomeLane } from './pipeline-data'

/** The supplied component's cadence, kept. */
export const TICKER_STEP_MS = 2700

export type LoopDiagramProps = {
  loop: LoopConfig
  cycle: Cycle
  counts: Record<OutcomeLane, number>
  paused: boolean
  totalCycles: number
  managedCount: number
  /** How many experiment outcomes and declined constraints memory holds. */
  memoryTried: number
  /** How many remembered experiments were ruled out; declined constraints stay separate. */
  memoryRuledOut: number
}

const LANE_DOT: Record<OutcomeLane, string> = {
  deployed: 'var(--flora-green)',
  testing: 'var(--pipe-accent)',
  held: '#d4870b',
  'rolled-back': 'var(--flora-red)',
}

const LOOP_LANE_LABEL: Record<OutcomeLane, string> = {
  ...LANE_LABEL,
  deployed: 'Applied',
  held: 'Pending asks',
}

function Wire({ delays, paused }: { delays: number[]; paused: boolean }) {
  return (
    <div
      aria-hidden
      className="relative mx-2 h-px min-w-4 flex-1"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to right, var(--pipe-accent) 0 3px, transparent 3px 8px)',
        opacity: 0.55,
      }}
    >
      {delays.map((delay, index) => (
        <span
          key={delay}
          className={cn('absolute -top-[2px] block rounded-full', !paused && 'animate-loop-wire')}
          style={
            {
              width: index === 0 ? 5 : 3.5,
              height: index === 0 ? 5 : 3.5,
              background: 'var(--pipe-accent)',
              '--loop-wire-delay': `${delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

function Node({
  eyebrow,
  title,
  meta,
  accent = false,
  children,
}: {
  eyebrow: string
  title: string
  meta: string
  accent?: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'shrink-0 rounded-lg border px-3 py-2',
        accent ? 'border-[var(--pipe-accent)]' : 'border-[var(--pipe-node-border)]',
      )}
      style={{ background: accent ? 'var(--pipe-node-accent)' : 'var(--pipe-node)' }}
    >
      <span
        className="block text-[9px] tracking-[0.08em]"
        style={{ color: accent ? 'var(--pipe-accent-fg)' : 'var(--pipe-label)' }}
      >
        {eyebrow}
      </span>
      <span className="mt-1 block text-[13px]" style={{ color: 'var(--pipe-value)' }}>
        {title}
      </span>
      {children}
      <span className="mt-1 block font-mono text-[9px]" style={{ color: 'var(--pipe-label-dim)' }}>
        {meta}
      </span>
    </div>
  )
}

export function LoopDiagram({
  loop,
  cycle,
  counts,
  paused,
  totalCycles,
  managedCount,
  memoryTried,
  memoryRuledOut,
}: LoopDiagramProps) {
  const [line, setLine] = useState(0)

  // Restart on the selected cycle's first line: the ticker is a replay of that
  // cycle's journal, not a rolling feed, so carrying an index across cycles
  // would open a short journal mid-sentence.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a selected journal replay starts at entry one
    setLine(0)
  }, [cycle.id])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      setLine((previous) => (previous + 1) % cycle.journal.length)
    }, TICKER_STEP_MS)
    return () => clearInterval(timer)
  }, [cycle.id, cycle.journal.length, paused])

  const stats: { key: string; label: string; value: string; testId: string }[] = [
    { key: 'cycles', label: 'CYCLES', value: String(totalCycles), testId: 'stat-cycles' },
    { key: 'managed', label: 'LIVE AGENTS', value: String(managedCount), testId: 'stat-managed' },
    {
      key: 'ttf',
      label: 'MEDIAN TIME-TO-FIX',
      value: loop.medianTimeToFix,
      testId: 'stat-time-to-fix',
    },
  ]

  return (
    <div data-testid="loop-diagram">
      <div
        data-testid="loop-diagram-root"
        data-loop-state={paused ? 'paused' : 'autonomous'}
        className="overflow-hidden rounded-[20px] border"
        style={
          {
            '--pipe-surface': 'var(--color-nav-active)',
            '--pipe-node': '#323d45',
            '--pipe-node-accent': '#20303f',
            '--pipe-node-border': 'rgba(255,255,255,0.11)',
            '--pipe-border': '#1e252a',
            '--pipe-divider': 'rgba(255,255,255,0.09)',
            '--pipe-label': 'rgba(255,255,255,0.62)',
            '--pipe-label-dim': 'rgba(255,255,255,0.52)',
            '--pipe-value': 'rgba(255,255,255,0.90)',
            // A lifted --color-accent-blue: #406cc4 does not carry on #293239.
            '--pipe-accent': '#7fa3e8',
            '--pipe-accent-fg': '#a9c2f0',
            background: 'var(--pipe-surface)',
            borderColor: 'var(--pipe-border)',
          } as React.CSSProperties
        }
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-3"
          style={{ borderColor: 'var(--pipe-divider)' }}
        >
          <span
            className="flex items-center gap-2 text-[10px] tracking-[0.1em]"
            style={{ color: 'var(--pipe-label)' }}
          >
            <span
              aria-hidden
              className={cn('block size-1.5 rounded-full', !paused && 'animate-loop-pulse')}
              style={{ background: paused ? 'var(--pipe-label)' : 'var(--flora-green)' }}
            />
            {paused ? 'OUTER LOOP · PAUSED' : 'OUTER LOOP · MIXED AUTHORITY'}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--pipe-label-dim)' }}>
            {loop.scopeLabel} · next wake {loop.nextWakeLabel}
          </span>
        </div>

        {/* The loop */}
        <div className="flex items-center px-5 py-6">
          <Node eyebrow="SCHEDULE" title={loop.scheduleLabel} meta={loop.cadence} />
          <Wire delays={[0, 0.35, 0.7]} paused={paused} />
          <Node
            eyebrow="MEMORY"
            title="Prior outcomes"
            meta={`${memoryTried} remembered · ${memoryRuledOut} ruled out`}
          />
          <Wire delays={[0.18, 0.62]} paused={paused} />
          <Node eyebrow="OPERATOR" title="Deciding" meta={loop.operatorLabel} accent>
            <span aria-hidden className="mt-1 flex gap-1">
              {[0, 0.4, 0.8].map((delay) => (
                <span
                  key={delay}
                  className={cn('block size-[3px] rounded-full', !paused && 'animate-loop-pulse')}
                  style={
                    {
                      background: 'var(--pipe-accent)',
                      '--loop-pulse-delay': `${delay}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </span>
          </Node>
          <Wire delays={[0.28, 0.85]} paused={paused} />
          <ul className="flex shrink-0 flex-col gap-1">
            {LANES.map((lane) => (
              <li
                key={lane}
                data-testid={`lane-${lane}`}
                className="flex items-center justify-between gap-4 rounded-md border px-2.5 py-1"
                style={{
                  background: 'var(--pipe-node)',
                  borderColor: 'var(--pipe-node-border)',
                  color: 'var(--pipe-value)',
                }}
              >
                <span className="flex items-center gap-2 text-[11px]">
                  <span
                    aria-hidden
                    className="block size-1.5 rounded-full"
                    style={{ background: LANE_DOT[lane] }}
                  />
                  {LOOP_LANE_LABEL[lane]}
                </span>
                <span data-testid="lane-count" className="font-mono text-[11px]">
                  {counts[lane]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Return edge — without it the drawing is a funnel, not a loop */}
        <div
          data-testid="loop-return-edge"
          className="mx-5 mb-1 flex h-5 items-end justify-center rounded-b-lg border-x border-b border-dashed"
          style={{ borderColor: 'var(--pipe-accent)', opacity: 0.5 }}
        >
          <span
            className="translate-y-1/2 px-2 text-[9px] tracking-[0.08em]"
            style={{ background: 'var(--pipe-surface)', color: 'var(--pipe-accent-fg)' }}
          >
            learns
          </span>
        </div>

        {/* Ticker — a replay of the selected cycle's immutable close record */}
        <div
          className="flex gap-2 border-t px-5 py-3"
          style={{ borderColor: 'var(--pipe-divider)' }}
        >
          <span
            aria-hidden
            className="font-mono text-[13px]"
            style={{ color: 'var(--pipe-accent)' }}
          >
            ›
          </span>
          <div className="min-w-0">
            <p
              data-testid="loop-ticker-label"
              className="text-[9px] tracking-[0.09em]"
              style={{ color: 'var(--pipe-label-dim)' }}
            >
              {paused ? 'LOOP STATUS' : `CYCLE #${cycle.ordinal} · CLOSE RECORD`}
            </p>
            <p
              data-testid="loop-ticker"
              aria-label={
                paused ? 'Loop status' : `Cycle ${cycle.ordinal} close-record journal entry`
              }
              key={paused ? 'paused' : `${cycle.id}-${line}`}
              className="animate-fade-in font-mono text-[11px] leading-[1.55]"
              style={{ color: 'var(--pipe-value)' }}
            >
              {paused
                ? 'No new diagnostic passes or actions will run while paused. Resume the loop to continue.'
                : cycle.journal[line]}
            </p>
          </div>
        </div>

        {/* Stats */}
        <dl
          className="flex gap-10 border-t px-5 py-3"
          style={{ borderColor: 'var(--pipe-divider)' }}
        >
          {stats.map((stat) => (
            <div key={stat.key}>
              <dt
                className="text-[9px] tracking-[0.09em]"
                style={{ color: 'var(--pipe-label-dim)' }}
              >
                {stat.label}
              </dt>
              <dd
                data-testid={stat.testId}
                className="mt-0.5 font-mono text-[16px]"
                style={{ color: 'var(--pipe-value)' }}
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
