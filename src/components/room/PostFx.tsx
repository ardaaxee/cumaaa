import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

// Subtle bloom + vignette. Skipped entirely on low quality (the whole composer
// is unmounted) to keep mid-range phones fast.
export function PostFx({ enabled }: { enabled: boolean }) {
  if (!enabled) return null
  return (
    <EffectComposer>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.2}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.25} darkness={0.7} />
    </EffectComposer>
  )
}
