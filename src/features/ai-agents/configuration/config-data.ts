// Mock data + types for the AI Agents → Configuration screen.
// Frontend-only; no backend. Values mirror the Figma section "Config" (frames
// Config_01 → the six siblings beside it): Widget ▸ Widget segments, AI
// Personality, CSAT, Knowledge Base, Embed, and Voice ▸ Voice segment, AI
// Personality. The Web Call tab mirrors the frame "Explore-Voice-Unification"
// (133-125597): Web Call segment — segment name, tags, default flag, company
// and agent names.
//
// Vocabulary note: what this screen configures is a **segment** — the design
// says "Widget segment" / "New segment" / "Segment name" throughout.
// It is deliberately not called a brand: `Brand` already means an app-level
// brand (see `app/brand-context`), and the two are different things.
import type { GardenIconName } from '@/components/garden-icon'

// `color` is the per-channel brand tint of the tab's icon (from Figma); it stays
// applied whether or not the tab is active. No design token — brand-specific.
export type ChannelTab = {
  id: 'widget' | 'voice' | 'webcall' | 'headless'
  label: string
  color: string
}

export const CHANNEL_TABS: ChannelTab[] = [
  { id: 'widget', label: 'Widget', color: '#e05c34' },
  { id: 'voice', label: 'Voice', color: '#be297b' },
  { id: 'webcall', label: 'Web Call', color: '#7c1d79' },
  { id: 'headless', label: 'Headless', color: '#2f99b3' },
]

// ── AI Personality ──────────────────────────────────────────────────────────
// Per-segment AI Personality config (the Sentiment rail section). Freeform text
// + optional preset tone chips. Both `toneUse*` flags gate their control in the
// UI. Widget and Voice each keep their own copy of this: the screen is
// channel-tabbed, so a segment's voice personality is not its widget one.
export type Personality = {
  generalContext: string
  glossary: string
  toneFreeform: string
  toneUseFreeform: boolean
  toneUsePresets: boolean
  tonePresets: string[]
}

export function emptyPersonality(): Personality {
  return {
    generalContext: '',
    glossary: '',
    toneFreeform: '',
    toneUseFreeform: true,
    toneUsePresets: false,
    tonePresets: [],
  }
}

// ── CSAT ────────────────────────────────────────────────────────────────────
export type RatingTone = 'negative' | 'neutral' | 'positive'

// One row of the rating scale: the numeral, its editable label, and the
// sentiment the label is read as.
export type RatingStep = { value: number; label: string; tone: RatingTone }

export type CsatStyleId =
  'smiles' | 'bw-smiles' | 'animated-smiles' | 'stars' | 'hearts' | 'numbers'

// How the scale is drawn in the widget. `kind` says what to render: an emoji
// glyph, an outline glyph (a lucide face), or the bare numeral — the design
// uses emoji artwork for four of the six, which is also how the dashboard's
// health card renders its glyph (see home/health/HealthHeroBand).
export type CsatStyle = {
  id: CsatStyleId
  label: string
  kind: 'emoji' | 'outline' | 'numeral'
  value: string
}

export const CSAT_STYLES: CsatStyle[] = [
  { id: 'smiles', label: 'Smiles', kind: 'emoji', value: '😄' },
  { id: 'bw-smiles', label: 'BW smiles', kind: 'outline', value: '' },
  { id: 'animated-smiles', label: 'Animated smiles', kind: 'emoji', value: '😍' },
  { id: 'stars', label: 'Stars', kind: 'emoji', value: '⭐' },
  { id: 'hearts', label: 'Hearts', kind: 'emoji', value: '❤️' },
  { id: 'numbers', label: 'Numbers', kind: 'numeral', value: '5' },
]

export type CsatConfig = {
  on: boolean
  // Availability. `afterInteractionsCount` is a free-text count, so it stays a
  // string (the field accepts what is typed and is never parsed here).
  afterInteractions: boolean
  afterInteractionsCount: string
  viaWidgetHeader: boolean
  onLiveChatEnd: boolean
  // Locked: the Policy owns the CSAT trigger, so this is checked and inert.
  onPolicyTrigger: boolean
  question: string
  scale: string
  style: CsatStyleId
  steps: RatingStep[]
}

export function seedCsat(): CsatConfig {
  return {
    on: true,
    afterInteractions: true,
    afterInteractionsCount: '2',
    viaWidgetHeader: true,
    onLiveChatEnd: true,
    onPolicyTrigger: true,
    question: 'How would you rate your experience today?',
    scale: 'From 1-5',
    style: 'stars',
    steps: [
      { value: 1, label: 'Terrible', tone: 'negative' },
      { value: 2, label: 'Bad', tone: 'negative' },
      { value: 3, label: 'Okay', tone: 'neutral' },
      { value: 4, label: 'Good', tone: 'positive' },
      { value: 5, label: 'Excellent', tone: 'positive' },
    ],
  }
}

export const CSAT_SCALE_OPTIONS = ['From 1-3', 'From 1-5', 'From 1-7'] as const

// ── Voice ───────────────────────────────────────────────────────────────────
export type VoiceConfig = {
  phoneNumbers: string[]
  companyName: string
  aiAgentName: string
  handoffNumber: string
  initialIntent: string
  personality: Personality
  settings: VoiceSettings
  privacy: VoicePrivacyConfig
  csat: VoiceCsatConfig
}

export const VOICE_INTENT_OPTIONS = [
  'Select use case',
  'Account access',
  'Refund request',
  'Trip issue',
] as const

// ── Voice ▸ Voice (microphone rail section) ─────────────────────────────────
// The greeting, default language, AI voice picker and speaking speed, from the
// frame "Explore-Voice-Unification" (124-62727). Per segment, like the rest of
// VoiceConfig; the frame's second tab (Sounds) has no designed content.
export type VoiceOption = {
  id: string
  name: string
  description: string
}

export type VoiceSettings = {
  greeting: string
  defaultLanguage: string
  /** Off reads "Auto language switching is off" beside the toggle. */
  autoLanguageSwitching: boolean
  /** The picker's search box; filters the list client-side. */
  voiceQuery: string
  voiceId: string
  /** 0–100 on the Slowest…Fastest scale; 50 is "Normal". */
  voiceSpeed: number
  /** Sounds tab: the wait-time effect toggle and which effect is picked. */
  soundOn: boolean
  soundEffect: string
  /** The ON variant's Enabled languages table (and the modal's rows). */
  languages: VoiceLanguage[]
}

export type VoiceLanguage = {
  id: string
  flag: string
  label: string
  /** The voice name shown in the table's Voice column. */
  voice: string
}

// The ON variant's seeded table (frame 100:51381): English default, German,
// Korean — the frame's row names ("Row — Spanish") don't match their content,
// so the mock follows the visible content.
export const VOICE_LANGUAGE_ROWS: VoiceLanguage[] = [
  { id: 'english', flag: '🇺🇸', label: 'English (default)', voice: 'Tim' },
  { id: 'german', flag: '🇩🇪', label: 'German', voice: 'Sofía' },
  { id: 'korean', flag: '🇰🇷', label: 'Korean', voice: 'Camille' },
]

// ── Voice ▸ Sounds tab ──────────────────────────────────────────────────────
export type VoiceSoundEffect = { id: string; name: string; description: string }

export const VOICE_SOUND_EFFECTS: VoiceSoundEffect[] = [
  { id: 'typewriter', name: 'Typewriter', description: 'Crisp, rapid keystrokes' },
  { id: 'chime', name: 'Chime', description: 'Gentle, muted tone' },
]

// ── Voice ▸ Privacy ─────────────────────────────────────────────────────────
// Recording toggle + the disclosure read before a call, per direction
// (frame 124:67675; rail's license slot).
export type VoicePrivacyConfig = {
  recording: boolean
  playDisclaimer: boolean
  side: 'inbound' | 'outbound'
  disclaimer: string
}

export const VOICE_DISCLAIMER_TEXT =
  'This call may be recorded for quality assurance and training purposes. By continuing with this call, you consent to potentially receiving an SMS CSAT survey.'

export function seedVoicePrivacy(
  overrides: Partial<VoicePrivacyConfig> = {},
): VoicePrivacyConfig {
  return {
    recording: true,
    playDisclaimer: false,
    side: 'inbound',
    disclaimer: VOICE_DISCLAIMER_TEXT,
    ...overrides,
  }
}

// ── Voice ▸ CSAT (SMS Message / CSAT survey tabs) ───────────────────────────
export type VoiceCsatConfig = {
  // SMS tab
  on: boolean
  sendAfterNonResolved: boolean
  smsMessage: string
  // CSAT tab
  themeColor: string
  question: string
  style: 'stars' | 'smiles' | 'bw-smiles'
  steps: RatingStep[]
  // Reasons for rating (frame 132:81756): the follow-up asked after the rating.
  followUpNegativeNeutral: boolean
  followUpPositive: boolean
  followUpQuestion: string
  followUpOptions: string[]
  // Resolution confirmation: a second, yes/no-style question.
  resolution: boolean
  resolutionQuestion: string
  resolutionOptions: string[]
  // Additional feedback + the confirmation shown at the end.
  openFeedback: boolean
  confirmationMessage: string
}

export const VOICE_SMS_MESSAGE =
  'Hi, thanks for speaking with our AI support agent earlier! Please click the link below to give us feedback:'

export function seedVoiceCsat(overrides: Partial<VoiceCsatConfig> = {}): VoiceCsatConfig {
  return {
    on: true,
    sendAfterNonResolved: false,
    smsMessage: VOICE_SMS_MESSAGE,
    themeColor: '#000000',
    question: 'How would you rate your experience today?',
    style: 'stars',
    steps: seedCsat().steps,
    followUpNegativeNeutral: true,
    followUpPositive: true,
    followUpQuestion: "We're sorry to hear that. Could you share what didn't go well?",
    followUpOptions: [
      'Took too long',
      'The info was hard to understand',
      'Unhelpful response',
      'Unfriendly',
    ],
    resolution: true,
    resolutionQuestion: 'Has your reported issue been resolved today?',
    resolutionOptions: ['Yes', 'No, not really'],
    openFeedback: false,
    confirmationMessage: 'We value and thank you for your feedback.',
    ...overrides,
  }
}

export const VOICE_LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Hindi',
  'Japanese',
] as const

// Six rows like the frame's list. The frame repeats "Tim" with the same blurb;
// the mock varies the names so the search filter has something to find. Only
// the first card is designed in its selected state, so it is the seed.
export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'sarah-curious',
    name: 'Sarah Curious',
    description: 'This voice is natural and expressive with a calm quality',
  },
  { id: 'tim', name: 'Tim', description: 'This voice is natural and expressive with a calm quality' },
  {
    id: 'rachel',
    name: 'Rachel',
    description: 'This voice is natural and expressive with a calm quality',
  },
  {
    id: 'marcus',
    name: 'Marcus',
    description: 'This voice is natural and expressive with a calm quality',
  },
  { id: 'ava', name: 'Ava', description: 'This voice is natural and expressive with a calm quality' },
  {
    id: 'noah',
    name: 'Noah',
    description: 'This voice is natural and expressive with a calm quality',
  },
]

export function seedVoiceSettings(overrides: Partial<VoiceSettings> = {}): VoiceSettings {
  return {
    greeting: 'Hello, thanks for calling Uber Support. How can I help you today?',
    defaultLanguage: 'English',
    autoLanguageSwitching: false,
    voiceQuery: '',
    voiceId: 'sarah-curious',
    voiceSpeed: 50,
    soundOn: true,
    soundEffect: 'typewriter',
    languages: VOICE_LANGUAGE_ROWS,
    ...overrides,
  }
}

// ── Web Call ─────────────────────────────────────────────────────────────────
// The web call's appearance settings, from the Appearance ▸ Theme frame
// ("Explore-Voice-Unification" 135-138214): what the in-call header says, the
// theme color, and the size/mode/position tiles. Launch icon and header logo
// are images in the frame; the mock renders the Uber mark and doesn't model
// uploads.
export type WebCallTheme = {
  headerText: string
  themeColor: string
  size: 'standard' | 'large'
  mode: 'light' | 'dark'
  position: 'bottom-right' | 'bottom-left'
}

export function seedWebCallTheme(overrides: Partial<WebCallTheme> = {}): WebCallTheme {
  return {
    headerText: 'Rider support',
    themeColor: '#000000',
    size: 'standard',
    mode: 'light',
    position: 'bottom-right',
    ...overrides,
  }
}

// The Appearance ▸ Avatar tab (frame 133-131295): whether the voice animation
// shows, and which stock visualization it uses. The frame also has an upload
// slot for a custom 120×120 PNG; uploads aren't modeled.
export type WebCallAvatar = {
  showAnimation: boolean
  visual: 'ring' | 'outline' | 'orb' | 'waveform'
}

export function seedWebCallAvatar(overrides: Partial<WebCallAvatar> = {}): WebCallAvatar {
  // The frame opens with the animation on and the rainbow ring selected.
  return { showAnimation: true, visual: 'ring', ...overrides }
}

// The Appearance-rail Voice section (frame 135-140107): greeting, default
// language, auto language switching, the picked AI voice, and the below-fold
// speed slider (Slowest–Normal–Fastest).
export type WebCallVoice = {
  greeting: string
  language: string
  autoLanguageSwitching: boolean
  voiceId: string
  /** 0–100; 50 = Normal on the frame's Slowest/Normal/Fastest scale. */
  speed: number
}

export function seedWebCallVoice(overrides: Partial<WebCallVoice> = {}): WebCallVoice {
  return {
    greeting: "Hello, this is Uber's voice assistant. How can I help you today?",
    language: 'English',
    autoLanguageSwitching: false,
    voiceId: 'sarah-curious',
    // The frame draws the knob just left of Normal.
    speed: 45,
    ...overrides,
  }
}

// The AI-voice catalog. The frame repeats its placeholder row — Sarah Curious
// plus three identical Tims — so the mock does the same.
export type WebCallVoiceOption = { id: string; name: string; description: string }

const WEBCALL_VOICE_DESCRIPTION = 'This voice is natural and expressive with a calm quality'

export const WEBCALL_VOICES: WebCallVoiceOption[] = [
  { id: 'sarah-curious', name: 'Sarah Curious', description: WEBCALL_VOICE_DESCRIPTION },
  { id: 'tim-1', name: 'Tim', description: WEBCALL_VOICE_DESCRIPTION },
  { id: 'tim-2', name: 'Tim', description: WEBCALL_VOICE_DESCRIPTION },
  { id: 'tim-3', name: 'Tim', description: WEBCALL_VOICE_DESCRIPTION },
]

// The seven languages the Voice channel seeds its segments with.
export const WEBCALL_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Hindi',
  'Japanese',
] as const

// The web call's own identity fields — what the floating call experience calls
// the company and the agent, plus its theme, avatar and voice. Fewer fields
// than VoiceConfig: the frames design no numbers, handoff or initial intent
// for web calls.
/** The webcall AI personality section (frame 135-142264). */
export type WebCallPersonality = {
  enabled: boolean
  generalContext: string
  glossary: string
  tone: string
  useSuggestions: boolean
  suggestions: string[]
}

export function seedWebCallPersonality(
  overrides: Partial<WebCallPersonality> = {},
): WebCallPersonality {
  // The frame draws the toggle on, both textareas on their Example:
  // placeholders, and the suggestions checkbox off.
  return {
    enabled: true,
    generalContext: '',
    glossary: '',
    tone: '',
    useSuggestions: false,
    suggestions: [],
    ...overrides,
  }
}

/** The webcall CSAT section (frame 135-152791) — the rail's smiley. Same
 * anatomy as the widget's CsatConfig but this frame's own copy ("via the
 * header", "the call ends"), seeds (After 1 interaction, only that checkbox
 * on) and a three-tile style picker (stars / emoji smiles / outline smiles).
 * `onPolicyTrigger` is locked on — the Policy owns the trigger. */
export type WebCallCsatStyleId = 'stars' | 'smiles' | 'bw-smiles'

export type WebCallCsat = {
  on: boolean
  afterInteractions: boolean
  afterInteractionsCount: string
  viaHeader: boolean
  onCallEnd: boolean
  onPolicyTrigger: boolean
  question: string
  scale: string
  style: WebCallCsatStyleId
  steps: RatingStep[]
  // Reasons for rating (the full panel, frame 135-133944): low (1-3) collects
  // Negative+Neutral, high (4-5) collects Positive.
  requestLow: boolean
  requestHigh: boolean
  lowQuestion: string
  lowReasons: string[]
  // Resolution confirmation.
  confirmResolution: boolean
  confirmQuestion: string
  confirmReasons: string[]
  // Additional feedback + the closing confirmation message.
  openFeedback: boolean
  confirmationMessage: string
  // The Emojis tab (frame 135-154344): the in-call reaction sheet on/off.
  emojisOn: boolean
}

export function seedWebCallCsat(overrides: Partial<WebCallCsat> = {}): WebCallCsat {
  return {
    on: true,
    afterInteractions: true,
    afterInteractionsCount: '1',
    viaHeader: false,
    onCallEnd: false,
    onPolicyTrigger: true,
    question: 'How would you rate your experience today?',
    scale: 'From 1 to 5',
    style: 'stars',
    steps: [
      { value: 1, label: 'Terrible', tone: 'negative' },
      { value: 2, label: 'Bad', tone: 'negative' },
      { value: 3, label: 'Okay', tone: 'neutral' },
      { value: 4, label: 'Good', tone: 'positive' },
      { value: 5, label: 'Excellent', tone: 'positive' },
    ],
    requestLow: true,
    requestHigh: true,
    lowQuestion: "We're sorry to hear that. Could you share what didn't go well?",
    lowReasons: [
      'Took too long',
      'The info was hard to understand',
      'Unhelpful response',
      'Unfriendly',
    ],
    confirmResolution: true,
    confirmQuestion: 'Has your reported issue been resolved today?',
    confirmReasons: ['Yes', 'No, not really'],
    openFeedback: false,
    confirmationMessage: 'We value and thank you for your feedback.',
    emojisOn: true,
    ...overrides,
  }
}

/** The webcall Privacy section (frame 135-144184). The three fields draw as
 * placeholders in the frame, so they seed empty and the panel/preview fall
 * back to the placeholder copy. */
export type WebCallPrivacy = {
  recording: boolean
  promptHeader: string
  policyBody: string
  ctaLabel: string
}

export function seedWebCallPrivacy(overrides: Partial<WebCallPrivacy> = {}): WebCallPrivacy {
  return { recording: true, promptHeader: '', policyBody: '', ctaLabel: '', ...overrides }
}

export type WebCallConfig = {
  companyName: string
  agentName: string
  theme: WebCallTheme
  avatar: WebCallAvatar
  voice: WebCallVoice
  personality: WebCallPersonality
  privacy: WebCallPrivacy
  csat: WebCallCsat
}

export function seedWebCall(overrides: Partial<WebCallConfig> = {}): WebCallConfig {
  return {
    companyName: 'Uber',
    agentName: 'Uber',
    theme: seedWebCallTheme(),
    avatar: seedWebCallAvatar(),
    voice: seedWebCallVoice(),
    personality: seedWebCallPersonality(),
    privacy: seedWebCallPrivacy(),
    csat: seedWebCallCsat(),
    ...overrides,
  }
}

// ── Segments ────────────────────────────────────────────────────────────────
// A segment a customer can configure a widget (or voice agent) for. `swatch` is
// the list dot colour; `label` is the short name the left list shows; `name` is
// the editable Segment name in the panel; `widgetTitle` is what the chat header
// reads. The design keeps all three separate — the list says "Riders", the
// panel field says "Riders", while the widget header still carries the Uber
// mark and says "Uber Rider Support". `widgetAccent` keeps presentation that
// varies by segment (the Business riders frame uses blue instead of black)
// with the segment rather than hardcoding it in the preview.
export type Segment = {
  id: string
  label: string
  name: string
  widgetMark: string
  widgetTitle: string
  widgetAccent: string
  swatch: string
  tags: string[]
  isDefault: boolean
  enabled: boolean
  personality: Personality
  csat: CsatConfig
  voice: VoiceConfig
  webcall: WebCallConfig
}

function seedVoice(overrides: Partial<VoiceConfig> = {}): VoiceConfig {
  return {
    phoneNumbers: ['+1 333-123-4567'],
    companyName: 'Uber',
    aiAgentName: 'Uber',
    handoffNumber: '',
    initialIntent: 'Select use case',
    personality: emptyPersonality(),
    settings: seedVoiceSettings(),
    privacy: seedVoicePrivacy(),
    csat: seedVoiceCsat(),
    ...overrides,
  }
}

export const SEED_SEGMENTS: Segment[] = [
  {
    id: 'riders',
    label: 'Riders',
    name: 'Riders',
    widgetMark: 'Uber',
    widgetTitle: 'Uber Rider Support',
    widgetAccent: '#000000',
    swatch: '#ff2d78',
    tags: ['rider_app', 'ios', 'android', 'web'],
    isDefault: true,
    enabled: true,
    personality: emptyPersonality(),
    csat: seedCsat(),
    voice: seedVoice({ phoneNumbers: ['+1 333-123-4567', '+1 888-888-5607'] }),
    webcall: seedWebCall(),
  },
  {
    id: 'one-members',
    label: 'One members',
    name: 'Uber One',
    widgetMark: 'Uber',
    widgetTitle: 'Uber One Support',
    widgetAccent: '#000000',
    swatch: '#7fb3f0',
    tags: ['uber_one'],
    isDefault: false,
    enabled: true,
    personality: emptyPersonality(),
    csat: seedCsat(),
    voice: seedVoice({ companyName: 'Uber One', aiAgentName: 'Uber One' }),
    webcall: seedWebCall({ companyName: 'Uber One', agentName: 'Uber One' }),
  },
  {
    id: 'business-riders',
    label: 'Business riders',
    name: 'Business riders',
    widgetMark: 'Uber',
    widgetTitle: 'Uber Business Rider',
    widgetAccent: '#2047b9',
    swatch: '#c39bf0',
    tags: ['business_profile'],
    isDefault: false,
    enabled: true,
    personality: emptyPersonality(),
    csat: seedCsat(),
    voice: seedVoice({
      phoneNumbers: [],
      companyName: 'Uber for Business',
      aiAgentName: 'Uber for Business',
    }),
    webcall: seedWebCall({ companyName: 'Uber for Business', agentName: 'Uber for Business' }),
  },
]

// Voice uses language-based segments in its design rather than reusing the
// Widget audience list. Keeping a separate local seed also lets each channel
// remember edits and selection independently.
const VOICE_LANGUAGES = [
  { id: 'riders-english', label: 'Riders English', swatch: '#e868bd' },
  { id: 'riders-spanish', label: 'Riders Spanish', swatch: '#84b9f5' },
  { id: 'riders-french', label: 'Riders French', swatch: '#b383ee' },
  { id: 'riders-german', label: 'Riders German', swatch: '#82c2bd' },
  { id: 'riders-portuguese', label: 'Riders Portuguese', swatch: '#94b3c5' },
  { id: 'riders-hindi', label: 'Riders Hindi', swatch: '#fae5bd' },
  { id: 'riders-japanese', label: 'Riders Japanese', swatch: '#e99888' },
] as const

export const VOICE_SEED_SEGMENTS: Segment[] = VOICE_LANGUAGES.map((language, index) => ({
  id: language.id,
  label: language.label,
  // The same string the list row and the preview header show. This used to
  // singularise ("Riders English" → "Rider English"), which put two spellings of
  // one segment on screen at once: the header reads 'Riders English' while the
  // Segment name field — whose helper says it identifies the segment in
  // configuration and insights — read Rider English.
  name: language.label,
  widgetMark: 'Uber',
  widgetTitle: 'Uber Rider Support',
  widgetAccent: '#000000',
  swatch: language.swatch,
  tags: [],
  isDefault: index === 0,
  enabled: true,
  personality: emptyPersonality(),
  csat: seedCsat(),
  voice: seedVoice(
    index === 0
      ? {
          phoneNumbers: ['+1 333-123-4567', '+1 888-888-56071'],
          aiAgentName: 'James',
        }
      : { phoneNumbers: [] },
  ),
  webcall: seedWebCall(),
}))

// Web Call mirrors its frame's audience list — the Widget three (Riders /
// One members / Business Riders) with the frame's own swatches (🌸 #ff70c6,
// Global blue--300 / purple--300) and its placeholder routing tags. The frame
// leaves "Set as default" unchecked for Riders, so no segment starts default.
// Like Voice, a separate seed keeps selection and edits per channel.
export const WEBCALL_SEED_SEGMENTS: Segment[] = [
  {
    id: 'riders',
    label: 'Riders',
    name: 'Riders',
    widgetMark: 'Uber',
    widgetTitle: 'Uber Rider Support',
    widgetAccent: '#000000',
    swatch: '#ff70c6',
    tags: ['Tag A', 'Tag B', 'Tag C', 'Tag D'],
    isDefault: false,
    enabled: true,
    personality: emptyPersonality(),
    csat: seedCsat(),
    voice: seedVoice(),
    webcall: seedWebCall(),
  },
  {
    id: 'one-members',
    label: 'One members',
    name: 'One members',
    widgetMark: 'Uber',
    widgetTitle: 'Uber One Support',
    widgetAccent: '#000000',
    swatch: '#85beff',
    tags: [],
    isDefault: false,
    enabled: true,
    personality: emptyPersonality(),
    csat: seedCsat(),
    voice: seedVoice(),
    webcall: seedWebCall({ companyName: 'Uber One', agentName: 'Uber One' }),
  },
  {
    id: 'business-riders',
    label: 'Business Riders',
    name: 'Business Riders',
    widgetMark: 'Uber',
    widgetTitle: 'Uber Business Rider',
    widgetAccent: '#000000',
    swatch: '#c89cff',
    tags: [],
    isDefault: false,
    enabled: true,
    personality: emptyPersonality(),
    csat: seedCsat(),
    voice: seedVoice(),
    webcall: seedWebCall({ companyName: 'Uber for Business', agentName: 'Uber for Business' }),
  },
]

// ── The customization rail ──────────────────────────────────────────────────
// Right-edge rail. `RailSection.id` is what the view keys its panel off, so the
// ids that have designed content are the ones the view switches on; the rest
// highlight on click and keep the section's panel (deferred).
export type RailSection = { id: string; icon: GardenIconName; label: string }

// Widget rail: six sections, a divider, then the trailing five.
export const WIDGET_RAIL_SECTIONS: RailSection[] = [
  { id: 'segments', icon: 'user-group-stroke', label: 'Segments' },
  { id: 'links', icon: 'link-stroke', label: 'Links' },
  { id: 'sentiment', icon: 'heart-stroke', label: 'Sentiment' },
  { id: 'license', icon: 'credit-card-stroke', label: 'License' },
  { id: 'mood', icon: 'smiley-stroke', label: 'Mood' },
  { id: 'announce', icon: 'megaphone-stroke', label: 'Announcements' },
  { id: 'code', icon: 'markup-stroke', label: 'Embed' },
  { id: 'knowledge', icon: 'lightbulb-stroke', label: 'Knowledge' },
  { id: 'install', icon: 'download-stroke', label: 'Install' },
  { id: 'messages', icon: 'speech-bubble-lightning-stroke', label: 'Messages' },
  { id: 'more', icon: 'overflow-stroke', label: 'More' },
]

// Voice rail: a shorter set — no embed/announcements, plus a microphone and an
// API section.
// The rail follows the design's icon order: Segments, Voice, Privacy,
// Sentiment, CSAT — then the site-wide group after the divider: Knowledge,
// Fallback, API (the ids predate the design pass and are stable routing keys,
// so they stay; the labels now match the design's panel titles).
export const VOICE_RAIL_SECTIONS: RailSection[] = [
  { id: 'segments', icon: 'user-group-stroke', label: 'Segments' },
  { id: 'voice', icon: 'microphone-on-stroke', label: 'Voice' },
  { id: 'license', icon: 'credit-card-stroke', label: 'Privacy' },
  { id: 'sentiment', icon: 'heart-stroke', label: 'Sentiment' },
  { id: 'mood', icon: 'smiley-stroke', label: 'CSAT' },
  { id: 'knowledge', icon: 'lightbulb-stroke', label: 'Knowledge' },
  { id: 'install', icon: 'download-stroke', label: 'Fallback' },
  { id: 'api', icon: 'plug-stroke', label: 'API' },
]

// Headless uses the same compact, icon-only rail treatment as Widget and
// Voice, while keeping the channel-specific sections from its setup flow.
export const HEADLESS_RAIL_SECTIONS: RailSection[] = [
  { id: 'headless', icon: 'markup-stroke', label: 'Headless' },
  { id: 'knowledge', icon: 'lightbulb-stroke', label: 'Knowledge' },
  { id: 'personality', icon: 'heart-stroke', label: 'Personality' },
]

// Web Call rail, from the frame: six sections (segments, appearance, voice,
// sentiment, privacy, mood), then a trailing group. The pen-nib glyph in the
// frame is Garden's pencil-stroke; the four-arrows glyph is share-stroke; the
// privacy glyph is tabler's document-with-seal (file-document-stroke is
// Garden's closest).
export const WEBCALL_RAIL_SECTIONS: RailSection[] = [
  { id: 'segments', icon: 'user-group-stroke', label: 'Segments' },
  { id: 'appearance', icon: 'pencil-stroke', label: 'Appearance' },
  { id: 'voice', icon: 'microphone-on-stroke', label: 'Voice' },
  { id: 'sentiment', icon: 'heart-stroke', label: 'Sentiment' },
  { id: 'privacy', icon: 'file-document-stroke', label: 'Privacy' },
  { id: 'mood', icon: 'smiley-stroke', label: 'Mood' },
  { id: 'knowledge', icon: 'lightbulb-stroke', label: 'Knowledge' },
  { id: 'install', icon: 'download-stroke', label: 'Install' },
  { id: 'share', icon: 'share-stroke', label: 'Share' },
  { id: 'code', icon: 'markup-stroke', label: 'Embed' },
]

// First section id in each rail's trailing group (a divider renders before it).
export const WIDGET_RAIL_TRAILING_START = 'code'
export const VOICE_RAIL_TRAILING_START = 'knowledge'
export const WEBCALL_RAIL_TRAILING_START = 'knowledge'

// Sections whose settings are not per-segment: the preview says so instead of
// naming the selected segment and its tags.
export const ALL_SEGMENT_SECTIONS = ['knowledge', 'code'] as const

export function isAllSegments(sectionId: string): boolean {
  return (ALL_SEGMENT_SECTIONS as readonly string[]).includes(sectionId)
}

// Suggested tags for the (decorative) "Assign tags" dropdown.
//
// A segment's `tags` are the routing tags that put a visitor *into* it — not
// the segment's own name, which is `label`/`name`. Hence 'rider_app' rather
// than 'Riders': a segment named Riders carrying a tag "Riders" says nothing.
// (Agent.tags in agent-builder-data.ts is the other thing entirely — there it
// reads as which segments a use case is scoped to.)
export const SUGGESTED_TAGS = ['rider_app', 'driver_app', 'ios', 'android', 'web', 'uber_one']

// Compact summary of a segment's tags for the filter row above the preview
// (e.g. ['A','B','C','D'] → "A, B, +2"). Empty when there are no tags.
export function summarizeTags(tags: string[]): string {
  if (tags.length === 0) return ''
  if (tags.length <= 2) return tags.join(', ')
  return `${tags.slice(0, 2).join(', ')}, +${tags.length - 2}`
}

// ── Panel copy ──────────────────────────────────────────────────────────────
// Static copy, transcribed from the frames. Kept here rather than inline so the
// panels stay layout-only and the wording is reviewable in one place.

export const WIDGET_SEGMENTS_COPY = {
  visibility: 'Widget is visible to users in this segment',
  title: 'Widget segment',
  intro:
    "Create a widget experience for a specific audience. Assign tags to define who belongs to this segment, then customize the widget's design and behavior for them.",
  segmentName: {
    label: 'Segment name',
    helper: 'Used to identify this segment in configuration and insights.',
  },
  tags: {
    label: 'Tags',
    helper: 'Select the tags that identify users in this segment. Manage available tags in',
    link: 'Global Tags',
  },
  default: {
    label: 'Set as Default',
    helper: 'Enable this segment by default if no specific tags are assigned or found in the',
    link: 'embedded script',
  },
} as const

// Tone presets shown as toggle chips in the AI Personality panel.
export const TONE_PRESET_OPTIONS = [
  'Empathetic',
  'Friendly',
  'Professional',
  'Straightforward',
  'Humorous',
  'Formal',
] as const

// Static copy for the AI Personality panel's three sections. `intro` is the
// Widget wording; `voiceIntro` is the Voice tab's, which talks about calls.
export const AI_PERSONALITY_COPY = {
  intro:
    'Define your agent’s voice and behavior, including tone, terminology, formatting, and how it responds to different audiences.',
  voiceIntro:
    'Define how your agent behaves and speaks, including tone, speaking style, and terminology. Keep inbound and outbound calls aligned with your segment’s standards.',
  generalContext: {
    label: 'General Context',
    helper: 'What should your agent know about your company, products, and customers?',
    placeholder:
      'Example:\nWe sell products to both buyers and sellers.\nBuyer Persona: Focused on product details, pricing, shipping, and support.\nSeller Persona: Focused on inventory, sales tools, and account features.',
    footnote: 'Keep it under 100 words',
  },
  glossary: {
    label: 'Glossary',
    helper: 'What company-specific terms should your agent understand and use?',
    placeholder:
      'Example:\n“NPF” for product feature\n“PF” stand for Paid Feature\n“FT” stands for Fee Trial',
    footnote: 'Keep it under 100 words',
  },
  tone: {
    label: 'Tone of Voice',
    helper: 'How should your agent sound, write, and format responses?',
    freeformCheckboxLabel: 'Describe with your own words',
    presetsCheckboxLabel: 'Select suggestions',
    placeholder:
      'Example:\nFormal and professional tone.\nCasual and friendly tone.\nTechnical and actionable tone when giving advice.\nUse a numerical format to break down complex information for clarity.',
    footnote: 'Keep it under 100 words',
  },
} as const

export const CSAT_COPY = {
  tabs: ['CSAT', 'Quick Feedback'],
  toggleLabel: 'CSAT is on',
  availability: 'CSAT availability',
  afterPrefix: 'After',
  afterSuffix: 'user interactions',
  viaWidgetHeader: 'Anytime the user accesses it via the widget header',
  onLiveChatEnd: 'When the live chat ends',
  onPolicyTrigger: 'When CSAT Trigger is applied in the Policy',
  question: 'Rating question',
  scale: 'Scale',
  style: 'Style',
} as const

export const KNOWLEDGE_COPY = {
  title: 'Knowledge Base',
  intro:
    'Define your agent’s voice and behavior, including tone, terminology, formatting, and how it responds to different audiences.',
  retrieval: {
    label: 'Knowledge Retrieval',
    action: 'Build ‘Knowledge Retrieval’',
    helper:
      'Knowledge Retrieval searches your connected knowledge sources and presents relevant articles based on the customer’s question.',
  },
  coaching: {
    label: 'Knowledge coaching',
    action: 'Knowledge coaching',
    helper:
      'Guide how your agent searches and uses help content by prioritizing sources, handling outdated information, excluding irrelevant content, and adding context.',
  },
  connected: { label: 'Connected knowledge', action: 'Connect new' },
} as const

// The mock connections the Knowledge Base panel lists. `mark` picks the row's
// glyph — 'link' is a bare link icon, the others are vendor stand-ins (the
// repo's convention for vendor artwork; see settings/IntegrationLogo).
export type KnowledgeConnection = {
  id: string
  mark: 'link' | 'salesforce' | 'airtable'
  title: string
  lastSync: string
  on: boolean
}

export const KNOWLEDGE_CONNECTIONS: KnowledgeConnection[] = [
  {
    id: 'mytestknowledgebase',
    mark: 'link',
    title: 'http://www.mytestknowledgebase.ai',
    lastSync: 'Last sync: Apr 4, 2023 at 11:15 am',
    on: true,
  },
  {
    id: 'salesforce',
    mark: 'salesforce',
    title: 'Salesforce',
    lastSync: 'Last sync: Apr 4, 2023 at 11:09 am',
    on: true,
  },
  {
    id: 'airtable',
    mark: 'airtable',
    title: 'Airtable',
    lastSync: 'Last sync: Apr 4, 2023 at 11:09 am',
    on: true,
  },
]

export const EMBED_COPY = {
  title: 'Embed',
  allowlist: {
    step: '1.',
    label: 'Domain allowlist',
    helper: 'The widget can only be installed on the domains listed here.',
    placeholder: 'http://',
    footnote: 'Enter your domain address to list your website',
  },
  snippet: {
    step: '2.',
    label: 'Code Snippet',
    copy: 'Copy code',
    showKey: 'Show API key in code snippet',
    refreshKey: 'Refresh API key',
    caption: 'Auto-generated code snippet',
  },
} as const

// The masked stand-in shown in place of the API key until it is revealed.
export const EMBED_KEY_PLACEHOLDER = '“ENABLE TO REVEAL HERE”'
export const EMBED_VALUE_PLACEHOLDER = '“ENTER-VALUE-HERE”'

// The embed snippet, as structured lines so the same source drives both the
// syntax-tinted render and the text the Copy button would hand over. `indent`
// is in monospace steps of 16px, matching the frame.
export type SnippetPart = { text: string; tone?: 'attr' | 'key' | 'muted' }
export type SnippetLine = { indent: 0 | 1 | 2; parts: SnippetPart[] }

export function embedSnippetLines(apiKey: string): SnippetLine[] {
  return [
    { indent: 0, parts: [{ text: '<!DOCTYPE html>' }] },
    { indent: 0, parts: [{ text: '<html lang="en">' }] },
    { indent: 1, parts: [{ text: '<script src="https://solve-widget.forethought.ai/embed.js"' }] },
    { indent: 2, parts: [{ text: 'type="application/javascript"' }] },
    {
      indent: 2,
      parts: [
        { text: 'data-api-key=', tone: 'attr' },
        { text: apiKey, tone: 'key' },
      ],
    },
    {
      indent: 2,
      parts: [
        { text: 'data-ft-Age=', tone: 'attr' },
        { text: EMBED_VALUE_PLACEHOLDER, tone: 'muted' },
      ],
    },
    { indent: 1, parts: [{ text: '/>' }] },
    { indent: 0, parts: [{ text: '</html>' }] },
  ]
}

export function snippetToText(lines: SnippetLine[]): string {
  return lines
    .map((line) => '  '.repeat(line.indent) + line.parts.map((p) => p.text).join(''))
    .join('\n')
}

export const VOICE_SEGMENT_COPY = {
  enabledLabel: 'Voice is enabled for users in this segment',
  title: 'Voice segment',
  intro:
    'Create tailored voice experiences for different user segments across inbound and outbound calls.',
  segmentName: {
    label: 'Segment name',
    helper: 'Used to identify this segment in configuration and insights.',
  },
  phone: {
    label: 'Phone number',
    helperLead: 'Assign phone numbers to this segment. Manage available numbers in',
    helperLink: 'Global phone numbers.',
    action: 'Phone number',
  },
  companyName: 'Company name',
  aiAgentName: 'Voice agent name',
  handoff: {
    label: 'Default handoff number',
    helper: 'Where calls go when the voice agent hands off to a human.',
    placeholder: '+1 123-123-1234',
  },
  intent: { label: 'Select initial use case for Inbound calls' },
  default: {
    label: 'Set as default',
    helper:
      'Enable this segment by default if no specific tags are assigned or found in voice agents.',
  },
} as const

export const VOICE_SETTINGS_COPY = {
  tabs: { voice: 'Voice', sounds: 'Sounds' },
  greeting: {
    label: 'Inbound call greeting',
    helperLead: 'Set specific call greetings for ',
    helperEmphasis: 'inbound calls.',
  },
  language: {
    label: 'Select default language',
    helper: 'The default language applies to greeting messages for all calls.',
  },
  picker: {
    label: 'Voice',
    autoOff: 'Auto language switching is off',
    autoOn: 'Auto language switching is on',
    searchPlaceholder: 'Search',
    filter: 'All',
  },
  speed: {
    label: 'Voice speed',
    helper: 'Adjust the speaking speed for all calls.',
    scale: ['Slowest', 'Normal', 'Fastest'],
  },
  sounds: {
    toggleOn: 'Wait time sound effect is on',
    toggleOff: 'Wait time sound effect is off',
    body: 'Enable a sound effect to play when the end user needs to wait while AI is executing an action.',
    label: 'Sound effect',
  },
  multilingual: {
    link: 'Multilingual settings',
    action: 'Multilingual settings',
    languagesColumn: 'Enabled languages',
    voiceColumn: 'Voice',
    modalIntro:
      'Select your enabled languages and choose a voice for each. Enabling multiple languages can affect performance and latency.',
    addLanguage: 'Add language',
    save: 'Save',
  },
} as const

export const VOICE_PRIVACY_COPY = {
  title: 'Privacy',
  intro:
    'Enable recording of all calls, and set specific disclaimers for inbound vs outbound calls.',
  recording: { label: 'Call recording', toggle: 'Enable automatic recording of all calls' },
  disclaimer: {
    label: 'Disclaimer',
    helper: 'Disclaimer will automatically play before all calls.',
    checkbox: 'Play disclaimer message before call connection',
    inbound: 'Inbound calls',
    outbound: 'Outbound calls',
    field: 'Disclaimer message',
  },
} as const

export const VOICE_KNOWLEDGE_COPY = {
  title: 'Knowledge Base',
  connect: { label: 'Connect with knowledge base', action: 'Connect new integration' },
  retrieval: {
    label: 'Knowledge Retrieval',
    action: 'Build Knowledge Retrieval in agent',
    helper:
      'The Knowledge retrieval feature triggers the connections you have defined in the Knowledge base, allowing relevant articles to be presented for customer queries.',
  },
  connections: { label: 'Current connections' },
} as const

export const VOICE_FALLBACK_COPY = {
  title: 'Fallback',
  connect: { label: 'Connect Help Desk', action: 'Connect new integration' },
  fallback: {
    label: 'Fallback',
    action: 'Build Fallback in agent',
    helper:
      "The fallback activates if the 'Knowledge Retrieval' agent fails, providing your predefined response before handing off to an agent.",
  },
} as const

export const VOICE_API_COPY = {
  title: 'API',
  key: {
    label: 'API key',
    helperLead:
      'Generate an API key to securely pass information between your phone system and Forethought Voice for all ',
    helperEmphasis: 'inbound and outbound calls.',
    masked: '**************',
    revealed: 'ft_voice_9f4k-83aa-29ce-51df',
    refresh: 'Refresh API key',
    refreshHelper:
      "Clicking on 'Refresh' will make the system generate a new API token for setting up connection. Once regenerated, the previous token will be inaccessible.",
  },
  variables: {
    label: 'Context Variable',
    helper: "Select the context variables you'd like Forethought Voice to send to your phone system.",
    placeholder: 'Select context variable',
    add: 'Add context variable',
    seeded: ['$name', '$phone'],
    pool: ['$email', '$order_id', '$account_tier'],
  },
} as const

export const VOICE_CSAT_COPY = {
  tabs: { sms: 'SMS Message', csat: 'CSAT survey' },
  sms: {
    toggle: 'CSAT is on for inbound calls',
    availability: 'SMS CSAT availability',
    sendAfter: 'Send after non-resolved conversations',
    message: 'SMS message',
    helper:
      'The CSAT survey URL will be appended to this message. Forethought provides the link and hosts the survey.',
  },
  csat: {
    logo: {
      label: 'Header logo',
      helper: 'This header logo will be displayed on mobile device screens.',
      action: 'Change image',
    },
    color: { label: 'Color', field: 'Theme color' },
    question: { label: 'Rating question', helper: 'Keep the question under 60 characters' },
    style: { label: 'Style', stars: 'Stars', smiles: 'Smiles', bw: 'BW smiles' },
    scaleHelper: 'Keep the labels under 60 characters',
    followUps: {
      label: 'Reasons for rating',
      negativeNeutral: 'Request feedback for low ratings (1-3)',
      positive: 'Request feedback for high ratings (4-5)',
      questionLabel: 'Question for low ratings',
      questionHelper: 'Keep the question under 60 characters',
      repliesLabel: 'Selectable reasons',
      addReply: 'Add option',
    },
    resolution: {
      label: 'Resolution confirmation',
      checkbox: 'Request to confirm the resolution of the issue',
      questionLabel: 'Question to confirm',
      questionHelper: 'Keep the question under 60 characters',
      optionsLabel: 'Selectable reasons',
    },
    additionalFeedback: {
      label: 'Additional feedback',
      checkbox: 'Request open-ended feedback in free-form text',
    },
    confirmation: {
      label: 'Confirmation message',
      helper: 'Keep the question under 60 characters',
    },
  },
} as const

export const WEBCALL_SEGMENT_COPY = {
  // The frame's toggle literally reads "Voice is enabled…" — a leftover from
  // the Voice frame the exploration was duplicated from. Adapted to Web Call.
  enabledLabel: 'Web Call is enabled for users in this segment',
  title: 'Web Call Segment',
  intro:
    'This section lets you create unique web call designs for different segments, giving each a personalized look. You can control which users see the web call by applying tags, so only those in the tagged segments will see it. This ensures targeted visibility and a tailored experience for your audience.',
  segmentName: {
    label: 'Segment name',
    helper: 'Used to identify this segment in configuration and insights.',
    footnote: 'Keep it under 20 characters',
  },
  tags: {
    label: 'Tags',
    helper: 'Select the tags that identify users in this segment. Manage available tags in',
    link: 'Global Tags',
    placeholder: 'Assign tags',
  },
  default: {
    label: 'Set as default',
    helper: 'Enable this segment by default if no specific tags are assigned or found in the',
    link: 'embedded script',
  },
  companyName: 'Company name',
  agentName: 'Web Call agent name',
} as const

// Appearance ▸ Theme panel copy, transcribed from the frame.
export const WEBCALL_THEME_COPY = {
  tabs: { theme: 'Theme', avatar: 'Avatar' },
  launchIcon: 'Launch icon',
  changeImage: 'Change image',
  resetDefault: 'Reset to default',
  headerLabel: 'Web call header',
  headerLogo: 'Header logo',
  colors: 'Colors',
  themeColor: 'Theme color',
  size: 'Size',
  sizes: [
    { id: 'standard', label: 'Standard' },
    { id: 'large', label: 'Large' },
  ] as const,
  mode: 'Mode',
  modes: [
    { id: 'light', label: 'Light', icon: 'sun-stroke' },
    { id: 'dark', label: 'Dark', icon: 'moon-stroke' },
  ] as const,
  // The tile refine frame (133-129910) names this group "Placement".
  position: 'Placement',
  positions: [
    { id: 'bottom-right', label: 'Bottom right' },
    { id: 'bottom-left', label: 'Bottom left' },
  ] as const,
} as const

// Appearance ▸ Avatar tab copy + the four stock visualizations, from the
// frame. The visuals are unnamed in the design; the labels are aria names.
export const WEBCALL_AVATAR_COPY = {
  intro: 'Customize the appearance of your web-based voice Agent.',
  visualization: {
    label: 'Visualization',
    helper: 'Customize the visual settings for your Web based AI Agent.',
  },
  showAnimation: 'Show voice animation',
  upload: {
    label: 'Upload web visual',
    hint: '120 × 120 px PNG',
    button: 'Upload visual',
  },
} as const

export const WEBCALL_AVATAR_VISUALS = [
  { id: 'ring', label: 'Rainbow ring' },
  { id: 'outline', label: 'Thin ring' },
  { id: 'orb', label: 'Iridescent orb' },
  { id: 'waveform', label: 'Waveform' },
] as const

// Voice section copy, transcribed from the frame (135-140107).
export const WEBCALL_VOICE_COPY = {
  title: 'Voice',
  greeting: {
    label: 'Call greeting',
    helper: 'Set the call greeting for web calls.',
  },
  language: {
    label: 'Select default language',
    helper:
      'The default language when starting a web call. For better quality, we recommend using one language.',
  },
  voiceLabel: 'Voice',
  // The toggle label reads its own state: "…is off" / "…is on".
  autoSwitching: (on: boolean) => `Auto language switching is ${on ? 'on' : 'off'}`,
  searchPlaceholder: 'Search',
  filterAll: 'All',
  // The refine frame (134-131906) fleshes the bare slider out: a Voice speed
  // group with helper, and an "Adjust the speaking speed" label on the slider.
  speed: {
    label: 'Voice speed',
    helper: 'Adjust the speaking speed for all calls.',
    sliderLabel: 'Adjust the speaking speed',
    slowest: 'Slowest',
    normal: 'Normal',
    fastest: 'Fastest',
  },
  // Auto language switching ON (135-132858): the search/list swap for a
  // language→voice box and the Multilingual settings button, which opens the
  // dialog from frame 149-182251.
  multilingual: {
    button: 'Multilingual settings',
    enabledLanguages: 'Enabled languages',
    voice: 'Voice',
    addLanguage: 'Add language',
    dialogTitle: 'Multilingual settings',
    dialogIntro:
      'Select your enabled languages and choose a voice for each. Enabling multiple languages can affect performance and latency.',
    save: 'Save',
  },
} as const

// The enabled-languages box the panel shows when auto switching is on
// (135-132858): flag, language, and the assigned voice per language.
export type WebCallMultilingualRow = {
  flag: string
  language: string
  isDefault?: boolean
  voice: string
}

export const WEBCALL_MULTILINGUAL: WebCallMultilingualRow[] = [
  { flag: '🇺🇸', language: 'English', isDefault: true, voice: 'Tim' },
  { flag: '🇩🇪', language: 'German', voice: 'Sofía' },
  { flag: '🇰🇷', language: 'Korean', voice: 'Camille' },
]

// Web Call ▸ AI personality (frame 135-142264). The helpers and placeholders
// largely mirror the shared AI_PERSONALITY_COPY, with the frame's own
// intro/tone-helper text.
export const WEBCALL_PERSONALITY_COPY = {
  title: 'AI personality',
  toggleOn: 'AI Personality is on',
  toggleOff: 'AI Personality is off',
  intro:
    'AI Personality defines how the AI should behave and communicate—including tone, terminology, and formatting. Use it to shape the AI\u2019s voice so every response aligns with your brand\u2019s standards.',
  generalContext: {
    label: 'General Context',
    helper: 'What should the AI know about your company and customers?',
    placeholder: AI_PERSONALITY_COPY.generalContext.placeholder,
    footnote: AI_PERSONALITY_COPY.generalContext.footnote,
  },
  glossary: {
    label: 'Glossary',
    helper: 'What key terms from the glossary should the AI know?',
    placeholder: AI_PERSONALITY_COPY.glossary.placeholder,
    footnote: AI_PERSONALITY_COPY.glossary.footnote,
  },
  tone: {
    label: 'Tone of Voice',
    helper: 'How should your agent sound, write, and format responses?',
    placeholder: AI_PERSONALITY_COPY.tone.placeholder,
    footnote: AI_PERSONALITY_COPY.tone.footnote,
  },
  // The suggestions block sits under Tone of Voice: a plain checkbox plus the
  // six shared tone presets as selectable pills.
  suggestionsLabel: AI_PERSONALITY_COPY.tone.presetsCheckboxLabel,
} as const

// Web Call ▸ Privacy (frame 135-144184): the consent prompt shown before a
// web call starts. The three field values are placeholders in the frame ("Keep
// the question under 30 characters" sic).
export const WEBCALL_PRIVACY_COPY = {
  title: 'Privacy',
  intro: 'Web privacy policy is presented before the conversation starts for all web calls.',
  recordingLabel: 'Call recording',
  recordingToggle: 'Enable automatic recording of all incoming calls',
  promptHeader: {
    label: 'Prompt header',
    placeholder: 'Privacy Policy',
    footnote: 'Keep the question under 30 characters',
  },
  policyBody: {
    label: 'Privacy Policy',
    placeholder: 'This call may be recorded for quality assurance and training purposes.',
  },
  ctaLabel: { label: 'Call to action label', placeholder: 'Accept Terms' },
} as const

// Web Call ▸ Embed (the rail's code section, panel titled "API"; frame
// 135-158769): the domain allowlist and the auto-generated script tag. Same
// anatomy as the widget's EmbedPanel — the shared snippet lines, key
// placeholder and deterministic mock keys in this file drive both.
export const WEBCALL_API_COPY = {
  title: 'API',
  allowlist: {
    step: '1.',
    label: 'Domain allowlist',
    helper: 'The Solve web call can only be installed on the domains listed here.',
    placeholder: 'http://',
    footnote: 'Enter your domain address to list your website',
    add: 'Add domain',
    seeded: ['forethought.ai'],
  },
  snippet: {
    step: '2.',
    label: 'Code Snippet',
    copy: 'Copy code',
    showKey: 'Show API key in code snippet',
    refreshKey: 'Refresh API key',
    caption: 'Auto-generated code snippet',
  },
} as const

// Web Call ▸ CSAT (the rail's smiley section; frame 135-152791): the CSAT /
// Emojis tab pair (Emojis is not designed — the coming-soon placeholder),
// then availability checkboxes, the rating question, the scale select, the
// three style tiles, and the per-rating label rows.
export const WEBCALL_CSAT_COPY = {
  tabs: ['CSAT', 'Emojis'],
  toggleOn: 'CSAT is on',
  toggleOff: 'CSAT is off',
  availability: 'CSAT availability',
  afterPrefix: 'After',
  afterSuffix: 'user interactions',
  viaHeader: 'Anytime the user accesses it via the header',
  onCallEnd: 'When the call ends',
  onPolicyTrigger: 'When CSAT Trigger is applied in the Policy',
  question: 'Rating question',
  questionFootnote: 'Keep the question under 60 characters',
  scale: 'Scale',
  scaleOptions: ['From 1 to 3', 'From 1 to 5', 'From 1 to 7'],
  style: 'Style',
  styles: [
    { id: 'stars', label: 'Stars' },
    { id: 'smiles', label: 'Smiles' },
    { id: 'bw-smiles', label: 'BW smiles' },
  ],
  // The full panel (frame 135-133944) continues below the per-rating rows.
  labelsFootnote: 'Keep the labels under 60 characters',
  reasons: {
    label: 'Reasons for rating',
    low: 'Request feedback for low ratings (1-3)',
    high: 'Request feedback for high ratings (4-5)',
  },
  lowQuestion: { label: 'Question for low ratings', footnote: 'Keep the question under 60 characters' },
  selectableReasons: 'Selectable reasons',
  addOption: 'Add option',
  resolution: {
    label: 'Resolution confirmation',
    toggle: 'Request to confirm the resolution of the issue',
    questionLabel: 'Question to confirm',
  },
  additional: {
    label: 'Additional feedback',
    toggle: 'Request open-ended feedback in free-form text',
  },
  confirmation: { label: 'Confirmation message', footnote: 'Keep the question under 60 characters' },
  // The Emojis tab (frame 135-154344): the emoji set is fixed — the tiles are
  // a legend, not a picker (no selection state in the frame). "Suprise" sic.
  emojis: {
    toggleOn: 'Emojis are on',
    toggleOff: 'Emojis are off',
    body: 'Emojis allow end users to express their emotions and provide feedback without interrupting the conversation.',
    list: [
      { id: 'heart', emoji: '❤️', label: 'Heart' },
      { id: 'thumbs-up', emoji: '👍', label: 'Thumbs up' },
      { id: 'confetti', emoji: '🎉', label: 'Confetti' },
      { id: 'clap', emoji: '👏', label: 'Clap' },
      { id: 'laugh', emoji: '😂', label: 'Laugh' },
      { id: 'suprise', emoji: '😮', label: 'Suprise' },
      { id: 'thinking', emoji: '🤔', label: 'Thinking' },
      { id: 'thumbs-down', emoji: '👎', label: 'Thumbs down' },
    ],
  },
} as const

// Web Call ▸ Knowledge (the rail's lightbulb section; frame 135-156009):
// connect a knowledge base, build the retrieval flow, and the current
// connections with per-source toggles. The connections themselves are the
// shared KNOWLEDGE_CONNECTIONS rows (Widget/Voice list the same three).
export const WEBCALL_KNOWLEDGE_COPY = {
  title: 'Knowledge base',
  connectLabel: 'Connect with knowledge base',
  connectAction: 'Connect new integration',
  retrieval: {
    label: 'Knowledge Retrieval',
    action: 'Build Knowledge Retrieval in agent',
    helper:
      'The Knowledge retrieval feature triggers the connections you have defined in the Knowledge base, allowing relevant articles to be presented for customer queries.',
  },
  connectionsLabel: 'Current connections',
} as const

// Web Call ▸ Fallback (the rail's install/download section; frame 135-157699):
// connect a help desk, build the fallback flow, and the current connections
// list. Buttons are inert mock actions.
export const WEBCALL_FALLBACK_COPY = {
  title: 'Fallback',
  connectLabel: 'Connect Help Desk',
  connectAction: 'Connect new integration',
  fallbackLabel: 'Fallback',
  fallbackAction: 'Build Fallback in agent',
  fallbackHelper:
    'The fallback activates if the ‘Knowledge Retrieval’ agent fails, providing your predefined response before handing off to an agent.',
  connectionsLabel: 'Current connections',
  connections: ['Salesforce'],
} as const

// Web Call ▸ Share (the rail's four-arrows section, panel titled "API";
// frame 135-158264): just the Caller API key — masked with reveal/copy, the
// stretched refresh action, and the regeneration footnote ("wil" sic).
export const WEBCALL_SHARE_COPY = {
  title: 'API',
  key: {
    label: 'API key',
    helper:
      'This API key is a unique identifier used for authenticating and authorizing access to an API.',
    masked: '**************',
    refresh: 'Refresh API key',
    refreshHelper:
      'Clicking on ‘Refresh’ wil make the system generate a new API token for setting up connection. Once regenerated, the previous token will be inaccessible.',
  },
} as const

// Flags for the languages the Multilingual settings dialog can add.
export const LANGUAGE_FLAGS: Record<string, string> = {
  English: '🇺🇸',
  Spanish: '🇪🇸',
  French: '🇫🇷',
  German: '🇩🇪',
  Portuguese: '🇧🇷',
  Hindi: '🇮🇳',
  Japanese: '🇯🇵',
  Korean: '🇰🇷',
}

// ── Preview copy ────────────────────────────────────────────────────────────
export const PREVIEW_COPY = {
  allSegments: 'Enabled for all segments',
  composer: 'Ask a question…',
  footer: 'Built with Zendesk',
  chat: {
    hint: 'Personalize your chat by using the menu on the right',
    agent:
      'Bonjour, Hola, Hello and welcome! How can I help make your day awesome? What can I do to assist you today?',
    user: 'I have some issues with my account',
  },
  csat: {
    hint: 'Personalize your CSAT survey using the menu on the right',
    resolution: 'Check the preview for the correct resolution',
    followUpLead: "We're sorry to hear that.",
    followUpAsk: "Can you tell us what didn't go well?",
    followUpOptions: ['Irrelevant info', 'Poor chat quality'],
    submit: 'Submit',
  },
  knowledge: {
    hintLead:
      'Enter the public URL of your organization’s knowledge base or select a connected help center.',
    hintTail: 'Your agent will use this content to provide more accurate, personalized answers.',
  },
  quickReplies: {
    agent: 'Hi there! How can I help you today?',
    options: ['Pricing/Quote', 'Authenticate user'],
    user: 'I have some issues with my account',
  },
  voice: {
    segmentHint: 'Configure voice segment, phone number, initial use case, language, and more.',
    voiceHint: 'Configure the greeting message, voice speed, AI voice, and more',
    personalityHint: 'Set the personality for your Voice AI Agent.',
    privacyHint:
      'To comply with legal requirements, we inform callers upfront that their call will be recorded. This helps ensure transparency and keeps everyone informed right from the start.',
    csatHint: 'Personalize your CSAT survey using the menu on the right',
    knowledgeHint:
      'Connect your knowledge base or help center for your AI Agents to deliver a better customer experience.',
    fallbackHint:
      'The Fallback Agent runs when no relevant articles are found. By default your AI agents hand off to a human agent.',
    apiHint: 'Set up the Caller API to capture important caller details.',
    call: 'Start a test call',
    // The SMS tab's phone preview (frame 130:74690): the message header and
    // the survey link appended to the configured SMS copy.
    sms: {
      testMessage: 'Test message • SMS',
      feedbackLink: 'forethought.ai/feedback/123',
    },
  },
  webcall: {
    hint: 'Use the settings on the right to customize the appearance of your web call. Configure colors, logo, size, mode and more.',
    // The Voice section's hint ("of you web call agent" sic — transcribed).
    voiceHint:
      'Configure the greeting message, AI voice, sounds, and wait time messaging of you web call agent.',
    // The AI personality section's hint (frame 135-142264).
    personalityHint: 'Set the personality for your Web Call AI Agent.',
    // The Privacy section's hint (frame 135-144184).
    privacyHint: 'Personalize your Privacy policy and consent for web calls by using the menu on the right.',
    // The Embed (API) section's hint (frame 135-158769).
    embedHint: 'Configure your voice web call embed settings on the right.',
    // The Share (Caller API key) section's hint (frame 135-158264) — "calls
    // functionality" sic.
    shareHint:
      'Set up the Caller API to securely pass information and support both inbound and outbound calls functionality.',
    // The Fallback section's hint (frame 135-158264 is the share frame; this
    // one is 135-157699) — three paragraphs with blank-line gaps; the
    // mismatched quotes around “Fallback“ are sic.
    fallbackHint: [
      'The “Fallback“ workflow is a default feature that activates when the Dynamic Article Suggestion component (part of the Knowledge Retrieval workflow) fails to find relevant content for a user\'s inquiry.',
      'It lets you define how the web call agent should respond in such cases. By default, the agent will initiate a standard handoff, but you can customize this response.',
      'To prevent further unhelpful article suggestions, the Articles feature is disabled during fallback scenarios.',
    ],
    // The Knowledge section's hint (frame 135-156009): two gradient
    // paragraphs under floating vendor logos.
    knowledgeHint: [
      "Please provide the public URL of your organization's knowledge base or an integrated help center such as Zendesk or Salesforce.",
      'Our AI models can connect with your help center and use the information to train your bot, giving you a more personalized experience.',
    ],
    // The CSAT section (frame 135-152791): solid-purple hint, then the survey
    // itself inside the card — the question, the star scale with per-rating
    // labels, and the follow-up with its two reason chips.
    csatHint: 'Personalize your CSAT and emojis using the menu on the right',
    csatFollowUp: "We're sorry to hear that.\nCan you tell us what didn't go well?",
    csatChips: ['Irrelevant info', 'Poor chat quality'],
    call: 'Start a test call',
    footer: 'Built with Zendesk',
  },
} as const

// ── Headless tab ────────────────────────────────────────────────────────────
// Frontend-only mock content for the AI Agents → Configuration → Headless tab.
// Mirrors Figma frames 225-6282 (tab) and 145-75243 (instruction content).

// The "points at the panel on the right" line, same role as the PREVIEW_COPY
// hints above — and rendered through the same `PreviewHint`.
export const HEADLESS_HINT = 'Configure Solve Headless using the menu on the right.'

export const HEADLESS_INTRO =
  'Run your agent with a direct API key, or layer on the A2A protocol so other agents can discover and call it. Both modes use the same key. A2A adds a public agent card and a message endpoint on top.'

export const A2A_HEADING = 'A2A (Agent to Agent)'

export const A2A_DESCRIPTION =
  'An open standard that lets AI agents from any vendor talk to your headless agent. Forethought publishes an agent card and message endpoint for you. Point any A2A client at them to start an authenticated support conversation. Your CX team stays in full control of the policies and Autoflows behind it.'

export const A2A_AGENT_CARD_URL =
  'https://app.forethought.ai/solve/a2a/acme/.well-known/agent-card.json'
export const A2A_MESSAGE_ENDPOINT = 'https://app.forethought.ai/solve/a2a/acme/v1/message'

// The masked API-key display (shown until the eye toggle reveals the real value).
export const API_KEY_MASK = '••••••••••••••'

export type HeadlessStep = {
  n: string
  title: string
  body: string
  code: string
  codeCaption?: string
}

const BEARER = 'Authorization: Bearer ft_a2a_live_9b3f7c21d8a64e05'

export const HEADLESS_STEPS: HeadlessStep[] = [
  {
    n: '01',
    title: 'Add Forethought as an A2A agent',
    body: 'In your A2A client, register a new agent using your Agent Card URL. The client reads the card and discovers the skill, endpoint, and auth automatically, no manual config.',
    code: `# Agent Card URL\n${A2A_AGENT_CARD_URL}`,
  },
  {
    n: '02',
    title: 'Authenticate with your API key',
    body: 'Send your A2A API key as a Bearer token on every request.',
    code: BEARER,
  },
  {
    n: '03',
    title: "Pass the end-user's identity",
    body: "Include the customer's signed token so Solve treats the conversation as authenticated and can act on their account.",
    code: BEARER,
  },
  {
    n: '04',
    title: 'Send a message',
    body: "POST a JSON-RPC message/send to your message endpoint. Forethought replies with a task and the agent's answer; reuse the returned task id for follow-up turns.",
    code: `POST ${A2A_MESSAGE_ENDPOINT}
{
  "jsonrpc": "2.0", "id": "1", "method": "message/send",
  "params": { "message": {
    "role": "user", "messageId": "m-1",
    "parts": [{ "kind": "text", "text": "Where is my refund for order 12345?" }]
  }}
}`,
  },
]

// Deterministic mock API keys (no Date.now/Math.random — see brand-context seq).
let keySeq = 0
function keyFrom(n: number): string {
  // Pad a counter-derived hex to a stable, key-looking suffix.
  const suffix = (0x9b3f7c21d8a64e05n + BigInt(n) * 0x1_0000_1111n).toString(16).slice(0, 16)
  return `ft_a2a_live_${suffix}`
}
export function seedApiKey(): string {
  return keyFrom(0)
}
export function nextApiKey(): string {
  return keyFrom(++keySeq)
}
