import * as THREE from 'three';

/**
 * Pre-allocated scratch objects.
 *
 * The performance budget forbids per-frame `new THREE.Vector3()`. Systems borrow
 * from this pool instead. Each name is owned by exactly one system so borrowed
 * values never collide across subsystems within a frame.
 */
export const scratch = {
  // Camera rig. The locomotion model works on plain numbers and the director
  // works on scalar offsets, so neither needs a vector here.
  camDesired: new THREE.Vector3(),
  camOffset: new THREE.Vector3(),
  camLook: new THREE.Vector3(),
  camRayDir: new THREE.Vector3(),
};

export const sharedRaycaster = new THREE.Raycaster();
