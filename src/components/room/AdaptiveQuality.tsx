import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { FpsMonitor } from '../../systems/performanceSystem'
import { useRoomStore } from '../../store/useRoomStore'
import type { GraphicsQuality } from '../../types'

const DOWNGRADE: Record<GraphicsQuality, GraphicsQuality | null> = {
  high: 'medium',
  medium: 'low',
  low: null,
}

// Watches frame rate and drops the quality tier one step if the device can't
// keep up. Only ever downgrades, and shows a toast so the change is visible.
export function AdaptiveQuality() {
  const monitor = useRef(new FpsMonitor())

  useFrame((_, delta) => {
    if (!monitor.current.sample(delta)) return
    const store = useRoomStore.getState()
    const current = store.settings.quality
    const next = DOWNGRADE[current]
    if (next) {
      store.setSettings({ quality: next, bloom: next !== 'low' && store.settings.bloom })
      store.pushToast(`Performance mode: graphics set to ${next.toUpperCase()}`)
      monitor.current.reset()
    }
  })

  return null
}
