import { useClock, useTimeOfDay } from '../../../hooks/useClock'

const DESC: Record<string, string> = {
  day: 'Clear daylight over the city. The room is bright and calm.',
  sunset: 'The sky is burning orange. City lights are beginning to flicker on.',
  night: 'Stars and distant city lights. The quiet hours — good for deep work.',
}

// Read-only window info panel: real local time + the current outdoor mood.
export function WindowPanel() {
  const { time, date } = useClock()
  const tod = useTimeOfDay()

  return (
    <div className="text-center">
      <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent-soft/70">
        {tod}
      </div>
      <div className="mt-2 font-mono text-5xl font-bold tabular-nums text-white">{time}</div>
      <div className="mt-1 text-sm text-white/40">{date}</div>
      <p className="mx-auto mt-6 max-w-sm text-sm text-white/60">{DESC[tod]}</p>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
        The scene outside follows your real local clock
      </p>
    </div>
  )
}
