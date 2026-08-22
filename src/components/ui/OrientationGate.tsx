import { useEffect, useState } from 'react'
import { usePlayerStore } from '../../store/usePlayerStore'

// On touch devices held in portrait, gently ask the user to rotate to landscape
// (the game is designed for a wide first-person view). No forced orientation
// lock — that isn't reliable across mobile browsers; this is a soft overlay.
export function OrientationGate() {
  const isTouch = usePlayerStore((s) => s.isTouch)
  const [portrait, setPortrait] = useState(false)

  useEffect(() => {
    if (!isTouch) return
    const mq = window.matchMedia('(orientation: portrait)')
    const update = () => setPortrait(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [isTouch])

  if (!isTouch || !portrait) return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 px-8 text-center backdrop-blur-md">
      <div className="text-4xl" style={{ animation: 'rotateHint 2.4s ease-in-out infinite' }}>
        ⟳
      </div>
      <div className="font-mono text-sm font-semibold tracking-[0.25em] text-white/90">
        ROTATE YOUR DEVICE
      </div>
      <div className="max-w-xs font-mono text-[11px] leading-relaxed text-white/50">
        ARDA ROOM is best explored in landscape. Turn your phone sideways to walk
        around.
      </div>
      <style>{`@keyframes rotateHint{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(78deg)}}`}</style>
    </div>
  )
}
