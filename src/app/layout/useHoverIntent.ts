import { useCallback, useEffect, useRef, useState } from 'react'

export function useHoverIntent(delayMs = 140) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  const open = useCallback((key: string) => {
    if (timer.current) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    setActiveKey(key)
  }, [])

  const scheduleClose = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setActiveKey(null), delayMs)
  }, [delayMs])

  const close = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = null
    setActiveKey(null)
  }, [])

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  return { activeKey, open, scheduleClose, close }
}
