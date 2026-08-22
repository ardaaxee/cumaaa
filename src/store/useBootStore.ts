import { create } from 'zustand'

// Tracks real boot milestones so the loading screen reflects genuine progress
// (store hydration → WebGL context → first rendered frame) rather than a fake
// timer.
export interface BootStore {
  hydrated: boolean
  contextReady: boolean
  firstFrame: boolean
  setHydrated: () => void
  setContextReady: () => void
  setFirstFrame: () => void
  progress: () => number
  done: () => boolean
}

export const useBootStore = create<BootStore>((set, get) => ({
  hydrated: false,
  contextReady: false,
  firstFrame: false,
  setHydrated: () => set({ hydrated: true }),
  setContextReady: () => set({ contextReady: true }),
  setFirstFrame: () => set({ firstFrame: true }),
  progress: () => {
    const s = get()
    let p = 10
    if (s.hydrated) p = 45
    if (s.contextReady) p = 75
    if (s.firstFrame) p = 100
    return p
  },
  done: () => get().firstFrame,
}))
