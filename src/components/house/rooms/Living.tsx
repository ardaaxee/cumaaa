import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCollider } from '../../furniture/useCollider'
import { fabric } from '../../../utils/textures'
import { CeilingLamp, FloorLamp, Rug, Plant, FramedArt } from '../props'
import { WindowDaylight } from '../Window'
import { useWorldFlag, WORLD_FLAGS, useMovie, useMovieMode } from '../../../systems/world'
import { getMovieTexture } from '../../../systems/movieVideo'
import { Snacks } from '../../movie/Snacks'
import { seeded, jitter, shadeVary } from '../../../systems/imperfections'

// Living room — soft seating around a coffee table, a TV on the wall, warm
// ambient light. The main social space: two sofa seats, shared snacks, and a
// TV for co-op Movie Night. Cloth + wood, distinct from the study's wood + metal.
export function LivingRoom() {
  const sofa = useMemo(() => fabric('#6b6f74', 'sofa'), [])
  const chair = useMemo(() => fabric('#7a5f48', 'lchair'), [])
  const lightOn = useWorldFlag(WORLD_FLAGS.livingLight)
  const movie = useMovie()
  const movieMode = useMovieMode()
  // Cinematic mode dims the room; the TV glow takes over.
  const ceilingIntensity = movieMode ? 0.18 : lightOn ? 1.7 : 0
  const cx = -5.75
  const cz = 10

  useCollider('living-sofa', [cx, 0, 13], [2.6, 0.9, 1.0])
  useCollider('living-chair', [cx - 2.6, 0, 10.4], [1.0, 0.9, 1.0])
  useCollider('living-coffee', [cx, 0, 10.6], [1.2, 0.5, 0.7])
  useCollider('living-tvunit', [cx, 0, 6.5], [2.4, 0.6, 0.5])

  return (
    <group>
      <CeilingLamp position={[cx, 2.78, cz]} intensity={ceilingIntensity} />
      <FloorLamp position={[cx + 3.6, 0, 12.6]} on={movieMode ? 0.15 : 0.7} />
      {/* Daylight through the south window (curtained shut during a movie) */}
      {!movieMode && <WindowDaylight position={[-7.5, 1.6, 6.7]} />}
      {movieMode && <MovieCurtain />}
      {/* Shared snacks on the coffee table (disappear when taken) */}
      <Snacks />
      <Rug position={[cx, 0.02, 11]} size={[3.4, 2.6]} color="#5a4f40" />

      {/* 3-seat sofa against the north wall, facing south */}
      <group position={[cx, 0, 13]}>
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.4, 0.95]} />
          <meshStandardMaterial color="#6b6f74" map={sofa.map} normalMap={sofa.normalMap} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.62, -0.4]} castShadow>
          <boxGeometry args={[2.5, 0.6, 0.2]} />
          <meshStandardMaterial color="#63676c" map={sofa.map} normalMap={sofa.normalMap} roughness={0.95} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.2, 0.5, 0]} castShadow>
            <boxGeometry args={[0.18, 0.4, 0.95]} />
            <meshStandardMaterial color="#5c6065" map={sofa.map} normalMap={sofa.normalMap} roughness={0.95} />
          </mesh>
        ))}
        {/* seat cushions (one nudged out of place) */}
        {[-0.75, 0.05, 0.8].map((x, i) => (
          <mesh key={i} position={[x, 0.5, i === 1 ? 0.06 : 0]} rotation={[0, i === 1 ? 0.08 : 0, 0]} castShadow>
            <boxGeometry args={[0.76, 0.14, 0.85]} />
            <meshStandardMaterial color="#72767b" map={sofa.map} normalMap={sofa.normalMap} roughness={0.95} />
          </mesh>
        ))}
        {/* throw pillows */}
        <mesh position={[-0.9, 0.62, 0.2]} rotation={[0, 0.3, 0.1]} castShadow>
          <boxGeometry args={[0.34, 0.34, 0.12]} />
          <meshStandardMaterial color="#8a5a44" map={chair.map} normalMap={chair.normalMap} roughness={0.95} />
        </mesh>
        {/* draped throw blanket */}
        <mesh position={[0.85, 0.5, 0.25]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.7, 0.5, 0.06]} />
          <meshStandardMaterial color="#7a5f48" map={chair.map} normalMap={chair.normalMap} roughness={0.95} />
        </mesh>
      </group>

      {/* armchair */}
      <group position={[cx - 2.6, 0, 10.4]} rotation={[0, 0.7, 0]}>
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.4, 0.9]} />
          <meshStandardMaterial color="#7a5f48" map={chair.map} normalMap={chair.normalMap} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.62, -0.38]} castShadow>
          <boxGeometry args={[0.9, 0.6, 0.16]} />
          <meshStandardMaterial color="#72583f" map={chair.map} normalMap={chair.normalMap} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.5, 0.06]} castShadow>
          <boxGeometry args={[0.78, 0.14, 0.78]} />
          <meshStandardMaterial color="#82684f" map={chair.map} normalMap={chair.normalMap} roughness={0.95} />
        </mesh>
      </group>

      {/* coffee table */}
      <group position={[cx, 0, 10.6]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.06, 0.68]} />
          <meshStandardMaterial color="#4a3826" roughness={0.5} metalness={0.05} />
        </mesh>
        {[[-0.52, -0.28], [0.52, -0.28], [-0.52, 0.28], [0.52, 0.28]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.2, z]}>
            <boxGeometry args={[0.05, 0.4, 0.05]} />
            <meshStandardMaterial color="#2a2d33" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        {/* books + mug on the table */}
        <mesh position={[-0.3, 0.45, 0]} rotation={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.24, 0.04, 0.3]} />
          <meshStandardMaterial color="#3a4a5c" roughness={0.8} />
        </mesh>
        <mesh position={[-0.28, 0.49, 0.02]} rotation={[0, -0.06, 0]} castShadow>
          <boxGeometry args={[0.22, 0.035, 0.28]} />
          <meshStandardMaterial color="#7a5140" roughness={0.85} />
        </mesh>
        <mesh position={[0.32, 0.46, 0.05]}>
          <cylinderGeometry args={[0.04, 0.035, 0.08, 12]} />
          <meshStandardMaterial color="#c9d3dd" roughness={0.3} />
        </mesh>
        {/* a couple of coasters */}
        {[[0.3, -0.18], [0.14, -0.2]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.435, z]} rotation={[0, i * 0.4, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.006, 16]} />
            <meshStandardMaterial color={i ? '#8a7a5c' : '#6a5a44'} roughness={0.7} />
          </mesh>
        ))}
        {/* TV remote resting on the table (movie night!) */}
        <group position={[0.02, 0.44, 0.16]} rotation={[0, -0.35, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.05, 0.02, 0.17]} />
            <meshStandardMaterial color="#1a1a1e" roughness={0.5} />
          </mesh>
          {[-0.05, 0, 0.05].map((z, i) => (
            <mesh key={i} position={[0, 0.012, z]}>
              <boxGeometry args={[0.02, 0.004, 0.02]} />
              <meshStandardMaterial color="#3a4a5c" emissive="#22303c" emissiveIntensity={0.3} roughness={0.4} />
            </mesh>
          ))}
        </group>
      </group>

      {/* TV + unit on the south wall */}
      <group position={[cx, 0, 6.55]}>
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.5, 0.42]} />
          <meshStandardMaterial color="#3a2c1c" roughness={0.55} metalness={0.05} />
        </mesh>
        <Tv position={[0, 1.35, -0.16]} movie={movie} movieMode={movieMode} />
        <Plant position={[1.05, 0.53, 0]} scale={0.5} />
      </group>

      {/* small bookshelf on the west wall */}
      <group position={[-9.7, 0, 10]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 1.8, 0.3]} />
          <meshStandardMaterial color="#4a3826" roughness={0.6} />
        </mesh>
        {[0.4, 0.9, 1.4].map((y, r) =>
          Array.from({ length: 6 }).map((_, i) => {
            // Deterministic lived-in variation: stable per book across reloads.
            const rand = seeded(`livbook-${r}-${i}`)
            const base = ['#6e3a30', '#3a4a5c', '#4a5a3c', '#7a6a46'][(i + r) % 4]
            return (
              <mesh
                key={`${r}-${i}`}
                position={[-0.65 + i * 0.24 + jitter(rand, 0.01), y, 0.08 + jitter(rand, 0.015)]}
                rotation={[0, 0, (i % 3 === 0 ? 0.1 : 0) + jitter(rand, 0.04)]}
              >
                <boxGeometry args={[0.11 + rand() * 0.03, 0.28 + rand() * 0.04, 0.22]} />
                <meshStandardMaterial color={shadeVary(base, rand, 0.1)} roughness={0.78 + rand() * 0.12} />
              </mesh>
            )
          }),
        )}
      </group>

      <FramedArt position={[cx - 1.5, 1.9, 13.88]} rotation={[0, Math.PI, 0]} tone={['#5a6b62', '#2e2a24', '#c9a06a']} />
      <FramedArt position={[cx + 1.2, 1.85, 13.88]} rotation={[0, Math.PI, 0]} w={0.5} h={0.7} tone={['#7a5a4a', '#2e2a24', '#a88a5c']} />
      <Plant position={[-2.2, 0, 13.2]} scale={1.1} />
    </group>
  )
}

function Tv({
  position,
  movie,
  movieMode,
}: {
  position: [number, number, number]
  movie: import('../../../network/protocol').MovieState
  movieMode: boolean
}) {
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const light = useRef<THREE.PointLight>(null)
  const tex = useMemo(() => getMovieTexture(), [])
  const showVideo = !!movie.media
  const active = movieMode || showVideo || movie.playing

  useFrame((s) => {
    const t = s.clock.elapsedTime
    // The screen glows while a movie is on; a gentle flicker reads as playback.
    if (mat.current) mat.current.emissiveIntensity = active ? (movie.playing ? 0.85 + Math.sin(t * 7) * 0.12 : 0.5) : 0
    // Screen light spills onto the sofa/table/wall — cool, subtle, flickering.
    if (light.current) light.current.intensity = active ? (movie.playing ? 0.7 + Math.sin(t * 6.3) * 0.15 : 0.4) : 0
  })

  return (
    <group position={position}>
      {/* Bezel */}
      <mesh castShadow>
        <boxGeometry args={[1.72, 1.0, 0.06]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Screen — shows the shared video when a movie is selected, else a dark
          cinematic panel. */}
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[1.62, 0.9]} />
        <meshStandardMaterial
          ref={mat}
          color={showVideo ? '#ffffff' : active ? '#141821' : '#0c0f12'}
          map={showVideo ? tex : undefined}
          emissive={showVideo ? '#ffffff' : '#33506a'}
          emissiveMap={showVideo ? tex : undefined}
          emissiveIntensity={0}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      {/* Cinematic letterbox bars during movie mode */}
      {active && (
        <>
          <mesh position={[0, 0.4, 0.034]}>
            <planeGeometry args={[1.62, 0.12]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0, -0.4, 0.034]}>
            <planeGeometry args={[1.62, 0.12]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </>
      )}
      <pointLight ref={light} position={[0, 0, 1.2]} color="#aebfd6" intensity={0} distance={7} decay={1.8} />
    </group>
  )
}

// A heavy drape drawn over the living-room window during Movie Night (synced via
// movie mode) so the room goes dark and cinematic.
function MovieCurtain() {
  const cloth = useMemo(() => fabric('#2a2620', 'moviecurtain'), [])
  return (
    <group position={[-7.5, 1.35, 6.28]}>
      {[-1.05, -0.7, -0.35, 0, 0.35, 0.7, 1.05].map((x, i) => (
        <mesh key={i} position={[x, 0, Math.sin(i) * 0.02]} castShadow>
          <boxGeometry args={[0.34, 2.3, 0.05]} />
          <meshStandardMaterial color="#2a2620" map={cloth.map} normalMap={cloth.normalMap} roughness={0.96} />
        </mesh>
      ))}
      {/* rod */}
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 2.6, 8]} />
        <meshStandardMaterial color="#3a2f24" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}
