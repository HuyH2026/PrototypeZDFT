// What the canvas shows between Approve and the created agent: four lines,
// revealed 600ms apart, naming exactly what the approval writes. Data + timing
// only, so a test can drive it with fake timers.
export const BUILD_TRACE_STEP_MS = 600

export const BUILD_TRACE: string[] = [
  'Creating agent — Service Cancellation',
  'Attaching 3 actions — Apply 30-Day Free, Schedule Day-30 Check-in, Process Cancellation',
  'Adding form — Cancellation reason',
  'Registering trigger — CSAT Survey',
]

export const BUILD_TRACE_TOTAL_MS = BUILD_TRACE.length * BUILD_TRACE_STEP_MS
