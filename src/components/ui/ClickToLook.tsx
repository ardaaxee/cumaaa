import { useEffect, useState } from 'react'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useRoomStore } from '../../store/useRoomStore'

// Desktop pointer-lock affordance. Deliberately small and quiet — a production
// hint, not a debug banner — and it retires itself once the player has locked
// the pointer at least once, so it never nags a returning user.
export function ClickToLook() {
  const isTouch = usePlayerStore((s) => s.isTouch)
  const locked = usePlayerStore((s) => s.pointerLocked)
  const activePanel = useRoomStore((s) => s.activePanel)
  const [everLocked, setEverLocked] = useState(false)

  useEffect(() => {
    if (locked) setEverLocked(true)
  }, [locked])

  if (isTouch || locked || activePanel || everLocked) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex justify-center">
      <div className="rounded-full bg-black/25 px-3 py-1 text-[11px] text-white/45 backdrop-blur-sm">
        Click to look around
      </div>
    </div>
  )
}
