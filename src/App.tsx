import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from './components/system/ErrorBoundary'
import { Experience } from './components/room/Experience'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { Intro } from './components/ui/Intro'
import { Hud } from './components/ui/Hud'
import { PanelHost } from './components/ui/PanelHost'
import { RoomAudio } from './components/room/RoomAudio'
import { MovieController } from './components/movie/MovieController'
import { useRoomStore } from './store/useRoomStore'
import { usePlayerStore } from './store/usePlayerStore'
import { useBootStore } from './store/useBootStore'
import { useAppStore } from './store/useAppStore'
import { useMultiplayerStore } from './store/useMultiplayerStore'
import { MainMenu } from './components/menu/MainMenu'
import { LobbyScreen } from './components/menu/LobbyScreen'
import { isTouchDevice } from './utils/device'
import { setAudioEnabled, setMasterVolume } from './systems/audioSystem'

export default function App() {
  const introDone = useRoomStore((s) => s.introDone)
  const hydrated = useRoomStore((s) => s.hydrated)
  const bootDone = useBootStore((s) => s.firstFrame)
  const stage = useAppStore((s) => s.stage)
  const inHome = useMultiplayerStore((s) => s.roomId !== null)
  const started = useMultiplayerStore((s) => s.home?.started ?? false)

  // One-time device + audio setup.
  useEffect(() => {
    usePlayerStore.getState().setTouch(isTouchDevice())
  }, [])

  // Mirror room-store hydration into the boot store and apply saved audio prefs.
  useEffect(() => {
    if (!hydrated) return
    useBootStore.getState().setHydrated()
    const { soundEnabled, volume } = useRoomStore.getState().settings
    setAudioEnabled(soundEnabled)
    setMasterVolume(volume)
  }, [hydrated])

  // Safety net: if hydration callback never fires, unblock after a short beat.
  useEffect(() => {
    const id = window.setTimeout(() => useBootStore.getState().setHydrated(), 1500)
    return () => window.clearTimeout(id)
  }, [])

  // Connecting to a home moves the player into the lobby; the host pressing
  // START (which flips `started` for both clients) moves them into the house.
  useEffect(() => {
    const app = useAppStore.getState()
    if (inHome && !started && app.stage !== 'lobby') app.setStage('lobby')
    if (inHome && started && app.stage === 'lobby') app.setStage('playing')
    if (!inHome && app.stage === 'lobby') app.setStage('menu')
  }, [inHome, started])

  // Menus sit over a live world: movement and pointer lock must be off unless
  // the player is actually in the house.
  useEffect(() => {
    const playing = stage === 'playing'
    usePlayerStore.getState().setInputEnabled(playing)
    if (!playing) {
      usePlayerStore.getState().setMove(0, 0)
      if (document.pointerLockElement) document.exitPointerLock()
    }
  }, [stage])

  const showIntro = bootDone && !introDone
  const ready = bootDone && introDone
  const showRoomUi = ready && stage === 'playing'

  return (
    <ErrorBoundary>
      <div className="relative h-full w-full overflow-hidden bg-ink-950">
        {/* The 3D world is always mounted so it can produce the first frame. */}
        <Experience />

        {/* HUD + panels only once the user has entered. */}
        {showRoomUi && (
          <>
            <Hud />
            <PanelHost />
            <RoomAudio />
            <MovieController />
          </>
        )}

        <AnimatePresence>
          {ready && stage === 'menu' && <MainMenu key="menu" />}
          {ready && stage === 'lobby' && <LobbyScreen key="lobby" />}
        </AnimatePresence>

        <AnimatePresence>{showIntro && <Intro key="intro" />}</AnimatePresence>
        <AnimatePresence>{!bootDone && <LoadingScreen key="loading" />}</AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}
