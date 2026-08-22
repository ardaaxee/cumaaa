import type { TimeOfDay } from '../types'

// Maps the user's *local* clock to a time-of-day bucket used for the window
// environment and outdoor lighting.
//   06:00–18:00 → day
//   18:00–21:00 → sunset
//   21:00–06:00 → night
export function timeOfDayFromHour(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 18) return 'day'
  if (hour >= 18 && hour < 21) return 'sunset'
  return 'night'
}

export function currentTimeOfDay(date = new Date()): TimeOfDay {
  return timeOfDayFromHour(date.getHours())
}

export function formatClock(date = new Date()): string {
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export function formatDate(date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

// Palette per time-of-day, consumed by lighting and the window shader-ish mesh.
export interface SkyPalette {
  top: string
  bottom: string
  ambient: string
  ambientIntensity: number
  sun: string
  sunIntensity: number
  stars: boolean
  cityLights: boolean
}

// Natural, photographic palettes — daylight is warm-neutral, dusk is warm,
// night leans on interior lamps rather than saturated ambient.
export function skyPalette(tod: TimeOfDay): SkyPalette {
  switch (tod) {
    case 'day':
      return {
        top: '#9db8d2', // clear sky
        bottom: '#e2e4de', // hazy horizon
        ambient: '#bcc2ca', // neutral fill
        ambientIntensity: 0.72,
        sun: '#fff2d6', // warm daylight
        sunIntensity: 1.5,
        stars: false,
        cityLights: false,
      }
    case 'sunset':
      return {
        top: '#5b4a63',
        bottom: '#e0a05e',
        ambient: '#a29387', // warm neutral
        ambientIntensity: 0.6,
        sun: '#ff9c4d',
        sunIntensity: 0.95,
        stars: false,
        cityLights: true,
      }
    case 'night':
      return {
        top: '#0a0e18',
        bottom: '#141a2a',
        // Lifted so a night room reads as a real dim room, not a black void.
        ambient: '#6c7280',
        ambientIntensity: 0.82,
        sun: '#8895aa', // moonlight
        sunIntensity: 0.4,
        stars: true,
        cityLights: true,
      }
  }
}

// How much the interior lamps (ceiling + desk) are "on" for a time of day.
export function interiorLightLevel(tod: TimeOfDay): number {
  switch (tod) {
    case 'day':
      return 0.25
    case 'sunset':
      return 0.7
    case 'night':
      return 1.0
  }
}
