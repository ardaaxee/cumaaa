import type { AvatarProfile } from '../../config/appearance'

// A hand with a palm and five fingers, each with its own segments and its own
// knuckle — not a mitten, and not a sphere with four bumps on it.
//
// Built hanging DOWN from the wrist, matching the arm chain: local -Y runs out
// along the hand, +Z is the back of the hand, and +X is toward the thumb on the
// right hand. Anything carried is parented at the wrist above this, so the item
// grips and the fingers share one frame.
//
// `curl` closes the fingers: 0 is an open hand, 1 a fist. That single number is
// what the pose system drives, so holding a mug and pointing at something are
// the same mechanism at different values.

export type HandPose = 'relaxed' | 'open' | 'grab' | 'point' | 'cup'

const POSE_CURL: Record<HandPose, { fingers: number; thumb: number; index: number }> = {
  // Nobody stands with their hands flat: a hand at rest is slightly closed.
  relaxed: { fingers: 0.3, thumb: 0.22, index: 0.26 },
  open: { fingers: 0.04, thumb: 0.06, index: 0.04 },
  grab: { fingers: 0.85, thumb: 0.7, index: 0.85 },
  point: { fingers: 0.92, thumb: 0.55, index: 0.02 },
  cup: { fingers: 0.55, thumb: 0.45, index: 0.5 },
}

interface FingerSpec {
  x: number
  z: number
  /** Length of the two visible segments. */
  prox: number
  dist: number
  radius: number
  /** Splay away from the middle finger. */
  splay: number
}

// Index, middle, ring, little — the middle is the longest, the little the
// shortest and set back, which is what gives a hand its fan shape.
const FINGERS: FingerSpec[] = [
  { x: 0.0225, z: 0.002, prox: 0.036, dist: 0.026, radius: 0.0079, splay: 0.1 },
  { x: 0.0075, z: 0.004, prox: 0.04, dist: 0.03, radius: 0.0082, splay: 0.02 },
  { x: -0.0075, z: 0.003, prox: 0.037, dist: 0.028, radius: 0.0077, splay: -0.04 },
  { x: -0.0215, z: -0.001, prox: 0.03, dist: 0.022, radius: 0.0068, splay: -0.14 },
]

export function Hand({
  profile,
  side,
  seg,
  detail,
  pose = 'relaxed',
}: {
  profile: AvatarProfile
  /** -1 = left, 1 = right. */
  side: -1 | 1
  seg: number
  detail: boolean
  pose?: HandPose
}) {
  const skin = profile.skin
  const mat = {
    color: skin.base,
    roughness: detail ? 0.6 : 0.68,
    metalness: 0.0,
    emissive: skin.base,
    emissiveIntensity: 0.1 * skin.translucency + 0.04,
  }
  const knuckleMat = { ...mat, color: skin.shade }
  const c = POSE_CURL[pose]

  // Below MEDIUM the fingers merge into one mass — still hand-SHAPED, with a
  // palm and a separate thumb, just without four individually posed digits.
  const simple = seg < 10

  return (
    <group>
      {/* Palm: flat across, thicker at the knuckles than at the wrist. */}
      <mesh position={[0, -0.036, 0.001]} scale={[1, 1, 0.42]} castShadow>
        <sphereGeometry args={[0.036, seg + 2, seg + 2]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* The heel of the hand, where it meets the wrist. */}
      <mesh position={[0, -0.012, 0]} scale={[0.82, 0.7, 0.44]}>
        <sphereGeometry args={[0.032, seg, seg]} />
        <meshStandardMaterial {...mat} />
      </mesh>

      {simple ? (
        <group>
          <mesh position={[0, -0.086, 0.004]} rotation={[c.fingers * 0.9, 0, 0]} scale={[1, 1, 0.5]}>
            <capsuleGeometry args={[0.026, 0.045, 2, 6]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          <mesh position={[side * 0.03, -0.036, 0.012]} rotation={[0.2, 0, side * 0.75]}>
            <capsuleGeometry args={[0.011, 0.034, 2, 6]} />
            <meshStandardMaterial {...mat} />
          </mesh>
        </group>
      ) : (
        <group>
          {FINGERS.map((f, i) => {
            const curl = i === 0 ? c.index : c.fingers
            return (
              <group
                key={i}
                position={[side * f.x, -0.062, f.z]}
                rotation={[curl * 1.35, 0, side * f.splay]}
              >
                {/* knuckle */}
                <mesh>
                  <sphereGeometry args={[f.radius * 1.08, seg, seg]} />
                  <meshStandardMaterial {...knuckleMat} />
                </mesh>
                {/* proximal phalanx */}
                <mesh position={[0, -f.prox / 2, 0]} castShadow>
                  <capsuleGeometry args={[f.radius, f.prox - f.radius, 2, seg - 2]} />
                  <meshStandardMaterial {...mat} />
                </mesh>
                {/* the second joint bends further than the first */}
                <group position={[0, -f.prox, 0]} rotation={[curl * 1.5, 0, 0]}>
                  <mesh position={[0, -f.dist / 2, 0]} castShadow>
                    <capsuleGeometry args={[f.radius * 0.86, f.dist - f.radius, 2, seg - 2]} />
                    <meshStandardMaterial {...mat} />
                  </mesh>
                  {detail && (
                    <mesh position={[0, -f.dist * 0.86, f.radius * 0.5]} scale={[0.8, 1, 0.35]}>
                      <sphereGeometry args={[f.radius * 0.62, 6, 6]} />
                      <meshStandardMaterial color="#e6c8b8" roughness={0.35} />
                    </mesh>
                  )}
                </group>
              </group>
            )
          })}

          {/* Thumb: set low on the side of the palm and rotated to oppose the
              fingers, which is the joint that makes a hand a hand. */}
          <group
            position={[side * 0.032, -0.03, 0.008]}
            rotation={[0.25 + c.thumb * 0.5, side * -0.35, side * (0.95 - c.thumb * 0.35)]}
          >
            <mesh>
              <sphereGeometry args={[0.012, seg, seg]} />
              <meshStandardMaterial {...knuckleMat} />
            </mesh>
            <mesh position={[0, -0.018, 0]} castShadow>
              <capsuleGeometry args={[0.0105, 0.026, 2, seg - 2]} />
              <meshStandardMaterial {...mat} />
            </mesh>
            <group position={[0, -0.036, 0]} rotation={[c.thumb * 0.9, 0, 0]}>
              <mesh position={[0, -0.014, 0]} castShadow>
                <capsuleGeometry args={[0.0092, 0.02, 2, seg - 2]} />
                <meshStandardMaterial {...mat} />
              </mesh>
            </group>
          </group>
        </group>
      )}
    </group>
  )
}
