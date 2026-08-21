import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ItemModel } from './models'
import { GRIPS, FIRST_PERSON_GRIP } from './grip'
import { itemDefOr } from '../../config/items'
import { useHeldItem, useItemsAt, useLooseItems } from '../../systems/items'
import { itemSpot, slotPosition, type WorldItem } from '../../network/protocol'
import type { GraphicsQuality } from '../../types'
import { isHighTier } from '../../utils/device'

export function itemSeg(quality: GraphicsQuality): number {
  return quality === 'low' ? 8 : quality === 'medium' ? 10 : isHighTier(quality) ? 16 : 12
}

/** An item in someone's hand, drawn inside that hand's wrist group. */
export function HeldInHand({ item, seg }: { item: WorldItem; seg: number }) {
  const grip = GRIPS[itemDefOr(item.def).holdPose]
  return (
    <group position={grip.pos} rotation={grip.rot}>
      <ItemModel item={item} seg={seg} />
    </group>
  )
}

/**
 * What the LOCAL player is carrying.
 *
 * First person draws no arms, but the thing in your hand still has to BE in
 * your hand. The item is anchored to the player's BODY, not to their head:
 * it follows the camera's position and yaw and ignores its pitch, because your
 * hand does not tilt when you glance up. So looking straight ahead leaves it
 * below the view — exactly as it is in life — and looking down brings it into
 * frame at hand height.
 *
 * That is the difference between carrying something and having a prop welded to
 * the lens. It is deliberately never centred in front of the camera.
 */
export function LocalHeldItem({ quality }: { quality: GraphicsQuality }) {
  const item = useHeldItem()
  const { camera } = useThree()
  const group = useRef<THREE.Group>(null)
  const yaw = useRef(0)
  const t = useRef(0)
  const seg = itemSeg(quality)

  useFrame((_, delta) => {
    const g = group.current
    if (!g || !item) return
    t.current += delta
    // Yaw only — the hand turns with the body, not with the head's pitch.
    const e = _tmpEuler.setFromQuaternion(camera.quaternion, 'YXZ')
    yaw.current += shortest(yaw.current, e.y) * Math.min(1, delta * 12)
    g.position.copy(camera.position)
    // A little sway as you walk, so it is carried rather than bolted on.
    g.position.y += Math.sin(t.current * 6) * 0.006
    g.rotation.set(0, yaw.current, 0)
  })

  if (!item) return null
  const grip = FIRST_PERSON_GRIP[itemDefOr(item.def).holdPose]
  return (
    <group ref={group}>
      <group position={grip.pos} rotation={grip.rot}>
        <ItemModel item={item} seg={seg} />
      </group>
    </group>
  )
}

const _tmpEuler = new THREE.Euler(0, 0, 0, 'YXZ')

function shortest(current: number, target: number): number {
  let d = (target - current) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

/**
 * Everything sitting in one container or on one surface.
 *
 * `frame` is for spots that move — the drawer slides, so its contents are
 * mounted inside the sliding group and positioned relative to it, while the
 * protocol's slot coordinates stay fixed (they are only used for range checks).
 */
export function SpotItems({
  spotId,
  seg,
  local,
}: {
  spotId: string
  seg: number
  /** Draw relative to a parent group at the spot's base instead of in world space. */
  local?: [number, number, number]
}) {
  const items = useItemsAt(spotId)
  const spot = itemSpot(spotId)
  if (!spot || items.length === 0) return null
  return (
    <group>
      {items.map((it) => {
        if (it.loc.at !== 'spot') return null
        const p = slotPosition(spot, it.loc.slot)
        const pos: [number, number, number] = local
          ? [p[0] - local[0], p[1] - local[1], p[2] - local[2]]
          : [p[0], p[1], p[2]]
        return (
          <group key={it.uid} position={pos}>
            <ItemModel item={it} seg={seg} />
          </group>
        )
      })}
    </group>
  )
}

/** Items that have been put down on the floor. */
export function LooseItems({ quality }: { quality: GraphicsQuality }) {
  const items = useLooseItems()
  const seg = itemSeg(quality)
  return (
    <group>
      {items.map((it) =>
        it.loc.at === 'world' ? (
          <group key={it.uid} position={[it.loc.x, it.loc.y, it.loc.z]} rotation={[0, it.loc.ry, 0]}>
            <ItemModel item={it} seg={seg} />
          </group>
        ) : null,
      )}
    </group>
  )
}
