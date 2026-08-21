import type { CSSProperties } from 'react'
import { Outlet } from 'react-router'

// The Insights section shell.
//
// `--glass-card-sheen: none` turns off the Flora card wash for this whole
// subtree. `Card`'s default frosted treatment carries a violet tint in its top-
// left corner (see --glass-card-sheen in theme.css), which is fine on a screen
// of text and tables but not here: every Insights screen is dense with charts,
// and the tint reads as a color the data does not mean. Color is reserved for
// the series. The token is overridden here rather than passing `flat` at each
// call site so the rule holds for charts added later, and it leaves `Card`
// itself — and the wash everywhere else in the app — untouched.
export function InsightsScreen() {
  return (
    <div
      data-testid="screen-insights"
      className="h-full rounded-[26px] bg-white"
      style={{ '--glass-card-sheen': 'none' } as CSSProperties}
    >
      <Outlet />
    </div>
  )
}
