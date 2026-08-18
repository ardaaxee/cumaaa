import { useEffect, useMemo } from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import { ROOM, HALF_W, HALF_D } from '../../config/roomLayout'
import { DOOR } from '../../config/labLayout'
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
    // Right wall is split around the hidden doorway (z ∈ [-2.9, -1.1]).
    const frontLen = DOOR.zCenter - DOOR.halfWidth - -HALF_D // -2.9 - (-6) = 3.1
    const backLen = HALF_D - (DOOR.zCenter + DOOR.halfWidth) // 6 - (-1.1) = 7.1
    registerCollider('wall-right-front', [HALF_W, 0, -HALF_D + frontLen / 2], [t, ROOM.height, frontLen])
    registerCollider('wall-right-back', [HALF_W, 0, HALF_D - backLen / 2], [t, ROOM.height, backLen])
    return () => {
      ;['wall-front', 'wall-back', 'wall-left', 'wall-right-front', 'wall-right-back'].forEach(
        unregisterCollider,
      )
    }
  }, [])

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        {reflectiveFloor ? (
          <MeshReflectorMaterial
            mirror={0.12}
            resolution={512}
            mixBlur={2}
            mixStrength={0.5}
            blur={[500, 180]}
            roughness={0.88}
            depthScale={0.4}
            minDepthThreshold={0.5}
            maxDepthThreshold={1.2}
            color="#3a2c1e"
            metalness={0.05}
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
          color="#6b5d4a"
          map={rug.map}
          normalMap={rug.normalMap}
          roughness={0.97}
          metalness={0}
        />
      </mesh>

      {/* Ceiling — warm off-white plaster */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.height, 0]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color="#2b2620" roughness={0.98} />
      </mesh>
      {/* Ceiling cove — a faint warm recessed light, not neon */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.height - 0.02, 0]}>
        <ringGeometry args={[2.5, 2.72, 48]} />
        <meshStandardMaterial color="#241d12" emissive="#ffe2b8" emissiveIntensity={0.12} />
      </mesh>

      {/* Walls */}
      {(
        [
          { key: 'front', pos: [0, ROOM.height / 2, -HALF_D], rot: [0, 0, 0], size: [ROOM.width, ROOM.height, ROOM.wall] },
          { key: 'back', pos: [0, ROOM.height / 2, HALF_D], rot: [0, Math.PI, 0], size: [ROOM.width, ROOM.height, ROOM.wall] },
          { key: 'left', pos: [-HALF_W, ROOM.height / 2, 0], rot: [0, Math.PI / 2, 0], size: [ROOM.depth, ROOM.height, ROOM.wall] },
        ] as const
      ).map((w) => (
        <mesh key={w.key} position={w.pos as [number, number, number]} rotation={w.rot as [number, number, number]} receiveShadow>
          <boxGeometry args={w.size as [number, number, number]} />
          <meshStandardMaterial
            color="#4a443a"
            map={walls.map}
            normalMap={walls.normalMap}
            roughness={0.92}
            metalness={0.04}
            envMapIntensity={0.35}
          />
        </mesh>
      ))}

      {/* Right wall — carved with a hidden doorway (behind the bookcase) */}
      {(
        [
          { z: -HALF_D + (DOOR.zCenter - DOOR.halfWidth - -HALF_D) / 2, len: DOOR.zCenter - DOOR.halfWidth - -HALF_D },
          { z: HALF_D - (HALF_D - (DOOR.zCenter + DOOR.halfWidth)) / 2, len: HALF_D - (DOOR.zCenter + DOOR.halfWidth) },
        ] as const
      ).map((seg, i) => (
        <mesh key={`rw${i}`} position={[HALF_W, ROOM.height / 2, seg.z]} receiveShadow>
          <boxGeometry args={[ROOM.wall, ROOM.height, seg.len]} />
          <meshStandardMaterial
            color="#4a443a"
            map={walls.map}
            normalMap={walls.normalMap}
            roughness={0.92}
            metalness={0.04}
            envMapIntensity={0.35}
          />
        </mesh>
      ))}
      {/* Lintel above the doorway */}
      <mesh
        position={[HALF_W, (DOOR.height + ROOM.height) / 2, DOOR.zCenter]}
        receiveShadow
      >
        <boxGeometry args={[ROOM.wall, ROOM.height - DOOR.height, DOOR.halfWidth * 2]} />
        <meshStandardMaterial color="#4a443a" map={walls.map} normalMap={walls.normalMap} roughness={0.92} />
      </mesh>
      {/* Glowing doorway frame (portal accent) */}
      {(
        [
          { p: [HALF_W, DOOR.height / 2, DOOR.zCenter - DOOR.halfWidth] as const, s: [0.08, DOOR.height, 0.08] as const },
          { p: [HALF_W, DOOR.height / 2, DOOR.zCenter + DOOR.halfWidth] as const, s: [0.08, DOOR.height, 0.08] as const },
          { p: [HALF_W, DOOR.height, DOOR.zCenter] as const, s: [0.08, 0.08, DOOR.halfWidth * 2] as const },
        ] as const
      ).map((f, i) => (
        <mesh key={`df${i}`} position={f.p as [number, number, number]}>
          <boxGeometry args={f.s as [number, number, number]} />
          <meshStandardMaterial color="#2a2018" roughness={0.6} metalness={0.15} />
        </mesh>
      ))}

      {/* Painted wood skirting boards around the whole room (matte, off-white) */}
      {(
        [
          { p: [0, 0.07, -HALF_D + ROOM.wall / 2 + 0.015], s: [ROOM.width, 0.14, 0.03] },
          { p: [0, 0.07, HALF_D - ROOM.wall / 2 - 0.015], s: [ROOM.width, 0.14, 0.03] },
          { p: [-HALF_W + ROOM.wall / 2 + 0.015, 0.07, 0], s: [0.03, 0.14, ROOM.depth] },
          { p: [HALF_W - ROOM.wall / 2 - 0.015, 0.07, 0], s: [0.03, 0.14, ROOM.depth] },
        ] as const
      ).map((b, i) => (
        <mesh key={i} position={b.p as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={b.s as [number, number, number]} />
          <meshStandardMaterial color="#cbc4b6" roughness={0.75} metalness={0} />
        </mesh>
      ))}
    </group>
  )
}
