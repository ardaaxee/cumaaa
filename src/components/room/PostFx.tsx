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
      {/* Restrained bloom — only genuine light sources (lamps, screens, sun)
          cross the threshold, so the room doesn't wash out. */}
      <Bloom
        intensity={high ? 0.32 : 0.24}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      {/* Soft vignette only — nothing that crushes the room's edges to black. */}
      <Vignette eskil={false} offset={0.36} darkness={high ? 0.34 : 0.3} />
    </EffectComposer>
  )
}
