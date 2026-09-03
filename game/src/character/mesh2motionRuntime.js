import * as THREE from 'three';

const _box = new THREE.Box3();
const _size = new THREE.Vector3();

/**
 * Wraps a Mesh2Motion-exported character in a stable visual container.
 * The wrapper, not the imported skeleton, receives scale/floor/orientation fixes,
 * so authored animation tracks keep their original bind-space assumptions.
 */
export function prepareMesh2MotionVisual(root, {
  targetHeight = 1.82,
  headingOffset = 0,
} = {}) {
  if (!root) throw new Error('Mesh2Motion root is required');

  root.updateMatrixWorld(true);
  _box.setFromObject(root);
  _box.getSize(_size);
  if (!Number.isFinite(_size.y) || _size.y <= 1e-5) {
    throw new Error('Mesh2Motion character has no measurable height');
  }

  const wrapper = new THREE.Group();
  wrapper.name = 'cuma-mesh2motion-visual';
  const uniformScale = targetHeight / _size.y;
  wrapper.scale.setScalar(uniformScale);
  wrapper.rotation.y = headingOffset;
  wrapper.position.y = -_box.min.y * uniformScale;
  wrapper.add(root);

  root.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
    object.frustumCulled = true;
  });

  return {
    wrapper,
    animationRoot: root,
    sourceHeight: _size.y,
    scale: uniformScale,
  };
}

export function disposeImportedObject(root) {
  root?.traverse?.((object) => {
    if (!object.isMesh) return;
    object.geometry?.dispose?.();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      for (const value of Object.values(material)) {
        if (value?.isTexture) value.dispose?.();
      }
      material.dispose?.();
    }
  });
}
