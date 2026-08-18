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

      {/* Cool ceiling strip (the room's main light) */}
      <Lightformer
        intensity={1.6}
        color="#bcd6f0"
        position={[0, 5, -1]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[8, 3, 1]}
      />
      {/* Cyan accent from the desk side */}
      <Lightformer
        intensity={1.1}
        color="#39d4e6"
        position={[-4, 2, -3]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[3, 2, 1]}
      />
      {/* Warm bounce from the bed corner */}
      <Lightformer
        intensity={0.7}
        color="#ffb877"
        position={[4, 1.6, 3]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[3, 2, 1]}
      />
      {/* Soft front fill so front faces aren't pure black in reflections */}
      <Lightformer
        intensity={0.5}
        color="#3a4560"
        position={[0, 2, 6]}
        rotation={[0, Math.PI, 0]}
        scale={[6, 3, 1]}
      />
    </Environment>
  )
}
