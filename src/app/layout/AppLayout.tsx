import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { findNavItemByPath } from '@/app/nav-config'
import { OrgProvider } from '@/app/org-context'
import { Sidebar } from './Sidebar'
import { ExpandedSidebar } from './ExpandedSidebar'
import { TopBar } from './TopBar'

export function AppLayout() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedSub, setSelectedSub] = useState<Record<string, string>>({ Insights: 'AI Performances' })
  const location = useLocation()

  const active = findNavItemByPath(location.pathname)
  const activeLabel = active?.label ?? 'Home'

  return (
    <OrgProvider>
      <div className="flex flex-col h-screen min-w-[1024px] bg-app-backdrop">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          {isExpanded ? (
            <ExpandedSidebar
              activeLabel={activeLabel}
              selectedSub={selectedSub}
              onSelectSub={(item, sub) => setSelectedSub((prev) => ({ ...prev, [item]: sub }))}
              onCollapse={() => setIsExpanded(false)}
            />
          ) : (
            <Sidebar onToggleExpand={() => setIsExpanded((v) => !v)} />
          )}
          <main className="flex-1 overflow-hidden p-2">
            <Outlet />
          </main>
        </div>
      </div>
    </OrgProvider>
  )
}
