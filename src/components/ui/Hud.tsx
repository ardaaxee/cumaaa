import { usePlayerStore } from '../../store/usePlayerStore'
import { useRoomStore } from '../../store/useRoomStore'
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
        </div>
        <HudClock />
      </div>

      {/* Bottom-left profile / controls hint */}
      <div className="absolute bottom-4 left-4 hidden font-mono text-[10px] leading-relaxed text-white/35 sm:block">
        <div className="text-white/60">{name}</div>
        <div>WASD move · MOUSE look</div>
        <div>E / CLICK interact · GFX {quality.toUpperCase()}</div>
      </div>

      {/* Center reticle + prompt (movement HUD) */}
      {!panelOpen && (
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
