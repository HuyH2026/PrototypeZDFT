import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PASSWORD_RESET_PLAN } from './self-improving-data'
import { HealthEvaluationSection } from './HealthEvaluationSection'
import { ImprovementOverviewSection } from './ImprovementOverviewSection'
import { ImprovementPlanSection } from './ImprovementPlanSection'
import { MonitoringSection } from './MonitoringSection'
import { CheckInsSection } from './CheckInsSection'
import { GuardrailsSection } from './GuardrailsSection'

const plan = PASSWORD_RESET_PLAN

describe('ImprovementOverviewSection', () => {
  it('numbers the four steps and lists what each one touches', () => {
    render(<ImprovementOverviewSection steps={plan.overview} />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('04')).toBeInTheDocument()
    expect(screen.getByText('Evaluate agent health')).toBeInTheDocument()
    expect(screen.getByText('Validate and check')).toBeInTheDocument()
    expect(screen.getByText('Escalation signals')).toBeInTheDocument()
    expect(screen.getAllByText('Admin sign-off')).toHaveLength(2)
  })

  // Read-only: this plan reports measurements, so nothing in it is editable.
  it('renders nothing editable', () => {
    render(<ImprovementOverviewSection steps={plan.overview} />)
    expect(document.querySelectorAll('[contenteditable="true"]')).toHaveLength(0)
  })
})

describe('HealthEvaluationSection', () => {
  it('scores all six signals against their targets', () => {
    render(<HealthEvaluationSection health={plan.health} />)
    for (const caption of [
      'Health Score',
      'Deflection rate',
      'CSAT',
      'Sentiment',
      'Avg handle time',
      'Fallback rate',
    ]) {
      expect(screen.getByText(caption)).toBeInTheDocument()
    }
    expect(screen.getByText('target ≥75%')).toBeInTheDocument()
    expect(screen.getByText('target ≤3 min')).toBeInTheDocument()
    expect(screen.getByText('8.1')).toBeInTheDocument()
    expect(screen.getByText('min')).toBeInTheDocument()
  })

  it('draws Sentiment as a face', () => {
    render(<HealthEvaluationSection health={plan.health} />)
    expect(screen.getByLabelText('Negative')).toBeInTheDocument()
  })

  it('makes the case with its three known root causes', () => {
    render(<HealthEvaluationSection health={plan.health} />)
    expect(screen.getByText('The case for a self-improving agent')).toBeInTheDocument()
    expect(screen.getByText(/CSAT dropped 32% in 21 days/)).toBeInTheDocument()
    expect(screen.getByText(/SSO users \(~30%\) get wrong reset instructions\./)).toBeInTheDocument()
    expect(screen.getByText(/API timeouts \(~8%\)/)).toBeInTheDocument()
  })

  // Asserting className is acceptable here (despite the repo's general rule against
  // it) because HealthEvaluationSection is a leaf that owns its classes and takes
  // no className pass-through, so a caller cannot silently override the token.
  it('reddens the three critical stats per their authored tone', () => {
    render(<HealthEvaluationSection health={plan.health} />)

    // Derive expectations from the data: every stat with tone: 'critical' should
    // be red, every other stat should not be.
    const criticalStats = plan.health.stats.filter((s) => s.tone === 'critical')
    const neutralStats = plan.health.stats.filter((s) => s.tone === 'neutral')

    expect(criticalStats.length).toBe(3)
    expect(neutralStats.length).toBeGreaterThan(0)

    // Critical stats: Health Score (value="Critical"), Sentiment (frown icon),
    // Avg handle time (value="8.1"). Each should have text-red-700.
    for (const stat of criticalStats) {
      let element: HTMLElement
      if (stat.glyph === 'frown') {
        element = screen.getByLabelText('Negative')
      } else {
        element = screen.getByText(stat.value).parentElement!
      }
      expect(element.classList.contains('text-red-700')).toBe(true)
    }

    // At least one neutral stat should NOT be red. Check Deflection rate (34%).
    const deflectionValue = screen.getByText('34')
    expect(deflectionValue.parentElement!.classList.contains('text-red-700')).toBe(false)
  })
})

describe('ImprovementPlanSection', () => {
  it('heads each week with its summary and chip', () => {
    render(<ImprovementPlanSection weeks={plan.weeks} />)
    expect(screen.getByText('Week 1 — Immediate auto-fixes')).toBeInTheDocument()
    expect(screen.getByText('Week 2 — Approval required')).toBeInTheDocument()
    expect(screen.getByText('Weeks 3–4 — Monitor and promote winners')).toBeInTheDocument()
    // Weeks 1 and 3–4 apply themselves; Week 2 waits for a human.
    expect(screen.getAllByText('Auto-applied')).toHaveLength(2)
    expect(screen.getByText('Needs approval')).toBeInTheDocument()
  })

  it('lists every fix with its blast radius', () => {
    render(<ImprovementPlanSection weeks={plan.weeks} />)
    expect(screen.getByText('Expand intent recognition — 14 new trigger phrases')).toBeInTheDocument()
    expect(screen.getByText('SSO detection + separate flow branch')).toBeInTheDocument()
    expect(screen.getByText('Promote A/B winner + close experiment')).toBeInTheDocument()
    expect(screen.getByText(/from 58% to ~18%/)).toBeInTheDocument()
    expect(screen.getByText('Risk: medium')).toBeInTheDocument()
    expect(screen.getByText('Traffic split: 50/50')).toBeInTheDocument()
    expect(screen.getByText('Auto-promotes if clear winner')).toBeInTheDocument()
  })

  it('renders one card per fix', () => {
    const { container } = render(<ImprovementPlanSection weeks={plan.weeks} />)
    const fixes = plan.weeks.reduce((total, week) => total + week.fixes.length, 0)
    expect(container.querySelectorAll('article')).toHaveLength(fixes)
  })
})

describe('MonitoringSection', () => {
  it('states the six signals and groups what happens when', () => {
    render(<MonitoringSection monitor={plan.monitor} />)
    expect(screen.getByText(/Track six signals continuously/)).toBeInTheDocument()
    expect(screen.getByText('Daily')).toBeInTheDocument()
    expect(screen.getByText('Weekly')).toBeInTheDocument()
    expect(screen.getByText('If something goes wrong')).toBeInTheDocument()
    expect(screen.getByText('Confirm each auto-fix applied correctly')).toBeInTheDocument()
    expect(screen.getByText('Re-score all six signals against their targets')).toBeInTheDocument()
    expect(screen.getByText('No fix is permanent until the admin confirms it holds')).toBeInTheDocument()
  })

  it('names both exit conditions and their outcomes', () => {
    render(<MonitoringSection monitor={plan.monitor} />)
    expect(screen.getByText('Exit condition')).toBeInTheDocument()
    expect(screen.getByText('Health score ≥ 70')).toBeInTheDocument()
    expect(screen.getByText(/Returns to standard monitoring/)).toBeInTheDocument()
    expect(screen.getByText('Below 70 after week 4')).toBeInTheDocument()
  })
})

describe('CheckInsSection', () => {
  it('lists the four check-ins with their cadences', () => {
    render(<CheckInsSection checkIns={plan.checkIns} />)
    expect(screen.getByText('Auto-fix health review')).toBeInTheDocument()
    expect(screen.getByText('A/B experiment mid-point read')).toBeInTheDocument()
    expect(screen.getByText('Full signal review')).toBeInTheDocument()
    expect(screen.getByText('Recovery assessment')).toBeInTheDocument()
    expect(screen.getAllByText('Daily')).toHaveLength(2)
    expect(screen.getByText('Weekly')).toBeInTheDocument()
    expect(screen.getByText('Day 28')).toBeInTheDocument()
    // Copy fix 2: six signals, not five metrics.
    expect(screen.getByText('All 6 signals against targets')).toBeInTheDocument()
  })
})

describe('GuardrailsSection', () => {
  it('states all four guardrails', () => {
    render(<GuardrailsSection guardrails={plan.guardrails} />)
    expect(screen.getByText('Auto-apply threshold')).toBeInTheDocument()
    expect(screen.getByText('Approval required when')).toBeInTheDocument()
    expect(screen.getByText('Auto-rollback triggers')).toBeInTheDocument()
    expect(screen.getByText('AI self-assessment cadence')).toBeInTheDocument()
    expect(screen.getByText(/no approval needed/)).toBeInTheDocument()
    expect(screen.getByText(/worsens by >10% within 48h/)).toBeInTheDocument()
  })
})
