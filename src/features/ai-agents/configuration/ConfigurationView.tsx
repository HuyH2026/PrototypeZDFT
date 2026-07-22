// AI Agents → Configuration (Widget). A widget-branding studio: a sticky top
// strip (title, channel tabs, Preview/Publish) over a 3-column body — brand
// list, live widget preview, and the Branded-widget config panel. Only the
// Widget tab is built; other tabs show a coming-soon body. All state is local
// and mocked (no backend).
import { useState } from 'react'
import { MessageSquare, Mic, Phone, Code2 } from 'lucide-react'
import { CHANNEL_TABS, SEED_BRANDS, type Brand, type ChannelTab } from './config-data'
import { BrandList } from './BrandList'
import { WidgetPreview } from './WidgetPreview'
import { BrandedWidgetPanel } from './BrandedWidgetPanel'

const TAB_ICON: Record<ChannelTab['id'], typeof MessageSquare> = {
  widget: MessageSquare,
  voice: Mic,
  webcall: Phone,
  headless: Code2,
}

export function ConfigurationView() {
  const [activeTab, setActiveTab] = useState<ChannelTab['id']>('widget')
  const [brands, setBrands] = useState<Brand[]>(SEED_BRANDS)
  const [selectedId, setSelectedId] = useState('vip')
  const [activeSection, setActiveSection] = useState('brands')

  const selected = brands.find((b) => b.id === selectedId)!
  const updateSelected = (patch: Partial<Brand>) =>
    setBrands((bs) => bs.map((b) => (b.id === selectedId ? { ...b, ...patch } : b)))

  return (
    <div data-testid="view-configuration" className="flex h-full flex-col">
      {/* Sticky top strip */}
      <div className="sticky top-0 z-10 flex items-center bg-white px-8 pb-4 pt-6">
        <h1 className="text-[20px] font-semibold text-ink">Configuration</h1>
        <div className="mx-auto flex gap-1 rounded-full bg-app-backdrop p-1">
          {CHANNEL_TABS.map((tab) => {
            const Icon = TAB_ICON[tab.id]
            const active = tab.id === activeTab
            return (
              <button
                key={tab.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] ${active ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="text-[14px] text-ink-muted">Preview</button>
          <button type="button" className="rounded-full bg-ink px-4 py-1.5 text-[14px] font-medium text-white">Publish</button>
        </div>
      </div>

      {/* Body */}
      {activeTab === 'widget' ? (
        <div className="flex flex-1 gap-6 overflow-hidden px-8 pb-8">
          <BrandList brands={brands} selectedId={selectedId} onSelect={setSelectedId} />
          <WidgetPreview brandName={selected.name} />
          <BrandedWidgetPanel
            brand={selected}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onNameChange={(name) => updateSelected({ name })}
            onToggleEnabled={() => updateSelected({ enabled: !selected.enabled })}
            onToggleDefault={() => updateSelected({ isDefault: !selected.isDefault })}
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-ink-muted">
          <div className="text-xl font-medium text-ink">{CHANNEL_TABS.find((t) => t.id === activeTab)?.label}</div>
          <div className="mt-2 text-sm opacity-70">Coming soon</div>
        </div>
      )}
    </div>
  )
}
