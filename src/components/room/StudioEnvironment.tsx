import { Environment, Lightformer } from '@react-three/drei'

// A procedurally-lit image-based-lighting environment built entirely from
// Lightformers (no HDR download, CSP-safe). It only feeds reflections/IBL — it
// does not draw a background — so metals, glass and the PC tower pick up
// believable highlights. Rendered once (frames={1}) then frozen for zero
// per-frame cost. Tuned dim to preserve the room's dark mood.
export function StudioEnvironment() {
  return (
    <Environment resolution={128} frames={1}>
      <color attach="background" args={['#05070c']} />

      {/* Soft daylight from the window/ceiling (the room's main light) */}
      <Lightformer
        intensity={1.5}
        color="#e8ecec"
        position={[2.8, 4.5, -5]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[6, 3, 1]}
      />
      {/* Warm interior bounce (tungsten) */}
      <Lightformer
        intensity={0.8}
        color="#ffd9ac"
        position={[-3, 2.2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[4, 2.4, 1]}
      />
      {/* Warm bounce from the bed corner */}
      <Lightformer
        intensity={0.5}
        color="#ffcf9a"
        position={[4, 1.6, 3]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[3, 2, 1]}
      />
      {/* Soft neutral front fill */}
      <Lightformer
        intensity={0.5}
        color="#b8bcc2"
        position={[0, 2, 6]}
        rotation={[0, Math.PI, 0]}
        scale={[6, 3, 1]}
      />
    </Environment>
  )
}
