// How the full-page studio spends time.
//
// There is no model behind any of this app's conversations — the transcripts are
// authored, so without a clock they are simply *present*, and a finished
// conversation appearing in one frame reads as a screenshot of an assistant
// rather than as one at work. The studio therefore plays its transcript in: the
// request lands, a thinking block runs the reasoning that message carries, then
// the answer arrives. This file is that whole "latency" — data in one place, so
// the demo can be re-timed without touching a view.
//
// It is a pace, not an animation: a message still travels no distance and
// nothing here is disabled under `prefers-reduced-motion` (the sweep on the
// "Thinking" label is, in theme.css). Content that arrives late still arrives.

export type ThinkingPace = {
  /** One reasoning line at a time. */
  lineMs: number
  /** The beat between the last line and the answer it produced. */
  tailMs: number
  /** A reply that scripts no reasoning still thinks for this long. */
  quietMs: number
  /** A scripted user turn waits this long, as though it were being typed. */
  userTurnMs: number
}

// Tuned against the two thinking blocks in the create-agent flow: three lines
// plus the tail is ~1.7s of visible work per assistant turn, so the flow's whole
// two-exchange script plays in about 3.7s — long enough to read as reasoning,
// short enough that a demo does not stall on it.
export const LIVE_PACE: ThinkingPace = {
  lineMs: 460,
  tailMs: 340,
  quietMs: 900,
  userTurnMs: 420,
}

// Every beat off, which the reveal engine reads as "no staging at all": the
// transcript is complete on first paint and no timer is ever scheduled.
export const INSTANT_PACE: ThinkingPace = {
  lineMs: 0,
  tailMs: 0,
  quietMs: 0,
  userTurnMs: 0,
}

// Vitest drives this UI with real timers — fake ones deadlock userEvent in this
// toolchain (see the note atop AgentPlanFlow.test) — so a paced transcript would
// add its entire running time to every test that opens the studio, and each of
// the plan flow's tests would sit through two thinking blocks before it could
// click anything. The suite therefore gets the instant pace, and the tests that
// exist to watch the staging pass their own fast pace explicitly.
export const DEFAULT_PACE: ThinkingPace = import.meta.env.MODE === 'test' ? INSTANT_PACE : LIVE_PACE

// Whether a pace stages anything at all. A pace of zeros is the switch that
// turns the reveal engine off, rather than a separate code path through it.
export function isPaced(pace: ThinkingPace): boolean {
  return pace.lineMs > 0 || pace.quietMs > 0 || pace.userTurnMs > 0
}
