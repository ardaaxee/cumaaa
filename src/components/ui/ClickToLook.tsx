import { usePlayerStore } from '../../store/usePlayerStore'
import { useRoomStore } from '../../store/useRoomStore'

// Desktop-only hint shown when the pointer isn't locked (so the user knows to
// click to capture the mouse for looking around).
export function ClickToLook() {
  const isTouch = usePlayerStore((s) => s.isTouch)
  const locked = usePlayerStore((s) => s.pointerLocked)
  const activePanel = useRoomStore((s) => s.activePanel)

  if (isTouch || locked || activePanel) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex justify-center">
      <div className="hud-panel px-4 py-2 font-mono text-xs tracking-[0.2em] text-white/70">
        CLICK TO LOOK AROUND
      </div>
    </div>
  )
}
