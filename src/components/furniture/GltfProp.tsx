import { Component, Suspense, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import type { GraphicsQuality } from '../../types'

// Optional drop-in GLTF/GLB loader with a procedural fallback.
//
// The room ships with NO bundled 3D model files, because genuinely photoreal
// GLBs are tens of MB each and would wreck mobile performance (the one hard
// constraint here). This component is the sanctioned path to upgrade a hero
// object later WITHOUT touching anything else:
//
//   1. Drop an open-license (CC0 / CC-BY) .glb into `public/models/`.
//   2. Wrap the procedural mesh you want to replace:
//        <GltfProp url="/models/desk.glb" quality={quality}
//                  position={[...]} rotation={[...]} scale={1}>
//          <Desk />   {/* fallback: shown on LOW, or if the file is missing */}
//        </GltfProp>
//   3. Record the source + license in ARDA_ROOM.md.
//
// It never loads on LOW / mobile (keeps the fast path procedural), and any load
// failure (missing file, bad asset) transparently falls back to the children.
interface Props {
  url?: string
  quality: GraphicsQuality
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
  children: ReactNode // procedural fallback
}

export function GltfProp({ url, quality, position, rotation, scale, children }: Props) {
  // Procedural fallback on the fast path or when no model is configured.
  if (!url || quality === 'low') return <>{children}</>

  return (
    <GltfBoundary fallback={children}>
      <Suspense fallback={children}>
        <Model url={url} position={position} rotation={rotation} scale={scale} />
      </Suspense>
    </GltfBoundary>
  )
}

function Model({
  url,
  position,
  rotation,
  scale,
}: {
  url: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
}) {
  const { scene } = useGLTF(url)
  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    />
  )
}

// A scene-graph error boundary: if the GLB fails to load or render, show the
// procedural fallback instead of crashing the canvas.
class GltfBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <>{this.props.fallback}</> : <>{this.props.children}</>
  }
}
