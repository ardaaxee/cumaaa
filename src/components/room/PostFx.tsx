import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import type { GraphicsQuality } from '../../types'

// Quality-aware post-processing. The whole composer unmounts on low quality.
// High adds multisampling and a stronger, wider bloom for a richer look; the
// IBL environment + reflective floor carry most of the "material" realism.
export function PostFx({ enabled, quality }: { enabled: boolean; quality: GraphicsQuality }) {
  if (!enabled) return null
  const high = quality === 'high'

  return (
    <EffectComposer multisampling={high ? 4 : 0}>
      <Bloom
        intensity={high ? 0.72 : 0.52}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.25}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.22} darkness={high ? 0.72 : 0.68} />
    </EffectComposer>
  )
}
