export type Channel = string

// A brand is the axis the console is scoped by: an account's product, region,
// or business unit. `mark` is the wordmark chip shown beside the name (see
// BrandMarkChip) — brands ship no logo assets.
export type BrandMark = { label: string; bg: string }

export type Brand = {
  id: string
  name: string
  mark: BrandMark
  channels: Channel[]
}

export type NavIconProps = {
  size?: number
  className?: string
  color?: string
}

export type NavIcon = (props: NavIconProps) => React.JSX.Element

// Optional display-only grouping over `submenu`: lets a section's pages column
// show labeled dividers (ported from the ft-unify prototype's `NAV.*.groups`).
// `routingKey` must be one of the section's `submenu` strings — `submenu`
// stays the source of truth for path derivation and tests; `display` is what
// renders in its place, so a page can be relabeled without touching its route.
export type SubmenuGroup = {
  label: string | null
  items: { display: string; routingKey: string }[]
}

export type NavItem = {
  label: string
  path: string
  icon: NavIcon
  submenu: string[]
  submenuGroups?: SubmenuGroup[]
}
