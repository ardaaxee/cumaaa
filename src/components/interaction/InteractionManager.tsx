import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { pickFocus, useInteractionStore } from '../../systems/interactionSystem'
import { useRoomStore } from '../../store/useRoomStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { ANCHORS } from '../../config/roomLayout'
import { DOOR } from '../../config/labLayout'
import { Sfx } from '../../systems/audioSystem'
import { triggerReach } from '../../systems/playerMotion'
import { toggleWorldFlag, WORLD_FLAGS } from '../../systems/world'
import type { InteractableInfo, InteractableKind } from '../../types'

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
      if (e.key === 'e' || e.key === 'E') {
        const p = usePlayerStore.getState()
        if (focusRef.current || p.seatPose) usePlayerStore.getState().requestInteract()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('click', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const handleInteractRequest = () => {
    const nonce = usePlayerStore.getState().interactNonce
    if (nonce === lastNonce.current) return
    lastNonce.current = nonce
    // Seated: any interact stands the player up (even with nothing in focus).
    if (usePlayerStore.getState().seatPose) {
      usePlayerStore.getState().setSeatPose(null)
      Sfx.close()
      return
    }
    const focus = focusRef.current
    if (!focus) return
    triggerReach() // a short first-person hand reach on every interaction
    activate(focus.kind)
  }

  return null
}

function activate(kind: InteractableKind) {
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
    // Synced world toggles: apply locally + broadcast to a co-op partner.
    case 'doorToggle': {
      Sfx.door()
      toggleWorldFlag(WORLD_FLAGS.mainDoor)
      break
    }
    case 'lightToggle': {
      toggleWorldFlag(WORLD_FLAGS.livingLight)
      break
    }
    case 'tvToggle': {
      toggleWorldFlag(WORLD_FLAGS.livingTv)
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
