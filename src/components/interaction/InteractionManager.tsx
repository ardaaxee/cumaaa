import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { pickFocus, useInteractionStore } from '../../systems/interactionSystem'
import { useRoomStore } from '../../store/useRoomStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { ANCHORS } from '../../config/roomLayout'
import { Sfx } from '../../systems/audioSystem'
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
      if (focusRef.current) usePlayerStore.getState().requestInteract()
    }
    window.addEventListener('click', onClick)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E') {
        if (focusRef.current) usePlayerStore.getState().requestInteract()
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
    const focus = focusRef.current
    if (!focus) return
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
    case 'secret':
      store.unlockSecret()
      Sfx.door()
      store.setActivePanel('secret')
      break
    default:
      store.setActivePanel(kind)
  }
}
