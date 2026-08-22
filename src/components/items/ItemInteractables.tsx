import { useMemo } from 'react'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { InteractableTrigger } from '../interaction/InteractableTrigger'
import { itemDefOr } from '../../config/items'
import { ITEM_SPOTS, itemSpot, slotPosition, type RoomState, type WorldItem } from '../../network/protocol'
import type { InteractableDef } from '../../config/interactables'

// Prompts for the things in the room, generated from the item map rather than
// declared in a list — a tomato you moved from the fridge to the counter is
// reachable at the counter, because the prompt is derived from where the item
// actually is.
//
// Each item is its own interactable, so looking at the tomato says "Take
// Domates" and looking at the milk beside it says "Take Süt". A single
// "open the fridge and something happens" prompt would not be a choice.

const TAKE_PREFIX = 'take:'
const PLACE_PREFIX = 'place:'

export function itemUidFromInteractable(id: string): string | null {
  return id.startsWith(TAKE_PREFIX) ? id.slice(TAKE_PREFIX.length) : null
}

export function spotIdFromInteractable(id: string): string | null {
  return id.startsWith(PLACE_PREFIX) ? id.slice(PLACE_PREFIX.length) : null
}

function takeDefs(world: RoomState): InteractableDef[] {
  const out: InteractableDef[] = []
  for (const it of Object.values(world.items) as WorldItem[]) {
    const def = itemDefOr(it.def)
    if (it.loc.at === 'spot') {
      const spot = itemSpot(it.loc.id)
      if (!spot) continue
      // Shut containers hide what is in them: no prompt through a closed door.
      if (spot.needsOpen && world.openables[spot.needsOpen] !== true) continue
      const p = slotPosition(spot, it.loc.slot)
      out.push({
        info: { id: `${TAKE_PREFIX}${it.uid}`, kind: 'itemTake', label: def.name, prompt: `Al — ${def.name}` },
        position: [p[0], p[1] + 0.07, p[2]],
        radius: 1.5,
      })
    } else if (it.loc.at === 'world') {
      out.push({
        info: { id: `${TAKE_PREFIX}${it.uid}`, kind: 'itemTake', label: def.name, prompt: `Al — ${def.name}` },
        position: [it.loc.x, it.loc.y + 0.12, it.loc.z],
        radius: 1.5,
      })
    }
  }
  return out
}

// Somewhere to put down what you are carrying. Only offered while your hands
// are full and the spot has room, so an empty-handed player is never told they
// can "place" nothing.
function placeDefs(world: RoomState, holding: boolean): InteractableDef[] {
  if (!holding) return []
  const out: InteractableDef[] = []
  for (const spot of ITEM_SPOTS) {
    if (spot.needsOpen && world.openables[spot.needsOpen] !== true) continue
    const used = new Set<number>()
    for (const it of Object.values(world.items)) {
      if (it.loc.at === 'spot' && it.loc.id === spot.id) used.add(it.loc.slot)
    }
    let free = -1
    for (let i = 0; i < spot.slots; i++) {
      if (!used.has(i)) { free = i; break }
    }
    if (free < 0) continue
    const p = slotPosition(spot, free)
    out.push({
      info: { id: `${PLACE_PREFIX}${spot.id}`, kind: 'itemPlace', label: 'Koy', prompt: 'Buraya koy' },
      position: [p[0], p[1] + 0.05, p[2]],
      radius: 1.4,
    })
  }
  return out
}

export function ItemInteractables() {
  const world = useMultiplayerStore((s) => s.world)
  const playerId = useMultiplayerStore((s) => s.playerId)
  const me = playerId ?? 'local'
  const holding = useMemo(
    () => Object.values(world.items).some((i) => i.loc.at === 'hand' && i.loc.by === me),
    [world.items, me],
  )
  const defs = useMemo(() => [...takeDefs(world), ...placeDefs(world, holding)], [world, holding])

  return (
    <>
      {defs.map((d) => (
        <InteractableTrigger key={d.info.id} info={d.info} position={d.position} radius={d.radius} />
      ))}
    </>
  )
}
