import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTimeOfDay } from '../../hooks/useClock'
import { skyPalette } from '../../systems/timeSystem'
import { useWeather } from '../../systems/weatherSystem'

// A sky that surrounds the whole world.
//
// The per-window Exterior backdrops are flat planes sized to a window opening,
// which works looking THROUGH a window but leaves the void showing from an open
// space — standing on the balcony at midday, the sky rendered pure black. This
// is one inverted sphere with a vertical gradient: no lighting, no depth write,
// drawn first, so it costs a single draw call and can never occlude anything.
const VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    // The sphere's local position IS the view direction, which is what a sky
    // gradient should key off — using world height instead made the horizon
    // slide as the player walked.
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBottom;
  varying vec3 vDir;
  void main() {
    // Haze hugs the horizon and gives way to clear sky overhead.
    float t = clamp(vDir.y * 2.4 + 0.12, 0.0, 1.0);
    vec3 c = mix(uBottom, uTop, pow(t, 0.6));
    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
  }
`

export function SkyDome() {
  const tod = useTimeOfDay()
  const weather = useWeather()
  const mat = useRef<THREE.ShaderMaterial>(null)
  const dome = useRef<THREE.Mesh>(null)
  const p = skyPalette(tod)

  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(p.top) },
      uBottom: { value: new THREE.Color(p.bottom) },
    }),
    // Built once; colours are updated in the frame loop below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // Overcast flattens and greys the sky; rain darkens it further. Updating the
  // uniforms in the loop keeps weather changes smooth instead of popping.
  useFrame(({ camera }, delta) => {
    // The sky rides with the camera. A fixed dome large enough to enclose the
    // world sat beyond the camera's 60 m far plane and was clipped away in
    // whichever direction you happened to be facing, which is what left a black
    // void overhead on the balcony.
    if (dome.current) dome.current.position.copy(camera.position)
    if (!mat.current) return
    const k = Math.min(1, delta * 1.6)
    const top = new THREE.Color(p.top)
    const bottom = new THREE.Color(p.bottom)
    if (weather === 'cloudy') {
      top.lerp(new THREE.Color('#9aa3ac'), 0.65)
      bottom.lerp(new THREE.Color('#b6bcc0'), 0.55)
    } else if (weather === 'rain') {
      top.lerp(new THREE.Color('#6b7278'), 0.75)
      bottom.lerp(new THREE.Color('#8c9296'), 0.6)
    }
    uniforms.uTop.value.lerp(top, k)
    uniforms.uBottom.value.lerp(bottom, k)
  })

  return (
    <mesh ref={dome} renderOrder={-1000} frustumCulled={false}>
      <sphereGeometry args={[40, 24, 16]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
        fog={false}
      />
    </mesh>
  )
}
