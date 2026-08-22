import { useEffect } from 'react'
import { useRoomStore } from '../../store/useRoomStore'
import { registerCollider, unregisterCollider } from '../../systems/collisionSystem'
import { DOOR } from '../../config/labLayout'
import { ROOM } from '../../config/roomLayout'

// Seals the hidden doorway until the secret is discovered: while locked it both
// blocks passage (collider) and fills the opening (so no void shows through).
// Once unlocked, both are removed and the player can walk into ARDA LAB.
export function SecretGate() {
  const secretUnlocked = useRoomStore((s) => s.secretUnlocked)

  useEffect(() => {
    if (secretUnlocked) return
    registerCollider(
      'secret-gate',
      [DOOR.x, 0, DOOR.zCenter],
      [0.5, ROOM.height, DOOR.halfWidth * 2 + 0.2],
    )
    return () => unregisterCollider('secret-gate')
  }, [secretUnlocked])

  if (secretUnlocked) return null

  return (
    <mesh position={[DOOR.x, DOOR.height / 2, DOOR.zCenter]}>
      <boxGeometry args={[ROOM.wall, DOOR.height, DOOR.halfWidth * 2]} />
      <meshStandardMaterial color="#141922" roughness={0.9} metalness={0.04} />
    </mesh>
  )
}
