import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ROOM, HALF_D } from '../../config/roomLayout'
import { ANCHORS } from '../../config/roomLayout'
import { useTimeOfDay } from '../../hooks/useClock'
import { skyPalette, interiorLightLevel } from '../../systems/timeSystem'
import { shadowsEnabled, shadowMapSize } from '../../utils/device'
import type { GraphicsQuality } from '../../types'

// Photographic lighting: a real directional "sun" through the window casts soft
// shadows, a warm tungsten ceiling lamp + desk lamp take over toward night, and
// ambient/hemisphere fill is neutral (no cyan flood).
export function Lighting({ quality }: { quality: GraphicsQuality }) {
  const tod = useTimeOfDay()
  const palette = skyPalette(tod)
  const interior = interiorLightLevel(tod)
  const castShadows = shadowsEnabled(quality)
  const mapSize = shadowMapSize(quality)

  const sun = useRef<THREE.DirectionalLight>(null)
  const [wx, , wz] = ANCHORS.window.pos

  // Aim the sun from just outside the window into the room.
  useFrame(() => {
    if (sun.current) {
      sun.current.target.position.set(wx * 0.3, 0.4, wz + 3)
      sun.current.target.updateMatrixWorld()
    }
  })

  return (
    <>
      <ambientLight color={palette.ambient} intensity={palette.ambientIntensity} />
      <hemisphereLight color={palette.top} groundColor="#26221c" intensity={0.45} />

      {/* Sunlight / moonlight through the window */}
      <directionalLight
        ref={sun}
        position={[wx + 1.5, 4.2, wz - 4]}
        color={palette.sun}
        intensity={palette.sunIntensity}
        castShadow={castShadows}
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* Warm ceiling lamp (tungsten) — stronger toward night */}
      <pointLight
        position={[0, ROOM.height - 0.25, 0.5]}
        intensity={0.5 + interior * 1.15}
        color="#ffdcae"
        distance={13}
        decay={1.6}
        castShadow={castShadows && quality === 'high'}
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
        shadow-bias={-0.0006}
      />

      {/* Second warm lamp toward the front so the desk area is readable */}
      <pointLight position={[0, ROOM.height - 0.4, -3]} intensity={0.3 + interior * 0.5} color="#ffe0b6" distance={9} />

      {/* Soft neutral fill so shadowed corners aren't crushed */}
      <pointLight position={[0, ROOM.height - 0.5, 2.5]} intensity={0.4} color="#c9cdd2" distance={11} />

      {/* Gentle warm bounce from the bed corner (night) */}
      <pointLight
        position={[3, 1.2, HALF_D - 2]}
        intensity={0.12 + interior * 0.18}
        color="#ffbe86"
        distance={6}
      />
    </>
  )
}
