import { describe, it, expect } from 'vitest'
import {
  PREVIEW_CONVERSATION_ID,
  PREVIEW_GREETING,
  PREVIEW_LANGUAGES,
  PREVIEW_SEGMENTS,
  PREVIEW_SCOPE_CAPTION,
  SEED_EXCHANGE,
  matchesUseCase,
  respondAsUseCase,
  respondTo,
  scopeCaption,
  type PreviewUseCase,
} from './preview-data'

const cancellation: PreviewUseCase = {
  name: 'Service cancellation',
  live: true,
  policyText: 'Reveal Form: Cancellation Diagnostic Survey to identify the root cause.',
  triggerPhrases: [],
  segmentScope: 'all segments',
}

describe('preview-data', () => {
  it('opens on the greeting and seed exchange the frame shows', () => {
    expect(PREVIEW_GREETING).toBe('Hi there, how may I help you?')
    expect(SEED_EXCHANGE.user).toBe('Can you help me update the billing address on my account?')
    expect(SEED_EXCHANGE.agent).toMatch(/^Thanks for reaching out!/)
    expect(SEED_EXCHANGE.detection).toBe('Update profile')
    expect(SEED_EXCHANGE.status).toBe('Live')
    expect(SEED_EXCHANGE.confidence).toBe('High')
    expect(SEED_EXCHANGE.policy).toBe(
      'Ask the customer for more details about what they want to update.',
    )
  })

  it('carries the frame’s conversation id and scope caption', () => {
    expect(PREVIEW_CONVERSATION_ID).toBe('5471e2cb-0347-41d6-85de-4ff6461f1642')
    expect(PREVIEW_SCOPE_CAPTION).toBe('Currently previewing all “Live” traffic.')
  })

  it('offers English first among languages and All segments first among segments', () => {
    expect(PREVIEW_LANGUAGES[0]).toBe('English')
    expect(PREVIEW_SEGMENTS[0]).toBe('All segments')
    expect(PREVIEW_LANGUAGES.length).toBeGreaterThan(1)
    expect(PREVIEW_SEGMENTS.length).toBeGreaterThan(1)
  })

  it('routes a cancellation question to the Service cancellation use case', () => {
    const exchange = respondTo('I want to cancel my subscription')
    expect(exchange.detection).toBe('Service cancellation')
    expect(exchange.user).toBe('I want to cancel my subscription')
  })

  it('routes a password question to Password Reset', () => {
    expect(respondTo('I forgot my password').detection).toBe('Password Reset')
  })

  it('falls back to knowledge retrieval at low confidence when nothing matches', () => {
    const exchange = respondTo('what is the weather in Oslo')
    expect(exchange.detection).toBe('Knowledge Retrieval')
    expect(exchange.confidence).toBe('Low')
  })

  it('matches keywords regardless of case', () => {
    expect(respondTo('CANCEL MY PLAN').detection).toBe('Service cancellation')
  })

  it('answers every question with a non-empty reply and policy', () => {
    for (const question of ['cancel', 'password', 'billing address', 'zzz', '']) {
      const exchange = respondTo(question)
      expect(exchange.agent.length).toBeGreaterThan(0)
      expect(exchange.policy.length).toBeGreaterThan(0)
    }
  })

  it('is deterministic — the same question always yields the same exchange', () => {
    expect(respondTo('refund me please')).toEqual(respondTo('refund me please'))
  })
})

describe('matchesUseCase', () => {
  it('matches a name token on a shared 4-character prefix', () => {
    // 'cancellation' vs 'cancel' — the seeded agents have no trigger phrases, so
    // the use case's own name is the only signal available.
    expect(matchesUseCase('I want to cancel my plan', cancellation)).toBe(true)
  })

  it('matches an exact short token', () => {
    const tax = { ...cancellation, name: 'Tax document processing' }
    expect(matchesUseCase('I need my tax paperwork', tax)).toBe(true)
  })

  it('does not match an unrelated question', () => {
    expect(matchesUseCase('what is the weather in Oslo', cancellation)).toBe(false)
  })

  it('does not match a neighbouring use case’s topic', () => {
    const login = { ...cancellation, name: 'Login Help' }
    expect(matchesUseCase('I forgot my password', login)).toBe(false)
  })

  it('ignores short filler words in the name', () => {
    const withFiller = { ...cancellation, name: 'Help me' }
    expect(matchesUseCase('I want to cancel', withFiller)).toBe(false)
  })

  it('prefers trigger phrases when the use case has them', () => {
    const withPhrases = { ...cancellation, name: 'Zzz', triggerPhrases: ['wind down my account'] }
    expect(matchesUseCase('please wind down my account', withPhrases)).toBe(true)
    // Name tokens are not consulted once phrases exist.
    expect(matchesUseCase('zzz', withPhrases)).toBe(false)
  })

  it('matches trigger phrases regardless of case', () => {
    const withPhrases = { ...cancellation, triggerPhrases: ['Cancel My Ride'] }
    expect(matchesUseCase('CANCEL MY RIDE now', withPhrases)).toBe(true)
  })
})

describe('respondAsUseCase', () => {
  it('attributes a matching question to the use case at high confidence', () => {
    const exchange = respondAsUseCase('I want to cancel my subscription', cancellation)
    expect(exchange.detection).toBe('Service cancellation')
    expect(exchange.status).toBe('Live')
    expect(exchange.confidence).toBe('High')
    expect(exchange.triggered).toBe(true)
    expect(exchange.policy).toBe(cancellation.policyText)
  })

  it('reports a non-matching question as not triggered, at low confidence', () => {
    const exchange = respondAsUseCase('what is the weather in Oslo', cancellation)
    expect(exchange.detection).toBe('Service cancellation')
    expect(exchange.confidence).toBe('Low')
    expect(exchange.triggered).toBe(false)
  })

  it('still answers the customer when the use case does not fire', () => {
    const exchange = respondAsUseCase('what is the weather in Oslo', cancellation)
    expect(exchange.agent.length).toBeGreaterThan(0)
  })

  it('carries the use case’s draft state into the trace', () => {
    const draft = { ...cancellation, live: false }
    expect(respondAsUseCase('cancel my plan', draft).status).toBe('Draft')
  })

  it('says so when the use case has no policy written yet', () => {
    const empty = { ...cancellation, policyText: '' }
    expect(respondAsUseCase('cancel my plan', empty).policy).toMatch(/no policy/i)
  })
})

describe('scopeCaption', () => {
  it('reports the whole channel by default', () => {
    expect(scopeCaption({})).toBe(PREVIEW_SCOPE_CAPTION)
  })

  it('names the qualifier the run has been narrowed to', () => {
    expect(scopeCaption({ qualifier: 'Drivers' })).toBe(
      'Currently previewing all “Live” traffic for Drivers.',
    )
  })

  it('names the use case instead when the run is scoped to one', () => {
    expect(
      scopeCaption({ useCaseName: 'Service cancellation', useCaseScope: 'all segments' }),
    ).toBe('Currently previewing the “Service cancellation” use case, all segments.')
  })

  it('lets the use case win over a qualifier — the policy owns its own scope', () => {
    const caption = scopeCaption({
      useCaseName: 'Service cancellation',
      useCaseScope: 'Riders',
      qualifier: 'Drivers',
    })
    expect(caption).not.toMatch(/Drivers/)
  })
})
