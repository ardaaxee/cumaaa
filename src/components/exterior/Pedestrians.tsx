import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Avatar, type AvatarRig } from '../characters/Avatar'
import { animateAvatar } from '../characters/animate'
import { generateAppearance } from '../../systems/npc/appearance'
import { laneAt, prepareLane, type LaneState } from '../../systems/traffic'
import { isHighTier } from '../../utils/device'
import type { GraphicsQuality } from '../../types'

// People on the pavement.
//
// This is the first thing built on the NPC appearance generator, and it is the
// point of that generator: everyone here is a DIFFERENT person — different
// height, build, face, hair and clothes — from nothing but a seed string. A
// street of recoloured clones is worse than an empty one, because an empty
// pavement just reads as quiet.
//
// They walk a lane exactly the way the cars do, because a pavement is a lane.
// What they do NOT have yet is any decision-making: no schedule, no needs, no
// destinations. They walk, and the honest description of that is "the movement
// layer of an NPC, without the AI layer".

interface Walker {
  seed: string
  lane: LaneState
  s: number
  speed: number
  phase: number
}

export function Pedestrians({
  quality,
  y,
  x0,
  x1,
  z0,
  z1,
  count,
}: {
  quality: GraphicsQuality
  /** Pavement height. */
  y: number
  x0: number
  x1: number
  z0: number
  z1: number
  count: number
}) {
  const detail = isHighTier(quality)
  // Distance from the flat is what decides the budget here, not the tier alone:
  // these are always far away, so they always run at a low segment count.
  const seg = detail ? 10 : 8

  const walkers = useMemo<Walker[]>(() => {
    const out: Walker[] = []
    for (let i = 0; i < count; i++) {
      const x = x0 + ((x1 - x0) * (i + 0.5)) / count
      // Up the pavement and back down it, a little apart, so two people can
      // pass each other rather than following in a queue.
      const lane = prepareLane({
        id: `walk${i}`,
        y,
        speed: 1.3,
        points: [
          [x, z0],
          [x, z1],
          [x + (i % 2 ? 0.8 : -0.8), z1 + 1.5],
          [x + (i % 2 ? 0.8 : -0.8), z0 - 1.5],
          [x, z0],
        ],
      })
      out.push({
        seed: `walker-${i}-${Math.round(x * 100)}`,
        lane,
        s: (lane.length * i) / count,
        // Everyone walks at their own pace; identical speeds read as a machine.
        speed: 1.05 + ((i * 37) % 11) / 22,
        phase: i * 1.7,
      })
    }
    return out
  }, [count, x0, x1, z0, z1, y])

  const profiles = useMemo(
    () => walkers.map((w) => generateAppearance(w.seed, { warm: 0.5 })),
    [walkers],
  )
  const groups = useRef<THREE.Group[]>([])
  const rigs = useRef<(AvatarRig | null)[]>([])
  const time = useRef(0)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    time.current += dt
    for (let i = 0; i < walkers.length; i++) {
      const w = walkers[i]
      w.s += w.speed * dt
      w.phase += (w.speed * dt) / 0.62 // stride length, roughly
      const at = laneAt(w.lane, w.s)
      const g = groups.current[i]
      if (g) {
        g.position.set(at.x, w.lane.lane.y, at.z)
        // The avatar is built facing -Z (the camera convention), and the lane's
        // yaw is measured for a +Z nose, so it turns by PI.
        g.rotation.y = at.yaw + Math.PI
      }
      const rig = rigs.current[i]
      if (rig) {
        animateAvatar(rig, {
          speed: w.speed,
          running: false,
          sit: 0,
          phase: w.phase,
          time: time.current + i,
          action: 'idle',
        })
      }
    }
  })

  return (
    <group>
      {walkers.map((w, i) => (
        <group key={w.seed} ref={(g) => { if (g) groups.current[i] = g }}>
          <Avatar ref={(r) => { rigs.current[i] = r }} profile={profiles[i]} seg={seg} detail={false} />
        </group>
      ))}
    </group>
  )
}
