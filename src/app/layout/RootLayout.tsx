import { Outlet } from 'react-router'
import { BrandProvider } from '@/app/brand-context'
import { AiAssistantProvider } from '@/app/ai-assistant-context'

// Pathless root layout: owns the single BrandProvider so brand state is shared by
// both the app shell (AppLayout) and the full-page create-agent flow, which are
// sibling routes. Also provides AiAssistantProvider for AI triggers across both
// routes. Renders a bare Outlet — no chrome of its own.
export function RootLayout() {
  return (
    <BrandProvider>
      <AiAssistantProvider>
        <Outlet />
      </AiAssistantProvider>
    </BrandProvider>
  )
}
