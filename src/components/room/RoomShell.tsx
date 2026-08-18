import { useEffect } from 'react'
import { ROOM, HALF_W, HALF_D } from '../../config/roomLayout'
import { registerCollider, unregisterCollider } from '../../systems/collisionSystem'

// The physical shell of the room: floor, four walls, ceiling. Walls register
// perimeter colliders so the player stays inside.
export function RoomShell() {
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
        <meshStandardMaterial color="#2a2118" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Subtle floor accent rug under the desk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -HALF_D + 2]} receiveShadow>
        <planeGeometry args={[3.4, 2.6]} />
        <meshStandardMaterial color="#16202b" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.height, 0]}>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color="#0c0f15" roughness={1} />
      </mesh>

      {/* Front wall (-Z) */}
      <mesh position={[0, ROOM.height / 2, -HALF_D]} receiveShadow>
        <boxGeometry args={[ROOM.width, ROOM.height, ROOM.wall]} />
        <meshStandardMaterial color="#161b24" roughness={0.85} />
      </mesh>

      {/* Back wall (+Z) */}
      <mesh position={[0, ROOM.height / 2, HALF_D]} rotation={[0, Math.PI, 0]} receiveShadow>
        <boxGeometry args={[ROOM.width, ROOM.height, ROOM.wall]} />
        <meshStandardMaterial color="#12161e" roughness={0.9} />
      </mesh>

      {/* Left wall (-X) */}
      <mesh position={[-HALF_W, ROOM.height / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM.wall, ROOM.height, ROOM.depth]} />
        <meshStandardMaterial color="#141922" roughness={0.88} />
      </mesh>

      {/* Right wall (+X) */}
      <mesh position={[HALF_W, ROOM.height / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM.wall, ROOM.height, ROOM.depth]} />
        <meshStandardMaterial color="#141922" roughness={0.88} />
      </mesh>

      {/* Baseboard accent strip along the front wall */}
      <mesh position={[0, 0.06, -HALF_D + ROOM.wall / 2 + 0.01]}>
        <boxGeometry args={[ROOM.width, 0.12, 0.03]} />
        <meshStandardMaterial
          color="#0b2b33"
          emissive="#39d4e6"
          emissiveIntensity={0.35}
          roughness={0.4}
        />
      </mesh>
    </group>
  )
}
