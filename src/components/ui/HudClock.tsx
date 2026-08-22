import { useClock } from '../../hooks/useClock'
import { usePlayerStore } from '../../store/usePlayerStore'

// Live digital clock + date, driven by the user's local timezone. On a handset
// it sets in one line: the stacked date sat exactly where the map begins, and
// the two overlapped.
export function HudClock() {
  const { time, date } = useClock()
  const isTouch = usePlayerStore((s) => s.isTouch)

  if (isTouch) {
    return (
      <div className="pointer-events-none flex select-none items-baseline gap-2 font-mono leading-none">
        <span className="text-lg font-semibold text-white tabular-nums">{time}</span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">{date}</span>
      </div>
    )
  }

  return (
    <div className="pointer-events-none select-none text-right font-mono">
      <div className="text-2xl font-semibold leading-none text-white tabular-nums">{time}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/40">{date}</div>
    </div>
  )
}
