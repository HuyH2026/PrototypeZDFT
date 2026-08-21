import type { ReactNode } from 'react'

// Shared "Coming soon" screen for unbuilt nav destinations. Accepts an optional
// `action` rendered in the top-right corner (e.g. an AI trigger) while the body
// stays the centered placeholder.
export function PlaceholderScreen({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center rounded-[26px] bg-white text-ink-muted">
      {action && <div className="absolute right-6 top-6">{action}</div>}
      <div className="mb-4 text-4xl">🚧</div>
      <div className="text-xl font-medium text-ink">{title}</div>
      <div className="mt-2 text-sm opacity-70">Coming soon</div>
    </div>
  )
}
