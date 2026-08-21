// Web Call ▸ Appearance: the frame's two-tab panel. Theme: launch icon +
// header logo as boxed marks with Change image, the header text field, the
// theme color swatch field, and the Size / Mode / Placement tile rows. Avatar:
// the stock visualization picker (frame 133-131295), the Show voice animation
// checkbox, and the custom-upload slot. Presentational — every edit bubbles up
// via handlers.
//
// Launch icon, header logo and visual uploads aren't modeled — the mock always
// renders the Uber mark and the stock visuals.
import { useState, type ReactNode } from 'react'
import { Upload } from 'lucide-react'
import { GardenIcon, type GardenIconName } from '@/components/garden-icon'
import { cn } from '@/lib/cn'
import {
  WEBCALL_AVATAR_COPY,
  WEBCALL_AVATAR_VISUALS,
  WEBCALL_THEME_COPY as COPY,
  type RailSection,
  type Segment,
  type WebCallAvatar,
  type WebCallTheme,
} from './config-data'
import { GroupLabel, Helper, PanelShell, TextField } from './panel-parts'

type WebCallThemePanelProps = {
  segment: Segment
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onThemeChange: (patch: Partial<WebCallTheme>) => void
  onAvatarChange: (patch: Partial<WebCallAvatar>) => void
}

export function WebCallThemePanel({
  segment,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onThemeChange,
  onAvatarChange,
}: WebCallThemePanelProps) {
  // The Theme/Avatar tab strip is panel-local: a mock with no deep-linking.
  const [tab, setTab] = useState<'theme' | 'avatar'>('theme')
  const theme = segment.webcall.theme

  return (
    <PanelShell
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      {/* Tabs — 44px underline strip from the frame. */}
      <div className="-mt-1 mb-2 flex border-b border-transparent" role="tablist">
        {(['theme', 'avatar'] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'h-11 border-b-2 px-2 text-[14px] transition-colors duration-instant ease-soft',
              tab === id
                ? 'border-ink font-semibold text-ink'
                : 'border-transparent text-grey-600 hover:text-ink',
            )}
          >
            {id === 'theme' ? COPY.tabs.theme : COPY.tabs.avatar}
          </button>
        ))}
      </div>

      {tab === 'avatar' ? (
        <AvatarTab avatar={segment.webcall.avatar} onAvatarChange={onAvatarChange} />
      ) : (
        // The frame stacks these groups 20px apart, 8px label-to-content.
        <div className="flex flex-col gap-5">
          {/* Launch icon */}
          <div>
            <GroupLabel label={COPY.launchIcon} />
            <LogoBox />
            <TextButton>{COPY.changeImage}</TextButton>
            <button
              type="button"
              className="mt-2 h-8 w-full rounded-full border border-[#9c9a99] text-[14px] font-semibold text-ink transition-colors duration-instant ease-soft hover:bg-grey-100"
            >
              {COPY.resetDefault}
            </button>
          </div>

          <Divider />

          {/* Web call header */}
          <div>
            <GroupLabel label={COPY.headerLabel} />
            <div className="mt-2">
              <TextField
                label={COPY.headerLabel}
                value={theme.headerText}
                onChange={(headerText) => onThemeChange({ headerText })}
              />
            </div>
          </div>

          {/* Header logo */}
          <div>
            <GroupLabel label={COPY.headerLogo} />
            <LogoBox />
            <TextButton>{COPY.changeImage}</TextButton>
          </div>

          {/* Colors */}
          <div>
            <GroupLabel label={COPY.colors} />
            <div className="mt-2 flex h-10 items-center justify-between rounded-lg border border-[#bcbdc5] bg-white px-3">
              <span className="text-[14px] text-ink">{COPY.themeColor}</span>
              <span className="flex items-center gap-2">
                <span className="text-[14px] uppercase text-ink">{theme.themeColor}</span>
                <span
                  className="size-5 rounded-full border border-black/10"
                  style={{ backgroundColor: theme.themeColor }}
                />
              </span>
            </div>
          </div>

          <Divider />

          {/* Size */}
          <div>
            <GroupLabel label={COPY.size} />
            <div className="mt-2 flex gap-4">
              {COPY.sizes.map((size) => (
                <OptionTile
                  key={size.id}
                  label={size.label}
                  selected={theme.size === size.id}
                  onClick={() => onThemeChange({ size: size.id })}
                >
                  {/* Card outline with the launcher's solid block inside it. */}
                  <TileGraphic selected={theme.size === size.id}>
                    <span
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 rounded-[2px]',
                        theme.size === size.id ? 'bg-accent-blue' : 'bg-grey-400',
                        size.id === 'large' ? 'right-2 h-[18px] w-3' : 'right-2.5 h-3.5 w-2.5',
                      )}
                    />
                  </TileGraphic>
                </OptionTile>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div>
            <GroupLabel label={COPY.mode} />
            <div className="mt-2 flex gap-4">
              {COPY.modes.map((mode) => (
                <OptionTile
                  key={mode.id}
                  label={mode.label}
                  selected={theme.mode === mode.id}
                  onClick={() => onThemeChange({ mode: mode.id })}
                >
                  <GardenIcon
                    name={mode.icon as GardenIconName}
                    className={cn(
                      'h-8 w-8',
                      theme.mode === mode.id ? 'text-accent-blue' : 'text-grey-400',
                    )}
                  />
                </OptionTile>
              ))}
            </div>
          </div>

          {/* Placement */}
          <div>
            <GroupLabel label={COPY.position} />
            <div className="mt-2 flex gap-4">
              {COPY.positions.map((position) => (
                <OptionTile
                  key={position.id}
                  label={position.label}
                  selected={theme.position === position.id}
                  onClick={() => onThemeChange({ position: position.id })}
                >
                  <TileGraphic selected={theme.position === position.id}>
                    <span
                      className={cn(
                        'absolute bottom-1 h-4 w-2.5 rounded-[2px]',
                        theme.position === position.id ? 'bg-accent-blue' : 'bg-grey-400',
                        position.id === 'bottom-right' ? 'right-1' : 'left-1',
                      )}
                    />
                  </TileGraphic>
                </OptionTile>
              ))}
            </div>
          </div>
        </div>
      )}
    </PanelShell>
  )
}

/** The 60px Uber mark in its preview box — the frame's launch icon/logo slot
 *  (input-border grey, 8px radius, 96px tall). */
function LogoBox() {
  return (
    <div className="mt-2 flex h-24 items-center justify-center rounded-lg border border-[#b7b7b3] bg-white">
      <span className="flex size-[60px] items-center justify-center rounded-full bg-black text-[14px] font-semibold text-white">
        Uber
      </span>
    </div>
  )
}

/** The frame's borderless centred "Change image" action (pill ghost). */
function TextButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="mt-2 h-8 w-full rounded-full text-[14px] font-semibold text-ink transition-colors duration-instant ease-soft hover:bg-grey-100"
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="h-px bg-grey-200" />
}

/** A Size/Mode/Placement tile: 72px tall, graphic over a label. From the tile
 *  refine frame: selected = #f3f6fb tint (🌸 blue/100, not an exposed class)
 *  + emphasis-blue border + semibold near-black label; unselected = grey-200
 *  border + regular grey-600 label. */
function OptionTile({
  label,
  selected,
  onClick,
  children,
}: {
  label: string
  selected: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'flex h-[72px] flex-1 flex-col items-center justify-center gap-2 rounded-lg border px-5 py-2 transition-colors duration-instant ease-soft',
        selected
          ? 'border-accent-blue bg-[#f3f6fb]'
          : 'border-grey-200 bg-white hover:border-grey-400',
      )}
    >
      {children}
      <span
        className={cn(
          'text-[12px]',
          selected ? 'font-semibold text-grey-1200' : 'font-normal text-grey-600',
        )}
      >
        {label}
      </span>
    </button>
  )
}

/** The Avatar tab: intro, the stock-visualization picker (108px option cards
 *  in the frame's 3-wide grid), the animation checkbox, and the upload slot. */
function AvatarTab({
  avatar,
  onAvatarChange,
}: {
  avatar: WebCallAvatar
  onAvatarChange: (patch: Partial<WebCallAvatar>) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-[14px] leading-5 tracking-[-0.154px] text-ink">{WEBCALL_AVATAR_COPY.intro}</p>

      <div>
        <GroupLabel label={WEBCALL_AVATAR_COPY.visualization.label} />
        <Helper>{WEBCALL_AVATAR_COPY.visualization.helper}</Helper>
        <label className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-ink">
          <input
            type="checkbox"
            checked={avatar.showAnimation}
            onChange={() => onAvatarChange({ showAnimation: !avatar.showAnimation })}
            className="size-4 accent-accent-blue"
          />
          {WEBCALL_AVATAR_COPY.showAnimation}
        </label>
        <div className="mt-4 flex flex-wrap gap-4">
          {WEBCALL_AVATAR_VISUALS.map((visual) => (
            <button
              key={visual.id}
              type="button"
              aria-label={visual.label}
              aria-pressed={avatar.visual === visual.id}
              onClick={() => onAvatarChange({ visual: visual.id })}
              className={cn(
                'flex size-[108px] items-center justify-center rounded-[5px] border transition-colors duration-instant ease-soft',
                avatar.visual === visual.id
                  ? 'border-accent-blue bg-[#f3f6fb]'
                  : 'border-grey-200 bg-white hover:border-grey-400',
              )}
            >
              <VisualGraphic id={visual.id} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <GroupLabel label={WEBCALL_AVATAR_COPY.upload.label} />
        <div className="mt-2 flex h-24 flex-col items-center justify-center gap-0.5 rounded-lg border border-[#b7b7b3] bg-white">
          <Upload size={20} className="text-ink" aria-hidden />
          <span className="text-[13px] text-grey-600">{WEBCALL_AVATAR_COPY.upload.hint}</span>
        </div>
        <TextButton>{WEBCALL_AVATAR_COPY.upload.button}</TextButton>
      </div>
    </div>
  )
}

/** The four stock visualizations, drawn in CSS at the frame's 56px size. The
 *  orb is a photograph in the frame; a radial gradient stands in. Decorative. */
function VisualGraphic({ id }: { id: WebCallAvatar['visual'] }) {
  if (id === 'ring')
    return (
      <span aria-hidden className="relative size-14">
        <span
          className="absolute inset-0 rounded-full blur-[2px]"
          style={{
            background:
              'conic-gradient(from 0deg, #f2a3a0 0deg, #4fbecb 80deg, #74d489 160deg, #c780dd 230deg, #ef8d72 300deg, #f2a3a0 360deg)',
          }}
        />
        <span className="absolute inset-[6px] rounded-full bg-white" />
      </span>
    )
  if (id === 'outline')
    return (
      <span aria-hidden className="relative size-14">
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, #f5d9a8 0deg, #a8d5c8 120deg, #a3b7df 240deg, #f5d9a8 360deg)',
          }}
        />
        <span className="absolute inset-[3px] rounded-full bg-white" />
      </span>
    )
  if (id === 'orb')
    return (
      <span
        aria-hidden
        className="size-14 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 32% 30%, #9ec2ff 0%, #6a5ae0 45%, #3b2d8f 78%, #2a6f77 100%)',
        }}
      />
    )
  // waveform: five bars, centre tallest, at the frame's 50% opacity.
  return (
    <span aria-hidden className="flex items-center gap-1.5 opacity-50">
      {[10, 18, 26, 18, 10].map((height, i) => (
        <span key={i} className="w-1 rounded-full bg-grey-700" style={{ height }} />
      ))}
    </span>
  )
}

/** The 50×32 card-outline graphic the Size and Placement tiles draw; children
 *  are the solid launcher block placed inside it. */
function TileGraphic({ selected, children }: { selected: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        'relative block h-8 w-[50px] rounded-[4px] border',
        selected ? 'border-accent-blue' : 'border-grey-400',
      )}
    >
      {children}
    </span>
  )
}
