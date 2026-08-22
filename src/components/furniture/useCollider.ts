import { useEffect } from 'react'
import { registerCollider, unregisterCollider } from '../../systems/collisionSystem'

// Declaratively register an AABB footprint for a piece of furniture.
export function useCollider(
  id: string,
  center: [number, number, number],
  size: [number, number, number],
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return
    registerCollider(id, center, size)
    return () => unregisterCollider(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, enabled, center[0], center[1], center[2], size[0], size[1], size[2]])
}
