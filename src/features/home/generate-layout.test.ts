import { describe, it, expect } from 'vitest'
import {
  generateLayout, ROLES, FOCUS_AREAS, PM_WIDGET_ID_LIST, DEFAULT_PM_LAYOUT,
  focusesFromPrompt, roleFromPrompt, composeDashboardPrompt, wantsPmDashboard,
  wantsExecutiveDashboard,
  type Role, type PmWidgetId,
} from './generate-layout'

const ALL_IDS = [
  'health', 'qa', 'gaps', 'approvals', 'notifications',
  'cost', 'activity', 'intents', 'policies', 'knowledge',
]

// generateLayout deals the ranking alternately into the two columns, so a
// widget's rank is its column position doubled (left) plus one (right). Reading
// rank back out is the only way to assert on ranking rather than on which column
// a widget happened to land in.
function rankOf(layout: { left: string[]; right: string[] }, id: string): number {
  const left = layout.left.indexOf(id)
  if (left !== -1) return left * 2
  return layout.right.indexOf(id) * 2 + 1
}

describe('generateLayout', () => {
  it('exposes the picker’s five roles and five focus areas in order', () => {
    expect(ROLES.map((r) => r.key)).toEqual(['ops', 'pm', 'cs', 'knowledge', 'exec'])
    expect(ROLES.map((r) => r.label)).toEqual([
      'Ops lead', 'Product Manager', 'CS Lead', 'Knowledge Manager', 'Executive',
    ])
    expect(FOCUS_AREAS.map((f) => f.key)).toEqual([
      'health', 'quality', 'cost', 'gaps', 'lifecycle',
    ])
    expect(FOCUS_AREAS.map((f) => f.label)).toEqual([
      'Agent health and trends', 'Quality and testing', 'Cost and efficiency',
      'Feature gaps and requirements', 'Product lifecycle',
    ])
  })

  it('only ever emits valid widget ids with no duplicates across columns', () => {
    const gridRoles = ROLES.map((r) => r.key).filter((r) => r !== 'pm') as Role[]
    for (const role of gridRoles) {
      const layout = generateLayout({ role, focuses: [] })
      const all = [...layout.left, ...layout.right]
      expect(all.every((id) => ALL_IDS.includes(id))).toBe(true)
      expect(new Set(all).size).toBe(all.length)
      expect(all.length).toBeGreaterThan(0)
    }
  })

  it('always includes the core widgets (health, approvals)', () => {
    const layout = generateLayout({ role: 'exec', focuses: [] })
    const all = [...layout.left, ...layout.right]
    expect(all).toContain('health')
    expect(all).toContain('approvals')
  })

  it('nudges core widgets (health, approvals) ahead in tie-break scenarios', () => {
    // health focus tags 'approvals', 'activity' and 'notifications' alike, so all
    // three tie — the +0.5 core nudge is what puts 'approvals' ahead.
    const layout = generateLayout({ role: 'knowledge', focuses: ['health'] })
    // Core widget 'approvals' must rank ahead of non-core 'activity' and 'notifications' when tied.
    expect(rankOf(layout, 'approvals')).toBeLessThan(rankOf(layout, 'activity'))
    expect(rankOf(layout, 'approvals')).toBeLessThan(rankOf(layout, 'notifications'))
  })

  it('ranks quality-tagged widgets to the top when quality is the focus', () => {
    const layout = generateLayout({ role: 'ops', focuses: ['quality'] })
    // qa, policies and approvals are the quality-tagged widgets; approvals also
    // carries the core nudge, so it leads and the other two follow it.
    expect(['approvals', 'policies', 'qa'].map((id) => rankOf(layout, id))).toEqual([0, 1, 2])
  })

  it('boosts a widget when the free-text prompt mentions its theme', () => {
    const withCost = generateLayout({ role: 'exec', focuses: ['quality'], prompt: 'keep an eye on cost' })
    const withoutCost = generateLayout({ role: 'exec', focuses: ['quality'] })
    const rank = (l: { left: string[]; right: string[] }) =>
      [...l.left, ...l.right].indexOf('cost')
    expect(rank(withCost)).toBeLessThan(rank(withoutCost))
  })

  it('is deterministic — same input yields same output', () => {
    const a = generateLayout({ role: 'ops', focuses: ['health', 'quality'], prompt: 'x' })
    const b = generateLayout({ role: 'ops', focuses: ['health', 'quality'], prompt: 'x' })
    expect(a).toEqual(b)
  })
})

// The guided picker doesn't send its checkboxes — it writes the sentence they
// stand for, which is also what the transcript shows.
describe('composeDashboardPrompt', () => {
  it('writes the request the design shows for a product manager', () => {
    expect(
      composeDashboardPrompt({ role: 'pm', focuses: ['quality', 'gaps', 'lifecycle'] }),
    ).toBe(
      'Build me a product management dashboard tailored to my role as a Product Manager. ' +
        'The dashboard should provide an end-to-end view of the product lifecycle, with a strong ' +
        'focus on feature gaps, requirements, testing, and product quality.',
    )
  })

  it('reads back as the same role and focuses it was written from', () => {
    for (const role of ROLES.map((r) => r.key)) {
      const focuses = ['health', 'cost'] as const
      const prompt = composeDashboardPrompt({ role, focuses: [...focuses] })
      expect(roleFromPrompt(prompt)).toBe(role)
      expect(focusesFromPrompt(prompt)).toEqual(['health', 'cost'])
    }
  })

  it('drops the second sentence when nothing was picked to track', () => {
    expect(composeDashboardPrompt({ role: 'ops', focuses: [] })).toBe(
      'Build me an operations dashboard tailored to my role as an Ops lead.',
    )
  })

  it('still writes a request when no role was picked', () => {
    expect(composeDashboardPrompt({ role: null, focuses: ['cost'] })).toBe(
      'Build me a dashboard. The dashboard should focus on cost and efficiency.',
    )
  })

  it('is order-blind — the sentence follows the phrasing order, not the click order', () => {
    const a = composeDashboardPrompt({ role: 'cs', focuses: ['gaps', 'quality'] })
    const b = composeDashboardPrompt({ role: 'cs', focuses: ['quality', 'gaps'] })
    expect(a).toBe(b)
  })
})

describe('wantsPmDashboard', () => {
  it('is asked for by the product manager role', () => {
    expect(wantsPmDashboard({ role: 'pm', focuses: [] })).toBe(true)
  })

  it('is asked for by tracking the product lifecycle, whatever the role', () => {
    expect(wantsPmDashboard({ role: 'ops', focuses: ['lifecycle'] })).toBe(true)
    expect(wantsPmDashboard({ role: null, focuses: ['lifecycle'] })).toBe(true)
  })

  it('is not asked for by any other combination', () => {
    expect(wantsPmDashboard({ role: 'exec', focuses: ['cost', 'health'] })).toBe(false)
    expect(wantsPmDashboard({ role: null, focuses: [] })).toBe(false)
  })
})

describe('wantsExecutiveDashboard', () => {
  it('is asked for by the executive role', () => {
    expect(wantsExecutiveDashboard({ role: 'exec' })).toBe(true)
  })

  it('does not replace other role dashboards', () => {
    expect(wantsExecutiveDashboard({ role: 'ops' })).toBe(false)
    expect(wantsExecutiveDashboard({ role: 'pm' })).toBe(false)
    expect(wantsExecutiveDashboard({ role: null })).toBe(false)
  })
})

describe('generate-layout — PM role & widgets', () => {
  it('includes a Product Manager role keyed pm', () => {
    const pm = ROLES.find((r) => r.key === 'pm')
    expect(pm).toBeDefined()
    expect(pm!.label).toBe('Product Manager')
  })

  it('keeps the four grid roles present', () => {
    for (const k of ['ops', 'cs', 'knowledge', 'exec'] as Role[]) {
      expect(ROLES.some((r) => r.key === k)).toBe(true)
    }
  })

  it('lists all four PM widget ids', () => {
    const expected: PmWidgetId[] = ['pm-kpis', 'pm-spotlight', 'pm-lifecycle', 'pm-feed']
    expect(PM_WIDGET_ID_LIST).toEqual(expected)
  })

  it('DEFAULT_PM_LAYOUT contains every PM widget once', () => {
    expect([...DEFAULT_PM_LAYOUT].sort()).toEqual([...PM_WIDGET_ID_LIST].sort())
    expect(new Set(DEFAULT_PM_LAYOUT).size).toBe(DEFAULT_PM_LAYOUT.length)
  })
})

// The AI Studio composer is free text — these two readers are what turn a typed
// sentence into the same inputs the old chip form supplied.
describe('reading a free-text dashboard request', () => {
  it('picks up the focus areas a request names', () => {
    expect(focusesFromPrompt('keep cost and quality front and center')).toEqual(['quality', 'cost'])
    expect(focusesFromPrompt('anything waiting on my approval')).toEqual(['quality'])
    expect(focusesFromPrompt('where are we on the roadmap')).toEqual(['lifecycle'])
  })

  it('returns focuses in FOCUS_AREAS order regardless of word order', () => {
    expect(focusesFromPrompt('cost then quality')).toEqual(focusesFromPrompt('quality then cost'))
  })

  it('finds no focus in a request that names none', () => {
    expect(focusesFromPrompt('build me something nice')).toEqual([])
  })

  it('recognises the roles a request names', () => {
    expect(roleFromPrompt('build me a dashboard for a knowledge manager')).toBe('knowledge')
    expect(roleFromPrompt('I am an ops lead')).toBe('ops')
    expect(roleFromPrompt('a view for the cs lead')).toBe('cs')
    expect(roleFromPrompt('exec summary please')).toBe('exec')
    expect(roleFromPrompt('product manager view')).toBe('pm')
  })

  it('does not mistake a widget topic for a role', () => {
    // "knowledge gaps" asks for a widget; only "knowledge manager" names the role.
    expect(roleFromPrompt('show me knowledge gaps')).toBeNull()
    expect(roleFromPrompt('cost and resolution')).toBeNull()
  })

  it('builds a layout from the prompt alone when no role is named', () => {
    const layout = generateLayout({ role: null, focuses: [], prompt: 'I only care about cost' })
    const all = [...layout.left, ...layout.right]
    expect(all).toContain('cost')
    expect(new Set(all).size).toBe(all.length)
    // Still a full dashboard, not a one-widget stub.
    expect(all.length).toBe(ALL_IDS.length)
  })

  it('ranks a prompt-only request differently than an unrelated one', () => {
    const cost = generateLayout({ role: null, focuses: [], prompt: 'cost and spend' })
    const knowledge = generateLayout({ role: null, focuses: [], prompt: 'knowledge gaps' })
    expect(cost).not.toEqual(knowledge)
  })
})
