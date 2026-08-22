import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useWeather } from '../../systems/weatherSystem'
import { isUltra, isHighTier } from '../../utils/device'
import type { GraphicsQuality } from '../../types'

// Rain drawn as one LineSegments buffer that follows the camera.
//
// A per-drop particle system would mean thousands of objects and a matrix
// update each; instead this is a single draw call over a fixed vertex buffer
// that is recycled in place. Drops fall inside a box centred on the player, so
// a small count covers the whole visible field however far you walk.
const COUNTS: Record<GraphicsQuality, number> = {
  low: 220,
  medium: 550,
  high: 1000,
  ultra: 1600,
}

const BOX = { w: 26, h: 16, d: 26 }

export function Rain({ quality }: { quality: GraphicsQuality }) {
  const weather = useWeather()
  const { camera } = useThree()
  const geo = useRef<THREE.BufferGeometry>(null)
  const group = useRef<THREE.Group>(null)

  const count = COUNTS[quality]
  const streak = isUltra(quality) ? 0.55 : isHighTier(quality) ? 0.45 : 0.34

  // Each drop is a short vertical line: two vertices, recycled every frame.
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 6)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * BOX.w
      const y = Math.random() * BOX.h
      const z = (Math.random() - 0.5) * BOX.d
      positions[i * 6 + 0] = x
      positions[i * 6 + 1] = y
      positions[i * 6 + 2] = z
      positions[i * 6 + 3] = x
      positions[i * 6 + 4] = y + streak
      positions[i * 6 + 5] = z
      speeds[i] = 9 + Math.random() * 7
    }
    return { positions, speeds }
  }, [count, streak])

  useFrame((_, rawDelta) => {
    if (weather !== 'rain' || !geo.current || !group.current) return
    const delta = Math.min(rawDelta, 0.05)
    // Follow the player on a grid so drops never visibly slide sideways.
    group.current.position.set(Math.round(camera.position.x), 0, Math.round(camera.position.z))

    const attr = geo.current.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    for (let i = 0; i < count; i++) {
      const o = i * 6
      const fall = speeds[i] * delta
      arr[o + 1] -= fall
      arr[o + 4] -= fall
      if (arr[o + 4] < 0) {
        const x = (Math.random() - 0.5) * BOX.w
        const z = (Math.random() - 0.5) * BOX.d
        arr[o + 0] = x
        arr[o + 2] = z
        arr[o + 3] = x
        arr[o + 5] = z
        arr[o + 1] = BOX.h
        arr[o + 4] = BOX.h + streak
      }
    }
    attr.needsUpdate = true
  })

  if (weather !== 'rain') return null

  return (
    <group ref={group}>
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={geo}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#b9c6d2" transparent opacity={0.34} depthWrite={false} fog={false} />
      </lineSegments>
    </group>
  )
}
