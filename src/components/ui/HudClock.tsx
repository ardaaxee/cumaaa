import { useClock } from '../../hooks/useClock'

// Live digital clock + date, driven by the user's local timezone.
export function HudClock() {
  const { time, date } = useClock()
  return (
    <div className="pointer-events-none select-none text-right font-mono">
      <div className="text-2xl font-semibold leading-none text-white tabular-nums">{time}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/40">{date}</div>
    </div>
  )
}
