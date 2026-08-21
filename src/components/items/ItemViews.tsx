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
 * First person draws no arms, but the thing in your hand still has to be in
 * your hand: this parents the item to the camera at the position the player's
 * own right hand occupies — low, right, and forward of the hip. Look down and
 * you see what you are carrying; look ahead and it is out of the way. It is
 * deliberately NOT centred in front of the lens, which is what makes a held
 * object read as a floating HUD prop instead of something you are holding.
 */
export function LocalHeldItem({ quality }: { quality: GraphicsQuality }) {
  const item = useHeldItem()
  const { camera } = useThree()
  const group = useRef<THREE.Group>(null)
  const bob = useRef(0)
  const seg = itemSeg(quality)

  useFrame((_, delta) => {
    const g = group.current
    if (!g || !item) return
    // Follow the camera, but a beat behind it: a hand does not snap to the head.
    g.position.copy(camera.position)
    g.quaternion.slerp(camera.quaternion, Math.min(1, delta * 14))
    bob.current += delta
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
