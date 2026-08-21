import { describe, it, expect } from 'vitest'
import {
  seedWebCallCsat,
  CHANNEL_TABS,
  SEED_SEGMENTS,
  VOICE_SEED_SEGMENTS,
  WIDGET_RAIL_SECTIONS,
  VOICE_RAIL_SECTIONS,
  WEBCALL_RAIL_SECTIONS,
  WEBCALL_RAIL_TRAILING_START,
  WEBCALL_SEED_SEGMENTS,
  summarizeTags,
  emptyPersonality,
  seedCsat,
  TONE_PRESET_OPTIONS,
  AI_PERSONALITY_COPY,
  CSAT_STYLES,
  KNOWLEDGE_CONNECTIONS,
  isAllSegments,
  embedSnippetLines,
  snippetToText,
  EMBED_KEY_PLACEHOLDER,
  HEADLESS_STEPS,
  A2A_AGENT_CARD_URL,
  A2A_MESSAGE_ENDPOINT,
  nextApiKey,
  seedApiKey,
  seedWebCallVoice,
  seedWebCallPersonality,
  seedWebCallPrivacy,
} from './config-data'

describe('config-data', () => {
  it('has four channel tabs starting with widget', () => {
    expect(CHANNEL_TABS.map((t) => t.id)).toEqual(['widget', 'voice', 'webcall', 'headless'])
  })

  it('seeds the design’s three segments, with Riders default + enabled', () => {
    expect(SEED_SEGMENTS.map((s) => s.label)).toEqual(['Riders', 'One members', 'Business riders'])
    const riders = SEED_SEGMENTS.find((s) => s.id === 'riders')!
    expect(riders.isDefault).toBe(true)
    expect(riders.enabled).toBe(true)
    expect(riders.name).toBe('Riders')
    expect(riders.widgetMark).toBe('Uber')
    expect(riders.widgetTitle).toBe('Uber Rider Support')
    expect(riders.tags.length).toBe(4)
  })

  it('seeds the Business riders frame with its own identity and widget treatment', () => {
    const business = SEED_SEGMENTS.find((s) => s.id === 'business-riders')!
    expect(business.name).toBe('Business riders')
    expect(business.widgetTitle).toBe('Uber Business Rider')
    expect(business.widgetAccent).toBe('#2047b9')
    expect(business.tags).toEqual(['business_profile'])
    expect(business.enabled).toBe(true)
    expect(business.isDefault).toBe(false)
  })

  it('keeps the editable segment identity and widget brand content independent', () => {
    const riders = SEED_SEGMENTS[0]
    expect(riders.label).toBe(riders.name)
    expect(new Set([riders.name, riders.widgetMark, riders.widgetTitle]).size).toBe(3)
  })

  it('leads the widget rail with segments and the voice rail with a shorter set', () => {
    expect(WIDGET_RAIL_SECTIONS[0].id).toBe('segments')
    expect(WIDGET_RAIL_SECTIONS.every((s) => typeof s.icon === 'string' && s.icon.length > 0)).toBe(
      true,
    )
    expect(VOICE_RAIL_SECTIONS[0].id).toBe('segments')
    expect(VOICE_RAIL_SECTIONS.length).toBeLessThan(WIDGET_RAIL_SECTIONS.length)
    // Every section the panels switch on must exist in its rail.
    const widgetIds = WIDGET_RAIL_SECTIONS.map((s) => s.id)
    for (const id of ['sentiment', 'mood', 'knowledge', 'code']) expect(widgetIds).toContain(id)
    expect(VOICE_RAIL_SECTIONS.map((s) => s.id)).toContain('sentiment')
  })

  it('marks only the site-wide sections as applying to all segments', () => {
    expect(isAllSegments('knowledge')).toBe(true)
    expect(isAllSegments('code')).toBe(true)
    expect(isAllSegments('segments')).toBe(false)
    expect(isAllSegments('mood')).toBe(false)
  })

  it('summarizes tags with a +N overflow past two', () => {
    expect(summarizeTags([])).toBe('')
    expect(summarizeTags(['A'])).toBe('A')
    expect(summarizeTags(['A', 'B'])).toBe('A, B')
    expect(summarizeTags(['A', 'B', 'C', 'D'])).toBe('A, B, +2')
  })

  it('seeds every segment with an empty widget personality and its own voice one', () => {
    for (const s of SEED_SEGMENTS) {
      expect(s.personality).toEqual(emptyPersonality())
      expect(s.voice.personality).toEqual(emptyPersonality())
      // Separate objects: the two channels must not share edits.
      expect(s.personality).not.toBe(s.voice.personality)
    }
  })

  it('seeds Voice with the seven language segments from the Voice configuration frame', () => {
    expect(VOICE_SEED_SEGMENTS.map((segment) => segment.label)).toEqual([
      'Riders English',
      'Riders Spanish',
      'Riders French',
      'Riders German',
      'Riders Portuguese',
      'Riders Hindi',
      'Riders Japanese',
    ])
    expect(VOICE_SEED_SEGMENTS[0].voice.aiAgentName).toBe('James')
  })

  it('seeds Web Call with the frame’s three audience segments, none default', () => {
    expect(WEBCALL_SEED_SEGMENTS.map((s) => s.label)).toEqual([
      'Riders',
      'One members',
      'Business Riders',
    ])
    const riders = WEBCALL_SEED_SEGMENTS[0]
    expect(riders.tags).toEqual(['Tag A', 'Tag B', 'Tag C', 'Tag D'])
    expect(riders.isDefault).toBe(false)
    expect(riders.enabled).toBe(true)
    expect(riders.webcall).toEqual({
      companyName: 'Uber',
      agentName: 'Uber',
      theme: {
        headerText: 'Rider support',
        themeColor: '#000000',
        size: 'standard',
        mode: 'light',
        position: 'bottom-right',
      },
      avatar: { showAnimation: true, visual: 'ring' },
      voice: seedWebCallVoice(),
      personality: seedWebCallPersonality(),
      privacy: seedWebCallPrivacy(),
      csat: seedWebCallCsat(),
    })
    // The webcall identity is a separate object from the voice one.
    expect(riders.webcall).not.toBe(riders.voice)
  })

  it('leads the webcall rail with segments and has a trailing group', () => {
    expect(WEBCALL_RAIL_SECTIONS[0].id).toBe('segments')
    expect(
      WEBCALL_RAIL_SECTIONS.every((s) => typeof s.icon === 'string' && s.icon.length > 0),
    ).toBe(true)
    expect(WEBCALL_RAIL_SECTIONS.map((s) => s.id)).toContain(WEBCALL_RAIL_TRAILING_START)
  })

  it('exposes the six tone presets in order', () => {
    expect(TONE_PRESET_OPTIONS).toEqual([
      'Empathetic',
      'Friendly',
      'Professional',
      'Straightforward',
      'Humorous',
      'Formal',
    ])
  })

  it('provides copy for the three AI Personality sections plus the voice intro', () => {
    expect(AI_PERSONALITY_COPY.generalContext.label).toBe('General Context')
    expect(AI_PERSONALITY_COPY.glossary.label).toBe('Glossary')
    expect(AI_PERSONALITY_COPY.tone.label).toBe('Tone of Voice')
    expect(AI_PERSONALITY_COPY.voiceIntro).toMatch(/inbound and outbound calls/)
  })

  it('emptyPersonality returns a fresh empty object each call', () => {
    const a = emptyPersonality()
    const b = emptyPersonality()
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
  })
})

describe('config-data — CSAT', () => {
  it('seeds a five-step scale labelled Terrible → Excellent with sentiments', () => {
    const csat = seedCsat()
    expect(csat.steps.map((s) => s.label)).toEqual(['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'])
    expect(csat.steps.map((s) => s.tone)).toEqual([
      'negative',
      'negative',
      'neutral',
      'positive',
      'positive',
    ])
    expect(csat.steps.map((s) => s.value)).toEqual([1, 2, 3, 4, 5])
  })

  it('seeds CSAT on, with the Policy trigger row checked', () => {
    const csat = seedCsat()
    expect(csat.on).toBe(true)
    expect(csat.onPolicyTrigger).toBe(true)
    expect(csat.question).toBe('How would you rate your experience today?')
    expect(csat.scale).toBe('From 1-5')
    expect(csat.style).toBe('stars')
  })

  it('offers the six scale styles the frame shows, in its order', () => {
    expect(CSAT_STYLES.map((s) => s.label)).toEqual([
      'Smiles',
      'BW smiles',
      'Animated smiles',
      'Stars',
      'Hearts',
      'Numbers',
    ])
    // The seeded style must be one of them.
    expect(CSAT_STYLES.some((s) => s.id === seedCsat().style)).toBe(true)
  })

  it('gives each segment its own CSAT config', () => {
    expect(SEED_SEGMENTS[0].csat).not.toBe(SEED_SEGMENTS[1].csat)
  })
})

describe('config-data — knowledge + embed', () => {
  it('lists the three mock knowledge connections, all on', () => {
    expect(KNOWLEDGE_CONNECTIONS.map((c) => c.title)).toEqual([
      'http://www.mytestknowledgebase.ai',
      'Salesforce',
      'Airtable',
    ])
    expect(KNOWLEDGE_CONNECTIONS.every((c) => c.on)).toBe(true)
  })

  it('builds the embed snippet around whichever key it is handed', () => {
    const revealed = snippetToText(embedSnippetLines('"ft_a2a_live_abc"'))
    expect(revealed).toContain('<script src="https://solve-widget.forethought.ai/embed.js"')
    expect(revealed).toContain('data-api-key="ft_a2a_live_abc"')
    const hidden = snippetToText(embedSnippetLines(EMBED_KEY_PLACEHOLDER))
    expect(hidden).toContain(EMBED_KEY_PLACEHOLDER)
    expect(hidden).not.toContain('ft_a2a_live_abc')
  })

  it('indents the snippet the way the frame nests it', () => {
    const lines = embedSnippetLines('x')
    expect(lines[0].indent).toBe(0)
    expect(lines[2].indent).toBe(1)
    expect(lines[3].indent).toBe(2)
    expect(snippetToText(lines).split('\n')[3].startsWith('    ')).toBe(true)
  })
})

describe('config-data — headless', () => {
  it('has four headless steps with the expected titles in order', () => {
    expect(HEADLESS_STEPS.map((s) => s.title)).toEqual([
      'Add Forethought as an A2A agent',
      'Authenticate with your API key',
      "Pass the end-user's identity",
      'Send a message',
    ])
    expect(HEADLESS_STEPS.map((s) => s.n)).toEqual(['01', '02', '03', '04'])
    expect(HEADLESS_STEPS.every((s) => s.code.length > 0 && s.body.length > 0)).toBe(true)
  })

  it('exposes the A2A endpoint URLs', () => {
    expect(A2A_AGENT_CARD_URL).toMatch(/agent-card\.json$/)
    expect(A2A_MESSAGE_ENDPOINT).toMatch(/\/v1\/message$/)
  })

  it('nextApiKey returns distinct ft_a2a_live_ keys on successive calls', () => {
    const a = nextApiKey()
    const b = nextApiKey()
    expect(a).toMatch(/^ft_a2a_live_/)
    expect(b).toMatch(/^ft_a2a_live_/)
    expect(a).not.toBe(b)
  })

  it('seedApiKey is a stable ft_a2a_live_ key', () => {
    expect(seedApiKey()).toBe(seedApiKey())
    expect(seedApiKey()).toMatch(/^ft_a2a_live_/)
  })
})
