import * as THREE from 'three'

// Axis-aligned bounding boxes the player cannot walk through. Furniture and
// walls register their footprint here; the controller resolves the player's
// movement against them each frame (2D on the XZ plane).

export interface Collider {
  id: string
  min: THREE.Vector2 // (minX, minZ)
  max: THREE.Vector2 // (maxX, maxZ)
}

const colliders = new Map<string, Collider>()

export function registerCollider(
  id: string,
  center: [number, number, number],
  size: [number, number, number],
): void {
  const [cx, , cz] = center
  const [sx, , sz] = size
  colliders.set(id, {
    id,
    min: new THREE.Vector2(cx - sx / 2, cz - sz / 2),
    max: new THREE.Vector2(cx + sx / 2, cz + sz / 2),
  })
}

export function unregisterCollider(id: string): void {
  colliders.delete(id)
}

export function clearColliders(): void {
  colliders.clear()
}

// Resolve a desired position against all colliders, treating the player as a
// circle of `radius`. Returns a corrected XZ position. Simple per-axis push-out
// keeps it stable and cheap.
export function resolveCollision(
  desiredX: number,
  desiredZ: number,
  radius: number,
): [number, number] {
  let x = desiredX
  let z = desiredZ

  for (const c of colliders.values()) {
    // Closest point on the (expanded) box to the player.
    const minX = c.min.x - radius
    const maxX = c.max.x + radius
    const minZ = c.min.y - radius
    const maxZ = c.max.y + radius

    if (x > minX && x < maxX && z > minZ && z < maxZ) {
      // Inside the expanded box — push out along the shallowest axis.
      const dxLeft = x - minX
      const dxRight = maxX - x
      const dzTop = z - minZ
      const dzBottom = maxZ - z
      const minPen = Math.min(dxLeft, dxRight, dzTop, dzBottom)
      if (minPen === dxLeft) x = minX
      else if (minPen === dxRight) x = maxX
      else if (minPen === dzTop) z = minZ
      else z = maxZ
    }
  }
  return [x, z]
}
