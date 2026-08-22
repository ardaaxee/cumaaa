import { EffectComposer, Bloom, Vignette, HueSaturation, BrightnessContrast, N8AO } from '@react-three/postprocessing'
import { isHighTier, isUltra } from '../../utils/device'
import type { GraphicsQuality } from '../../types'

// Quality-aware post-processing. The whole composer unmounts on low quality.
//
// HIGH/ULTRA add real screen-space ambient occlusion (N8AO) plus a light colour
// grade, aiming at an architectural-visualisation look: contact darkening in
// corners and under furniture, gentle warmth, no neon and no blown-out bloom.
// MEDIUM keeps the cheap bloom + vignette only.
//
// There is deliberately NO film grain. Grain is a camera artefact, and this is
// not meant to look like footage of a room — it is meant to look like the room.
// It also fights the fine detail everything else here spends its budget on: a
// pore normal map and a hair-card alpha edge are exactly the frequencies grain
// buries.
export function PostFx({ enabled, quality }: { enabled: boolean; quality: GraphicsQuality }) {
  if (!enabled) return null
  const high = isHighTier(quality)
  const ultra = isUltra(quality)

  return (
    <EffectComposer multisampling={ultra ? 8 : high ? 4 : 0} enableNormalPass={high}>
      {/* Screen-space AO — the single biggest realism win: soft occlusion where
          surfaces meet, instead of flat ambient everywhere. HIGH/ULTRA only. */}
      {high ? (
        <N8AO
          aoRadius={ultra ? 1.4 : 1.1}
          intensity={ultra ? 1.6 : 1.3}
          distanceFalloff={1}
          quality={ultra ? 'high' : 'medium'}
          halfRes={!ultra}
          color="#0a0806"
        />
      ) : (
        <></>
      )}

      {/* Restrained bloom — only genuine light sources cross the threshold. */}
      <Bloom
        intensity={high ? 0.32 : 0.24}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.3}
        mipmapBlur
      />

      {/* Subtle warm grade: a touch of contrast and saturation, nothing stylised. */}
      {high ? <BrightnessContrast brightness={0.005} contrast={0.045} /> : <></>}
      {high ? <HueSaturation saturation={0.045} hue={0} /> : <></>}

      {/* Soft vignette only — never crushes the room's edges to black. */}
      <Vignette eskil={false} offset={0.36} darkness={high ? 0.34 : 0.3} />
    </EffectComposer>
  )
}
