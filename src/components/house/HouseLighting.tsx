import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTimeOfDay } from '../../hooks/useClock'
import { skyPalette } from '../../systems/timeSystem'
import { shadowMapSize } from '../../utils/device'
import type { GraphicsQuality } from '../../types'

// One directional "sun" for the whole apartment, driven by the real local time.
// It rakes across the rooms so window-lit furniture throws soft PCF shadows on
// the floors and walls. Its elevation lowers and colour warms toward sunset,
// then dims to a faint moonlight at night when the interior lamps take over.
//
// Only one shadow-casting directional is used for the house, and only on HIGH —
// MEDIUM keeps the directional for shading without a shadow map, LOW drops it
// entirely (ambient/hemisphere fill only), so mobile stays fast.
export function HouseLighting({ quality }: { quality: GraphicsQuality }) {
  const tod = useTimeOfDay()
  const p = skyPalette(tod)
  const sun = useRef<THREE.DirectionalLight>(null)
  const castShadow = quality === 'high'
  const mapSize = shadowMapSize(quality)

  // Sun height by time of day: high and bright by day, low at dusk, near the
  // horizon (dim) at night. The apartment centre is roughly [-1, 0, 14].
  const elev = tod === 'day' ? 8.5 : tod === 'sunset' ? 3.6 : 2.2
  const reach = tod === 'day' ? 6 : 10 // lower sun casts from further out

  useFrame(() => {
    if (sun.current) {
      sun.current.target.position.set(-1, 0.4, 14)
      sun.current.target.updateMatrixWorld()
    }
  })

  if (quality === 'low') return null

  return (
    <directionalLight
      ref={sun}
      position={[-1 + reach, elev, 14 - reach]}
      color={p.sun}
      intensity={p.sunIntensity * 0.7}
      castShadow={castShadow}
      shadow-mapSize-width={mapSize}
      shadow-mapSize-height={mapSize}
      shadow-bias={-0.0004}
      shadow-normalBias={0.03}
      shadow-camera-near={0.5}
      shadow-camera-far={40}
      shadow-camera-left={-14}
      shadow-camera-right={14}
      shadow-camera-top={12}
      shadow-camera-bottom={-12}
    />
  )
}
