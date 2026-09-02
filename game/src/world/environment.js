import * as THREE from 'three';

/**
 * A generated environment map for image-based lighting.
 *
 * Without one, metallic materials have nothing to reflect and render black —
 * which is exactly what happened to the Glass Warden and to the wet road. This
 * builds a small equirectangular sky on a canvas (overcast blue above, warm
 * city bounce below) and pre-filters it once at load.
 *
 * It is also what supplies the "controlled reflections" on the street: the road
 * reflects this sky rather than a real-time reflection pass, which no phone
 * would thank us for.
 */
export function createEnvironment(renderer, scene) {
  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Vertical gradient: cool overcast sky down to a warm sodium-lit street.
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0.0, '#2b3c55');
  sky.addColorStop(0.45, '#3d526e');
  sky.addColorStop(0.55, '#1d2530');
  sky.addColorStop(1.0, '#2a2119');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Scattered warm highlights around the horizon stand in for lit windows, so
  // reflective surfaces pick up city colour instead of a flat wash.
  for (let i = 0; i < 26; i += 1) {
    const x = Math.random() * width;
    const y = height * 0.5 + (Math.random() - 0.35) * height * 0.22;
    const radius = 8 + Math.random() * 26;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, 'rgba(255,196,132,0.5)');
    glow.addColorStop(1, 'rgba(255,196,132,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const target = pmrem.fromEquirectangular(texture);

  scene.environment = target.texture;

  texture.dispose();
  pmrem.dispose();

  return {
    texture: target.texture,
    dispose() {
      scene.environment = null;
      target.dispose();
    },
  };
}
