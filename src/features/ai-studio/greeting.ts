// Pure, injectable greeting helper for the AI Studio landing. Kept separate
// from the component so it can be unit-tested with fixed dates. Greetings may
// be non-deterministic at runtime (called with `new Date()` in the UI) — this
// is presentational copy, not an id.
const NAME = 'Sunny'

export function greetingFor(date: Date): string {
  const hour = date.getHours()
  const partOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  return `Good ${partOfDay}, ${NAME}!`
}
