# ARDA ROOM — Personal Digital Space

An interactive, first-person **3D personal digital space** built with React Three
Fiber. Not a landing page or a demo scene — a room you walk around in, where every
major object does something real, and your data (projects, tasks, notes,
achievements, profile) persists locally between visits.

> This web app lives alongside the Python `persona` tool in this repo. The two are
> independent; see the root `README.md` for the persona tool.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

Node 18+ recommended (developed on Node 22).

## Tech stack

- **React 18 + TypeScript + Vite**
- **Three.js** via **@react-three/fiber** and **@react-three/drei**
- **@react-three/postprocessing** (bloom + vignette, disabled on low quality)
- **Zustand** (state) with `persist` middleware → localStorage
- **Framer Motion** (UI animation)
- **Tailwind CSS** (HUD / panels)

## Controls

| | Desktop | Mobile |
|---|---|---|
| Move | `WASD` / arrows (`Shift` = sprint) | left virtual joystick |
| Look | mouse (click to capture) | drag anywhere |
| Interact | `E` or click | ⊙ button |
| Close panel | `Esc` | ✕ button |

## What actually works

- **First-person controller** with AABB collision against walls and furniture.
- **Cinematic intro** (skippable, remembered via localStorage) + **real** loading
  screen tied to boot milestones (hydration → WebGL context → first frame).
- **Interaction system**: proximity + view-angle focus (no per-frame raycasting),
  a reusable trigger registry, and a central manager mapping each object to an action.
- **ARDA OS** (the workstation): Profile, Projects, Tasks, Archive, AI, Achievements,
  Stats, Settings — entered with a short camera push-in.
- **Projects**: create / delete, status, progress, tech tags — persisted.
- **Tasks**: add / complete / delete; the wall-mounted 3D board mirrors open tasks
  live; completing 10 unlocks an achievement.
- **Archive**: notes / ideas / memories with category filters — persisted.
- **ARDA AI**: offline rule-based assistant grounded in your room data; upgrades to a
  backend proxy automatically if `VITE_AI_PROXY_URL` is set. No API key in the frontend.
- **ARDA LAB — a full second 3D space**: click the odd glowing book in the bookcase;
  the hidden door mechanism plays, the view cinematically turns to the opening, and
  the passage becomes physically walkable. Walk through the corridor into **ARDA LAB**,
  a colder, more technical room with its own lighting, grid floor, server racks,
  ceiling beams and dust. Every station is real and data-driven:
  - **Project Hologram** — a rotating holographic display of your live projects (opens
    the Projects manager).
  - **Project Core** — an energy orb whose brightness/scale/spin reflect real progress
    (avg project progress + completed tasks + achievements); opens live stats.
  - **Code Terminal** — a SAFE simulated terminal (`projects`, `tasks`, `status`,
    `stats`, `achievements`, `whoami`, `help`) that only reads your store — no shell,
    filesystem or network access.
  - **ARDA AI Terminal** — the same offline/proxy AI, in the lab.
  - **Idea Wall** — holo-cards from your ideas/private notes; adding one makes a new
    card appear.
  - **Achievement Core** — 3D badges that light up as unlocked, with a particle burst
    when a new one is earned.
  - **Future Projects** — locked/unlocked roadmap slots gated by real milestones (no
    fake progress).
  - **Exit portal** — “RETURN TO ROOM”; walk back through the corridor (no teleport).
  The lab is only built once discovered (persisted via `secretUnlocked`), so it costs
  nothing until then, and obeys the same LOW/MEDIUM/HIGH quality tiers.
- **Window**: the scene outside (sky, city lights, stars) follows your **real local
  clock** — day / sunset / night.
- **Clock**: live local time + date in the HUD.
- **Music**: add your own audio files (session-local); play / pause / next / volume.
  Playback only starts from a user gesture (autoplay-safe).
- **Achievements**: fed by real progress; a 3D badge wall lights up as you unlock them.
- **Dynamic room**: creating projects, finishing tasks, unlocking achievements all
  reflect in the world and the activity feed; returning after a long absence shows
  **“Welcome back, ARDA”**.
- **Settings**: graphics tier (low / med / high), bloom, sound, volume, look
  sensitivity, and full data reset.
- **Performance**: DPR clamped per tier + device, shadows/post-fx scale with quality,
  and an **adaptive quality** watchdog drops a tier if the framerate can't keep up.
  Mobile / mid-range devices auto-start on a lower tier.
- **Resilience**: an error boundary keeps a failed render from white-screening; a
  corrupt localStorage falls back to defaults.

## Project structure

```
src/
  components/
    furniture/   Desk, Chair, Bookcase (+secret door), Bed, Decor, Details, MonitorScreen
    interaction/ PlayerController, InteractionManager, InteractableTrigger
    lab/         ArdaLab, LabShell, LabLighting, ProjectHologram, ProjectCore,
                 IdeaWall, AchievementCore, ServerRacks, LabProps
    pc/          PcOs + views/ (Projects, Tasks, Notes, AI, Achievements, Stats,
                 Settings, Profile, Music, Window, Bed, Secret, Terminal, FutureProjects)
    room/        Experience (Canvas), Scene, RoomShell, SecretGate, Lighting,
                 StudioEnvironment, PostFx, AdaptiveQuality, TaskBoardMesh,
                 WindowView, AchievementWallMesh
    system/      ErrorBoundary
    ui/          Hud, Intro, LoadingScreen, PanelHost, PanelFrame, Crosshair,
                 InteractionPrompt, MobileControls, Toast, WelcomeBack, HudClock
  config/        roomLayout, labLayout, interactables
  hooks/         useClock (clock + time-of-day)
  store/         useRoomStore (persisted), usePlayerStore, useBootStore
  systems/       interactionSystem, collisionSystem, timeSystem, audioSystem,
                 aiSystem, performanceSystem
  types/         shared domain types
  utils/         device (quality/DPR), uid
```

## AI configuration & security

- The frontend never embeds a provider API key. By default ARDA AI runs a local,
  offline engine. To use a real model, run your **own backend proxy** and set
  `VITE_AI_PROXY_URL` in `.env` (copy from `.env.example`); the browser only ever
  calls that URL. Real `.env` files are git-ignored.

## Realism

The room is lit and surfaced for a photographic, lived-in feel rather than a neon
demo:

- **Natural lighting**: a real directional "sun" through the window casts soft
  (PCF) shadows; warm tungsten ceiling + desk lamps take over toward night; ambient
  fill is neutral. Day / sunset / night shift the sun and interior balance.
- **De-neoned palette**: cyan trim replaced with painted skirting, wood, matte
  framed art and warm accents; the IBL environment is daylight/tungsten, not cyan.
- **PBR materials with imperfections**: warm oak floor with grain, knots and scuffs;
  greige plaster walls; woven wool rug; fabric (with normal maps) on the bed, chair
  and curtains; tempered-glass PC panel and window glass.
- **Fake contact AO**: soft occlusion blobs ground the large furniture (real SSAO
  isn't available on this Three version).
- **Camera immersion**: eye-level first-person with a subtle head-bob and footstep
  sounds while walking; the view settles when you stop.
- **Restrained post**: bloom only crosses the threshold on genuine light sources;
  soft vignette; ACES tone mapping.

All of this still respects the LOW/MEDIUM/HIGH tiers and the mobile auto-downgrade.

## Assets & licenses

- **No external 3D models, textures, or audio are bundled.** The entire room is built
  from Three.js primitives and procedural (canvas-generated) geometry/textures, and all
  sound is synthesized at runtime via the Web Audio API — so there are no third-party
  asset licenses to track.
- Fonts: **Inter** and **JetBrains Mono** loaded from Google Fonts (SIL Open Font
  License), with system fallbacks if unavailable.
- If you later add GLTF/GLB assets, record their licenses here.

## Known limitations / next steps

- The main JS bundle is ~1.3 MB (Three.js); could be code-split / lazy-loaded.
- ARDA LAB and the archive share one note store (separated by category in the UI).
- Music tracks are session-local (object URLs); persisting them would need IndexedDB.
- Shadows are single-light; no baked GI. A future pass could add light probes / SSAO.
- No automated test suite yet for the React/3D app.
