import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTimeOfDay } from '../../hooks/useClock'
import { skyPalette } from '../../systems/timeSystem'
import { shadowMapSize, isHighTier } from '../../utils/device'
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
// Fake "bounced" light per zone: a warm one low down (light coming back off the
// wood floor) and a cooler one high up (off the ceiling/walls). Deliberately dim
// and wide so they only lift shadow detail — they must never read as lamps.
const bounces: { pos: [number, number, number]; color: string; intensity: number; distance: number }[] = [
  // study
  { pos: [0, 0.5, -1], color: '#a9855e', intensity: 0.3, distance: 12 },
  { pos: [0, 2.7, -1], color: '#8d93a3', intensity: 0.22, distance: 12 },
  // hallway
  { pos: [0, 0.5, 10], color: '#a9855e', intensity: 0.22, distance: 8 },
  // living
  { pos: [-5.75, 0.5, 10.5], color: '#a9855e', intensity: 0.34, distance: 12 },
  { pos: [-5.75, 2.7, 10.5], color: '#8d93a3', intensity: 0.24, distance: 12 },
  // kitchen
  { pos: [5.5, 0.5, 10], color: '#a08e74', intensity: 0.3, distance: 11 },
  { pos: [5.5, 2.5, 10], color: '#93989f', intensity: 0.22, distance: 11 },
  // bedroom
  { pos: [-2.25, 0.5, 18.5], color: '#a9855e', intensity: 0.3, distance: 11 },
  { pos: [-2.25, 2.7, 18.5], color: '#8d93a3', intensity: 0.2, distance: 11 },
  // bathroom
  { pos: [3.5, 0.6, 16.5], color: '#9fa6ab', intensity: 0.26, distance: 8 },
  // north wing: corridor, bedrooms 2-4, family bathroom, laundry
  // the corridor is 16 m long — one bounce left its west end black
  { pos: [-4, 0.5, 23.5], color: '#a9855e', intensity: 0.24, distance: 12 },
  { pos: [4, 0.5, 23.5], color: '#a9855e', intensity: 0.24, distance: 12 },
  { pos: [-9, 0.5, 24.5], color: '#a9855e', intensity: 0.28, distance: 10 },
  { pos: [-9, 2.6, 24.5], color: '#8d93a3', intensity: 0.18, distance: 10 },
  { pos: [-3, 0.5, 28], color: '#a9855e', intensity: 0.28, distance: 10 },
  { pos: [3, 0.5, 28], color: '#a9855e', intensity: 0.28, distance: 10 },
  { pos: [12, 0.6, 23.2], color: '#9fa6ab', intensity: 0.24, distance: 8 },
  { pos: [12, 0.6, 27.2], color: '#a3a69f', intensity: 0.24, distance: 8 },
]

export function HouseLighting({ quality }: { quality: GraphicsQuality }) {
  const tod = useTimeOfDay()
  const p = skyPalette(tod)
  const sun = useRef<THREE.DirectionalLight>(null)
  const fill = useRef<THREE.DirectionalLight>(null)
  const castShadow = isHighTier(quality)
  const mapSize = shadowMapSize(quality)

  // Sun height by time of day: high and bright by day, low at dusk, near the
  // horizon (dim) at night. The apartment centre is roughly [-1, 0, 14].
  const elev = tod === 'day' ? 8.5 : tod === 'sunset' ? 3.6 : 2.2
  const reach = tod === 'day' ? 6 : 10 // lower sun casts from further out
  // Cool exterior fill — subtle by day (windows already bright), a touch more
  // present at night so the room keeps a believable cool spill near windows.
  const fillIntensity = tod === 'day' ? 0.12 : tod === 'sunset' ? 0.16 : 0.24
  // Bounce light is strongest by day (lots of energy entering the windows) and
  // weakest at night, when the lamps do the work.
  const bounceScale = tod === 'day' ? 1 : tod === 'sunset' ? 0.8 : 0.55

  useFrame(() => {
    if (sun.current) {
      sun.current.target.position.set(0, 0.4, 16)
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
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />
      {/* cool window/exterior fill (no shadow) */}
      <directionalLight ref={fill} position={[-9, 3, 10]} color="#8aa2c4" intensity={fillIntensity} />

      {/* --- Lightweight GI approximation ------------------------------------
          Real-time global illumination is far too expensive here, so we fake the
          part that matters most: light that has already hit a surface and
          bounced. Two very dim, wide, shadowless lights per zone — one warm
          pointing UP off the floor, one from the ceiling pointing down — lift
          the dark side of furniture and stop wall/floor corners crushing to
          black, without reading as a visible light source. */}
      {bounces.map((b, i) => (
        <pointLight
          key={i}
          position={b.pos}
          color={b.color}
          intensity={b.intensity * bounceScale}
          distance={b.distance}
          decay={1.1}
        />
      ))}
    </>
  )
}
