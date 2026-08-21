import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { findNavItemByPath } from '@/app/nav-config'
import { Sidebar } from './Sidebar'
import { SubnavPanel } from './SubnavPanel'
import { TopBar } from './TopBar'
import { AiAssistantHost } from '@/features/ai-studio/AiAssistantHost'

export function AppLayout() {
  const location = useLocation()

  const active = findNavItemByPath(location.pathname)

  // Which section the user has closed the pages column for, if any.
  //
  // The rail's toggle is the prototype's `.nav-toggle`, whose only job is
  // `toggleSubnav()` — show/hide this column. There is no wider labelled nav: the
  // prototype's `.nav` is 56px at every width, so the rail never grows.
  //
  // Closing it frees room for the page you are on rather than setting a lasting
  // preference: the prototype's `selectNav` re-opens the column for any section
  // that has pages, so selecting *any* rail section clears this (see
  // `onSelectSection` below) — including re-selecting the section it was hidden
  // for. In-section navigation (a table row into a detail route) does not, which
  // is why this is cleared on the rail's click rather than on every location
  // change.
  //
  // It stores the *label* rather than a boolean so that the section it was hidden
  // for is recorded, not just the fact of hiding: the toggle's own state has to
  // survive an in-section navigation, and a stale label can never hide a column
  // for the wrong section.
  const [closedFor, setClosedFor] = useState<string | null>(null)

  // A section without pages has no column at all, toggle or no toggle.
  const hasPages = active !== undefined && active.submenu.length > 0
  const subnavItem = hasPages && closedFor !== active.label ? active : null

  return (
    // Flat --color-app-backdrop, matching the prototype's `body`. The warm wash is
    // not a property of the whole shell: it belongs to the nav strip, and to the row
    // only while the pages column is closed (see below).
    // overflow-hidden: the assistant panel slides in from beyond the right edge
    // (see AiAssistantHost), which would otherwise extend the document and flash a
    // horizontal scrollbar for the length of the transition.
    <div className="flex flex-col h-screen min-w-[1024px] overflow-hidden bg-app-backdrop">
      <TopBar />
      {/* The chrome is not a card: the nav and the pages column sit directly on the
          wash, and only `main` is the raised white surface (as in the prototype,
          where `.main` alone carries the radius and shadow). A panel wrapping the
          whole row would put the nav on white and flatten the wash behind it.

          The row's wash is conditional, as in the prototype: with the pages column
          open, `body.subnav-visible .body { background: none }` drops the gradient
          so the flat backdrop shows under `main`, and the nav strip keeps its own.
          Applied unconditionally, the gradient's dark end (#eae8e7) bled into the
          band below the content card, where the prototype stays #f7f7f7.

          The bottom and right insets belong to `main` alone, not the row, so the nav
          and the pages column run to the bottom of the window (`.main` carries
          margin-bottom; `.nav` and `.subnav` do not). */}
      {/* `relative`: the assistant side panel is positioned against this row, so it
          can slide in over the content instead of squashing it (the prototype's
          `.copilot-panel` is likewise absolute within `.body`). */}
      <div
        className="relative flex flex-1 min-h-0"
        style={subnavItem ? undefined : { backgroundImage: 'var(--chrome-wash)' }}
      >
        <Sidebar
          subnavOpen={subnavItem !== null}
          canToggleSubnav={hasPages}
          onToggleSubnav={() => setClosedFor(subnavItem !== null ? (active?.label ?? null) : null)}
          onSelectSection={() => setClosedFor(null)}
        />
        {/* The active item's pages open as their own column, pushing the content
            over — the nav beside it keeps its rows in place. Keyed by label so
            switching sections replays the stagger instead of swapping in place. */}
        {subnavItem && <SubnavPanel key={subnavItem.label} item={subnavItem} />}
        {/* `relative`: the containing block for anything a screen positions
            absolutely, so it lands inside the content region rather than against
            the viewport — and `overflow-hidden` keeps it inside the radius.
            (A `fixed` takeover, such as the create-agent flow, escapes both by
            design: it replaces the chrome instead of layering over the content.) */}
        <main className="relative mb-2 mr-2 flex-1 overflow-hidden rounded-[26px] bg-white shadow-xs-flora">
          <Outlet />
        </main>
        <AiAssistantHost />
      </div>
    </div>
  )
}
