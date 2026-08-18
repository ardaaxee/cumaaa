import { ROOM } from '../../config/roomLayout'
import { useTimeOfDay } from '../../hooks/useClock'
import { skyPalette } from '../../systems/timeSystem'
import { shadowsEnabled, shadowMapSize } from '../../utils/device'
import type { GraphicsQuality } from '../../types'

// Atmospheric lighting that shifts with the real time-of-day. Shadow cost
// scales with the graphics quality tier.
export function Lighting({ quality }: { quality: GraphicsQuality }) {
  const tod = useTimeOfDay()
  const palette = skyPalette(tod)
  const castShadows = shadowsEnabled(quality)
  const mapSize = shadowMapSize(quality)

  return (
    <>
      <ambientLight color={palette.ambient} intensity={palette.ambientIntensity} />
      <hemisphereLight color={palette.top} groundColor="#0a0c10" intensity={0.5} />

      {/* Soft overhead ceiling fill so upper walls aren't pitch black */}
      <pointLight position={[0, ROOM.height - 0.3, 0]} intensity={0.4} color="#c3d2e6" distance={12} />


      {/* Key light over the desk */}
      <spotLight
        position={[0, ROOM.height - 0.2, -2]}
        angle={0.8}
        penumbra={0.6}
        intensity={1.1}
        color="#dfe8ff"
        distance={12}
        castShadow={castShadows}
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
        shadow-bias={-0.0005}
      />

      {/* Fill light near the ceiling centre */}
      <pointLight position={[0, ROOM.height - 0.4, 2]} intensity={0.35} color="#9bb6cf" distance={10} />

      {/* Cool accent from the window side */}
      <pointLight
        position={[3, 1.6, -4]}
        intensity={0.4 * palette.sunIntensity + 0.15}
        color={palette.sun}
        distance={7}
      />

      {/* Warm accent from the bed corner */}
      <pointLight position={[3, 1.4, 4]} intensity={0.25} color="#ffb877" distance={6} />
    </>
  )
}
