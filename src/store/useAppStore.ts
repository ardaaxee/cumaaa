import { create } from 'zustand'

// Where the player is in the application, as opposed to where they are in the
// house. The 3D world stays mounted across all of these (it is the menu's
// backdrop and must keep producing frames) — only the UI layer swaps.
export type Stage = 'menu' | 'lobby' | 'playing'

export type MenuScreen = 'main' | 'auth' | 'profile' | 'settings' | 'howto' | 'create' | 'join'

export type AuthMode = 'signin' | 'register'

interface AppState {
  stage: Stage
  screen: MenuScreen
  // Which tab the auth screen opens on — decided by the button the player
  // pressed, not inferred from whether they happen to be signed in.
  authMode: AuthMode
  setStage: (stage: Stage) => void
  openMenu: (screen?: MenuScreen) => void
  setScreen: (screen: MenuScreen) => void
  openAuth: (mode: AuthMode) => void
}

export const useAppStore = create<AppState>((set) => ({
  stage: 'menu',
  screen: 'main',
  authMode: 'signin',
  setStage: (stage) => set({ stage }),
  openMenu: (screen = 'main') => set({ stage: 'menu', screen }),
  setScreen: (screen) => set({ screen }),
  openAuth: (authMode) => set({ screen: 'auth', authMode }),
}))
