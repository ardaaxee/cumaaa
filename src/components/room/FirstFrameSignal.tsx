import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { useBootStore } from '../../store/useBootStore'

// Flips the boot store's firstFrame flag once the scene has actually rendered
// a frame — used to complete the loading progress honestly.
export function FirstFrameSignal() {
  const fired = useRef(false)
  useFrame(() => {
    if (fired.current) return
    fired.current = true
    useBootStore.getState().setFirstFrame()
  })
  return null
}
