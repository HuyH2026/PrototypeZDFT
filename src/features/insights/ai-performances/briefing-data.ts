// Data-only model for the AI Performance arrival briefing. An authored catalog of
// candidate findings plus a pure selector that gates them by threshold, dismiss,
// and "seen" memory, then ranks and caps at three. No React, no storage here —
// persistence and side effects live in ./use-briefing-memory.
import type { AiScope } from '@/features/ai-studio/ai-context-registry'

// An observation is a fact we can show plainly; a suspectedDriver is an inference
// and MUST be labeled as such in the UI so we never present inference as fact.
export type Evidence = { observation: string; suspectedDriver?: string }

export type BriefingFinding = {
  id: string // stable key for seen/dismissed memory
  scope: AiScope // reused by Investigate to prime the shared assistant
  metric: string
  headline: string
  deltaPct: number // signed; magnitude is threshold-gated
  threshold: number // minimum |deltaPct| to surface
  priority: number // higher ranks first
  evidence: Evidence
}

export type BriefingMemory = { dismissed: string[]; seen: Record<string, number> }

// How many "views" a dismissed-by-inaction (merely seen) finding stays suppressed
// before it may resurface. Views are a mock integer clock (no Date.now here).
export const COOLDOWN = 3

export const BRIEFING_CATALOG: BriefingFinding[] = [
  {
    id: 'reopens',
    scope: 'ai-performance-reopens',
    metric: 'Tickets reopened',
    headline: 'Tickets reopened are up 18%',
    deltaPct: 18,
    threshold: 10,
    priority: 3,
    evidence: {
      observation: 'Reopened tickets rose 18% week over week.',
      suspectedDriver: 'Concentrated in Billing widget conversations after Policy v2.4.',
    },
  },
  {
    id: 'csat',
    scope: 'ai-performance-csat',
    metric: 'CSAT',
    headline: 'CSAT dropped 12% on Voice',
    deltaPct: -12,
    threshold: 10,
    priority: 2,
    evidence: {
      observation: 'Voice-channel CSAT fell 12% over the last 7 days.',
      suspectedDriver: 'Longer handle times on the "view bank statement" workflow may be a factor.',
    },
  },
  {
    id: 'escalations',
    scope: 'ai-performance-escalations',
    metric: 'Escalation rate',
    headline: 'Escalations to a human are up 22%',
    deltaPct: 22,
    threshold: 10,
    priority: 1,
    evidence: {
      observation: 'Human-escalation rate rose 22% week over week.',
      suspectedDriver: 'Growth appears in the "update profile" intent after the last agent change.',
    },
  },
]

export function selectBriefings(
  catalog: BriefingFinding[],
  memory: BriefingMemory,
  views: number,
  cooldown: number,
): BriefingFinding[] {
  return catalog
    .filter((f) => Math.abs(f.deltaPct) >= f.threshold)
    .filter((f) => !memory.dismissed.includes(f.id))
    .filter((f) => {
      const seenAt = memory.seen[f.id]
      return seenAt === undefined || views - seenAt >= cooldown
    })
    .sort((a, b) => b.priority - a.priority || Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
    .slice(0, 3)
}
