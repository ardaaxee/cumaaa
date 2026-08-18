import { useRef, useState } from 'react'
import { usePlayerStore } from '../../store/usePlayerStore'
import { Sfx } from '../../systems/audioSystem'

const JOY_RADIUS = 56 // px

// Touch controls: a left virtual joystick for movement, a full-screen drag
// layer for camera look, and a large interact button. Uses pointer events so a
// captured joystick pointer never leaks into the look layer.
export function MobileControls() {
  return (
    <>
      <LookLayer />
      <Joystick />
      <InteractButton />
    </>
  )
}

function LookLayer() {
  const active = useRef<number | null>(null)
  const last = useRef({ x: 0, y: 0 })

  const onDown = (e: React.PointerEvent) => {
    if (active.current !== null) return
    active.current = e.pointerId
    last.current = { x: e.clientX, y: e.clientY }
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (active.current !== e.pointerId) return
    const dx = e.clientX - last.current.x
    const dy = e.clientY - last.current.y
    last.current = { x: e.clientX, y: e.clientY }
    usePlayerStore.getState().addLook(dx, dy)
  }
  const onUp = (e: React.PointerEvent) => {
    if (active.current === e.pointerId) active.current = null
  }

  return (
    <div
      className="absolute inset-0 z-10 touch-none"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    />
  )
}

function Joystick() {
  const base = useRef<HTMLDivElement>(null)
  const pointer = useRef<number | null>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })

  const onDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    pointer.current = e.pointerId
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (pointer.current !== e.pointerId || !base.current) return
    e.stopPropagation()
    const rect = base.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = e.clientX - cx
    let dy = e.clientY - cy
    const dist = Math.hypot(dx, dy)
    if (dist > JOY_RADIUS) {
      dx = (dx / dist) * JOY_RADIUS
      dy = (dy / dist) * JOY_RADIUS
    }
    setKnob({ x: dx, y: dy })
    // y is inverted: pushing up should move forward (+y in store).
    usePlayerStore.getState().setMove(dx / JOY_RADIUS, -dy / JOY_RADIUS)
  }
  const onUp = (e: React.PointerEvent) => {
    if (pointer.current !== e.pointerId) return
    e.stopPropagation()
    pointer.current = null
    setKnob({ x: 0, y: 0 })
    usePlayerStore.getState().setMove(0, 0)
  }

  return (
    <div
      ref={base}
      className="absolute bottom-8 left-6 z-20 flex h-32 w-32 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur-sm"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ touchAction: 'none' }}
    >
      <div
        className="h-14 w-14 rounded-full border border-accent/40 bg-accent/20"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  )
}

function InteractButton() {
  const onTap = (e: React.PointerEvent) => {
    e.stopPropagation()
    Sfx.click()
    usePlayerStore.getState().requestInteract()
  }
  return (
    <button
      className="absolute bottom-12 right-8 z-20 flex h-20 w-20 items-center justify-center rounded-full border border-accent/50 bg-accent/15 text-2xl text-accent-soft active:scale-95"
      onPointerDown={onTap}
      aria-label="Interact"
    >
      ⊙
    </button>
  )
}
