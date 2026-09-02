import * as THREE from 'three';

/**
 * Cuma's articulated placeholder rig.
 *
 * Bone names match a standard humanoid so that when real GLB animation lands the
 * clips can retarget onto these same joints — the rest of the game keeps talking
 * to `rig.bones.*` and never learns whether a pose came from code or a clip.
 */

// Cuma reads against a dark wet city, so the coat carries real value rather
// than sitting at near-black where it would vanish into the road.
const SKIN = 0xc09274;
const COAT = 0x39445a;
const COAT_DARK = 0x28303f;
const TRIM = 0x55617a;

const makeMaterial = (color, roughness = 0.62, metalness = 0.06) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

/** Adds a box mesh whose top sits at the joint origin and hangs down `length`. */
function addLimbMesh(bone, width, length, depth, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, length, depth), material);
  mesh.position.y = -length / 2;
  mesh.castShadow = true;
  bone.add(mesh);
  return mesh;
}

function addJoint(parent, name, x, y, z, bones) {
  const joint = new THREE.Object3D();
  joint.name = name;
  joint.position.set(x, y, z);
  parent.add(joint);
  bones[name] = joint;
  return joint;
}

export function createCharacterRig() {
  const coat = makeMaterial(COAT);
  const coatDark = makeMaterial(COAT_DARK);
  const trim = makeMaterial(TRIM, 0.45, 0.28);
  const skin = makeMaterial(SKIN, 0.72, 0.0);
  const materials = [coat, coatDark, trim, skin];

  const root = new THREE.Group();
  root.name = 'cuma';

  const bones = {};

  // The whole body hangs off hips; lean and land-dip are applied here.
  const hips = addJoint(root, 'hips', 0, 0.92, 0, bones);
  addLimbMesh(hips, 0.42, 0.26, 0.28, coatDark).position.y = -0.08;

  const spine = addJoint(hips, 'spine', 0, 0.1, 0, bones);
  const chest = addJoint(spine, 'chest', 0, 0.26, 0, bones);
  // Tall enough to meet the neck: a shorter torso leaves a visible gap under
  // the head, which reads as a floating head from the shoulder camera.
  const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.56, 0.29), coat);
  chestMesh.position.y = 0.24;
  chestMesh.castShadow = true;
  chest.add(chestMesh);

  // A long coat panel: it catches the rain light and reads as silhouette.
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.34), coatDark);
  skirt.position.y = -0.3;
  skirt.castShadow = true;
  bones.coatTail = skirt;
  hips.add(skirt);

  const neck = addJoint(chest, 'neck', 0, 0.5, 0, bones);
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.12, 10), skin);
  neckMesh.position.y = 0.02;
  neck.add(neckMesh);

  const head = addJoint(neck, 'head', 0, 0.1, 0, bones);
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.165, 18, 14), skin);
  headMesh.position.y = 0.12;
  headMesh.scale.set(1, 1.1, 1.02);
  headMesh.castShadow = true;
  head.add(headMesh);

  // A raised coat collar at the base of the neck, not at the waist.
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.19, 0.15, 12), trim);
  collar.position.y = 0.49;
  chest.add(collar);
  bones.collar = collar;

  for (const side of [-1, 1]) {
    const key = side < 0 ? 'L' : 'R';
    const shoulder = addJoint(chest, `shoulder${key}`, side * 0.26, 0.4, 0, bones);
    const upperArm = addJoint(shoulder, `upperArm${key}`, 0, 0, 0, bones);
    addLimbMesh(upperArm, 0.15, 0.34, 0.16, coat);
    const lowerArm = addJoint(upperArm, `lowerArm${key}`, 0, -0.34, 0, bones);
    addLimbMesh(lowerArm, 0.125, 0.32, 0.135, coat);
    const hand = addJoint(lowerArm, `hand${key}`, 0, -0.32, 0, bones);
    const handMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.1), skin);
    handMesh.position.y = -0.06;
    hand.add(handMesh);

    const upperLeg = addJoint(hips, `upperLeg${key}`, side * 0.13, -0.06, 0, bones);
    addLimbMesh(upperLeg, 0.18, 0.44, 0.19, coatDark);
    const lowerLeg = addJoint(upperLeg, `lowerLeg${key}`, 0, -0.44, 0, bones);
    addLimbMesh(lowerLeg, 0.155, 0.42, 0.16, coatDark);
    const foot = addJoint(lowerLeg, `foot${key}`, 0, -0.42, 0, bones);
    const footMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.28), trim);
    footMesh.position.set(0, -0.045, 0.05);
    foot.add(footMesh);
  }

  return {
    root,
    bones,
    /** Baseline hip height, restored every frame before the pose is applied. */
    hipRestHeight: hips.position.y,
    dispose() {
      root.traverse((object) => {
        if (object.isMesh) object.geometry.dispose();
      });
      for (const material of materials) material.dispose();
    },
  };
}
