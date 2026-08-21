// Insights ▸ Topics (`/insights/topics`). The Figma destination is now a single
// Topics dashboard rather than the former Overview/Topics tab pair. The file and
// test id retain the historic CX Journey name because routes and tests consume it.
import { TopicsView } from './topics/TopicsView'
import { PageHeader } from '@/components/flora/PageHeader'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'

export function CxJourneyView() {
  return (
    <div data-testid="view-cx-journey" className="h-full overflow-y-auto">
      <PageHeader title="Topics" actions={<AiTriggerButton label="Ask AI about this page" />} />
      <div className="px-16 pb-16">
        <TopicsView />
      </div>
    </div>
  )
}
