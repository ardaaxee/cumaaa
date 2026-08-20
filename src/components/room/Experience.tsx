import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Scene } from './Scene'
import { PostFx } from './PostFx'
import { AdaptiveQuality } from './AdaptiveQuality'
import { useRoomStore } from '../../store/useRoomStore'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useBootStore } from '../../store/useBootStore'
import { dprRange, shadowsEnabled } from '../../utils/device'
import { PLAYER } from '../../config/roomLayout'

// The WebGL host. Camera, renderer options, fog and post-processing all scale
// with the current graphics tier. Fully unmounts post-fx on low quality.
export function Experience() {
  const quality = useRoomStore((s) => s.settings.quality)
  const bloom = useRoomStore((s) => s.settings.bloom)
  const isTouch = usePlayerStore((s) => s.isTouch)

  const dpr = useMemo(() => dprRange(quality, isTouch), [quality, isTouch])
  const castShadows = shadowsEnabled(quality)
  const bloomOn = bloom && quality !== 'low'

  return (
    <Canvas
      shadows={castShadows}
      dpr={dpr}
      gl={{
        antialias: quality === 'high',
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        depth: true,
      }}
      camera={{ fov: 72, near: 0.1, far: 60, position: [0, PLAYER.eyeHeight, 3] }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.24
        gl.shadowMap.type = THREE.PCFSoftShadowMap
        // Dark warm neutral (not pure black) so gaps never crush to #000, and
        // fog kept far/soft so interior walls don't fade into darkness.
        scene.background = new THREE.Color('#1b1a17')
        scene.fog = new THREE.Fog('#1f1d19', 20, 60)
        useBootStore.getState().setContextReady()
      }}
    >
      <Suspense fallback={null}>
        <Scene quality={quality} />
        <PostFx enabled={bloomOn} quality={quality} />
      </Suspense>
      <AdaptiveQuality />
    </Canvas>
  )
}
