import { useMemo } from 'react'
import { ANCHORS } from '../../config/roomLayout'
import { useTimeOfDay } from '../../hooks/useClock'
import { skyPalette } from '../../systems/timeSystem'
import { fabric } from '../../utils/textures'

// A real window: painted frame, glass, sill, side curtains and a valance. The
// scene beyond (sky, distant city, stars) follows the user's real local time —
// tuned to read as a believable view, not a fantasy skybox.
export function WindowView() {
  const [x, y, z] = ANCHORS.window.pos
  const tod = useTimeOfDay()
  const palette = skyPalette(tod)
  const day = tod === 'day'

  const stars = useMemo(() => makeStarfield(90), [])
  const cityLights = useMemo(() => makeCity(22), [])
  const curtain = useMemo(() => fabric('#8f8576', 'curtain'), [])

  const FRAME = '#d8d2c6'

  return (
    <group position={[x, y, z]}>
      {/* Sky backdrop, just outside the wall */}
      <mesh position={[0, 0, -0.6]}>
        <planeGeometry args={[4.4, 3.4]} />
        <meshBasicMaterial color={palette.bottom} />
      </mesh>
      <mesh position={[0, 1.0, -0.59]}>
        <planeGeometry args={[4.4, 1.7]} />
        <meshBasicMaterial color={palette.top} />
      </mesh>
      {/* Daytime brightness bloom-through */}
      {day && (
        <mesh position={[0, 0.2, -0.58]}>
          <planeGeometry args={[3.6, 2.6]} />
          <meshBasicMaterial color="#fff6e2" transparent opacity={0.35} />
        </mesh>
      )}

      {/* Stars at night (dim) */}
      {palette.stars && (
        <points position={[0, 0.5, -0.55]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[stars, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.022} color="#c8d0dc" transparent opacity={0.7} sizeAttenuation />
        </points>
      )}

      {/* Distant city: dark building silhouettes with warm lit windows */}
      {palette.cityLights &&
        cityLights.map((c, i) => (
          <group key={i}>
            <mesh position={[c.x, c.y, -0.5]}>
              <boxGeometry args={[c.w, c.h, 0.02]} />
              <meshBasicMaterial color="#0a0d14" />
            </mesh>
            <mesh position={[c.x, c.y + c.h * 0.2, -0.49]}>
              <boxGeometry args={[c.w * 0.5, c.h * 0.5, 0.02]} />
              <meshBasicMaterial color={i % 4 === 0 ? '#ffd38a' : '#e8c079'} transparent opacity={0.75} />
            </mesh>
          </group>
        ))}

      {/* Glass */}
      <mesh>
        <planeGeometry args={[3.6, 2.6]} />
        <meshPhysicalMaterial
          color="#aec4cf"
          transparent
          opacity={0.1}
          roughness={0.02}
          metalness={0}
          transmission={0.6}
          thickness={0.02}
        />
      </mesh>

      {/* Painted frame + mullions */}
      <group>
        {[
          { p: [0, 1.35, 0.02], s: [3.9, 0.12, 0.12] },
          { p: [0, -1.35, 0.02], s: [3.9, 0.12, 0.12] },
          { p: [-1.85, 0, 0.02], s: [0.12, 2.7, 0.12] },
          { p: [1.85, 0, 0.02], s: [0.12, 2.7, 0.12] },
          { p: [0, 0, 0.02], s: [0.07, 2.7, 0.09] },
          { p: [0, 0, 0.02], s: [3.9, 0.07, 0.09] },
        ].map((m, i) => (
          <mesh key={i} position={m.p as [number, number, number]} castShadow>
            <boxGeometry args={m.s as [number, number, number]} />
            <meshStandardMaterial color={FRAME} roughness={0.7} metalness={0} />
          </mesh>
        ))}
        {/* Sill jutting into the room */}
        <mesh position={[0, -1.42, 0.16]} castShadow receiveShadow>
          <boxGeometry args={[4.1, 0.08, 0.28]} />
          <meshStandardMaterial color={FRAME} roughness={0.7} />
        </mesh>
      </group>

      {/* Curtain rod + valance + two side curtain panels */}
      <mesh position={[0, 1.5, 0.28]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 4.3, 10]} />
        <meshStandardMaterial color="#4a3a28" metalness={0.4} roughness={0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 1.72, 0.05, 0.26]}>
          {/* gathered folds via a few thin panels */}
          {[-0.16, -0.05, 0.06, 0.16].map((ox, j) => (
            <mesh key={j} position={[s * ox, 0, Math.sin(j) * 0.03]} rotation={[0, s * 0.05 * j, 0]} castShadow>
              <boxGeometry args={[0.13, 2.9, 0.04]} />
              <meshStandardMaterial color="#8f8576" map={curtain.map} normalMap={curtain.normalMap} roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function makeStarfield(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 4
    arr[i * 3 + 1] = Math.random() * 2.4 - 0.2
    arr[i * 3 + 2] = 0
  }
  return arr
}

function makeCity(count: number): { x: number; y: number; w: number; h: number }[] {
  const out: { x: number; y: number; w: number; h: number }[] = []
  for (let i = 0; i < count; i++) {
    const w = 0.12 + Math.random() * 0.16
    const h = 0.15 + Math.random() * 0.55
    out.push({ x: -1.8 + (i / count) * 3.6, y: -1.15 + h / 2, w, h })
  }
  return out
}
