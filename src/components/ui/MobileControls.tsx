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

const JOY_RADIUS = 58 // px throw
const DEAD_ZONE = 0.14 // ignore tiny wobble near center

function Joystick() {
  const base = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const pointer = useRef<number | null>(null)

  const setKnob = (x: number, y: number) => {
    if (knob.current) knob.current.style.transform = `translate(${x}px, ${y}px)`
  }

  const onDown = (e: React.PointerEvent) => {
    if (pointer.current !== null) return
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
    setKnob(dx, dy)
    // Normalize to [-1,1], apply a dead zone, and rescale so motion past the
    // dead zone still reaches full analog speed. y inverts (push up = forward).
    let nx = dx / JOY_RADIUS
    let ny = -dy / JOY_RADIUS
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
  }
  const onUp = (e: React.PointerEvent) => {
    if (pointer.current !== e.pointerId) return
    e.stopPropagation()
    pointer.current = null
    setKnob(0, 0)
    usePlayerStore.getState().setMove(0, 0)
  }

  return (
    <div
      ref={base}
      className="pointer-events-auto absolute z-20 flex h-32 w-32 items-center justify-center rounded-full border border-white/15 bg-black/20 backdrop-blur-sm"
      style={{
        left: 'max(1.25rem, env(safe-area-inset-left))',
        bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
        touchAction: 'none',
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div className="absolute inset-3 rounded-full border border-white/10" />
      <div
        ref={knob}
        className="h-14 w-14 rounded-full border border-accent/40 bg-accent/25 shadow-lg"
      />
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

function ActionButtons() {
  const focus = useInteractionStore((s) => s.focus)
  const seated = usePlayerStore((s) => s.seatPose !== null)
  const prompt = seated ? 'Stand up' : focus?.prompt
  const showInteract = seated || !!focus

  return (
    <div
      className="pointer-events-none absolute z-30 flex flex-col items-end gap-3"
      style={{
        right: 'max(1.25rem, env(safe-area-inset-right))',
        bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Contextual interact — visible only near an object, or to stand up */}
      {showInteract && (
        <button
          className="pointer-events-auto flex flex-col items-center rounded-2xl border border-accent/50 bg-accent/20 px-5 py-2 backdrop-blur-sm transition active:scale-95 active:bg-accent/30"
          onPointerDown={(e) => {
            e.stopPropagation()
            Sfx.click()
            haptic(12)
            usePlayerStore.getState().requestInteract()
          }}
          aria-label={prompt}
        >
          <span className="font-mono text-base font-bold text-accent-soft">E</span>
          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-white/70">
            {prompt}
          </span>
        </button>
      )}

      <div className="flex items-end gap-3">
        <WaveButton />
        <ChatButton />
        <RunButton />
        <HoldlessButton
          label="JUMP"
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
function WaveButton() {
  return (
    <button
      className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/25 text-xl backdrop-blur-sm transition active:scale-90 active:bg-white/10"
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
function ChatButton() {
  const unread = useMultiplayerStore((s) => s.unreadChat)
  const setChatOpen = useMultiplayerStore((s) => s.setChatOpen)
  return (
    <button
      className="pointer-events-auto relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/25 font-mono text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-sm transition active:scale-90 active:bg-white/10"
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

// RUN: hold to sprint, release to walk (not a toggle).
function RunButton() {
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
      className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm transition active:scale-95 ${
        held ? 'border-accent/60 bg-accent/30 text-white' : 'border-white/20 bg-black/20 text-white/70'
      }`}
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

function HoldlessButton({ label, onTap }: { label: string; onTap: () => void }) {
  return (
    <button
      className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/25 font-mono text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-sm transition active:scale-90 active:bg-white/10"
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
