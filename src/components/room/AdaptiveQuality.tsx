import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { FpsMonitor } from '../../systems/performanceSystem'
import { useRoomStore } from '../../store/useRoomStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { QUALITY_ORDER, isTouchDevice } from '../../utils/device'
import type { GraphicsQuality } from '../../types'

// Watches sustained frame rate and moves the graphics tier to match the device:
// down when it is genuinely struggling, up when it has proven headroom. A single
// slow frame never changes anything (see FpsMonitor's multi-window logic), and
// the tier is only ever auto-raised as far as the device earns — mobile is not
// pinned to LOW. The watchdog runs ONLY while Settings is on AUTO; picking a
// tier by hand is a decision the app must not quietly overrule.
export function AdaptiveQuality() {
  const monitor = useRef(new FpsMonitor())
  // Auto-promotion ceiling: phones/tablets top out at HIGH, desktops may reach
  // ULTRA. Either can still be set manually in Settings.
  const ceiling = useRef<GraphicsQuality>(isTouchDevice() ? 'high' : 'ultra')

  useFrame((_, delta) => {
    const verdict = monitor.current.sample(delta)
    if (verdict === 'steady') return
    // Never fight a user who is mid-interaction (panel open / cinematic).
    if (!usePlayerStore.getState().inputEnabled) return

    const store = useRoomStore.getState()
    if (store.settings.qualityMode !== 'auto') return // user picked a tier
    const current = store.settings.quality
    const idx = QUALITY_ORDER.indexOf(current)
    if (idx < 0) return

    if (verdict === 'downgrade') {
      const next = QUALITY_ORDER[idx - 1]
      if (!next) return
      store.setSettings({ quality: next, bloom: next !== 'low' && store.settings.bloom })
      store.pushToast(`Performance mode: graphics set to ${next.toUpperCase()}`)
      monitor.current.reset()
      return
    }

    // upgrade — only up to what this class of device should attempt.
    const next = QUALITY_ORDER[idx + 1]
    const capIdx = QUALITY_ORDER.indexOf(ceiling.current)
    if (!next || idx + 1 > capIdx) return
    store.setSettings({ quality: next, bloom: true })
    store.pushToast(`Graphics raised to ${next.toUpperCase()}`)
    monitor.current.reset()
  })

  return null
}
