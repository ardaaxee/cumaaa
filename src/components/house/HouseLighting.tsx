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
// The directional renders on ALL tiers (so even LOW gets directional shaping);
// only HIGH casts a shadow map. A second, dim COOL directional stands in for
// window/exterior fill toward evening/night so rooms are never a black void and
// the windows read as a real (if dim) light source — cheap (no extra shadow).
export function HouseLighting({ quality }: { quality: GraphicsQuality }) {
  const tod = useTimeOfDay()
  const p = skyPalette(tod)
  const sun = useRef<THREE.DirectionalLight>(null)
  const fill = useRef<THREE.DirectionalLight>(null)
  const castShadow = quality === 'high'
  const mapSize = shadowMapSize(quality)

  // Sun height by time of day: high and bright by day, low at dusk, near the
  // horizon (dim) at night. The apartment centre is roughly [-1, 0, 14].
  const elev = tod === 'day' ? 8.5 : tod === 'sunset' ? 3.6 : 2.2
  const reach = tod === 'day' ? 6 : 10 // lower sun casts from further out
  // Cool exterior fill — subtle by day (windows already bright), a touch more
  // present at night so the room keeps a believable cool spill near windows.
  const fillIntensity = tod === 'day' ? 0.12 : tod === 'sunset' ? 0.16 : 0.24

  useFrame(() => {
    if (sun.current) {
      sun.current.target.position.set(-1, 0.4, 14)
      sun.current.target.updateMatrixWorld()
    }
    if (fill.current) {
      fill.current.target.position.set(-1, 0.8, 14)
      fill.current.target.updateMatrixWorld()
    }
  })

  return (
    <>
      <directionalLight
        ref={sun}
        position={[-1 + reach, elev, 14 - reach]}
        color={p.sun}
        intensity={p.sunIntensity * (tod === 'day' ? 0.7 : 0.55)}
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
      {/* cool window/exterior fill (no shadow) */}
      <directionalLight ref={fill} position={[-9, 3, 10]} color="#8aa2c4" intensity={fillIntensity} />
    </>
  )
}
