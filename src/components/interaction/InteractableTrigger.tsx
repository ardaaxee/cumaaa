import { useEffect } from 'react'
import * as THREE from 'three'
import { useInteractionStore } from '../../systems/interactionSystem'
import type { InteractableInfo } from '../../types'

interface Props {
  info: InteractableInfo
  position: [number, number, number]
  radius?: number
}

// Registers a world-space interaction volume. Detection/activation is handled
// centrally by InteractionManager — this only declares "there is something
// interactable here".
export function InteractableTrigger({ info, position, radius = 2.1 }: Props) {
  const register = useInteractionStore((s) => s.register)
  const unregister = useInteractionStore((s) => s.unregister)

  useEffect(() => {
    register({
      info,
      position: new THREE.Vector3(position[0], position[1], position[2]),
      radius,
    })
    return () => unregister(info.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.id, position[0], position[1], position[2], radius])

  return null
}
