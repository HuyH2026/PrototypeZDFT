import { Link, useLocation } from 'react-router'
import { PanelLeft } from 'lucide-react'
import { PRIMARY_NAV, SECONDARY_NAV, findNavItemByPath } from '@/app/nav-config'
import type { NavItem } from '@/types'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'

interface SidebarProps {
  /** Show or hide the active section's pages column (the prototype's `toggleSubnav`). */
  onToggleSubnav: () => void
  /**
   * A rail section was selected (the prototype's `selectNav`, which always calls
   * `openSubnav` for a section that has pages). Selecting a section is the other
   * way back to a hidden column, alongside the toggle — including re-selecting
   * the very section it was hidden for.
   */
  onSelectSection: () => void
  /** The active section's pages are showing in their own column beside the rail. */
  subnavOpen?: boolean
  /**
   * The active section has pages to show. False on Dashboard and Agent Setup,
   * where there is no column for the toggle to act on — the prototype's
   * `toggleSubnav()` is a no-op there, so the control is disabled rather than
   * silently inert.
   */
  canToggleSubnav?: boolean
}

// A single collapsed-rail entry: a 56×48 row (the hover/hit target) wrapping a
// 32×32 pill that carries the active/hover background — matching the Figma spec,
// where the pill is centered with margin rather than filling the rail.
//
// Hovering names the destination in a dark tooltip pill (the prototype's
// `.nav-item .tooltip`), rather than opening a white popover listing the
// section's pages. The prototype has no such popover: its rail says only where
// an icon goes, and the pages themselves live in the column that opens once you
// select the section.
function NavRailItem({
  item,
  isActive,
  showTooltip,
  onSelect,
}: {
  item: NavItem
  isActive: boolean
  showTooltip: boolean
  onSelect: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      to={item.path}
      onClick={onSelect}
      aria-current={isActive ? 'page' : undefined}
      aria-label={item.label}
      className="group relative flex h-12 w-14 items-center justify-center"
    >
      <span
        // 8px, not Tailwind's rounded-lg (10px): the prototype's rail pill uses
        // --radius-btn for both its hover and active states.
        className={`flex size-8 items-center justify-center rounded-[8px] transition-colors duration-instant ease-soft ${
          isActive ? 'bg-nav-active' : 'group-hover:bg-nav-hover'
        }`}
      >
        {/* The glyph holds its colour on hover — only the pill behind it changes,
            as in the prototype. The old hover tint was a cool blue-grey.
            Inactive glyphs are --flora-fg-body (#404241), matching the prototype's
            --nav-icon-inactive (rgba(67,66,66,.9) over the warm rail ≈ #434242). */}
        <Icon size={20} className={isActive ? 'text-white' : 'text-flora-fg-body'} />
      </span>

      {/* The tooltip: 24px dark pill, 8px clear of the 56px rail, vertically
          centred on the row. `pointer-events-none` so it never intercepts the
          hover that summons it. */}
      {showTooltip && (
        <span
          data-testid="nav-tooltip"
          role="tooltip"
          className="pointer-events-none absolute left-[58px] top-1/2 z-[300] flex h-6 -translate-y-1/2 items-center whitespace-nowrap rounded-[12px] bg-[#404241] px-3 text-[12px] leading-4 tracking-[0.5px] text-white opacity-0 transition-opacity duration-instant ease-soft group-hover:opacity-100"
        >
          {item.label}
        </span>
      )}
    </Link>
  )
}

export function Sidebar({
  onToggleSubnav,
  onSelectSection,
  subnavOpen = false,
  canToggleSubnav = false,
}: SidebarProps) {
  const { pathname } = useLocation()
  const active = findNavItemByPath(pathname)

  // With the pages column open, the tooltips would open straight over it, so they
  // stand down — exactly as the prototype does
  // (`.subnav-visible .nav-item .tooltip { opacity: 0 !important }`).
  const showTooltips = !subnavOpen

  return (
    // The rail carries the warm wash itself (prototype `.nav`) so it keeps its ramp
    // when the pages column is open and the row's own gradient stands down. With
    // the column closed the row paints the gradient instead and the rail goes
    // transparent, exactly as the prototype's
    // `body:not(.subnav-visible) .nav { background: transparent }` — otherwise the
    // two ramps stack over the same 56px.
    <div
      className="relative flex h-full w-14 shrink-0 flex-col"
      style={subnavOpen ? { backgroundImage: 'var(--chrome-wash)' } : undefined}
    >
      {/* AI assistant trigger, pinned above Home, then the primary nav items.
          The global blank-slate entry: no scope, so it opens the route-derived
          context, and `mode="full"` launches the full-suite takeover (whereas
          the in-context triggers on page headers open the inline side panel). */}
      <div className="flex flex-col items-center gap-0 pt-3">
        <div className="flex h-12 w-14 items-center justify-center">
          <AiTriggerButton mode="full" variant="nav" />
        </div>
        {PRIMARY_NAV.map((item) => (
          <NavRailItem
            key={item.label}
            item={item}
            isActive={active?.label === item.label}
            showTooltip={showTooltips}
            onSelect={onSelectSection}
          />
        ))}
      </div>

      {/* Separator */}
      <div className="mx-auto my-2 h-px w-8 bg-[#e8eaec]" />

      {/* Secondary nav items (Agent Setup) */}
      <div className="flex flex-col items-center gap-0">
        {SECONDARY_NAV.map((item) => (
          <NavRailItem
            key={item.label}
            item={item}
            isActive={active?.label === item.label}
            showTooltip={showTooltips}
            onSelect={onSelectSection}
          />
        ))}
      </div>

      {/* Pages-column toggle, pinned to the bottom (the prototype's `.nav-toggle`). */}
      <div className="mt-auto flex items-end justify-center pb-3">
        <button
          aria-label={subnavOpen ? 'Hide pages' : 'Show pages'}
          aria-expanded={subnavOpen}
          onClick={onToggleSubnav}
          disabled={!canToggleSubnav}
          // The prototype's `.nav-toggle` dims the whole white circle rather than
          // tinting it grey: it's a floating control on the wash, not a nav row.
          className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white transition-opacity duration-instant ease-soft hover:opacity-80 disabled:cursor-default disabled:opacity-40 disabled:hover:opacity-40"
        >
          <PanelLeft size={16} className="text-ink" />
        </button>
      </div>
    </div>
  )
}
