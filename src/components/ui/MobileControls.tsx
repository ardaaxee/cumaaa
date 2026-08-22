import { useEffect, useRef, useState } from 'react'
import { useMultiplayerStore } from '../../store/useMultiplayerStore'
import { playAction } from '../characters/actions'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useInteractionStore } from '../../systems/interactionSystem'
import { Sfx } from '../../systems/audioSystem'
import { haptic } from '../../utils/haptics'

// Mobile first-person controls, landscape-oriented:
//   • left  — analog movement joystick (bottom-left)
//   • right — a wide look area (drag to turn the camera)
//   • right-bottom — RUN (hold to sprint), JUMP, and a contextual INTERACT
// Every finger is tracked by pointerId so move + look + a button all work at
// once. Movement/look write through refs (no per-frame React state) so touch
// input never thrashes the render tree.
export function MobileControls() {
  return (
    <>
      <LookArea />
      <Joystick />
      <ActionButtons />
    </>
  )
}

const DEAD_ZONE = 0.14 // ignore tiny wobble near center
const SPRINT_AT = 0.92 // push the stick to the rim to break into a run

// Throw distance, and every control's size, scale with the SHORT axis. A
// landscape phone is only ~400px tall, and fixed 64px pucks ate a third of it.
function joyRadius(): number {
  const h = typeof window === 'undefined' ? 640 : window.innerHeight
  return Math.max(42, Math.min(64, h * 0.15))
}

// A floating stick: it appears under the thumb wherever the left half is
// touched, rather than making the player find a fixed puck by feel while
// looking at the room. Resting, it sits low-left at half opacity as a hint.
function Joystick() {
  const zone = useRef<HTMLDivElement>(null)
  const stick = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const pointer = useRef<number | null>(null)
  const origin = useRef({ x: 0, y: 0 })
  const radius = useRef(joyRadius())

  useEffect(() => {
    const onResize = () => { radius.current = joyRadius() }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      usePlayerStore.getState().setMove(0, 0)
      usePlayerStore.getState().setSprintHeld(false)
    }
  }, [])

  const placeStick = (x: number, y: number, active: boolean) => {
    const el = stick.current
    if (!el || !zone.current) return
    const box = zone.current.getBoundingClientRect()
    el.style.left = `${x - box.left}px`
    el.style.top = `${y - box.top}px`
    el.style.opacity = active ? '1' : '0.45'
  }
  const setKnob = (x: number, y: number) => {
    if (knob.current) knob.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
  }

  const onDown = (e: React.PointerEvent) => {
    if (pointer.current !== null) return
    pointer.current = e.pointerId
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    origin.current = { x: e.clientX, y: e.clientY }
    placeStick(e.clientX, e.clientY, true)
    setKnob(0, 0)
    haptic(6)
  }

  const onMove = (e: React.PointerEvent) => {
    if (pointer.current !== e.pointerId) return
    const R = radius.current
    let dx = e.clientX - origin.current.x
    let dy = e.clientY - origin.current.y
    const dist = Math.hypot(dx, dy)
    if (dist > R) {
      dx = (dx / dist) * R
      dy = (dy / dist) * R
    }
    setKnob(dx, dy)
    // Normalize to [-1,1], apply a dead zone, and rescale so motion past the
    // dead zone still reaches full analog speed. y inverts (push up = forward).
    let nx = dx / R
    let ny = -dy / R
    const mag = Math.hypot(nx, ny)
    if (mag < DEAD_ZONE) {
      nx = 0
      ny = 0
    } else {
      const scaled = (mag - DEAD_ZONE) / (1 - DEAD_ZONE) / mag
      nx *= scaled
      ny *= scaled
    }
    usePlayerStore.getState().setMove(nx, ny)
    // Pushing the stick all the way out runs, so a sprint costs no second
    // thumb — the RUN button stays for people who prefer to hold it.
    usePlayerStore.getState().setSprintHeld(mag >= SPRINT_AT)
  }

  const onUp = (e: React.PointerEvent) => {
    if (pointer.current !== e.pointerId) return
    pointer.current = null
    setKnob(0, 0)
    if (zone.current && stick.current) {
      const box = zone.current.getBoundingClientRect()
      placeStick(box.left + box.width * 0.42, box.top + box.height * 0.72, false)
    }
    usePlayerStore.getState().setMove(0, 0)
    usePlayerStore.getState().setSprintHeld(false)
  }

  const R = radius.current
  return (
    <div
      ref={zone}
      className="pointer-events-auto absolute inset-y-0 left-0 z-20"
      style={{ width: '42%', touchAction: 'none' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div
        ref={stick}
        className="absolute rounded-full border border-white/15 bg-black/20 backdrop-blur-sm transition-opacity duration-200"
        style={{
          left: '42%',
          top: '72%',
          width: R * 2,
          height: R * 2,
          transform: 'translate(-50%, -50%)',
          opacity: 0.45,
        }}
      >
        <div className="absolute inset-[12%] rounded-full border border-white/10" />
        <div
          ref={knob}
          className="absolute left-1/2 top-1/2 rounded-full border border-accent/40 bg-accent/25 shadow-lg"
          style={{ width: R, height: R, transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  )
}

// A wide right-hand drag area for camera look. Only claims the right ~58% of the
// screen so the left stays free for the joystick and never fights it.
function LookArea() {
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
      className="pointer-events-auto absolute inset-y-0 right-0 z-10"
      style={{ width: '58%', touchAction: 'none' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    />
  )
}

// Every pad scales off the short axis, so the cluster keeps the same share of
// the screen on a small handset as on a tablet instead of swallowing it.
function useControlScale(): number {
  const [px, setPx] = useState(() => padSize())
  useEffect(() => {
    const onResize = () => setPx(padSize())
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])
  return px
}

function padSize(): number {
  const h = typeof window === 'undefined' ? 640 : window.innerHeight
  return Math.max(44, Math.min(64, h * 0.14))
}

function ActionButtons() {
  const focus = useInteractionStore((s) => s.focus)
  const seated = usePlayerStore((s) => s.seatPose !== null)
  const prompt = seated ? 'Stand up' : focus?.prompt
  const showInteract = seated || !!focus
  const pad = useControlScale()

  return (
    <div
      className="pointer-events-none absolute z-30 flex flex-col items-end gap-2"
      style={{
        right: 'max(0.75rem, env(safe-area-inset-right))',
        bottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Contextual interact — visible only near an object, or to stand up.
          It sits directly above the thumb rather than in the row, because it
          is the button you reach for without looking. */}
      {showInteract && (
        <button
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-accent/50 bg-accent/20 px-4 py-2 backdrop-blur-sm transition active:scale-95 active:bg-accent/30"
          onPointerDown={(e) => {
            e.stopPropagation()
            Sfx.click()
            haptic(12)
            usePlayerStore.getState().requestInteract()
          }}
          aria-label={prompt}
        >
          <span className="font-mono text-sm font-bold text-accent-soft">E</span>
          <span className="max-w-[38vw] truncate font-mono text-[10px] uppercase tracking-[0.15em] text-white/75">
            {prompt}
          </span>
        </button>
      )}

      <div className="flex items-end gap-2">
        <WaveButton size={pad * 0.8} />
        <ChatButton size={pad * 0.8} />
        <RunButton size={pad * 0.9} />
        <HoldlessButton
          label="JUMP"
          size={pad}
          onTap={() => {
            haptic(8)
            usePlayerStore.getState().requestJump()
          }}
        />
      </div>
    </div>
  )
}

// WAVE: the one emote worth a thumb on a phone. The partner sees it.
function WaveButton({ size }: { size: number }) {
  return (
    <button
      className="pointer-events-auto flex items-center justify-center rounded-full border border-white/20 bg-black/25 backdrop-blur-sm transition active:scale-90 active:bg-white/10"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      onPointerDown={(e) => {
        e.stopPropagation()
        haptic(10)
        playAction('wave')
      }}
      aria-label="Wave"
    >
      👋
    </button>
  )
}

// CHAT: opens the message panel, with the unread count on the badge.
function ChatButton({ size }: { size: number }) {
  const unread = useMultiplayerStore((s) => s.unreadChat)
  const setChatOpen = useMultiplayerStore((s) => s.setChatOpen)
  return (
    <button
      className="pointer-events-auto relative flex items-center justify-center rounded-full border border-white/20 bg-black/25 font-mono font-bold uppercase tracking-wider text-white/80 backdrop-blur-sm transition active:scale-90 active:bg-white/10"
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.2) }}
      onPointerDown={(e) => {
        e.stopPropagation()
        Sfx.open()
        haptic(10)
        setChatOpen(true)
      }}
      aria-label="Open chat"
    >
      CHAT
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-accent px-1 text-[10px] font-bold leading-[18px] text-black">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  )
}

// RUN: hold to sprint, release to walk (not a toggle). Redundant with pushing
// the stick to the rim, kept for players who would rather hold a button.
function RunButton({ size }: { size: number }) {
  const [held, setHeld] = useState(false)
  const pointer = useRef<number | null>(null)

  const press = (e: React.PointerEvent) => {
    e.stopPropagation()
    pointer.current = e.pointerId
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    setHeld(true)
    haptic(6)
    usePlayerStore.getState().setSprintHeld(true)
  }
  const release = (e: React.PointerEvent) => {
    if (pointer.current !== e.pointerId) return
    e.stopPropagation()
    pointer.current = null
    setHeld(false)
    usePlayerStore.getState().setSprintHeld(false)
  }
  // Safety: clear sprint if the component unmounts (e.g. panel opens).
  useEffect(() => () => usePlayerStore.getState().setSprintHeld(false), [])

  return (
    <button
      className={`pointer-events-auto flex items-center justify-center rounded-full border font-mono font-bold uppercase tracking-wider backdrop-blur-sm transition active:scale-95 ${
        held ? 'border-accent/60 bg-accent/30 text-white' : 'border-white/20 bg-black/20 text-white/70'
      }`}
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.2) }}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      aria-label="Run"
    >
      RUN
    </button>
  )
}

function HoldlessButton({ label, size, onTap }: { label: string; size: number; onTap: () => void }) {
  return (
    <button
      className="pointer-events-auto flex items-center justify-center rounded-full border border-white/20 bg-black/25 font-mono font-bold uppercase tracking-wider text-white/80 backdrop-blur-sm transition active:scale-90 active:bg-white/10"
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.2) }}
      onPointerDown={(e) => {
        e.stopPropagation()
        onTap()
      }}
      aria-label={label}
    >
      {label}
    </button>
  )
}
