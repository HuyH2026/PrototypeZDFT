import { Link, useLocation } from 'react-router'
import type { CSSProperties } from 'react'
import type { NavItem } from '@/types'

type SubnavPanelProps = {
  item: NavItem
}

function kebab(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
}

/**
 * The active nav item's pages, as their own column beside the nav list.
 *
 * Ported from the prototype (`v1/index.html`, `.subnav`), where the submenu is a
 * sibling of the rail rather than a nested block: it opens as a 240px column and
 * pushes the content over, so the nav list beside it never reflows. Nesting the
 * submenu inline shifted every row below the active one, which the prototype
 * never does.
 */
export function SubnavPanel({ item }: SubnavPanelProps) {
  const { pathname } = useLocation()

  // The agent editor (`/agent-builder/:agentId`) and the experiment setup flow
  // (`/experiment/new`) are routed as *siblings* of their section's static tab
  // routes (see routes.tsx: "dynamic sibling", "setup flow at sibling
  // /experiment/new"), not nested under them — so neither is a prefix of its
  // tab's own path, and the plain equality/prefix check below never matches.
  // Route them back to the tab a user actually reaches them from.
  function isSiblingDetailRoute(sub: string): boolean {
    if (item.label === 'Agent Builder' && sub === 'Use cases') {
      const knownTabs = new Set(item.submenu.map(kebab))
      const segment = pathname.slice(item.path.length + 1)
      return pathname.startsWith(`${item.path}/`) && !segment.includes('/') && !knownTabs.has(segment)
    }
    // Reached only from A/B Test's table rows and its "Create new" button.
    if (item.label === 'Experiment' && sub === 'A/B Test') {
      return pathname === '/experiment/new'
    }
    return false
  }

  // The index route renders the first submenu entry, so it reads as selected
  // while the URL is still the parent path. The startsWith check catches
  // detail routes nested under a tab's own path (e.g. /agent-builder/actions/:id);
  // isSiblingDetailRoute catches the ones that aren't nested at all.
  // `flatIndex` is the entry's position among `item.submenu` (for the
  // parent-path fallback above), independent of `rowIndex`, which is its
  // position among all rendered rows including group dividers (for the
  // entrance-animation stagger).
  function renderLink(display: string, routingKey: string, flatIndex: number, rowIndex: number) {
    const subPath = `${item.path}/${kebab(routingKey)}`
    const selected =
      pathname === subPath ||
      pathname.startsWith(`${subPath}/`) ||
      (pathname === item.path && flatIndex === 0) ||
      isSiblingDetailRoute(routingKey)
    return (
      <Link
        key={routingKey}
        to={subPath}
        aria-current={selected ? 'page' : undefined}
        className={`flex h-8 items-center gap-2 truncate rounded-[12px] pl-3 pr-2 text-[14px] leading-5 tracking-[-0.154px] no-underline transition-colors duration-instant ease-soft animate-nav-row ${
          selected ? 'bg-nav-active text-white' : 'text-nav-active hover:bg-nav-hover'
        }`}
        style={{ '--row': rowIndex } as CSSProperties}
      >
        {display}
      </Link>
    )
  }

  const rows: React.ReactNode[] = []
  if (item.submenuGroups) {
    let flatIndex = 0
    let rowIndex = 1
    item.submenuGroups.forEach((group, gi) => {
      if (group.label) {
        rows.push(
          <div
            key={`group-${gi}`}
            className="flex items-center gap-1 px-3 pb-2 pt-4 animate-nav-row"
            style={{ '--row': rowIndex } as CSSProperties}
          >
            <span className="whitespace-nowrap text-[12px] font-semibold leading-4 text-ink-muted">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-surface-border" />
          </div>,
        )
        rowIndex++
      }
      group.items.forEach((entry) => {
        rows.push(renderLink(entry.display, entry.routingKey, flatIndex, rowIndex))
        flatIndex++
        rowIndex++
      })
    })
  } else {
    item.submenu.forEach((sub, i) => rows.push(renderLink(sub, sub, i, i + 1)))
  }

  return (
    <div
      data-testid="subnav-panel"
      aria-label={`${item.label} pages`}
      // Flat --chrome-top rather than letting the wash through: the prototype's
      // `.subnav-inner` is a flat #f6f5f4 panel sitting on the gradient.
      className="h-full w-[240px] shrink-0 overflow-hidden bg-chrome-top animate-sidebar-open"
    >
      <div className="flex w-[240px] flex-col p-2">
        <div className="flex items-center px-3 py-3 animate-nav-row" style={{ '--row': 0 } as CSSProperties}>
          <span className="truncate text-[18px] font-normal leading-6 tracking-[-0.45px] text-nav-active">
            {item.label}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">{rows}</div>
      </div>
    </div>
  )
}
