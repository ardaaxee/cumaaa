import { useMultiplayerStore } from '../store/useMultiplayerStore'
import type { Weather } from '../network/protocol'

export type { Weather }

// Weather lives in the SHARED world state, not in a local store: if CUMA starts
// the rain, ZEYNEP is standing in it too. Reading it goes through the same
// channel as lights and doors, so a joining player picks up the current sky
// with the rest of the room state.
export function useWeather(): Weather {
  return useMultiplayerStore((s) => s.world.weather)
}

export function weatherNow(): Weather {
  return useMultiplayerStore.getState().world.weather
}

export function setWeather(weather: Weather): void {
  useMultiplayerStore.getState().toggleWorld({
    kind: 'WEATHER_CHANGED',
    id: 'sky',
    value: true,
    weather,
  })
}

export const WEATHER_ORDER: Weather[] = ['sunny', 'cloudy', 'rain']

export function weatherLabel(w: Weather): string {
  return w === 'sunny' ? 'Clear' : w === 'cloudy' ? 'Cloudy' : 'Rain'
}

// How much of the outdoor light survives the cloud deck. Applied on top of the
// time-of-day palette so DAY+RAIN is still brighter than NIGHT+CLEAR.
export function skyLightFactor(w: Weather): number {
  return w === 'sunny' ? 1 : w === 'cloudy' ? 0.72 : 0.55
}

// Direct sun is what a cloud deck removes first; ambient fill survives it.
export function sunFactor(w: Weather): number {
  return w === 'sunny' ? 1 : w === 'cloudy' ? 0.34 : 0.18
}
