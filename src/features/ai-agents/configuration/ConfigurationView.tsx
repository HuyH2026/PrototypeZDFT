// AI Agents → Configuration. A per-segment studio: a sticky top strip (title,
// channel tabs, Preview/Publish) over a 3-column body — segment list, live
// preview, and the panel for whichever rail section is active.
//
// Widget, Voice and Web Call are built, each with its own rail, preview and
// panels; Headless has its own view. All state is local and mocked (no
// backend).
import { useState } from 'react'
import { GardenIcon, type GardenIconName } from '@/components/garden-icon'
import {
  CHANNEL_TABS,
  KNOWLEDGE_CONNECTIONS,
  SEED_SEGMENTS,
  VOICE_SEED_SEGMENTS,
  VOICE_RAIL_SECTIONS,
  VOICE_RAIL_TRAILING_START,
  WEBCALL_RAIL_SECTIONS,
  WEBCALL_RAIL_TRAILING_START,
  WEBCALL_SEED_SEGMENTS,
  WIDGET_RAIL_SECTIONS,
  WIDGET_RAIL_TRAILING_START,
  type ChannelTab,
  type CsatConfig,
  type KnowledgeConnection,
  type Personality,
  type Segment,
  type VoiceConfig,
  type VoiceCsatConfig,
  type VoicePrivacyConfig,
  type VoiceSettings,
  type WebCallAvatar,
  type WebCallCsat,
  type WebCallPersonality,
  type WebCallPrivacy,
  type WebCallConfig,
  type WebCallTheme,
  type WebCallVoice,
} from './config-data'
import { SegmentList } from './SegmentList'
import { WidgetPreview } from './WidgetPreview'
import { VoicePreview } from './VoicePreview'
import { WidgetSegmentsPanel } from './WidgetSegmentsPanel'
import { AiPersonalityPanel } from './AiPersonalityPanel'
import { CsatPanel } from './CsatPanel'
import { KnowledgePanel } from './KnowledgePanel'
import { EmbedPanel } from './EmbedPanel'
import { VoiceSegmentPanel } from './VoiceSegmentPanel'
import { VoiceSettingsPanel } from './VoiceSettingsPanel'
import { VoicePrivacyPanel } from './VoicePrivacyPanel'
import { VoiceKnowledgePanel } from './VoiceKnowledgePanel'
import { VoiceFallbackPanel } from './VoiceFallbackPanel'
import { VoiceApiPanel } from './VoiceApiPanel'
import { VoiceCsatPanel, type VoiceCsatTab } from './VoiceCsatPanel'
import { WebCallPreview } from './WebCallPreview'
import { WebCallSegmentPanel } from './WebCallSegmentPanel'
import { WebCallApiPanel } from './WebCallApiPanel'
import { WebCallCsatPanel } from './WebCallCsatPanel'
import { WebCallFallbackPanel } from './WebCallFallbackPanel'
import { WebCallKnowledgePanel } from './WebCallKnowledgePanel'
import { WebCallPersonalityPanel } from './WebCallPersonalityPanel'
import { WebCallPrivacyPanel } from './WebCallPrivacyPanel'
import { WebCallSharePanel } from './WebCallSharePanel'
import { WebCallThemePanel } from './WebCallThemePanel'
import { WebCallVoicePanel } from './WebCallVoicePanel'
import { HeadlessView } from './HeadlessView'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'
import { PageHeader } from '@/components/flora/PageHeader'

const TAB_ICON: Record<ChannelTab['id'], GardenIconName> = {
  widget: 'speech-bubble-stroke',
  voice: 'phone-stroke',
  webcall: 'mobile-phone-stroke',
  headless: 'markup-stroke',
}

export function ConfigurationView() {
  const [activeTab, setActiveTab] = useState<ChannelTab['id']>('widget')
  const [segments, setSegments] = useState<Segment[]>(SEED_SEGMENTS)
  const [selectedId, setSelectedId] = useState(SEED_SEGMENTS[0].id)
  const [voiceSegments, setVoiceSegments] = useState<Segment[]>(VOICE_SEED_SEGMENTS)
  const [voiceSelectedId, setVoiceSelectedId] = useState(VOICE_SEED_SEGMENTS[0].id)
  const [webcallSegments, setWebcallSegments] = useState<Segment[]>(WEBCALL_SEED_SEGMENTS)
  const [webcallSelectedId, setWebcallSelectedId] = useState(WEBCALL_SEED_SEGMENTS[0].id)
  // Each channel remembers its own section: the rails don't hold the same
  // sections, so one shared value would strand the panel on a missing id.
  const [widgetSection, setWidgetSection] = useState('segments')
  const [voiceSection, setVoiceSection] = useState('segments')
  // The Voice CSAT panel's tab — owned here so the centre preview can swap
  // between the SMS phone and the survey mock with it.
  const [voiceCsatTab, setVoiceCsatTab] = useState<VoiceCsatTab>('sms')
  const [webcallSection, setWebcallSection] = useState('segments')
  // The webcall CSAT panel's CSAT/Emojis tab is lifted so the preview can
  // swap the survey for the emoji reaction sheet (frame 135-154344).
  const [webcallFeedbackTab, setWebcallFeedbackTab] = useState<'CSAT' | 'Emojis'>('CSAT')
  const [connections, setConnections] = useState<KnowledgeConnection[]>(KNOWLEDGE_CONNECTIONS)

  const selected = segments.find((s) => s.id === selectedId)!
  const selectedVoice = voiceSegments.find((s) => s.id === voiceSelectedId)!
  const selectedWebcall = webcallSegments.find((s) => s.id === webcallSelectedId)!
  const patchSelected = (patch: Partial<Segment>) =>
    setSegments((list) => list.map((s) => (s.id === selectedId ? { ...s, ...patch } : s)))
  const patchPersonality = (patch: Partial<Personality>) =>
    patchSelected({ personality: { ...selected.personality, ...patch } })
  const patchCsat = (patch: Partial<CsatConfig>) =>
    patchSelected({ csat: { ...selected.csat, ...patch } })
  const patchSelectedVoiceSegment = (patch: Partial<Segment>) =>
    setVoiceSegments((list) => list.map((s) => (s.id === voiceSelectedId ? { ...s, ...patch } : s)))
  const patchVoice = (patch: Partial<VoiceConfig>) =>
    patchSelectedVoiceSegment({ voice: { ...selectedVoice.voice, ...patch } })
  const patchVoicePersonality = (patch: Partial<Personality>) =>
    patchVoice({ personality: { ...selectedVoice.voice.personality, ...patch } })
  const patchVoiceSettings = (patch: Partial<VoiceSettings>) =>
    patchVoice({ settings: { ...selectedVoice.voice.settings, ...patch } })
  const patchVoicePrivacy = (patch: Partial<VoicePrivacyConfig>) =>
    patchVoice({ privacy: { ...selectedVoice.voice.privacy, ...patch } })
  const patchVoiceCsat = (patch: Partial<VoiceCsatConfig>) =>
    patchVoice({ csat: { ...selectedVoice.voice.csat, ...patch } })
  const patchSelectedWebcallSegment = (patch: Partial<Segment>) =>
    setWebcallSegments((list) =>
      list.map((s) => (s.id === webcallSelectedId ? { ...s, ...patch } : s)),
    )
  const patchWebcall = (patch: Partial<WebCallConfig>) =>
    patchSelectedWebcallSegment({ webcall: { ...selectedWebcall.webcall, ...patch } })
  const patchWebcallTheme = (patch: Partial<WebCallTheme>) =>
    patchWebcall({ theme: { ...selectedWebcall.webcall.theme, ...patch } })
  const patchWebcallAvatar = (patch: Partial<WebCallAvatar>) =>
    patchWebcall({ avatar: { ...selectedWebcall.webcall.avatar, ...patch } })
  const patchWebcallVoice = (patch: Partial<WebCallVoice>) =>
    patchWebcall({ voice: { ...selectedWebcall.webcall.voice, ...patch } })
  const patchWebcallPersonality = (patch: Partial<WebCallPersonality>) =>
    patchWebcall({ personality: { ...selectedWebcall.webcall.personality, ...patch } })
  const patchWebcallPrivacy = (patch: Partial<WebCallPrivacy>) =>
    patchWebcall({ privacy: { ...selectedWebcall.webcall.privacy, ...patch } })
  const patchWebcallCsat = (patch: Partial<WebCallCsat>) =>
    patchWebcall({ csat: { ...selectedWebcall.webcall.csat, ...patch } })
  const toggleConnection = (id: string) =>
    setConnections((list) => list.map((c) => (c.id === id ? { ...c, on: !c.on } : c)))

  const widgetRail = {
    sections: WIDGET_RAIL_SECTIONS,
    trailingStart: WIDGET_RAIL_TRAILING_START,
    activeSection: widgetSection,
    onSectionChange: setWidgetSection,
  }
  const voiceRail = {
    sections: VOICE_RAIL_SECTIONS,
    trailingStart: VOICE_RAIL_TRAILING_START,
    activeSection: voiceSection,
    onSectionChange: setVoiceSection,
  }
  const webcallRail = {
    sections: WEBCALL_RAIL_SECTIONS,
    trailingStart: WEBCALL_RAIL_TRAILING_START,
    activeSection: webcallSection,
    onSectionChange: setWebcallSection,
  }

  function widgetPanel() {
    if (widgetSection === 'sentiment') {
      return (
        <AiPersonalityPanel
          {...widgetRail}
          personality={selected.personality}
          onPersonalityChange={patchPersonality}
        />
      )
    }
    if (widgetSection === 'mood')
      return <CsatPanel {...widgetRail} csat={selected.csat} onCsatChange={patchCsat} />
    if (widgetSection === 'knowledge') {
      return (
        <KnowledgePanel
          {...widgetRail}
          connections={connections}
          onToggleConnection={toggleConnection}
        />
      )
    }
    if (widgetSection === 'code') return <EmbedPanel {...widgetRail} />
    return (
      <WidgetSegmentsPanel
        {...widgetRail}
        segment={selected}
        onNameChange={(name) => patchSelected({ name })}
        onToggleEnabled={() => patchSelected({ enabled: !selected.enabled })}
        onToggleDefault={() => patchSelected({ isDefault: !selected.isDefault })}
      />
    )
  }

  function voicePanel() {
    if (voiceSection === 'voice') {
      return (
        <VoiceSettingsPanel
          {...voiceRail}
          settings={selectedVoice.voice.settings}
          onSettingsChange={patchVoiceSettings}
        />
      )
    }
    if (voiceSection === 'license') {
      return (
        <VoicePrivacyPanel
          {...voiceRail}
          privacy={selectedVoice.voice.privacy}
          onPrivacyChange={patchVoicePrivacy}
        />
      )
    }
    if (voiceSection === 'mood') {
      return (
        <VoiceCsatPanel
          {...voiceRail}
          csat={selectedVoice.voice.csat}
          tab={voiceCsatTab}
          onTabChange={setVoiceCsatTab}
          onCsatChange={patchVoiceCsat}
        />
      )
    }
    if (voiceSection === 'knowledge') {
      return (
        <VoiceKnowledgePanel
          {...voiceRail}
          connections={connections}
          onToggleConnection={toggleConnection}
        />
      )
    }
    if (voiceSection === 'install') return <VoiceFallbackPanel {...voiceRail} />
    if (voiceSection === 'api') return <VoiceApiPanel {...voiceRail} />
    if (voiceSection === 'sentiment') {
      return (
        <AiPersonalityPanel
          {...voiceRail}
          channel="voice"
          personality={selectedVoice.voice.personality}
          onPersonalityChange={patchVoicePersonality}
        />
      )
    }
    return (
      <VoiceSegmentPanel
        {...voiceRail}
        segment={selectedVoice}
        onNameChange={(name) => patchSelectedVoiceSegment({ name })}
        onToggleEnabled={() => patchSelectedVoiceSegment({ enabled: !selectedVoice.enabled })}
        onToggleDefault={() =>
          patchSelectedVoiceSegment({ isDefault: !selectedVoice.isDefault })
        }
        onVoiceChange={patchVoice}
      />
    )
  }

  function webcallPanel() {
    // Segments, Appearance, Voice and AI personality are designed; the rest
    // of the rail highlights on click and keeps the segments panel (deferred,
    // like Widget/Voice).
    // AI personality hangs off the rail's heart (sentiment) section; privacy
    // off the document section; the API/embed panel off the code section;
    // CSAT off the smiley (mood) section.
    if (webcallSection === 'mood')
      return (
        <WebCallCsatPanel
          {...webcallRail}
          csat={selectedWebcall.webcall.csat}
          onCsatChange={patchWebcallCsat}
          tab={webcallFeedbackTab}
          onTabChange={setWebcallFeedbackTab}
        />
      )
    if (webcallSection === 'code') return <WebCallApiPanel {...webcallRail} />
    if (webcallSection === 'share') return <WebCallSharePanel {...webcallRail} />
    if (webcallSection === 'install') return <WebCallFallbackPanel {...webcallRail} />
    // Knowledge shares the connections list with the Widget/Voice panels.
    if (webcallSection === 'knowledge')
      return (
        <WebCallKnowledgePanel
          {...webcallRail}
          connections={connections}
          onToggleConnection={toggleConnection}
        />
      )
    if (webcallSection === 'privacy')
      return (
        <WebCallPrivacyPanel
          {...webcallRail}
          privacy={selectedWebcall.webcall.privacy}
          onPrivacyChange={patchWebcallPrivacy}
        />
      )
    if (webcallSection === 'sentiment')
      return (
        <WebCallPersonalityPanel
          {...webcallRail}
          personality={selectedWebcall.webcall.personality}
          onPersonalityChange={patchWebcallPersonality}
        />
      )
    if (webcallSection === 'voice')
      return (
        <WebCallVoicePanel
          {...webcallRail}
          segment={selectedWebcall}
          onVoiceChange={patchWebcallVoice}
        />
      )
    if (webcallSection === 'appearance')
      return (
        <WebCallThemePanel
          {...webcallRail}
          segment={selectedWebcall}
          onThemeChange={patchWebcallTheme}
          onAvatarChange={patchWebcallAvatar}
        />
      )
    return (
      <WebCallSegmentPanel
        {...webcallRail}
        segment={selectedWebcall}
        onNameChange={(name) => patchSelectedWebcallSegment({ name })}
        onToggleEnabled={() =>
          patchSelectedWebcallSegment({ enabled: !selectedWebcall.enabled })
        }
        onToggleDefault={() =>
          patchSelectedWebcallSegment({ isDefault: !selectedWebcall.isDefault })
        }
        onRemoveTag={(tag) =>
          patchSelectedWebcallSegment({
            tags: selectedWebcall.tags.filter((t) => t !== tag),
          })
        }
        onWebCallChange={patchWebcall}
      />
    )
  }

  return (
    <div data-testid="view-configuration" className="flex h-full flex-col bg-[#f9f8f7]">
      <PageHeader
        title="Configuration"
        middle={
          <div
            data-testid="channel-tabs"
            className="flex w-full max-w-[518px] items-center rounded-full bg-grey-100 p-1"
          >
            {CHANNEL_TABS.map((tab) => {
              const active = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] whitespace-nowrap ${active ? 'bg-white font-semibold text-ink shadow-sm' : 'font-medium text-ink-muted'}`}
                >
                  <GardenIcon
                    name={TAB_ICON[tab.id]}
                    className="h-4 w-4"
                    style={{ color: tab.color }}
                  />
                  {tab.label}
                </button>
              )
            })}
          </div>
        }
        actions={
          // The sparkle sits last, in the far-right corner — the one spot it
          // occupies on every other section page, where it is the header's only
          // action. Page-specific actions come before it.
          <div className="flex items-center gap-3">
            <button type="button" className="text-[14px] text-ink-muted">
              Preview
            </button>
            <button
              type="button"
              className="rounded-full bg-ink px-4 py-1 text-[14px] font-medium text-white"
            >
              Publish
            </button>
            <AiTriggerButton label="Ask AI about this page" />
          </div>
        }
      />

      {/* Body */}
      {activeTab === 'headless' ? (
        <HeadlessView />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <SegmentList
            segments={
              activeTab === 'voice'
                ? voiceSegments
                : activeTab === 'webcall'
                  ? webcallSegments
                  : segments
            }
            selectedId={
              activeTab === 'voice'
                ? voiceSelectedId
                : activeTab === 'webcall'
                  ? webcallSelectedId
                  : selectedId
            }
            onSelect={
              activeTab === 'voice'
                ? setVoiceSelectedId
                : activeTab === 'webcall'
                  ? setWebcallSelectedId
                  : setSelectedId
            }
          />
          <div className="flex flex-1 justify-center overflow-y-auto px-6 py-8">
            {activeTab === 'widget' ? (
              <WidgetPreview segment={selected} section={widgetSection} csat={selected.csat} />
            ) : activeTab === 'voice' ? (
              <VoicePreview
                segment={selectedVoice}
                section={voiceSection}
                csatTab={voiceCsatTab}
              />
            ) : (
              <WebCallPreview
                segment={selectedWebcall}
                section={webcallSection}
                moodTab={webcallFeedbackTab}
              />
            )}
          </div>
          <div className="flex shrink-0 py-2 pr-2">
            {activeTab === 'widget'
              ? widgetPanel()
              : activeTab === 'voice'
                ? voicePanel()
                : webcallPanel()}
          </div>
        </div>
      )}
    </div>
  )
}
