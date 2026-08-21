import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useRoomStore } from '../../store/useRoomStore'
import { PLAYER, HALF_D } from '../../config/roomLayout'
import { resolveCollision } from '../../systems/collisionSystem'
import { Sfx } from '../../systems/audioSystem'
import { playerMotion } from '../../systems/playerMotion'
import { surfaceAt } from '../../systems/surfaces'

const PITCH_LIMIT = 1.396 // ~80° — can't fully flip the head over
const MOUSE_SENS = 0.0022
const TOUCH_SENS = 0.0045
const GRAVITY = 16 // m/s² — a grounded, non-arcade fall
const JUMP_V0 = 3.0 // ≈ 0.28 m hop, uses the same collision floor
const SIT_EYE = 1.18 // sitting eye height

// First-person controller. Desktop = pointer-lock mouse look + WASD.
// Mobile = joystick move + touch-drag look (fed via usePlayerStore).
export function PlayerController() {
  const { camera, gl } = useThree()
  const yaw = useRef(0)
  const pitch = useRef(0)
  const keys = useRef<Record<string, boolean>>({})
  const tmp = useRef(new THREE.Vector3())
  const bobPhase = useRef(0) // walk cycle for head-bob + footsteps
  const stepArmed = useRef(false)
  const vel = useRef(new THREE.Vector2(0, 0)) // world-space XZ velocity (inertia)
  const jumpOffset = useRef(0) // vertical offset above eye height (jump arc)
  const velY = useRef(0) // vertical velocity for the jump/gravity integration
  const lastJump = useRef(0) // last consumed jump nonce

  // Start slightly back from the desk, looking toward it.
  useEffect(() => {
    camera.position.set(0, PLAYER.eyeHeight, HALF_D - 2)
    yaw.current = 0 // yaw 0 looks toward -Z (toward the desk)
    pitch.current = 0
    applyRotation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyRotation = () => {
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ')
    camera.quaternion.setFromEuler(euler)
  }

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true
      // Space = jump (desktop). Ignore auto-repeat so holding it doesn't spam.
      if (e.code === 'Space' && !e.repeat) usePlayerStore.getState().requestJump()
    }
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // Pointer lock + mouse look (desktop)
  useEffect(() => {
    const canvas = gl.domElement
    const setLocked = usePlayerStore.getState().setPointerLocked

    const onCanvasClick = () => {
      const p = usePlayerStore.getState()
      if (p.isTouch || !p.inputEnabled) return
      if (!document.pointerLockElement) {
        canvas.requestPointerLock?.()
      }
    }
    const onLockChange = () => {
      setLocked(document.pointerLockElement === canvas)
    }
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return
      if (!usePlayerStore.getState().inputEnabled) return
      const sens = useRoomStore.getState().settings.sensitivity
      yaw.current -= e.movementX * MOUSE_SENS * sens
      pitch.current -= e.movementY * MOUSE_SENS * sens
      pitch.current = clamp(pitch.current, -PITCH_LIMIT, PITCH_LIMIT)
    }

    canvas.addEventListener('click', onCanvasClick)
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('mousemove', onMouseMove)
    return () => {
      canvas.removeEventListener('click', onCanvasClick)
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [gl])

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const p = usePlayerStore.getState()

    // --- Camera focus animation (entering the PC) ---------------------------
    if (p.focusTarget) {
      const [tx, ty, tz] = p.focusTarget.position
      tmp.current.set(tx, ty, tz)
      camera.position.lerp(tmp.current, Math.min(1, delta * 4))
      const [lx, ly, lz] = p.focusTarget.lookAt
      camera.lookAt(lx, ly, lz)
      return
    }

    // --- Cinematic look-at (secret reveal / lab exit) -----------------------
    // Rotates toward a world point without moving the player, updating the real
    // yaw/pitch so control resumes with no snap when released.
    if (!p.inputEnabled && p.lookTarget) {
      const [lx, ly, lz] = p.lookTarget
      const dx = lx - camera.position.x
      const dy = ly - camera.position.y
      const dz = lz - camera.position.z
      const h = Math.hypot(dx, dz)
      const desiredYaw = Math.atan2(-dx, -dz) // forward = (-sin yaw, 0, -cos yaw)
      const desiredPitch = Math.atan2(dy, h)
      const t = Math.min(1, delta * 3.5)
      yaw.current += shortestAngle(yaw.current, desiredYaw) * t
      pitch.current += (desiredPitch - pitch.current) * t
      pitch.current = clamp(pitch.current, -PITCH_LIMIT, PITCH_LIMIT)
      applyRotation()
      return
    }

    if (!p.inputEnabled) {
      // Movement is parked, but the player still HAS a position: keep publishing
      // it so the map, ambience and footstep systems don't read a stale spot
      // while a panel or menu is open.
      playerMotion.x = camera.position.x
      playerMotion.z = camera.position.z
      playerMotion.speed = 0
      playerMotion.moving = false
      playerMotion.running = false
      return
    }

    // --- Look (mobile touch-drag) -------------------------------------------
    if (p.isTouch) {
      const look = usePlayerStore.getState().consumeLook()
      if (look.yaw !== 0 || look.pitch !== 0) {
        const sens = useRoomStore.getState().settings.touchSensitivity
        yaw.current -= look.yaw * TOUCH_SENS * sens
        pitch.current -= look.pitch * TOUCH_SENS * sens
        pitch.current = clamp(pitch.current, -PITCH_LIMIT, PITCH_LIMIT)
      }
    }
    applyRotation()

    // --- Seated: lock movement, settle to a sitting eye height --------------
    // Look still works; the player eases into the seat and back out on stand.
    if (p.seatPose) {
      const e = Math.min(1, delta * 6)
      camera.position.x += (p.seatPose.x - camera.position.x) * e
      camera.position.z += (p.seatPose.z - camera.position.z) * e
      camera.position.y += (SIT_EYE - camera.position.y) * e
      vel.current.set(0, 0)
      playerMotion.speed = 0
      playerMotion.moving = false
      playerMotion.running = false
      playerMotion.x = camera.position.x
      playerMotion.z = camera.position.z
      return
    }

    // --- Movement (with inertia) --------------------------------------------
    let mx = 0
    let mz = 0
    const k = keys.current
    if (k['KeyW'] || k['ArrowUp']) mz -= 1
    if (k['KeyS'] || k['ArrowDown']) mz += 1
    if (k['KeyA'] || k['ArrowLeft']) mx -= 1
    if (k['KeyD'] || k['ArrowRight']) mx += 1
    mx += p.moveX
    mz -= p.moveY

    const len = Math.hypot(mx, mz)
    const sprint = k['ShiftLeft'] || k['ShiftRight'] || p.sprintHeld
    const maxSpeed = sprint ? PLAYER.sprintSpeed : PLAYER.speed

    // --- Jump / gravity (shared by desktop Space + mobile JUMP button) -------
    const grounded = jumpOffset.current <= 1e-4 && velY.current <= 0
    if (p.jumpNonce !== lastJump.current) {
      lastJump.current = p.jumpNonce
      if (grounded) velY.current = JUMP_V0
    }
    if (jumpOffset.current > 0 || velY.current !== 0) {
      velY.current -= GRAVITY * delta
      jumpOffset.current += velY.current * delta
      if (jumpOffset.current <= 0) {
        jumpOffset.current = 0
        velY.current = 0
      }
    }

    // Subtle sprint FOV widening (kept small to avoid motion sickness).
    const cam = camera as THREE.PerspectiveCamera
    if (cam.isPerspectiveCamera) {
      const targetFov = sprint && vel.current.length() > 0.5 ? 75 : 72
      if (Math.abs(cam.fov - targetFov) > 0.05) {
        cam.fov += (targetFov - cam.fov) * Math.min(1, delta * 4)
        cam.updateProjectionMatrix()
      }
    }

    // Target world-space velocity from input (0 when idle).
    let targetVX = 0
    let targetVZ = 0
    if (len > 0.001) {
      const nmx = mx / Math.max(1, len)
      const nmz = mz / Math.max(1, len)
      // Camera forward is (-sin, 0, -cos); right is (cos, 0, -sin).
      const sin = Math.sin(yaw.current)
      const cos = Math.cos(yaw.current)
      targetVX = (nmx * cos + nmz * sin) * maxSpeed
      targetVZ = (-nmx * sin + nmz * cos) * maxSpeed
    }

    // Ease current velocity toward the target — snappy to start, a touch of
    // glide to stop — so a real body's weight is felt without feeling floaty.
    const accel = len > 0.001 ? 11 : 8
    const f = 1 - Math.exp(-accel * delta)
    vel.current.x += (targetVX - vel.current.x) * f
    vel.current.y += (targetVZ - vel.current.y) * f

    const speed2 = vel.current.length()
    if (speed2 > 0.0008) {
      const desiredX = camera.position.x + vel.current.x * delta
      const desiredZ = camera.position.z + vel.current.y * delta
      const [rx, rz] = resolveCollision(desiredX, desiredZ, PLAYER.radius)
      // If collision blocked an axis, kill that velocity component (no sliding buildup).
      if (Math.abs(rx - desiredX) > 1e-4) vel.current.x = 0
      if (Math.abs(rz - desiredZ) > 1e-4) vel.current.y = 0
      const moved = Math.hypot(rx - camera.position.x, rz - camera.position.z)
      camera.position.x = rx
      camera.position.z = rz

      // Head-bob amplitude scales with speed; footsteps fire at each low point.
      // The phase keeps advancing under reduced motion so footsteps stay in
      // time with the stride — only the visible movement is removed.
      bobPhase.current += moved * 7.2
      const motionScale = useRoomStore.getState().settings.reducedMotion ? 0 : 1
      const amp = (0.012 + Math.min(1, speed2 / PLAYER.speed) * 0.014) * motionScale
      camera.position.y = PLAYER.eyeHeight + Math.sin(bobPhase.current) * amp + jumpOffset.current
      // Very subtle lateral sway (half the bob rate) so it reads as a body
      // shifting weight, not a floating camera. Applied along the view-right.
      const sway = Math.sin(bobPhase.current * 0.5) * amp * 0.6
      camera.position.x += Math.cos(yaw.current) * sway
      camera.position.z += -Math.sin(yaw.current) * sway
      const s = Math.sin(bobPhase.current)
      if (s < -0.85 && stepArmed.current) {
        Sfx.footstep(surfaceAt(camera.position.x, camera.position.z), sprint)
        stepArmed.current = false
      } else if (s > 0) {
        stepArmed.current = true
      }
    } else {
      vel.current.set(0, 0)
      if (jumpOffset.current > 1e-4) {
        // Airborne while standing still: follow the jump arc directly.
        camera.position.y = PLAYER.eyeHeight + jumpOffset.current
      } else {
        camera.position.y += (PLAYER.eyeHeight - camera.position.y) * Math.min(1, delta * 8)
      }
    }

    // Publish motion for the first-person body, footstep pacing + blob shadow.
    playerMotion.x = camera.position.x
    playerMotion.z = camera.position.z
    playerMotion.speed = speed2
    playerMotion.bobPhase = bobPhase.current
    playerMotion.running = sprint && speed2 > 0.5
    playerMotion.moving = speed2 > 0.4
    playerMotion.grounded = grounded
  })

  return null
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

// Signed shortest angular difference (target - current), wrapped to [-π, π].
function shortestAngle(current: number, target: number): number {
  let d = (target - current) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}
