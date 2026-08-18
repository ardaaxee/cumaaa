import { useEffect, useMemo } from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import { ROOM, HALF_W, HALF_D } from '../../config/roomLayout'
import { registerCollider, unregisterCollider } from '../../systems/collisionSystem'
import { woodFloor, wall as wallTex, rug as rugTex } from '../../utils/textures'
import type { GraphicsQuality } from '../../types'

// The physical shell of the room: floor, four walls, ceiling. Walls register
// perimeter colliders so the player stays inside. Materials use procedural PBR
// textures; the floor becomes lightly reflective on the HIGH tier.
export function RoomShell({ quality }: { quality: GraphicsQuality }) {
  const wood = useMemo(() => woodFloor(), [])
  const walls = useMemo(() => wallTex(), [])
  const rug = useMemo(() => rugTex(), [])
  const reflectiveFloor = quality === 'high'

  useEffect(() => {
    const t = ROOM.wall
    registerCollider('wall-front', [0, 0, -HALF_D], [ROOM.width, ROOM.height, t])
    registerCollider('wall-back', [0, 0, HALF_D], [ROOM.width, ROOM.height, t])
    registerCollider('wall-left', [-HALF_W, 0, 0], [t, ROOM.height, ROOM.depth])
    registerCollider('wall-right', [HALF_W, 0, 0], [t, ROOM.height, ROOM.depth])
    return () => {
      ;['wall-front', 'wall-back', 'wall-left', 'wall-right'].forEach(unregisterCollider)
    }
  }, [])

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        {reflectiveFloor ? (
          <MeshReflectorMaterial
            mirror={0.35}
            resolution={512}
            mixBlur={1}
            mixStrength={2.2}
            blur={[400, 100]}
            roughness={0.85}
            depthScale={0.6}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
            color="#2a2118"
            metalness={0.3}
            map={wood.map}
            normalMap={wood.normalMap}
          />
        ) : (
          <meshStandardMaterial
            color="#2a2118"
            map={wood.map}
            normalMap={wood.normalMap}
            roughness={0.72}
            metalness={0.08}
            envMapIntensity={0.5}
          />
        )}
      </mesh>

      {/* Rug under the desk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -HALF_D + 2]} receiveShadow>
        <planeGeometry args={[3.6, 2.8]} />
        <meshStandardMaterial
          color="#16202b"
          map={rug.map}
          normalMap={rug.normalMap}
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.height, 0]}>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color="#0c0f15" roughness={1} />
      </mesh>
      {/* Ceiling recess accent */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.height - 0.02, 0]}>
        <ringGeometry args={[2.6, 2.75, 4]} />
        <meshStandardMaterial color="#0a2230" emissive="#39d4e6" emissiveIntensity={0.5} />
      </mesh>

      {/* Walls */}
      {(
        [
          { key: 'front', pos: [0, ROOM.height / 2, -HALF_D], rot: [0, 0, 0], size: [ROOM.width, ROOM.height, ROOM.wall] },
          { key: 'back', pos: [0, ROOM.height / 2, HALF_D], rot: [0, Math.PI, 0], size: [ROOM.width, ROOM.height, ROOM.wall] },
          { key: 'left', pos: [-HALF_W, ROOM.height / 2, 0], rot: [0, Math.PI / 2, 0], size: [ROOM.depth, ROOM.height, ROOM.wall] },
          { key: 'right', pos: [HALF_W, ROOM.height / 2, 0], rot: [0, -Math.PI / 2, 0], size: [ROOM.depth, ROOM.height, ROOM.wall] },
        ] as const
      ).map((w) => (
        <mesh key={w.key} position={w.pos as [number, number, number]} rotation={w.rot as [number, number, number]} receiveShadow>
          <boxGeometry args={w.size as [number, number, number]} />
          <meshStandardMaterial
            color="#151a23"
            map={walls.map}
            normalMap={walls.normalMap}
            roughness={0.92}
            metalness={0.04}
            envMapIntensity={0.35}
          />
        </mesh>
      ))}

      {/* Baseboards around the whole room */}
      {(
        [
          { p: [0, 0.06, -HALF_D + ROOM.wall / 2 + 0.01], s: [ROOM.width, 0.12, 0.03], glow: true },
          { p: [0, 0.06, HALF_D - ROOM.wall / 2 - 0.01], s: [ROOM.width, 0.12, 0.03], glow: false },
          { p: [-HALF_W + ROOM.wall / 2 + 0.01, 0.06, 0], s: [0.03, 0.12, ROOM.depth], glow: false },
          { p: [HALF_W - ROOM.wall / 2 - 0.01, 0.06, 0], s: [0.03, 0.12, ROOM.depth], glow: false },
        ] as const
      ).map((b, i) => (
        <mesh key={i} position={b.p as [number, number, number]}>
          <boxGeometry args={b.s as [number, number, number]} />
          <meshStandardMaterial
            color={b.glow ? '#0b2b33' : '#0e1219'}
            emissive={b.glow ? '#39d4e6' : '#39d4e6'}
            emissiveIntensity={b.glow ? 0.35 : 0.12}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}
