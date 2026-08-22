import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { useWeather, setWeather, weatherLabel, WEATHER_ORDER } from '../../systems/weatherSystem'
import { useTimeOfDay } from '../../hooks/useClock'
import { Sfx } from '../../systems/audioSystem'

const ICON = { sunny: '☀', cloudy: '☁', rain: '☂' } as const

// Weather is shared, so this is a small, honest control rather than a hidden
// debug switch: whoever changes it changes it for both people in the home.
export function WeatherControl() {
  const weather = useWeather()
  const tod = useTimeOfDay()
  const inHome = useMultiplayerStore((s) => s.roomId !== null)

  const cycle = () => {
    Sfx.click()
    const next = WEATHER_ORDER[(WEATHER_ORDER.indexOf(weather) + 1) % WEATHER_ORDER.length]
    setWeather(next)
  }

  return (
    <button
      className="hud-btn !px-2 !py-1 text-[11px]"
      onClick={cycle}
      title={inHome ? 'Change the weather (both of you see it)' : 'Change the weather'}
    >
      <span className="mr-1">{ICON[weather]}</span>
      {weatherLabel(weather).toUpperCase()}
      <span className="ml-1.5 text-white/35">{tod === 'sunset' ? 'EVE' : tod.toUpperCase()}</span>
    </button>
  )
}
