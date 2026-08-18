import type { GraphicsQuality } from '../types'

// Touch / mobile detection. Kept intentionally simple and defensive so a
// missing browser API never throws.
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    (navigator.maxTouchPoints ?? 0) > 0 ||
    // Coarse pointer usually means touch-first hardware.
    window.matchMedia?.('(pointer: coarse)').matches === true
  )
}

// Pick a sensible default graphics tier based on the device. Mid-range
// Android phones (e.g. Redmi 10 5G) should land on low/medium.
export function detectQuality(): GraphicsQuality {
  if (typeof navigator === 'undefined') return 'medium'
  const cores = navigator.hardwareConcurrency ?? 4
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  const touch = isTouchDevice()

  if (touch) {
    if (cores <= 4 || mem <= 3) return 'low'
    return 'medium'
  }
  if (cores <= 4 || mem <= 4) return 'medium'
  return 'high'
}

// Device-pixel-ratio ceiling per quality tier. High DPR on phones murders FPS.
export function dprRange(quality: GraphicsQuality, touch: boolean): [number, number] {
  if (touch) {
    if (quality === 'low') return [0.6, 1]
    if (quality === 'medium') return [0.8, 1.3]
    return [1, 1.6]
  }
  if (quality === 'low') return [0.8, 1.2]
  if (quality === 'medium') return [1, 1.6]
  return [1, 2]
}

export function shadowsEnabled(quality: GraphicsQuality): boolean {
  return quality !== 'low'
}

export function shadowMapSize(quality: GraphicsQuality): number {
  if (quality === 'high') return 2048
  if (quality === 'medium') return 1024
  return 512
}
