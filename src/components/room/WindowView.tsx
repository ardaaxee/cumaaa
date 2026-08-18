import { useMemo } from 'react'
import { ANCHORS } from '../../config/roomLayout'
import { useTimeOfDay } from '../../hooks/useClock'
import { skyPalette } from '../../systems/timeSystem'

// Large window on the far wall. The scene beyond it (sky gradient, city
// lights, stars) follows the user's real local time via useTimeOfDay.
export function WindowView() {
  const [x, y, z] = ANCHORS.window.pos
  const tod = useTimeOfDay()
  const palette = skyPalette(tod)

  const stars = useMemo(() => makeStarfield(140), [])
  const cityLights = useMemo(() => makeCity(26), [])

  return (
    <group position={[x, y, z]}>
      {/* Sky backdrop, just outside the wall */}
      <mesh position={[0, 0, -0.6]}>
        <planeGeometry args={[4.2, 3.2]} />
        <meshBasicMaterial color={palette.bottom} />
      </mesh>
      <mesh position={[0, 0.9, -0.59]}>
        <planeGeometry args={[4.2, 1.6]} />
        <meshBasicMaterial color={palette.top} />
      </mesh>

      {/* Stars at night */}
      {palette.stars && (
        <points position={[0, 0.4, -0.55]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[stars, 3]}
            />
          </bufferGeometry>
          <pointsMaterial size={0.03} color="#dfe8ff" sizeAttenuation />
        </points>
      )}

      {/* City lights on the horizon */}
      {palette.cityLights &&
        cityLights.map((c, i) => (
          <mesh key={i} position={[c.x, c.y, -0.5]}>
            <boxGeometry args={[c.w, c.h, 0.02]} />
            <meshStandardMaterial
              color="#0a1420"
              emissive={i % 3 === 0 ? '#ffce8a' : '#39d4e6'}
              emissiveIntensity={0.7}
            />
          </mesh>
        ))}

      {/* Glass */}
      <mesh>
        <planeGeometry args={[3.6, 2.6]} />
        <meshStandardMaterial
          color="#a9c7d6"
          transparent
          opacity={0.12}
          roughness={0.05}
          metalness={0.2}
        />
      </mesh>

      {/* Frame + mullions */}
      <group>
        <mesh position={[0, 1.35, 0.02]}>
          <boxGeometry args={[3.9, 0.12, 0.1]} />
          <meshStandardMaterial color="#20242c" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, -1.35, 0.02]}>
          <boxGeometry args={[3.9, 0.12, 0.1]} />
          <meshStandardMaterial color="#20242c" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[-1.85, 0, 0.02]}>
          <boxGeometry args={[0.12, 2.7, 0.1]} />
          <meshStandardMaterial color="#20242c" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[1.85, 0, 0.02]}>
          <boxGeometry args={[0.12, 2.7, 0.1]} />
          <meshStandardMaterial color="#20242c" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.08, 2.7, 0.08]} />
          <meshStandardMaterial color="#20242c" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[3.9, 0.08, 0.08]} />
          <meshStandardMaterial color="#20242c" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

function makeStarfield(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 4
    arr[i * 3 + 1] = Math.random() * 2.4 - 0.4
    arr[i * 3 + 2] = 0
  }
  return arr
}

function makeCity(count: number): { x: number; y: number; w: number; h: number }[] {
  const out: { x: number; y: number; w: number; h: number }[] = []
  for (let i = 0; i < count; i++) {
    const w = 0.1 + Math.random() * 0.14
    const h = 0.15 + Math.random() * 0.6
    out.push({ x: -1.8 + (i / count) * 3.6, y: -1.05 + h / 2, w, h })
  }
  return out
}
