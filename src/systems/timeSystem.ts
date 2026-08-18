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

export function skyPalette(tod: TimeOfDay): SkyPalette {
  switch (tod) {
    case 'day':
      return {
        top: '#6fa8dc',
        bottom: '#cfe4f5',
        ambient: '#9bb6cf',
        ambientIntensity: 0.72,
        sun: '#fff4e0',
        sunIntensity: 0.9,
        stars: false,
        cityLights: false,
      }
    case 'sunset':
      return {
        top: '#3a2b52',
        bottom: '#e0794a',
        ambient: '#b06a55',
        ambientIntensity: 0.55,
        sun: '#ff9d5c',
        sunIntensity: 0.7,
        stars: false,
        cityLights: true,
      }
    case 'night':
      return {
        top: '#05070f',
        bottom: '#0d1430',
        ambient: '#2a3350',
        ambientIntensity: 0.42,
        sun: '#5a6a9a',
        sunIntensity: 0.3,
        stars: true,
        cityLights: true,
      }
  }
}
