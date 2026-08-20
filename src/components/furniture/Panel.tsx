import { RoundedBox } from '@react-three/drei'
import { useRoomStore } from '../../store/useRoomStore'
import type { ReactNode } from 'react'

// A furniture "panel" — the shared building block for every cabinet, seat,
// tabletop and carcass in the home. Real furniture has softened edges that
// catch a highlight; a raw boxGeometry reads as a game prop. This wraps drei's
// RoundedBox with a safe auto-clamped radius and tier-aware tessellation:
//
//   LOW    → plain box (cheapest; mobile-safe)
//   MEDIUM → 1 bevel segment
//   HIGH   → 2 bevel segments (softest highlight)
//
// Drop-in for `<mesh><boxGeometry args={[w,h,d]}/>…</mesh>`; pass the material
// as children exactly as before.
export function Panel({
  args,
  radius,
  castShadow = true,
  receiveShadow = false,
  children,
  ...rest
}: {
  args: [number, number, number]
  radius?: number
  castShadow?: boolean
  receiveShadow?: boolean
  children?: ReactNode
} & Omit<JSX.IntrinsicElements['mesh'], 'args' | 'children'>) {
  const quality = useRoomStore((s) => s.settings.quality)
  const [w, h, d] = args

  if (quality === 'low') {
    return (
      <mesh castShadow={castShadow} receiveShadow={receiveShadow} {...rest}>
        <boxGeometry args={args} />
        {children}
      </mesh>
    )
  }

  // Keep the radius safely under half the smallest dimension so thin panels
  // (drawer fronts, tabletops) don't collapse into a pill.
  const smallest = Math.min(w, h, d)
  const r = Math.max(0.004, Math.min(radius ?? smallest * 0.22, smallest * 0.42))

  return (
    // NOTE: drei doubles `bevelSegments` internally and runs toCreasedNormals
    // per instance, so keep both numbers tiny — a 2-segment bevel is already
    // enough to catch a highlight, and a whole room of these must stay cheap.
    <RoundedBox
      args={args}
      radius={r}
      smoothness={quality === 'high' ? 2 : 1}
      bevelSegments={1}
      steps={1}
      creaseAngle={0.5}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      {...rest}
    >
      {children}
    </RoundedBox>
  )
}
