import { describe, expect, it } from 'vitest'
import { CHANNELS } from '@/features/ai-agents/agent-builder-data'
import {
  ATTENTION_AGENT_IDS,
  FINDINGS,
  findingsForAgent,
  INITIAL_MANAGEMENT_MODES,
  MANAGEMENT_MODE_LABEL,
  modeCounts,
  OUTCOME_METRICS,
  projectedOutcomeImpactForAgent,
  topFindingForAgent,
  type ManagementMode,
} from './cockpit-data'

describe('outcome contract', () => {
  it('sets the entitlement target from the prototype brief', () => {
    const entitlement = OUTCOME_METRICS.find((metric) => metric.id === 'entitlement-consumption')

    expect(entitlement).toMatchObject({
      current: 38_400,
      target: 50_000,
      format: 'compact-number',
    })
  })

  it('sets the cost-avoided target from the prototype brief', () => {
    const costAvoided = OUTCOME_METRICS.find((metric) => metric.id === 'cost-avoided')

    expect(costAvoided).toMatchObject({
      current: 312_000,
      target: 450_000,
      format: 'currency',
    })
  })

  it('lets AI resolution rate maximize toward 100% with no editable target', () => {
    const resolution = OUTCOME_METRICS.find((metric) => metric.id === 'ai-resolution-rate')

    expect(resolution).toMatchObject({ current: 42.1, format: 'percent' })
    expect(resolution).not.toHaveProperty('target')
    expect(resolution).not.toHaveProperty('hardFloor')
  })

  it('treats CSAT as a hard floor rather than a growth target', () => {
    const csat = OUTCOME_METRICS.find((metric) => metric.id === 'ai-interaction-csat')

    expect(csat).toMatchObject({ current: 4.21, hardFloor: 4.17, format: 'rating' })
    expect(csat).not.toHaveProperty('target')
    expect(csat!.current).toBeGreaterThan(csat!.hardFloor!)
  })

  it('treats policy compliance as a second hard floor', () => {
    const compliance = OUTCOME_METRICS.find((metric) => metric.id === 'policy-compliance-rate')

    expect(compliance).toMatchObject({ current: 99.6, hardFloor: 99.0, format: 'percent' })
    expect(compliance).not.toHaveProperty('target')
    expect(compliance!.current).toBeGreaterThan(compliance!.hardFloor!)
  })

  it('contains exactly the five customer-facing outcome metrics', () => {
    expect(OUTCOME_METRICS).toHaveLength(5)
  })
})

describe('attention ranking and findings', () => {
  it('ranks exactly four unique agents by aggregate projected outcome impact', () => {
    expect(ATTENTION_AGENT_IDS).toHaveLength(4)
    expect(new Set(ATTENTION_AGENT_IDS).size).toBe(4)
    expect(ATTENTION_AGENT_IDS).toEqual(['w8', 'w2', 'v1', 'c1'])

    const impacts = ATTENTION_AGENT_IDS.map(projectedOutcomeImpactForAgent)
    expect(impacts).toEqual([...impacts].sort((left, right) => right - left))
  })

  it('supports one finding targeting more than one managed agent', () => {
    const shared = FINDINGS.find((finding) => finding.targetAgentIds.length > 1)

    expect(shared?.targetAgentIds).toEqual(['w8', 'w2'])
    expect(findingsForAgent('w8')).toContain(shared)
    expect(findingsForAgent('w2')).toContain(shared)
  })

  it('selects the highest-impact finding for an agent', () => {
    expect(topFindingForAgent('w8')?.id).toBe('password-reset-lockout-language')
    expect(topFindingForAgent('unknown-agent')).toBeUndefined()
  })

  it('keeps findings keyed to real seeded agents and gives every mode a CTA', () => {
    const seededIds = new Set(
      CHANNELS.flatMap((channel) => channel.agents.map((agent) => agent.id)),
    )
    const modes: ManagementMode[] = ['shadow', 'suggest', 'full']

    for (const finding of FINDINGS) {
      expect(finding.targetAgentIds.every((agentId) => seededIds.has(agentId))).toBe(true)
      expect(finding.evidence.length).toBeGreaterThan(0)
      expect(finding.confidence).toBeGreaterThan(0)
      expect(finding.confidence).toBeLessThanOrEqual(100)
      for (const mode of modes) expect(finding.ctaByMode[mode]).toBeTruthy()
    }
  })
})

describe('management modes', () => {
  it('labels all three trust modes', () => {
    expect(MANAGEMENT_MODE_LABEL).toEqual({
      shadow: 'Shadow',
      suggest: 'Suggest',
      full: 'Full',
    })
  })

  it('covers the complete seeded fleet with an even mix of modes', () => {
    const seededIds = CHANNELS.flatMap((channel) => channel.agents.map((agent) => agent.id)).sort()

    expect(Object.keys(INITIAL_MANAGEMENT_MODES).sort()).toEqual(seededIds)
    // 39 seeded agents — Web Call's four join (frame 120:57534) while the
    // outbound voice redesign in flight drops v10. The mix is near-even.
    expect(modeCounts()).toEqual({ shadow: 13, suggest: 13, full: 13 })
  })

  it('counts an edited mode record without mutating the initial fixtures', () => {
    const edited = { ...INITIAL_MANAGEMENT_MODES, w8: 'full' as const }

    expect(modeCounts(edited)).toEqual({ shadow: 13, suggest: 12, full: 14 })
    expect(INITIAL_MANAGEMENT_MODES.w8).toBe('suggest')
  })
})
