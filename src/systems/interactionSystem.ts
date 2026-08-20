import { create } from 'zustand'
import * as THREE from 'three'
import type { InteractableInfo, InteractableKind } from '../types'

// A registered interactable in world space. Detection is proximity + view-angle
// based (no per-frame raycasting) so it stays cheap on mobile.
export interface Interactable {
  info: InteractableInfo
  position: THREE.Vector3
  radius: number // activation distance
}

interface InteractionStore {
  items: Map<string, Interactable>
  focus: InteractableInfo | null
  register: (item: Interactable) => void
  unregister: (id: string) => void
  setFocus: (info: InteractableInfo | null) => void
}

// Non-persisted, canvas-facing store for interactable registration + focus.
export const useInteractionStore = create<InteractionStore>((set) => ({
  items: new Map(),
  focus: null,
  register: (item) =>
    set((s) => {
      const next = new Map(s.items)
      next.set(item.info.id, item)
      return { items: next }
    }),
  unregister: (id) =>
    set((s) => {
      if (!s.items.has(id)) return s
      const next = new Map(s.items)
      next.delete(id)
      return { items: next }
    }),
  setFocus: (info) => set({ focus: info }),
}))

const _dir = new THREE.Vector3()
const _fwd = new THREE.Vector3()

// Returns the best interactable the camera is looking at & near, or null.
export function pickFocus(camera: THREE.Camera): InteractableInfo | null {
  const { items } = useInteractionStore.getState()
  if (items.size === 0) return null

  camera.getWorldDirection(_fwd)
  const camPos = camera.position

  let best: InteractableInfo | null = null
  let bestScore = -Infinity

  for (const item of items.values()) {
    const dist = camPos.distanceTo(item.position)
    if (dist > item.radius) continue

    _dir.copy(item.position).sub(camPos).normalize()
    const facing = _dir.dot(_fwd) // 1 = dead ahead
    if (facing < 0.55) continue // must be roughly in view

    // Closer + more centered scores higher.
    const score = facing * 2 - dist / item.radius
    if (score > bestScore) {
      bestScore = score
      best = item.info
    }
  }
  return best
}

export const InteractableKinds: InteractableKind[] = [
  'pc',
  'taskboard',
  'archive',
  'music',
  'window',
  'bed',
  'secret',
  'achievements',
  'door',
  'chairSit',
]
