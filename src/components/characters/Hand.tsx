import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { AvatarProfile } from '../../config/appearance'
import { bodySkinMaterial } from '../../systems/materials/skin'
import { buildNail, buildPalm, buildPhalanx, buildThenar, buildTip, DIGITS } from './geometry/hand'
import { GRIPS, type GripName, type GripPose } from './handPose'

// A hand with a palm and five fingers, each with its own bones.
//
// Every digit now has the three joints a real one has — MCP at the knuckle, PIP
// in the middle, DIP at the end — as separate groups the animator and the IK can
// drive individually. The single `curl` number they replace could only ever
// produce one shape, which is why a mug, a fork and a phone were all held the
// same way.
//
// Built hanging DOWN from the wrist, matching the arm chain: local -Y runs out
// along the hand, +Z is the back of the hand, and +X is toward the thumb on the
// right hand. Anything carried is parented at the wrist above this, so the item
// grips and the fingers share one frame.

export interface DigitRig {
  mcp: THREE.Group | null
  pip: THREE.Group | null
  dip: THREE.Group | null
}

export interface HandRig {
  /** Thumb, index, middle, ring, little. */
  digits: DigitRig[]
}

export const Hand = forwardRef<
  HandRig,
  {
    profile: AvatarProfile
    /** -1 = left, 1 = right. */
    side: -1 | 1
    seg: number
    detail: boolean
    grip?: GripName
  }
>(function Hand({ profile, side, seg, detail, grip = 'relaxed' }, ref) {
  const digits = useRef<DigitRig[]>(DIGITS.map(() => ({ mcp: null, pip: null, dip: null })))
  useImperativeHandle(ref, () => ({ get digits() { return digits.current } }))

  const mat = bodySkinMaterial(profile, detail)
  const radial = Math.max(6, Math.round(seg * 0.6))
  const pose: GripPose = GRIPS[grip] ?? GRIPS.relaxed

  const geom = useMemo(() => {
    const palm = buildPalm(Math.max(8, radial))
    const thenar = buildThenar(Math.max(6, radial - 2))
    const bones = DIGITS.map((dg) => ({
      prox: buildPhalanx(dg.ph.prox, dg.ph.radius, 0.9, radial),
      mid: dg.ph.mid > 0 ? buildPhalanx(dg.ph.mid, dg.ph.radius * 0.88, 0.92, radial) : null,
      tip: buildTip(dg.ph.dist, dg.ph.radius * (dg.ph.mid > 0 ? 0.78 : 0.86), radial),
      nail: detail ? buildNail(dg.ph.radius * 0.62, radial) : null,
    }))
    return { palm, thenar, bones }
  }, [radial, detail])

  useEffect(
    () => () => {
      geom.palm.dispose()
      geom.thenar.dispose()
      geom.bones.forEach((b) => { b.prox.dispose(); b.mid?.dispose(); b.tip.dispose(); b.nail?.dispose() })
    },
    [geom],
  )

  // Below MEDIUM the fingers merge into one mass — still hand-SHAPED, with a
  // palm and a separate thumb, just without five individually posed digits.
  const simple = seg < 10

  return (
    <group>
      <mesh geometry={geom.palm} castShadow>
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh geometry={geom.thenar} position={[side * 0.024, -0.004, 0.003]} rotation={[0, 0, side * -0.22]}>
        <meshStandardMaterial {...mat} />
      </mesh>

      {simple ? (
        <group>
          <mesh position={[0, -0.108, 0.004]} rotation={[pose[2].mcp * 0.9, 0, 0]} scale={[1, 1, 0.5]}>
            <capsuleGeometry args={[0.028, 0.05, 2, 6]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          <mesh position={[side * 0.034, -0.042, 0.012]} rotation={[0.2, 0, side * 0.75]}>
            <capsuleGeometry args={[0.012, 0.036, 2, 6]} />
            <meshStandardMaterial {...mat} />
          </mesh>
        </group>
      ) : (
        <group>
          {DIGITS.map((dg, i) => {
            const p = pose[i]
            const b = geom.bones[i]
            const thumb = i === 0
            return (
              <group
                key={dg.name}
                // MCP — for the thumb this is the carpometacarpal joint, low on
                // the side of the palm and rotated to OPPOSE the fingers, which
                // is the joint that makes a hand a hand.
                ref={(g) => { if (g) digits.current[i].mcp = g }}
                position={[side * dg.x, dg.base, dg.z]}
                rotation={
                  thumb
                    ? [0.2 + p.mcp * 0.5, side * -0.34, side * (dg.splay + p.splay * 0.4)]
                    : [p.mcp, 0, side * (dg.splay + p.splay)]
                }
              >
                <mesh geometry={b.prox} castShadow>
                  <meshStandardMaterial {...mat} />
                </mesh>
                <group
                  ref={(g) => { if (g) digits.current[i].pip = g }}
                  position={[0, -dg.ph.prox, 0]}
                  rotation={[p.pip, 0, 0]}
                >
                  {b.mid && (
                    <mesh geometry={b.mid} castShadow>
                      <meshStandardMaterial {...mat} />
                    </mesh>
                  )}
                  <group
                    ref={(g) => { if (g) digits.current[i].dip = g }}
                    position={[0, -(dg.ph.mid || 0), 0]}
                    rotation={[p.dip, 0, 0]}
                  >
                    <mesh geometry={b.tip} castShadow>
                      <meshStandardMaterial {...mat} />
                    </mesh>
                    {b.nail && (
                      <mesh
                        geometry={b.nail}
                        position={[0, -dg.ph.dist * 0.5, dg.ph.radius * 0.42]}
                        rotation={[Math.PI / 2 - 0.3, 0, 0]}
                      >
                        <meshStandardMaterial color="#e7c9ba" roughness={0.28} metalness={0.02} />
                      </mesh>
                    )}
                  </group>
                </group>
              </group>
            )
          })}
        </group>
      )}
    </group>
  )
})
