import * as THREE from 'three';

/**
 * Procedurally generated textures.
 *
 * Generated on a canvas at load time rather than shipped as files: the whole
 * build stays a few hundred kilobytes, which matters for a phone target.
 */

function createCanvas(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

/**
 * Roughness map for the road: broad damp patches with a few standing puddles.
 * Dark texels are smooth (mirror-like), so this is what makes the street read as
 * wet without a real reflection pass.
 */
export function createWetRoadRoughness(size = 512) {
  const canvas = createCanvas(size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#8c8c8c';
  ctx.fillRect(0, 0, size, size);

  // Damp sheen bands running along the street.
  for (let i = 0; i < 26; i += 1) {
    const y = Math.random() * size;
    const height = 12 + Math.random() * 70;
    const gradient = ctx.createLinearGradient(0, y, 0, y + height);
    gradient.addColorStop(0, 'rgba(40,40,40,0)');
    gradient.addColorStop(0.5, 'rgba(28,28,28,0.55)');
    gradient.addColorStop(1, 'rgba(40,40,40,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, size, height);
  }

  // Puddles: smooth cores with soft edges.
  for (let i = 0; i < 40; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 10 + Math.random() * 48;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(14,14,14,0.92)');
    gradient.addColorStop(0.7, 'rgba(30,30,30,0.4)');
    gradient.addColorStop(1, 'rgba(140,140,140,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 14);
  return texture;
}

/** Soft vertical gradient used for the reflection smears under window lights. */
export function createReflectionStreak(size = 128) {
  const canvas = createCanvas(size);
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, 'rgba(255,232,196,0.55)');
  gradient.addColorStop(0.35, 'rgba(255,214,164,0.22)');
  gradient.addColorStop(1, 'rgba(255,200,150,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Horizontal break-up so the smear does not read as a hard bar.
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 60; i += 1) {
    const y = Math.random() * size;
    ctx.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.2})`;
    ctx.fillRect(0, y, size, 1 + Math.random() * 2);
  }

  return new THREE.CanvasTexture(canvas);
}

/** A soft round falloff, used for haze cards and light glows. */
export function createGlow(size = 128) {
  const canvas = createCanvas(size);
  const ctx = canvas.getContext('2d');
  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.25)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}
