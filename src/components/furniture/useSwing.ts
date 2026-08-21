import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useOpenable, useAppliance } from '../../systems/world'

// Smoothly drives a group between "shut" and "open" from the SHARED world
// state, so a door the partner opened is already swinging when you walk in.
//
// Six pieces of kitchen furniture needed the same three lines of lerp; this is
// that, once. `axis` picks what open means: a hinge (rotation) or a slide
// (position), which is the only difference between a cupboard and a drawer.
export type SwingAxis = 'rotY' | 'rotX' | 'slideZ' | 'slideY'

export function useSwing(
  id: string,
  open: number,
  axis: SwingAxis = 'rotY',
  speed = 7,
): React.RefObject<THREE.Group> {
  const isOpen = useOpenable(id)
  const ref = useRef<THREE.Group>(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += ((isOpen ? 1 : 0) - t.current) * Math.min(1, delta * speed)
    const g = ref.current
    if (!g) return
    const v = t.current * open
    switch (axis) {
      case 'rotY':
        g.rotation.y = v
        break
      case 'rotX':
        g.rotation.x = v
        break
      case 'slideZ':
        g.position.z = v
        break
      case 'slideY':
        g.position.y = v
        break
    }
  })

  return ref
}

export { useOpenable, useAppliance }
