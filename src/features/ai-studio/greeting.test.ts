import { describe, expect, it } from 'vitest'
import { greetingFor } from './greeting'

describe('greetingFor', () => {
  it('says good morning before noon', () => {
    expect(greetingFor(new Date(2026, 6, 29, 9, 0))).toBe('Good morning, Sunny!')
  })

  it('says good afternoon between noon and 6pm', () => {
    expect(greetingFor(new Date(2026, 6, 29, 13, 0))).toBe('Good afternoon, Sunny!')
  })

  it('says good evening from 6pm', () => {
    expect(greetingFor(new Date(2026, 6, 29, 20, 0))).toBe('Good evening, Sunny!')
  })

  it('reads the hour, not the weekday', () => {
    // 2026-08-02 is a Sunday; the greeting no longer names the day (Figma 1194:120016).
    expect(greetingFor(new Date(2026, 7, 2, 9, 0))).toBe('Good morning, Sunny!')
  })
})
