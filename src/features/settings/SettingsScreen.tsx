import { Outlet } from 'react-router'

// Section shell for /settings — Integrations, Security, Logs. A bare Outlet
// wrapper, like the Insights/Agent Builder/Experiment shells: the raised white
// surface belongs to the section, and each child fills it.
export function SettingsScreen() {
  return (
    <div data-testid="screen-settings" className="h-full overflow-y-auto rounded-[26px] bg-white">
      <Outlet />
    </div>
  )
}
