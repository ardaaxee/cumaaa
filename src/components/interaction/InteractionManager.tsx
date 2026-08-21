import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { pickFocus, useInteractionStore } from '../../systems/interactionSystem'
import { useRoomStore } from '../../store/useRoomStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { ANCHORS } from '../../config/roomLayout'
import { DOOR } from '../../config/labLayout'
import { Sfx } from '../../systems/audioSystem'
import { triggerReach } from '../../systems/playerMotion'
import { playAction, holdAction } from '../characters/actions'
import { worldValue, toggleWorldFlag, toggleOpenable, toggleAppliance, WORLD_FLAGS, takeSnack } from '../../systems/world'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { SOFA_SEATS } from '../../config/interactables'
import { itemUidFromInteractable, spotIdFromInteractable } from '../items/ItemInteractables'
import { takeItem, placeItem, dropItem, consumeItem, currentHeld } from '../../systems/items'
import { itemDefOr } from '../../config/items'
import type { InteractableInfo } from '../../types'

// Central hub: each frame it figures out what the player is looking at, mirrors
// that focus into the HUD store, and turns an interact request (click / tap /
// E key) into the right action.
export function InteractionManager() {
  const { camera } = useThree()
  const setInteractionFocus = useInteractionStore((s) => s.setFocus)
  const lastNonce = useRef(0)
  const focusRef = useRef<InteractableInfo | null>(null)
  const frame = useRef(0)

  useFrame(() => {
    // Throttle picking to ~20fps; interaction focus doesn't need every frame.
    frame.current += 1
    if (frame.current % 3 !== 0) {
      handleInteractRequest()
      return
    }
    const focus = pickFocus(camera)
    if (focus?.id !== focusRef.current?.id) {
      focusRef.current = focus
      setInteractionFocus(focus)
      useRoomStore.getState().setFocus(focus)
      if (focus) Sfx.hover()
    }
    handleInteractRequest()
  })

  // Desktop: click (while pointer-locked) triggers interact.
  useEffect(() => {
    const onClick = () => {
      const p = usePlayerStore.getState()
      if (!p.inputEnabled) return
      if (p.isTouch) return
      // Desktop: only interact while pointer-locked (the first click just locks).
      if (!document.pointerLockElement) return
      if (focusRef.current || p.seatPose) usePlayerStore.getState().requestInteract()
    }
    window.addEventListener('click', onClick)
    const onKey = (e: KeyboardEvent) => {
      const p = usePlayerStore.getState()
      if (!p.inputEnabled) return
      if (e.key === 'e' || e.key === 'E') {
        if (focusRef.current || p.seatPose) usePlayerStore.getState().requestInteract()
        return
      }
      // F uses whatever is in your hand — drink from the glass, bite the apple,
      // open the book. Separate from E so a full hand does not steal the
      // prompt for the cupboard you are standing in front of.
      if (e.key === 'f' || e.key === 'F') {
        useHeldItem()
        return
      }
      // G puts it down where you stand.
      if (e.key === 'g' || e.key === 'G') {
        dropHeld(camera)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('click', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [camera])

  const handleInteractRequest = () => {
    const nonce = usePlayerStore.getState().interactNonce
    if (nonce === lastNonce.current) return
    lastNonce.current = nonce
    // Seated: any interact stands the player up (even with nothing in focus).
    if (usePlayerStore.getState().seatPose) {
      usePlayerStore.getState().setSeatPose(null)
      holdAction(null) // standing up releases whatever pose the seat implied
      Sfx.close()
      return
    }
    const focus = focusRef.current
    if (!focus) return
    triggerReach() // a short first-person hand reach on every interaction
    activate(focus)
  }

  return null
}

// Use what is in your hand. What that means comes from the item definition:
// a glass with water in it is drunk from, an apple is eaten, a book is read.
function useHeldItem(): void {
  const held = currentHeld()
  if (!held) return
  const def = itemDefOr(held.def)
  switch (def.interaction) {
    case 'drink': {
      if (!held.fill) {
        useRoomStore.getState().pushToast(`${def.name} boş`)
        return
      }
      if (!consumeItem(held.uid)) return
      playAction('drink')
      Sfx.click()
      break
    }
    case 'eat': {
      if (!consumeItem(held.uid)) return
      playAction('eat')
      Sfx.click()
      break
    }
    case 'read':
      playAction('read')
      break
    case 'phone':
      playAction('phone')
      break
    case 'use':
      playAction('use')
      Sfx.click()
      break
    default:
      break
  }
}

// Put down what you are carrying, at your feet, facing the way you are.
function dropHeld(camera: THREE.Camera): void {
  const held = currentHeld()
  if (!held) return
  const dir = new THREE.Vector3()
  camera.getWorldDirection(dir)
  const x = camera.position.x + dir.x * 0.55
  const z = camera.position.z + dir.z * 0.55
  if (!dropItem(held.uid, x, z, Math.atan2(-dir.x, -dir.z))) return
  playAction('drop')
  Sfx.close()
}

function activate(info: InteractableInfo) {
  const kind = info.kind
  const store = useRoomStore.getState()
  const player = usePlayerStore.getState()
  Sfx.open()
  store.markVisited(kind)

  switch (kind) {
    case 'pc': {
      // Cinematic focus toward the monitor, then open ARDA OS.
      const [mx, my, mz] = ANCHORS.monitor.pos
      player.setInputEnabled(false)
      player.setFocusTarget({
        position: [mx, my + 0.05, mz + 1.15],
        lookAt: [mx, my, mz],
      })
      window.setTimeout(() => {
        store.setActivePanel('pc')
      }, 620)
      break
    }
    case 'secret': {
      // Physical reveal: unlock, play the door mechanism, and cinematically turn
      // the player to face the opening passage — then hand control back so they
      // can walk into ARDA LAB themselves (no teleport, no modal).
      const wasLocked = !store.secretUnlocked
      store.unlockSecret()
      Sfx.door()
      if (wasLocked) store.pushToast('The bookcase slides open — a passage appears.', 'success')
      runCinematic([DOOR.x, 1.5, DOOR.zCenter], 1700)
      break
    }
    case 'labExit': {
      // Turn to face the corridor back to the room, then release control.
      store.pushToast('Returning to ARDA ROOM…')
      runCinematic([DOOR.x, 1.5, DOOR.zCenter], 1400)
      break
    }
    case 'chairSit': {
      // Sit in the desk chair: the controller settles the player onto the seat
      // and locks movement; look stays free. Press E again to stand.
      const [cx, , cz] = ANCHORS.chair.pos
      player.setSeatPose({ x: cx, z: cz + 0.05, yaw: 0 })
      break
    }
    case 'sofaSit': {
      // Sit on a specific sofa seat (this is per-player LOCAL state — CUMA and
      // ZEYNEP each sit on their own seat; the partner sees it via the avatar).
      const seat = SOFA_SEATS[info.id]
      if (seat) player.setSeatPose(seat)
      // Sitting down in front of a running TV is watching TV, and the partner
      // should see that rather than a generic sit.
      holdAction(worldValue(useMultiplayerStore.getState().world, WORLD_FLAGS.livingTv) ? 'watchTv' : null)
      break
    }
    case 'snackTake': {
      // Take a shared snack — synced so it disappears for both players.
      takeSnack(info.id)
      break
    }
    case 'movieNight': {
      // Open the (local-UI) Movie Night panel; playback state is shared.
      useMultiplayerStore.getState().setMoviePanel(true)
      break
    }
    // Synced world toggles: apply locally + broadcast to a co-op partner.
    case 'doorToggle': {
      Sfx.door()
      playAction('open')
      toggleWorldFlag(WORLD_FLAGS.mainDoor)
      break
    }
    case 'lightToggle': {
      playAction('use')
      toggleWorldFlag(WORLD_FLAGS.livingLight)
      break
    }
    case 'tvToggle': {
      playAction('use')
      toggleWorldFlag(WORLD_FLAGS.livingTv)
      break
    }
    case 'curtainToggle': {
      playAction('use')
      toggleWorldFlag(WORLD_FLAGS.livingCurtain)
      break
    }
    // Daily life: doors on furniture, and appliances that are simply on or off.
    // Both ride the shared world channel, so the partner sees them move.
    case 'openable': {
      Sfx.door()
      playAction('open')
      toggleOpenable(info.id)
      break
    }
    case 'appliance': {
      Sfx.click()
      playAction('use')
      toggleAppliance(info.id)
      break
    }
    // Items. The prompt carries the uid (or the spot id) it refers to, so
    // taking the tomato takes THAT tomato and not "an item from the fridge".
    case 'itemTake': {
      const uid = itemUidFromInteractable(info.id)
      if (!uid) break
      if (!takeItem(uid)) break // hands full, or someone else got there first
      playAction('pickUp')
      Sfx.click()
      break
    }
    case 'itemPlace': {
      const spot = spotIdFromInteractable(info.id)
      const held = currentHeld()
      if (!spot || !held) break
      if (!placeItem(held.uid, spot)) break
      playAction('drop')
      Sfx.click()
      break
    }
    default:
      // All other stations (room + lab) open their panel.
      store.setActivePanel(kind)
  }
}

// Briefly disable input and rotate the view toward a world point, then restore.
function runCinematic(lookAt: [number, number, number], ms: number) {
  const player = usePlayerStore.getState()
  player.setInputEnabled(false)
  player.setMove(0, 0)
  player.setLookTarget(lookAt)
  window.setTimeout(() => {
    const p = usePlayerStore.getState()
    p.setLookTarget(null)
    p.setInputEnabled(true)
  }, ms)
}
