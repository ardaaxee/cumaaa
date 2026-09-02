# CUMA WORLD — Aster City vertical slice

Third-person cinematic open-world prototype. Web-based (Three.js + Vite) so it
runs on a phone and on Replit, and so development clips can be captured for
Instagram directly from the browser.

CUMA WORLD is entirely original. No characters, maps, UI, animation, story or
assets are taken from any other game.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm test         # unit tests for the movement, camera and input logic
```

## Controls

| Action | Gamepad | Keyboard | Touch |
| --- | --- | --- | --- |
| Move | Left stick | `WASD` | Left joystick |
| Camera | Right stick | — | Right half of screen |
| Sprint | `L3` | `Shift` | Push the stick to its edge |
| Dodge | `Circle` / `B` | `Right Shift` | `○` |
| Parry | `L1` | `Q` | `L1` |
| Action / attack | `R1` | `E` | `R1` / `□` |
| Field focus | `Triangle` / `Y` | `F` | `△` |
| Jump | `Cross` / `A` | `Space` | `✕` |
| Camera mode | — | `V` | `CAM` |
| Map | — | `M` | `MAP` |
| 9:16 capture | — | `C` | `CINE` |

Every input source writes into one shared intent struct (`src/input/intent.js`)
and gameplay reads only that. There is deliberately no separate mobile gameplay
path — a mobile dodge runs exactly the same code as a DualSense `Circle` press.

## Architecture

```
src/
  core/        one rAF loop, tuning constants, pure math, scratch pool, renderer
  input/       intent struct + keyboard / touch / gamepad sources
  character/   locomotion model, rig, animation drivers
  camera/      camera modes, rig, cinematic director, sequences
  world/       Aster City, skyline, rain, crowd, environment, hero moment
  combat/      The Glass Warden
  ui/          HUD
```

### Movement

`src/character/locomotionState.js` is the movement model. It is free of Three.js
and of the DOM — it works on plain numbers, so the feel of the character is unit
tested without a renderer. It provides acceleration and braking, analog
walk/jog/sprint, speed-dependent turn rates, body lean from acceleration and
turning, distance-based stride phase, a real timed dodge with i-frames, jump and
landing recovery, and idle breathing.

Body facing follows the direction of travel in free movement. In **strafe mode**
— used automatically while locked onto the Warden — the body keeps facing the
camera, which is what makes backpedalling and strafing sustained states with
their own speed caps rather than momentary artefacts.

### Animation

`src/character/animationDriver.js` is the seam. Every driver implements
`update(rig, locomotionState, dt)`:

- `createProceduralAnimator()` — poses the placeholder rig from code. Used now.
- `createClipAnimator(rig, clips)` — drives the same rig from an
  `AnimationMixer`. Used when authored GLB clips exist.

`computeClipWeights(state)` derives the blend weights and is shared by both, so
swapping to real animation is a one-line change in `createAnimationDriver` and
nothing else in the game moves. Rig joints use standard humanoid names so clips
can retarget onto them.

### Camera

A camera mode (`src/camera/cameraModes.js`) is only a parameter set: distance,
height, shoulder offset, FOV, pitch bias, lag rates, sway. Switching modes never
assigns a camera position — it retargets those numbers and the rig blends toward
them, which is what structurally prevents a camera teleport.

Modes: `SHOULDER_RIGHT`, `SHOULDER_LEFT`, `WIDE`, `SCENIC`, `LOW_TRACK`,
`BOSS_FRAME`.

The rig (`cameraRig.js`) adds lagged follow, speed-based framing, sprint FOV,
hand-held sway and collision avoidance that raycasts a small registered collider
list rather than scanning the scene.

### Cinematics

`src/camera/director.js` never assigns a camera transform either. It drives the
rig's additive offsets and asks it to change mode, so a cinematic is the same
camera, moved. There is no cut, no letterbox and no fade hiding a hand-off, and
the player keeps walking throughout.

Sequences are keyframe timelines in `src/camera/sequences.js`. Each starts and
ends at zero offset in a gameplay mode — a test enforces this — so control comes
back exactly where the player expects it. `alignYaw` on the closing keyframes
pulls the camera's resting yaw behind wherever the character is actually
heading (movement matching).

### Aster City hero moment

Triggered once when Cuma reaches the Meridian Market crossroads. About ten and a
half seconds: gameplay shoulder → the rig drifts off the shoulder → a slow orbit
opens the skyline and lands the Crown Spire in frame → the rig drops low and
tracks him → it settles back behind him and gameplay continues. Composed to read
in 9:16; `CINE` renders a true 9:16 viewport, not just a narrower FOV.

## Performance notes

- Exactly one `requestAnimationFrame` loop, in `src/core/loop.js`. No other
  module may call it.
- No per-frame allocation on the hot path: shared scratch vectors live in
  `src/core/scratch.js`.
- Camera collision raycasts a registered collider list, never the whole scene.
- Crowd updates are bounded to a fixed number of agents per frame; each catches
  up on the time actually elapsed since it was last touched, and distant agents
  are parked.
- Windows, reflections, crowd and skyline are instanced.
- Device pixel ratio is capped, lower on mobile.
- Every subsystem returns a `dispose()` that removes the listeners it added.
- Delta is clamped, so at very low frame rates the game runs in slow motion
  rather than tunnelling.

## Testing

`npm test` covers the pure logic: movement, gait selection, dodge, lean, strafe
mode, camera mode blending, sequence sampling, and the input mapping. Rendering
is verified separately with a Playwright pass over desktop and two phone
viewports.
