import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { ensureItemsSeeded, tickCookingOffline } from '../../systems/items'
import { SpotItems, LooseItems, itemSeg } from './ItemViews'
import { ItemInteractables } from './ItemInteractables'
import { ITEM_SPOTS } from '../../network/protocol'
import type { GraphicsQuality } from '../../types'

// Spots whose contents are drawn by the furniture itself because the furniture
// MOVES: a drawer's cutlery has to slide out with the drawer, so it is mounted
// inside the sliding group rather than at fixed world coordinates.
const SELF_DRAWN = new Set(['kitchen-drawer'])

/**
 * Everything in the home that is an item: what is sitting in the cupboards and
 * on the counters, and whatever has been put down on the floor.
 *
 * A shut container draws nothing — there is no point paying for a fridge full
 * of geometry nobody can see, and it means opening the door is what reveals the
 * food rather than the food being visible through it.
 */
export function WorldItems({ quality }: { quality: GraphicsQuality }) {
  const openables = useMultiplayerStore((s) => s.world.openables)
  const seg = itemSeg(quality)

  // Single player has no server to stock the kitchen; in a home the server's
  // seed has already arrived and this does nothing.
  useEffect(() => { ensureItemsSeeded() }, [])

  // Offline cooking clock, at the same 2 s cadence the server uses.
  const acc = useRef(0)
  useFrame((_, delta) => {
    acc.current += delta
    if (acc.current < 2) return
    tickCookingOffline(acc.current)
    acc.current = 0
  })

  return (
    <group>
      {ITEM_SPOTS.map((spot) => {
        if (SELF_DRAWN.has(spot.id)) return null
        if (spot.needsOpen && openables[spot.needsOpen] !== true) return null
        return <SpotItems key={spot.id} spotId={spot.id} seg={seg} />
      })}
      <LooseItems quality={quality} />
      <ItemInteractables />
    </group>
  )
}
