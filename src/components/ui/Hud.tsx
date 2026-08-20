import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useRoomStore } from '../../store/useRoomStore'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { CoopPanel } from './CoopPanel'
import { ChatPanel } from './ChatPanel'
import { MovieNightPanel } from '../movie/MovieNightPanel'
import { HudClock } from './HudClock'
import { Crosshair } from './Crosshair'
import { InteractionPrompt } from './InteractionPrompt'
import { Toast } from './Toast'
import { WelcomeBack } from './WelcomeBack'
import { MobileControls } from './MobileControls'
import { OrientationGate } from './OrientationGate'
import { ClickToLook } from './ClickToLook'
import { Sfx } from '../../systems/audioSystem'

// The in-world heads-up display. Only the movement HUD (crosshair, joystick,
// prompt) hides while a panel is open; ambient bits (clock, brand) stay.
export function Hud() {
  const isTouch = usePlayerStore((s) => s.isTouch)
  const activePanel = useRoomStore((s) => s.activePanel)
  const name = useRoomStore((s) => s.profile.name)
  const quality = useRoomStore((s) => s.settings.quality)
  const setActivePanel = useRoomStore((s) => s.setActivePanel)

  const panelOpen = activePanel !== null
  const [coopOpen, setCoopOpen] = useState(false)
  const netPhase = useMultiplayerStore((s) => s.phase)
  const inHome = useMultiplayerStore((s) => s.roomId !== null)
  const netConnected = netPhase === 'open' && inHome
  const moviePanelOpen = useMultiplayerStore((s) => s.moviePanelOpen)
  const chatOpen = useMultiplayerStore((s) => s.chatOpen)
  const unreadChat = useMultiplayerStore((s) => s.unreadChat)
  const setChatOpen = useMultiplayerStore((s) => s.setChatOpen)

  // ENTER opens chat, ESC closes it — the shortcut people already expect. Only
  // while no other panel owns the screen, and never mid-typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
      if (e.code === 'Escape' && useMultiplayerStore.getState().chatOpen) {
        setChatOpen(false)
        return
      }
      if (e.code !== 'Enter' || typing) return
      if (useRoomStore.getState().activePanel !== null) return
      if (useMultiplayerStore.getState().moviePanelOpen) return
      setChatOpen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setChatOpen])

  // Park movement while the chat panel is up, driven by the flag (not by the
  // panel's unmount) so closing always restores control immediately. Input is
  // only handed back if no other panel still owns the screen.
  useEffect(() => {
    if (!chatOpen) return
    usePlayerStore.getState().setInputEnabled(false)
    return () => {
      const busy = useRoomStore.getState().activePanel !== null || useMultiplayerStore.getState().moviePanelOpen
      if (!busy) usePlayerStore.getState().setInputEnabled(true)
    }
  }, [chatOpen])

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-5">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="font-mono text-sm font-bold tracking-[0.3em] text-white">
            ARDA<span className="text-accent"> ROOM</span>
          </div>
          <button
            className="hud-btn hidden !px-2 !py-1 text-[11px] sm:block"
            onClick={() => {
              Sfx.open()
              setActivePanel('pc')
            }}
          >
            ⌂ ARDA OS
          </button>
          <button
            className="hud-btn relative !px-2 !py-1 text-[11px]"
            onClick={() => {
              Sfx.open()
              setChatOpen(true)
            }}
          >
            ✉ CHAT
            {unreadChat > 0 && (
              <span className="absolute -right-1.5 -top-1.5 min-w-[16px] rounded-full bg-accent px-1 text-[9px] font-bold leading-4 text-black">
                {unreadChat > 9 ? '9+' : unreadChat}
              </span>
            )}
          </button>
          <button
            className="hud-btn !px-2 !py-1 text-[11px]"
            onClick={() => {
              Sfx.open()
              setCoopOpen(true)
            }}
          >
            {inHome ? (
              <span className={netConnected ? 'text-green-300' : 'text-amber-300'}>
                {netConnected ? '●' : '○'} CO-OP
              </span>
            ) : (
              '◐ CO-OP'
            )}
          </button>
        </div>
        <HudClock />
      </div>

      <AnimatePresence>{coopOpen && <CoopPanel key="coop" onClose={() => setCoopOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{moviePanelOpen && <MovieNightPanel key="movie" />}</AnimatePresence>
      <AnimatePresence>{chatOpen && <ChatPanel key="chat" onClose={() => { Sfx.close(); setChatOpen(false) }} />}</AnimatePresence>

      {/* Bottom-left profile / controls hint */}
      <div className="absolute bottom-4 left-4 hidden font-mono text-[10px] leading-relaxed text-white/35 sm:block">
        <div className="text-white/60">{name}</div>
        <div>WASD move · MOUSE look</div>
        <div>E / CLICK interact · GFX {quality.toUpperCase()}</div>
      </div>

      {/* Center reticle + prompt (movement HUD) */}
      {!panelOpen && !moviePanelOpen && !chatOpen && (
        <>
          <Crosshair />
          <InteractionPrompt />
          <ClickToLook />
          {isTouch && <MobileControls />}
        </>
      )}

      <WelcomeBack />
      <Toast />
      <OrientationGate />
    </div>
  )
}
