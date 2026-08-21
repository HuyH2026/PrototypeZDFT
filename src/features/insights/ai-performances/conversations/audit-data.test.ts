import { describe, expect, it } from 'vitest'
import {
  EVIDENCE_KINDS,
  IMPACT_STATES,
  OWNER_DOMAINS,
  STATE_META,
  allEvents,
  auditFor,
  countFor,
  errorCount,
  errorEvents,
  firstErrorExchange,
  formatLatency,
} from './audit-data'
import { CHANNELS, type ChannelKey } from './conversations-data'
import { groupIntoTurns } from './TurnAudit'

const IDS = ['g-1', 'g-2', 'g-3', 'g-4', 'g-5']

describe('audit-data', () => {
  it('carries an audit for each of the five Widget rows and nothing else', () => {
    for (const id of IDS) expect(auditFor(id)).toBeDefined()
    expect(auditFor('c-1')).toBeUndefined()
    expect(auditFor('nope')).toBeUndefined()
  })

  it('names an impact inside the union on every row', () => {
    for (const id of IDS) expect(IMPACT_STATES).toContain(auditFor(id)!.impact)
  })

  it('carries an owner exactly when the state is not healthy', () => {
    for (const id of IDS) {
      const a = auditFor(id)!
      if (a.state === 'healthy') {
        expect(a.owner).toBeUndefined()
      } else {
        expect(OWNER_DOMAINS).toContain(a.owner!)
      }
    }
  })

  it('preserves a trace ID on every audit', () => {
    const traceIds = IDS.map((id) => auditFor(id)!.traceId)
    for (const t of traceIds) expect(t.length).toBeGreaterThan(0)
    expect(new Set(traceIds).size).toBe(IDS.length)
  })

  it('covers three impact states and the triage owner across the set', () => {
    const impacts = new Set(IDS.map((id) => auditFor(id)!.impact))
    expect(impacts).toEqual(new Set(['Answer delivered', 'Fallback delivered', 'Delivery unknown']))
    const owners = IDS.map((id) => auditFor(id)!.owner)
    expect(owners).toContain('Unassigned / needs triage')
  })

  it('derives the error count from the events rather than an authored total', () => {
    const a = auditFor('g-1')!
    expect(errorCount(a)).toBe(allEvents(a).filter((e) => e.kind === 'error').length)
    expect(errorCount(a)).toBe(1)
    expect(errorCount(auditFor('g-2')!)).toBe(0)
  })

  it('every error event carries a category, a severity, an ID and a fix; no other kind does', () => {
    for (const id of IDS) {
      for (const e of allEvents(auditFor(id)!)) {
        if (e.kind === 'error') {
          expect(e.category?.length ?? 0).toBeGreaterThan(0)
          expect(['high', 'medium', 'low']).toContain(e.severity!)
          expect(e.errorId?.length ?? 0).toBeGreaterThan(0)
          expect(e.fix!.steps.length).toBeGreaterThan(0)
          expect(e.fix!.flowId.length).toBeGreaterThan(0)
          expect(e.fix!.flowName.length).toBeGreaterThan(0)
        } else {
          expect(e.category).toBeUndefined()
          expect(e.severity).toBeUndefined()
          expect(e.errorId).toBeUndefined()
          expect(e.fix).toBeUndefined()
        }
      }
    }
  })

  it('gives every event an explicit, non-negative latency', () => {
    for (const id of IDS) {
      for (const e of allEvents(auditFor(id)!)) {
        expect(Number.isFinite(e.latencyMs)).toBe(true)
        expect(e.latencyMs).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('cites every retrieval as title + version links, never article content', () => {
    for (const id of IDS) {
      for (const e of allEvents(auditFor(id)!)) {
        if (e.kind !== 'retrieval') continue
        expect(e.sources!.length).toBeGreaterThan(0)
        for (const s of e.sources!) {
          expect(s.title.length).toBeGreaterThan(0)
          expect(s.version).toMatch(/^v\d+$/)
          expect(s.href).toMatch(/^https:/)
        }
      }
    }
  })

  it('points at the first exchange holding an error, and -1 when there is none', () => {
    expect(firstErrorExchange(auditFor('g-1')!)).toBe(1)
    expect(firstErrorExchange(auditFor('g-2')!)).toBe(-1)
  })

  it("matches g-1's worked example counts", () => {
    const a = auditFor('g-1')!
    expect(allEvents(a)).toHaveLength(8)
    expect(countFor(a, 'intent')).toBe(2)
    expect(countFor(a, 'retrieval')).toBe(1)
    expect(countFor(a, 'api')).toBe(1)
    expect(countFor(a, 'tool')).toBe(0)
    expect(countFor(a, 'step')).toBe(3)
    expect(countFor(a, 'error')).toBe(1)
  })

  it('has a non-zero count for every evidence kind somewhere in the set', () => {
    for (const { kind } of EVIDENCE_KINDS) {
      const total = IDS.reduce((sum, id) => sum + countFor(auditFor(id)!, kind), 0)
      expect(total).toBeGreaterThan(0)
    }
  })

  it('gives every event a time and an evidence line', () => {
    for (const id of IDS) {
      for (const e of allEvents(auditFor(id)!)) {
        expect(e.time.length).toBeGreaterThan(0)
        expect(e.detail.length).toBeGreaterThan(0)
        expect(e.evidence.length).toBeGreaterThan(0)
      }
    }
  })

  it('gives each conversation state its own chip label and tone', () => {
    expect(STATE_META.healthy.label).toBe('Healthy')
    expect(STATE_META['partial failure'].label).toBe('Partial failure')
    expect(STATE_META.unresolved.label).toBe('Unresolved')
    const fills = new Set(Object.values(STATE_META).map((m) => m.bg))
    expect(fills.size).toBe(3)
  })
})

describe('errorEvents', () => {
  it('pairs each error with the exchange it failed in', () => {
    expect(errorEvents(auditFor('g-1')!).map((e) => e.exchange)).toEqual([1])
    expect(errorEvents(auditFor('g-4')!).map((e) => e.exchange)).toEqual([2])
    expect(errorEvents(auditFor('g-2')!)).toEqual([])
  })
})

describe('formatLatency', () => {
  it('renders sub-second latencies as milliseconds', () => {
    expect(formatLatency(0)).toBe('0ms')
    expect(formatLatency(410)).toBe('410ms')
    expect(formatLatency(999)).toBe('999ms')
  })

  it('renders second-scale latencies with a single trimmed decimal', () => {
    expect(formatLatency(1000)).toBe('1s')
    expect(formatLatency(1400)).toBe('1.4s')
    expect(formatLatency(10000)).toBe('10s')
  })
})

describe('audit wiring', () => {
  it('gives every Widget row an audit', () => {
    for (const row of CHANNELS.widget.rows) expect(row.detail.audit).toBeDefined()
  })

  it('gives no other channel an audit', () => {
    for (const k of ['voice', 'webcall', 'headless'] as ChannelKey[]) {
      for (const row of CHANNELS[k].rows) expect(row.detail.audit).toBeUndefined()
    }
  })

  it('aligns each audit with the exchanges derived from its transcript', () => {
    for (const row of CHANNELS.widget.rows) {
      expect(row.detail.audit!.exchanges).toHaveLength(groupIntoTurns(row.detail.transcript).length)
    }
  })

  it('names three non-healthy Widget rows for the table filter to find', () => {
    const failing = CHANNELS.widget.rows.filter((r) => r.detail.audit!.state !== 'healthy')
    expect(failing.map((r) => r.id)).toEqual(['g-1', 'g-3', 'g-4'])
  })

  it('leaves the shared Figma table previews untouched', () => {
    // The authored transcripts are drawer content; the table still previews the
    // three Figma lines, identically across the three generic channels.
    expect(CHANNELS.widget.rows[0].transcript).toEqual(CHANNELS.voice.rows[0].transcript)
  })
})
