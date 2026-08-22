import { useEffect, useState } from 'react'
import { currentTimeOfDay, formatClock, formatDate } from '../systems/timeSystem'
import type { TimeOfDay } from '../types'

// Ticks once per second; used by the HUD clock. Cleans up its interval.
export function useClock(): { time: string; date: string } {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return { time: formatClock(now), date: formatDate(now) }
}

// Updates only when the time-of-day bucket changes (checked every 30s), so the
// window/lighting don't re-render every second.
export function useTimeOfDay(): TimeOfDay {
  const [tod, setTod] = useState<TimeOfDay>(() => currentTimeOfDay())
  useEffect(() => {
    const id = window.setInterval(() => {
      const next = currentTimeOfDay()
      setTod((prev) => (prev === next ? prev : next))
    }, 30_000)
    return () => window.clearInterval(id)
  }, [])
  return tod
}
