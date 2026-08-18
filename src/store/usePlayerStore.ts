import { create } from 'zustand'

// Ephemeral input + control state (never persisted). Feeds the first-person
// controller from either desktop (keyboard/mouse) or mobile (joystick/touch).

interface PlayerState {
  isTouch: boolean
  pointerLocked: boolean

  // Movement intent from a virtual joystick, range [-1, 1].
  moveX: number
  moveY: number

  // Accumulated look delta (radians) to be consumed by the controller.
  lookYaw: number
  lookPitch: number

  // Camera should ignore input while a panel/cinematic owns the screen.
  inputEnabled: boolean

  // Bumped to request an interaction (mobile button / E key).
  interactNonce: number

  // Camera focus animation target (used when entering the PC), or null.
  focusTarget: null | {
    position: [number, number, number]
    lookAt: [number, number, number]
  }

  // Cinematic look-at target: rotates the view toward a world point WITHOUT
  // moving the player (used for the secret reveal and lab exit). Because it
  // updates the controller's own yaw/pitch, control resumes seamlessly.
  lookTarget: [number, number, number] | null

  setTouch: (v: boolean) => void
  setPointerLocked: (v: boolean) => void
  setMove: (x: number, y: number) => void
  addLook: (yaw: number, pitch: number) => void
  consumeLook: () => { yaw: number; pitch: number }
  setInputEnabled: (v: boolean) => void
  requestInteract: () => void
  setFocusTarget: (t: PlayerState['focusTarget']) => void
  setLookTarget: (t: [number, number, number] | null) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isTouch: false,
  pointerLocked: false,
  moveX: 0,
  moveY: 0,
  lookYaw: 0,
  lookPitch: 0,
  inputEnabled: true,
  interactNonce: 0,
  focusTarget: null,
  lookTarget: null,

  setTouch: (v) => set({ isTouch: v }),
  setPointerLocked: (v) => set({ pointerLocked: v }),
  setMove: (x, y) => set({ moveX: x, moveY: y }),
  addLook: (yaw, pitch) =>
    set((s) => ({ lookYaw: s.lookYaw + yaw, lookPitch: s.lookPitch + pitch })),
  consumeLook: () => {
    const { lookYaw, lookPitch } = get()
    set({ lookYaw: 0, lookPitch: 0 })
    return { yaw: lookYaw, pitch: lookPitch }
  },
  setInputEnabled: (v) => set({ inputEnabled: v }),
  requestInteract: () => set((s) => ({ interactNonce: s.interactNonce + 1 })),
  setFocusTarget: (t) => set({ focusTarget: t }),
  setLookTarget: (t) => set({ lookTarget: t }),
}))
