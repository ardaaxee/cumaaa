# CUMA WORLD — Mesh2Motion Character Pipeline

This branch integrates CUMA WORLD with GLB/GLTF packages exported from Mesh2Motion.

## Runtime contract

CUMA WORLD keeps a stable gameplay anchor for Cuma. The procedural placeholder is only a visual child of that anchor. When a valid Mesh2Motion package is loaded, the imported rig becomes the visual child while locomotion, combat, camera tracking and world position continue to use the same authoritative state.

A failed download, invalid GLB, empty scene or incomplete locomotion clip set leaves the procedural placeholder active.

## Required locomotion clip ids

- idle
- walk_fwd
- jog_fwd
- sprint_fwd
- walk_bwd
- strafe_l
- strafe_r
- dodge
- jump
- land

Common Mesh2Motion-style names such as `Walk Forward`, `Sprint`, `Strafe Left` and `Landing` are normalized automatically.

The manifest already knows future combat/traversal ids including `parry`, `perfect_parry`, `attack_light`, `attack_heavy`, `hit_front`, `hit_left`, `hit_right`, `vault`, `mantle_low` and `mantle_high`.

## Build configuration

The runtime makes no network request unless a model URL is explicitly configured.

Example environment variables:

```env
VITE_CUMA_CHARACTER_URL=/assets/characters/cuma/cuma.glb
VITE_CUMA_ANIMATION_URLS=/assets/characters/cuma/locomotion.glb,/assets/characters/cuma/combat.glb
VITE_CUMA_CHARACTER_HEIGHT=1.82
VITE_CUMA_CHARACTER_HEADING=0
```

The main model may contain clips itself. Additional GLBs are merged into the clip library without overwriting an already-present normalized clip id.

## Mesh2Motion authoring flow

1. Import the chosen Cuma GLB/GLTF into Mesh2Motion.
2. Choose/fit the humanoid skeleton.
3. Preview animations on the target character.
4. Export the rigged model and selected retargeted animations as GLB/GLTF.
5. Place the exported files under the CUMA WORLD asset directory or another explicitly configured host.
6. Build/run CUMA WORLD with the environment variables above.

Mesh2Motion exports retargeted animation clips inside GLB and normalizes spaces in clip names to underscores. CUMA WORLD performs an additional compatibility-name pass at load time.

## Fallback guarantee

Do not delete `proceduralAnimator.js` or `characterRig.js`. They remain the zero-network fallback, smoke-test representation and recovery path when authored assets are incomplete.

## Source project

Mesh2Motion/mesh2motion-app is MIT licensed. Its repository documents the included 3D art/rig/animation assets as CC0. Preserve the upstream license notices when redistributing upstream assets directly.
