import { describe, expect, it } from 'vitest'
import { POLICY_SEEDS, POLICY_TITLE, type PolicySeed } from './policy-seeds'
import { CHANNELS } from './agent-builder-data'
import { seedAgents, type ChipVariant, type PolicyDoc } from './agent-store'
import { TOOL_ACTION_NAMES } from '@/features/tools/tools-data'
import { matchesUseCase } from './preview/preview-data'

const entries = Object.entries(POLICY_SEEDS)
const chipsOf = (doc: PolicyDoc) => doc.segments.filter((s) => s.kind === 'chip')
const proseOf = (doc: PolicyDoc) => doc.segments.filter((s) => s.kind === 'prose')

describe('policy-seeds', () => {
  it('covers every seeded use case, and invents none', () => {
    const seeded = CHANNELS.flatMap((c) => c.agents.map((a) => a.id))
    expect(Object.keys(POLICY_SEEDS).sort()).toEqual([...seeded].sort())
  })

  it('titles every policy "AI policy"', () => {
    for (const [id, seed] of entries) {
      expect(seed.policy.title, id).toBe(POLICY_TITLE)
    }
  })

  it('leaves no placeholder prose behind', () => {
    for (const [id, seed] of entries) {
      for (const segment of proseOf(seed.policy)) {
        expect(segment.text, id).not.toMatch(/Describe how the/)
      }
    }
  })

  // PolicyEditor edits prose by id (`s.kind === 'prose' && s.id === id`), so two
  // segments sharing an id would make one keystroke rewrite both spans.
  it('gives every segment in a document a unique id', () => {
    for (const [id, seed] of entries) {
      const ids = seed.policy.segments.map((s) => s.id)
      expect(new Set(ids).size, id).toBe(ids.length)
    }
  })

  it('never leaves an empty prose segment, which would render as an unreachable span', () => {
    for (const [id, seed] of entries) {
      for (const segment of proseOf(seed.policy)) {
        expect(segment.text.length, `${id}/${segment.id}`).toBeGreaterThan(0)
      }
    }
  })

  // An `action` chip is a reference to the Actions catalog. A label with no
  // matching row reads as a dead link when you cross from a policy to Actions.
  it('names only actions the Actions catalog carries', () => {
    for (const [id, seed] of entries) {
      for (const chip of chipsOf(seed.policy)) {
        if (chip.variant !== 'action') continue
        expect(TOOL_ACTION_NAMES, `${id}: ${chip.label}`).toContain(chip.label)
      }
    }
  })

  it('exercises all eight chip variants across the set', () => {
    const used = new Set(entries.flatMap(([, s]) => chipsOf(s.policy).map((c) => c.variant)))
    const all: ChipVariant[] = [
      'form',
      'routing',
      'event',
      'action',
      'trigger',
      'variable',
      'agent',
      'article',
    ]
    for (const variant of all) expect(used, variant).toContain(variant)
  })

  it('gives every use case a customer request and at least one trigger phrase', () => {
    for (const [id, seed] of entries) {
      expect(seed.customerRequest.length, id).toBeGreaterThan(40)
      expect(seed.triggerPhrases.length, id).toBeGreaterThan(0)
    }
  })

  // matchesUseCase tests `question.includes(phrase)` and abandons the name-token
  // fallback once a use case has any phrase, so a sentence-length phrase makes a
  // use case match less than it did with no phrases at all.
  it('keeps trigger phrases short, lowercase, and punctuation-free', () => {
    for (const [id, seed] of entries) {
      for (const phrase of seed.triggerPhrases) {
        expect(phrase, id).toBe(phrase.toLowerCase())
        expect(phrase.length, `${id}: ${phrase}`).toBeLessThanOrEqual(24)
        expect(phrase, id).not.toMatch(/[.?!,]/)
        expect(phrase.trim(), id).toBe(phrase)
      }
    }
  })

  it('routes a plausible question to each use case through its own phrases', () => {
    const asked: Record<string, string> = {
      w1: 'how do i change my payment method',
      w2: 'can i talk to someone about this',
      w3: 'i want to cancel my membership',
      w4: 'i cannot log in to my account',
      w5: 'where is my 1099 for last year',
      w6: 'our webhook stopped firing this morning',
      w7: 'is uber one worth it for me',
      w8: 'i forgot my password',
      w9: "where's my order",
      w10: 'i need to change order details',
      w11: 'cancel my order',
      w12: 'my package arrived damaged',
      w13: 'can you send me delivery proof',
      w14: 'i want to pause subscription',
      w15: 'unpause my subscription',
      w16: 'my payment failed',
      w17: 'upgrade my plan',
      w18: 'i need to update payment info',
      w19: 'i need to dispute charge',
      w20: 'apply a promo code',
      w21: 'split payment between two cards',
      c1: 'i would like to escalate this thread',
      v1: 'connect me with billing please',
      v2: 'i left a message yesterday',
      v3: 'report an incident',
      v4: 'i left behind my phone',
      v5: 'i want to dispute rating',
      v6: 'emergency contact',
      v7: 'getting started',
      v8: "i haven't used this in a while",
      v9: 'scheduled maintenance',
      h1: 'lookup the refund window',
      h2: 'classify this message',
      h3: 'unhandled request payload',
      h4: 'enrich this request',
      // Web Call's rows reuse Widget's authored policies; their questions do too.
      wc1: 'how do i change my payment method',
      wc2: 'can i talk to someone about this',
      wc3: 'i need to update payment info',
      wc4: 'i cannot log in to my account',
    }
    for (const [id, seed] of entries) {
      const useCase = {
        name: '',
        live: true,
        policyText: '',
        triggerPhrases: seed.triggerPhrases,
        segmentScope: 'all segments',
      }
      expect(matchesUseCase(asked[id], useCase), `${id}: ${asked[id]}`).toBe(true)
    }
  })
})

describe('policy-seeds: Service cancellation', () => {
  // Transcribed from the Figma frame, including its line breaks. Pinned in full
  // so an edit to the authoring helpers or a nearby policy cannot quietly
  // reshape the one document the design specifies exactly.
  it('matches the transcribed frame segment for segment', () => {
    expect(POLICY_SEEDS.w3.policy.segments).toEqual([
      { kind: 'prose', id: 'p1', text: 'Reveal ' },
      { kind: 'chip', id: 'c1', variant: 'form', label: 'Form: Cancellation Diagnostic Survey' },
      { kind: 'prose', id: 'p2', text: ' to identify the root cause.\nTrigger ' },
      { kind: 'chip', id: 'c2', variant: 'routing', label: 'Retention Routing' },
      {
        kind: 'prose',
        id: 'p3',
        text: '\nBased on retention classification, explain to the customer that their problem is solvable and offer 30 days free while the team works on resolving it.\nAsk if they want to take the offer.\nCollect their decision via ',
      },
      { kind: 'chip', id: 'c3', variant: 'form', label: '30-Day Free - Accept or Decline' },
      { kind: 'prose', id: 'p4', text: '\n\nIf the customer accepts, fire event ' },
      { kind: 'chip', id: 'c4', variant: 'event', label: 'Retention Saved' },
      { kind: 'prose', id: 'p5', text: ' and trigger\n' },
      { kind: 'chip', id: 'c5', variant: 'action', label: 'Apply 30-Day Free' },
      { kind: 'prose', id: 'p6', text: ' and ' },
      { kind: 'chip', id: 'c6', variant: 'action', label: 'Schedule Day-30 Check-in' },
      { kind: 'prose', id: 'p7', text: '\n\nIf the customer declines, trigger ' },
      { kind: 'chip', id: 'c7', variant: 'action', label: 'Process Cancellation' },
      { kind: 'prose', id: 'p8', text: '\nAt close, trigger ' },
      { kind: 'chip', id: 'c8', variant: 'form', label: 'CSAT Survey' },
    ])
  })

  it('keeps the one expanded condition card the design shows', () => {
    expect(POLICY_SEEDS.w3.blocks).toEqual([
      {
        id: 'b-seed-1',
        stepType: 'condition',
        title: 'Untitled classic block 01',
        header: 'Conditions',
        subtitle: 'Shipping status',
        rows: [
          { id: 'r-seed-1', label: 'Condition description' },
          { id: 'r-seed-2', label: 'Condition description' },
          { id: 'r-seed-3', label: 'Otherwise…' },
        ],
      },
    ])
  })
})

describe('policy-seeds: Password Reset reflects Week 1 done, Week 2 open', () => {
  // PASSWORD_RESET_PLAN (self-improving-data.ts) marks Week 1's three fixes
  // "Auto-applied" and Week 2's SSO branch "Needs approval". The policy has to
  // agree with whichever the plan claims, or the two contradict each other.
  const w8: PolicySeed = POLICY_SEEDS.w8

  it('picked up the Week 1 trigger-phrase fix already marked done', () => {
    for (const variant of ["can't log in", 'locked out', 'forgot credentials']) {
      expect(w8.triggerPhrases).toContain(variant)
    }
  })

  it('has no SSO branch yet — that fix still needs approval (Week 2)', () => {
    const text = JSON.stringify(w8.policy.segments).toLowerCase()
    for (const token of ['sso', 'google', 'apple', 'auth_provider']) {
      expect(text, token).not.toContain(token)
    }
  })

  it('retries before erroring rather than handing off', () => {
    const variants = chipsOf(w8.policy).map((c) => c.variant)
    expect(variants).not.toContain('routing')
    expect(variants).not.toContain('agent')
  })

  it('is markedly thinner than the Login Help policy it should resemble', () => {
    expect(w8.policy.segments.length).toBeLessThan(POLICY_SEEDS.w4.policy.segments.length / 2)
  })
})

describe('seedAgents with authored content', () => {
  it('carries the authored policy, request, phrases, and blocks onto every agent', () => {
    for (const agent of seedAgents()) {
      const seed = POLICY_SEEDS[agent.id]
      expect(seed, agent.id).toBeDefined()
      expect(agent.policy, agent.id).toEqual(seed.policy)
      expect(agent.customerRequest, agent.id).toBe(seed.customerRequest)
      expect(agent.triggerPhrases, agent.id).toEqual(seed.triggerPhrases)
      expect(agent.blocks, agent.id).toEqual(seed.blocks ?? [])
    }
  })

  it('scopes every use case to named segments rather than placeholders', () => {
    for (const agent of seedAgents()) {
      // Web Call's built-ins are tagless by design — the frame (120:57534)
      // prints "n/a" in their Tags column.
      const frameTagless = agent.channel === 'webcall' && agent.canToggle === false
      if (!frameTagless) expect(agent.tags.length, agent.id).toBeGreaterThan(0)
      for (const tag of agent.tags) {
        expect(tag, agent.id).not.toMatch(/^Tag [A-Z]$/)
      }
    }
  })
})
