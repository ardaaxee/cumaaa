import * as THREE from 'three';
import { PERFORMANCE } from './settings.js';

const REELS_ASPECT = 9 / 16;

const isMobile = () =>
  typeof navigator !== 'undefined' &&
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent ?? '');

/**
 * Renderer, camera and resize handling.
 *
 * Also owns capture mode: instead of only narrowing the FOV, it renders into a
 * true 9:16 viewport so what is composed on screen is exactly what a Reel gets.
 */
export function createRenderContext(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile(),
    powerPreference: 'high-performance',
    stencil: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.setClearColor(0x05070b, 1);
  renderer.autoClear = false;

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 620);

  let captureMode = false;
  const viewport = { x: 0, y: 0, width: 1, height: 1 };

  const pixelRatioCap = isMobile()
    ? PERFORMANCE.MAX_PIXEL_RATIO_MOBILE
    : PERFORMANCE.MAX_PIXEL_RATIO_DESKTOP;

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
    renderer.setSize(width, height, false);

    if (captureMode) {
      // Letterbox to 9:16 within whatever the window actually is.
      let frameWidth = width;
      let frameHeight = Math.round(width / REELS_ASPECT);
      if (frameHeight > height) {
        frameHeight = height;
        frameWidth = Math.round(height * REELS_ASPECT);
      }
      viewport.width = frameWidth;
      viewport.height = frameHeight;
      viewport.x = Math.round((width - frameWidth) / 2);
      viewport.y = Math.round((height - frameHeight) / 2);
    } else {
      viewport.x = 0;
      viewport.y = 0;
      viewport.width = width;
      viewport.height = height;
    }

    camera.aspect = viewport.width / viewport.height;
    camera.updateProjectionMatrix();
  }

  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  resize();

  return {
    renderer,
    camera,

    setCaptureMode(enabled) {
      captureMode = enabled;
      resize();
    },

    render(scene) {
      renderer.setScissorTest(false);
      renderer.clear();
      renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
      renderer.setScissor(viewport.x, viewport.y, viewport.width, viewport.height);
      renderer.setScissorTest(true);
      renderer.render(scene, camera);
    },

    dispose() {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      renderer.dispose();
    },
  };
}
