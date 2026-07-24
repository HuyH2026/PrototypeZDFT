// The Headless tab body: instructions (left) + config card & rail (right).
// Owns local, mocked state — masked/revealed API key, current key value, and
// which rail section is active (only 'headless' has content this phase).
import { useState } from 'react'
import { HeadlessInstructions } from './HeadlessInstructions'
import { HeadlessConfigPanel } from './HeadlessConfigPanel'
import { seedApiKey, nextApiKey } from './config-data'

export function HeadlessView() {
  const [apiKey, setApiKey] = useState(seedApiKey)
  const [revealed, setRevealed] = useState(false)
  const [activeSection, setActiveSection] = useState('headless')

  return (
    <div className="flex flex-1 overflow-hidden">
      <HeadlessInstructions />
      <HeadlessConfigPanel
        apiKey={apiKey}
        revealed={revealed}
        onToggleReveal={() => setRevealed((r) => !r)}
        onRefreshKey={() => {
          setApiKey(nextApiKey())
          setRevealed(false)
        }}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    </div>
  )
}
