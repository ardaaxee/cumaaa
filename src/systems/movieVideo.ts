import * as THREE from 'three'

// A single shared, hidden <video> element + THREE.VideoTexture used by the
// Living-room TV. Created lazily so nothing is allocated until a movie starts.
// Playback is driven by the synced movie state (see MovieController); this
// module only owns the element and texture.

let video: HTMLVideoElement | null = null
let texture: THREE.VideoTexture | null = null

export function getMovieVideo(): HTMLVideoElement {
  if (video) return video
  const el = document.createElement('video')
  el.crossOrigin = 'anonymous'
  el.playsInline = true
  el.preload = 'auto'
  el.loop = false
  el.style.display = 'none'
  document.body.appendChild(el)
  video = el
  return el
}

export function getMovieTexture(): THREE.VideoTexture {
  if (texture) return texture
  const t = new THREE.VideoTexture(getMovieVideo())
  t.colorSpace = THREE.SRGBColorSpace
  texture = t
  return t
}

// Attempts play; if the browser blocks autoplay (remote client receiving a
// network PLAY without a gesture), retry muted so the picture still runs.
export function tryPlay(el: HTMLVideoElement): void {
  const p = el.play()
  if (p && typeof p.then === 'function') {
    p.catch(() => {
      el.muted = true
      el.play().catch(() => {
        /* still blocked — stays paused; user can tap play again */
      })
    })
  }
}
