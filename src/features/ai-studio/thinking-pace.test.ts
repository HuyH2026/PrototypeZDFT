import { describe, expect, it } from 'vitest'
import { DEFAULT_PACE, INSTANT_PACE, isPaced, LIVE_PACE } from './thinking-pace'

describe('thinking pace', () => {
  it('treats a pace of zeros as no staging at all', () => {
    expect(isPaced(INSTANT_PACE)).toBe(false)
    expect(isPaced(LIVE_PACE)).toBe(true)
  })

  it('still counts as paced when only the quiet beat is set', () => {
    expect(isPaced({ ...INSTANT_PACE, quietMs: 400 })).toBe(true)
  })

  // The suite runs on real timers, so a paced transcript would charge its whole
  // running time to every test that opens the studio. Pinned here because it is
  // the reason ~30 existing assertions can still read the transcript
  // synchronously; the tests that watch the staging pass their own pace.
  it('defaults to the instant pace under test', () => {
    expect(DEFAULT_PACE).toEqual(INSTANT_PACE)
  })

  it('spends longer on a reasoning line than on a scripted user turn', () => {
    expect(LIVE_PACE.lineMs).toBeGreaterThan(0)
    expect(LIVE_PACE.userTurnMs).toBeLessThan(LIVE_PACE.lineMs + LIVE_PACE.tailMs)
  })
})
