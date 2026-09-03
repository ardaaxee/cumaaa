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
  combat/      the Warden's brain, move data, hit resolution, combat clock
  fx/          pooled impact effects
  audio/       the single AudioContext and its synthesised cues
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

## Combat

### The Glass Warden

`src/combat/bossBrain.js` is a state machine over plain numbers — no THREE, no
DOM, no wall clock — so the whole encounter can be simulated in a test. States:

```
IDLE → APPROACH → ANTICIPATION → ATTACK_ACTIVE → RECOVERY
                       ↑                              │
                       └──────── follow-up ───────────┘
STAGGER            on posture break
PHASE_TRANSITION   on a health gate
```

The Warden can never enter `ATTACK_ACTIVE` without having played
`ANTICIPATION` first, and always leaves it through `RECOVERY`. Tests enforce
both, in the unit suite and again in the browser.

### Move set

Three attacks, all defined as data in `src/combat/attackData.js` — the state
machine holds no tuning numbers of its own:

| Attack | Wind-up | Answer |
| --- | --- | --- |
| **Wide Sweep** | 0.78s, shards swing out wide and level | dodge, or parry |
| **Heavy Impact** | 1.12s, everything gathers up and inward | distance, or dodge — **cannot be parried** |
| **Forward Pressure** | 0.52s, shards form a spear and it lunges | side dodge, or parry |

Each wind-up gives the shard ring a distinct silhouette, so the three read apart
before the active window opens. Danger is communicated by animation, sound and
light — there are no telegraph decals on the ground.

### Attack selection

`selectAttack` filters by distance, cooldown and phase, suppresses whatever was
used recently, and picks from what remains with a **seeded** generator. It runs
only when a new decision is needed — on entering a wind-up — never per frame,
and never through `Math.random`. A test asserts `Math.random` is not called once
across a sixty-second fight.

### Parry and dodge

A parry press opens a 0.32s window; the first 0.13s of it is *perfect*. So
pressing at the last moment is perfect, pressing early still holds, and pressing
too early means the window has already shut. One press answers one attack.

A perfect parry cancels the attack into an extended recovery, costs the Warden
real posture, and opens a counter window. An ordinary parry only nudges it.

The dodge is M01's, unchanged: a 0.42s burst with an evade window from 0.06s to
0.30s. Invulnerability is that window only, never the whole dodge. Circle,
`Right Shift` and the on-screen `○` all run the same code.

### Hit resolution

`resolveAttack` is the one authoritative place an attack is answered, and it is
a pure function of two snapshots. It returns exactly one of `HIT`, `DODGED`,
`PARRIED`, `PERFECT_PARRIED` or `MISS`. Each attack instance resolves at most
once. Gameplay decides the outcome; the presentation layer reads it and never
re-decides it.

### Posture

Bounded 0–100. Ordinary hits barely dent it; perfect parries and counters landed
during recovery take it down. At zero the Warden staggers for 1.65s, then
recovers its composure at 55% — it is not a stun-lockable NPC.

### Phases

Phase two and three do not simply speed the same attacks up. They shorten the
Warden's *own* recovery, raise approach pressure and add follow-up chains (up to
two in phase two, three in phase three). Wind-ups stay above 85% of their
phase-one length, so the tells remain readable at the hardest point of the
fight.

### Combat clock

M01 mixed clocks: the character advanced on hit-stop-scaled time while the parry
window counted down on wall time. Everything combat now runs through one
accumulator at a fixed 120 Hz step (`src/combat/combatClock.js`), fed the same
dilated gameplay time as the character. Hit-stop splits each frame into its
frozen and free parts, so a freeze costs exactly its own duration however many
frames it spans.

The result is tested directly: the same logical timeline — including a parry
expressed at the same moment — produces the same outcomes at 60 fps, at 30 fps
and on an irregular bounded frame sequence.

### Impact feel

Conveyed through anticipation and recovery animation, a micro hit-stop, a camera
impulse, a brief FOV punch, pooled impact VFX and a distinct audio voice per
event — never through gore. Response is scaled to significance: a poke barely
registers, a perfect parry or a posture break lands hard.

`src/audio/audioManager.js` owns the only `AudioContext` in the project, created
lazily on the first gesture. Every cue is its own synthesised voice rather than
one beep retuned.

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
- Impact effects come from a fixed pool; a long fight allocates nothing.
- The Warden picks attacks only when a decision is needed, from a seeded
  generator — never per frame and never from `Math.random`.
- Attack history is bounded; audio voices are capped.
- Every subsystem returns a `dispose()` that removes the listeners it added.
- Delta is clamped, so at very low frame rates the game runs in slow motion
  rather than tunnelling.

## Testing

`npm test` covers the pure logic: movement, gait selection, dodge, lean, strafe
mode, camera mode blending, sequence sampling, the input mapping, and the whole
combat core — state-machine ordering, hit resolution, parry and perfect-parry
windows, posture bounds, phase gates, deterministic attack selection, and
frame-rate equivalence at 60 fps, 30 fps and on an irregular frame sequence.

Rendering and the encounter end-to-end are verified separately with a Playwright
pass over desktop and two phone viewports, which plays the fight: it waits for a
wind-up, parries inside the perfect window, and checks the posture break, the
stagger and the hero moment.
