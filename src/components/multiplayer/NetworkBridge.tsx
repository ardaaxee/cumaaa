import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { playerMotion } from '../../systems/playerMotion'
import { NET_SEND_MS } from '../../network/protocol'

// Publishes the LOCAL player's transform + state to the server at a fixed tick
// (not every frame). Does nothing until we're actually in a home. The local
// controller is completely untouched — this only reads from it.
export function NetworkBridge() {
  const { camera } = useThree()
  const last = useRef(0)
  const dir = useRef(new THREE.Vector3())

  useFrame(() => {
    const mp = useMultiplayerStore.getState()
    if (!mp.roomId || mp.phase !== 'open') return
    const now = performance.now()
    if (now - last.current < NET_SEND_MS) return
    last.current = now

    camera.getWorldDirection(dir.current)
    const ry = Math.atan2(-dir.current.x, -dir.current.z)
    mp.sendState({
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      ry,
      run: playerMotion.running,
      jump: !playerMotion.grounded,
      sit: usePlayerStore.getState().seatPose !== null,
    })
  })

  return null
}
