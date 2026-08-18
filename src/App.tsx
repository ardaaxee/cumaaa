import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from './components/system/ErrorBoundary'
import { Experience } from './components/room/Experience'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { Intro } from './components/ui/Intro'
import { Hud } from './components/ui/Hud'
import { PanelHost } from './components/ui/PanelHost'
import { useRoomStore } from './store/useRoomStore'
import { usePlayerStore } from './store/usePlayerStore'
import { useBootStore } from './store/useBootStore'
import { isTouchDevice } from './utils/device'
import { setAudioEnabled, setMasterVolume } from './systems/audioSystem'

export default function App() {
  const introDone = useRoomStore((s) => s.introDone)
  const hydrated = useRoomStore((s) => s.hydrated)
  const bootDone = useBootStore((s) => s.firstFrame)

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

  const showIntro = bootDone && !introDone
  const showRoomUi = bootDone && introDone

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
          </>
        )}

        <AnimatePresence>{showIntro && <Intro key="intro" />}</AnimatePresence>
        <AnimatePresence>{!bootDone && <LoadingScreen key="loading" />}</AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}
