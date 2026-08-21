import { describe, expect, it } from 'vitest'
import { wantsAgentPlan } from '../agent-plan/agent-plan-data'
import {
  getImprovementPlan,
  IMPROVEMENT_SECTIONS,
  PASSWORD_RESET_PLAN,
  SECTION_CHIP,
  SECTION_LABEL,
  weekCount,
  wantsSelfImprovingPlan,
} from './self-improving-data'

const plan = PASSWORD_RESET_PLAN

describe('self-improving-data', () => {
  it('names the six sections in frame order', () => {
    expect(IMPROVEMENT_SECTIONS).toEqual([
      'overview',
      'health',
      'plan',
      'monitor',
      'validate',
      'guardrails',
    ])
    expect(IMPROVEMENT_SECTIONS.map((key) => SECTION_LABEL[key])).toEqual([
      'Plan overview',
      'Agent health evaluation',
      'Self-improving plan',
      'Monitor and improve',
      'Validate and check',
      'Autonomy guardrails',
    ])
  })

  // Decision 3: the chips report what the plan is, not what the user has read,
  // and Plan overview has none.
  it('authors a chip on every section but the overview', () => {
    expect(SECTION_CHIP.overview).toBeNull()
    expect(SECTION_CHIP.health).toBe('critical')
    expect(SECTION_CHIP.plan).toBe('needs-approval')
    expect(SECTION_CHIP.monitor).toBe('tracking')
    expect(SECTION_CHIP.validate).toBe('active-check-ins')
    expect(SECTION_CHIP.guardrails).toBe('auto-applied')
  })

  it('targets the seeded Password Reset agent', () => {
    expect(plan.agentName).toBe('Password Reset')
    expect(plan.agentId).toBe('w8')
  })

  it('gives every health stat a caption and a target', () => {
    expect(plan.health.stats).toHaveLength(6)
    expect(plan.health.stats.map((stat) => stat.caption)).toEqual([
      'Health Score',
      'Deflection rate',
      'CSAT',
      'Sentiment',
      'Avg handle time',
      'Fallback rate',
    ])
    for (const stat of plan.health.stats) {
      expect(stat.target).toMatch(/^target/)
    }
  })

  // Authored emphasis, not a rule: all six signals miss their targets but the
  // frame reddens only three.
  it('reddens exactly the three stats the frame reddens', () => {
    expect(plan.health.stats.filter((stat) => stat.tone === 'critical').map((s) => s.key)).toEqual([
      'health-score',
      'sentiment',
      'handle-time',
    ])
  })

  it('renders Sentiment as a face rather than a number', () => {
    const sentiment = plan.health.stats.find((stat) => stat.key === 'sentiment')!
    expect(sentiment.glyph).toBe('frown')
    expect(sentiment.value).toBe('')
  })

  it('derives four weeks from the week labels', () => {
    expect(plan.weeks.map((week) => week.label)).toEqual(['Week 1', 'Week 2', 'Weeks 3–4'])
    expect(weekCount(plan)).toBe(4)
  })

  it('gives every week at least one fix and one of the two chips', () => {
    for (const week of plan.weeks) {
      expect(week.fixes.length).toBeGreaterThan(0)
      expect(['auto-applied', 'needs-approval']).toContain(week.chip)
    }
  })

  // Copy fix 1: the scorecard, the case narrative and the conversation all say
  // 58%, so the fix card does too.
  it('quotes the fallback rate as 58%', () => {
    const first = plan.weeks[0].fixes[0]
    expect(first.description).toContain('from 58% to ~18%')
    expect(first.description).not.toContain('38%')
  })

  // Copy fix 2 and 3.
  it('applies the check-in and Weekly copy fixes', () => {
    const review = plan.checkIns.find((checkIn) => checkIn.title === 'Full signal review')!
    expect(review.description).toBe('All 6 signals against targets')
    const daily = plan.monitor.groups.find((group) => group.title === 'Daily')!
    const weekly = plan.monitor.groups.find((group) => group.title === 'Weekly')!
    expect(weekly.items).not.toEqual(daily.items)
    expect(weekly.items[0]).toBe('Re-score all six signals against their targets')
  })

  it('authors four check-ins and four guardrails', () => {
    expect(plan.checkIns).toHaveLength(4)
    expect(plan.guardrails).toHaveLength(4)
    expect(plan.checkIns[0]).toMatchObject({ title: 'Auto-fix health review', cadence: 'Daily' })
  })

  // Curly punctuation fidelity: the brief authors two curly apostrophes and six
  // curly double-quote pairs. These two assertions catch the sites that regressed.
  it('preserves curly double quotes in caseCauses', () => {
    const cause = plan.health.caseCauses[0]
    expect(cause).toContain('“locked out”')
    expect(cause).toContain('“forgot credentials”')
    expect(cause).not.toContain('"locked out"')
    expect(cause).not.toContain('"forgot credentials"')
  })

  it('preserves curly double quotes in the A/B winner fix', () => {
    const fix = plan.weeks[2].fixes[0]
    expect(fix.description).toContain('“No winner”')
    expect(fix.description).not.toContain('"No winner"')
  })

  // Guard: no ASCII double quotes anywhere in the plan's string values. The only
  // ASCII " in the file are in comments. This recursive walk catches any present
  // or future site.
  it('contains no ASCII double quotes in any string value', () => {
    const asciiQuotes: string[] = []

    function walk(value: unknown, path: string): void {
      if (typeof value === 'string') {
        if (value.includes('"')) {
          asciiQuotes.push(`${path}: ${value.slice(0, 80)}`)
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, i) => walk(item, `${path}[${i}]`))
      } else if (value && typeof value === 'object') {
        for (const [key, val] of Object.entries(value)) {
          walk(val, path ? `${path}.${key}` : key)
        }
      }
    }

    walk(plan, 'plan')
    expect(asciiQuotes).toEqual([])
  })
})

describe('getImprovementPlan', () => {
  it('finds the seeded plan by the agent id it targets', () => {
    expect(getImprovementPlan('w8')).toBe(plan)
  })

  it('returns undefined for an agent with no plan', () => {
    expect(getImprovementPlan('w1')).toBeUndefined()
  })
})

describe('wantsSelfImprovingPlan', () => {
  it.each([
    'Are any of my agents struggling?',
    'is any agent underperforming?',
    'how is my agent health?',
    'help me improve my worst agent',
    'set up a self-improving cycle',
    // Asking after an agent's state, without naming it as bad. The first is the
    // flow's own opening turn, verbatim — a user who types the question the
    // transcript opens with must land in the transcript that answers it.
    'I wanted to check in on how our AI agents are doing. Are any of them struggling?',
    'I wanted to check in on how our AI agents are doing',
    'how are my agents performing?',
    'which agent needs attention first?',
  ])('matches %s', (prompt) => {
    expect(wantsSelfImprovingPlan(prompt)).toBe(true)
  })

  it.each([
    '',
    'what is my deflection rate?',
    'improve my knowledge base',
    'build me an agent for cancellations',
    'summarize last week',
    // The new vocabulary needs an agent word beside it. These are all authored
    // prompts the app already offers elsewhere, and none of them is this flow.
    'Catch me up on Solve performance',
    'Why is the Integration workflow underperforming?',
    'Create a plan for my lowest-performing workflow',
    'Help me rewrite this policy to improve deflection',
    // Nor may it steal a scoped panel's prefill that means something else there.
    'Draft test cases for this agent',
  ])('rejects %s', (prompt) => {
    expect(wantsSelfImprovingPlan(prompt)).toBe(false)
  })

  // The collision, asserted in both directions: neither matcher may steal the
  // other's ordinary phrasing.
  it('does not collide with the create-agent matcher', () => {
    expect(wantsAgentPlan('are any of my agents struggling?')).toBe(false)
    expect(wantsSelfImprovingPlan('build me an agent for cancellations')).toBe(false)
  })

  // The one string both match. The host checks this matcher first, because the
  // more specific one wins (spec Decision 10).
  it('claims the one prompt both matchers accept', () => {
    const prompt = 'create a self-improving plan for my agent'
    expect(wantsSelfImprovingPlan(prompt)).toBe(true)
    expect(wantsAgentPlan(prompt)).toBe(true)
  })
})
