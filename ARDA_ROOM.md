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

| | Desktop | Mobile (landscape) |
|---|---|---|
| Move | `WASD` / arrows | left analog joystick (dead zone + smooth accel/release) |
| Look | mouse (click to capture) | drag the right ~58% of the screen |
| Run | hold `Shift` | hold the **RUN** button |
| Jump | `Space` | tap the **JUMP** button |
| Interact | `E` or click | contextual **E** button (appears only near an object) |
| Close panel | `Esc` | ✕ button |

On phones the controls are first-person and multi-touch: you can steer with the
left joystick and look with the right thumb at the same time, and tap RUN / JUMP
/ E without either finger interrupting the others. Held in portrait, a soft
"rotate your device" overlay suggests landscape. Look sensitivity (shared by
mouse and touch) lives in **Settings → Controls**.

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
- **Memory objects (personalization)**: the room physically reflects ARDA's real
  data, rebuilt every load from the stores (single source of truth — create makes an
  object appear, delete removes it, nothing is duplicated in storage):
  - a **desk name plate**, a **Current Project** card on a little easel (pick the
    current project in ARDA OS → Projects, or from the card's panel — persisted via
    `currentProjectId`),
  - **desk trophies** that grow with your achievement ratio and a special **ARDA ROOM
    trophy** that appears only when the ARDA ROOM project hits 100%,
  - a **Project Archive** shelf holding the 5 newest project cards with an “+N”
    archive box for older ones,
  - an **ARDA ACTIVITY** paper board on the wall showing recent activity,
  - a warm (non-neon) glint on the achievement wall when a new one is earned.
  Walk up to any of them for an **info panel** that reads the live store. All matte
  paper / metal to match the room; capped in count and gated by tier for mobile.
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
    house/       House, HouseRoomShell, HouseLighting, Window, Exterior, props +
                 rooms/ (Hallway, Living, Kitchen, Bedroom, Bathroom, Storage,
                 Balcony)
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

## Co-op multiplayer (ARDA HOME)

Two people can share the same home in real time — walk around together, run,
jump, sit, and toggle the door / living-room light / TV, all synced. It's an
opt-in layer: the game stays fully single-player until you open a home, and
**ARDA OS and all personal data remain local** (only presence + world toggles
are shared).

### Architecture

```
server/            Node WebSocket co-op server (rooms, player sync, world events)
src/network/       protocol.ts (shared typed messages) + NetworkClient (reconnect)
src/store/         useMultiplayerStore (roster + shared world state)
src/components/multiplayer/  RemotePlayer (avatar), RemotePlayers, NetworkBridge
```

The server keeps only runtime state per room — player transforms and a small
world state (`doors` / `lights` / `tv` / `curtains`). World changes are typed
events (`DOOR_TOGGLED`, `LIGHT_TOGGLED`, `TV_TOGGLED`, `CURTAIN_TOGGLED`) so the
next passes (market, film night, decoration…) extend the union without touching
the transport. Player transforms broadcast at 15 Hz and remote avatars are
interpolated client-side (no teleport jitter). Incoming data is validated and
clamped — NaN / out-of-range positions are rejected.

### Running it

```bash
npm run server   # co-op server on ws://0.0.0.0:8787
npm run dev       # client on http://localhost:5173
# or both at once:
npm run dev:all
```

The existing `npm run dev` / `npm run build` are unchanged. The server is typed
and can be checked with `npm run typecheck:server`.

### Testing across two devices on the same Wi-Fi (LAN)

1. On the machine that will host the server, find its LAN IP:
   - macOS/Linux: `ipconfig getifaddr en0` or `ip addr` (look for `192.168.x.x`)
   - Windows: `ipconfig` (IPv4 Address)
2. Start the server and the client with `--host` so they're reachable on the LAN:
   `npm run server` and `npm run dev -- --host` (or `npm run dev:all`).
3. On each phone/tablet (same Wi-Fi), open **`http://<LAN-IP>:5173`** in the
   browser — e.g. `http://192.168.1.42:5173`. Do **not** use `localhost` on the
   other device.
4. The client auto-targets the co-op server at `ws://<page-host>:8787`, so
   serving the page from the same machine that runs the server just works. If
   the server runs elsewhere, set `VITE_MULTIPLAYER_URL` in `.env` (see
   `.env.example`) — e.g. `VITE_MULTIPLAYER_URL=ws://192.168.1.42:8787`.

### Creating / joining a home

- Tap **CO-OP** in the top bar → **CREATE HOME**. You get a 6-character code
  (e.g. `ARDA42`) with a **COPY** button — that's `● Connected` when green.
- On the second device, tap **CO-OP → JOIN HOME**, enter the code, **CONNECT**.
- A wrong code shows **HOME NOT FOUND**; a lost link shows **RECONNECTING…** and
  retries automatically, restoring the room state when it comes back.
- You'll see your partner's avatar (with their name above) walking the home in
  real time, and a toast when they join or leave.

Two browser tabs on one computer work the same way (Tab 1 create, Tab 2 join)
for quick desktop testing.

### Two independent players — CUMA & ZEYNEP

Each device controls **only its own** character: the local player is **CUMA**,
the partner you see is **ZEYNEP** (and vice-versa on the other device). The
local controller (joystick / touch / WASD / mouse / RUN / JUMP / E) moves only
the local camera; `NetworkBridge` just *reads* that transform and sends it up,
and `RemotePlayer` renders the partner by interpolation — it never touches your
camera or input. Multi-touch only ever affects the local player. Sitting is
per-player local state, so CUMA on the left sofa and ZEYNEP on the right are
fully independent. Only **shared world state** (doors, lights, curtains, TV,
movie playback, snacks) is synchronized — ARDA OS, Projects, Tasks, Notes and
achievements stay private to each player.

### Movie Night 🎬

The living room is the shared social space. Walk up to the **two sofa seats**
(`Sit (left)` / `Sit (right)`) so both of you can sit, then interact with the
**TV → Watch together** to open the **Movie Night** panel (select a clip, play,
pause, end). Playback is synchronized through tiny typed world events — never by
streaming video over the network:

- `TV_MEDIA_CHANGED`, `TV_PLAY`, `TV_PAUSE`, `TV_SEEK`, `MOVIE_MODE_CHANGED`,
  `SNACK_TAKEN` (alongside the existing `DOOR_/LIGHT_/TV_/CURTAIN_TOGGLED`).
- The server stores the movie state (`media`, `playing`, `time`, `updatedAt`)
  and each client drift-corrects its own `<video>` toward the expected position,
  so pausing on one device pauses on the other within a moment.
- Starting a movie flips the room into **cinematic mode** (synced): the ceiling
  light dims, the window curtain draws, and the TV's screen light spills onto
  the sofa — no neon. Ending the movie restores normal lighting.
- Shared **snacks** (popcorn / chips / drink) sit on the coffee table; when one
  player takes a snack it disappears for both.

**Media:** no copyrighted video is bundled. Drop small clips you own into
`public/media/` (`demo-1.mp4` … see `public/media/README.md`); with no file the
TV shows a cinematic placeholder, so everything runs fine offline.

## Graphics quality

The world targets a photographic, lived-in look while staying mobile-first —
everything is procedural geometry + canvas-generated textures, with **no heavy
GLB or 4K textures bundled**. Quality scales per tier and the adaptive-quality
watchdog drops a tier if the framerate can't keep up:

- **HIGH** — PCF soft shadows, a real reflective mirror, richer environment
  lighting, denser first-person hands.
- **MEDIUM** — directional daylight without a second shadow map, lighter
  reflections.
- **LOW** — mobile-safe lighting, thinned exterior skyline, no player-sun.

Lived-in imperfection is **deterministic** (seeded) so the home looks the same
on every reload rather than re-shuffling.

## Mobile multiplayer

Both CUMA and ZEYNEP can play from separate phones/tablets over the same Wi-Fi
(see the LAN steps above). The mobile controls are unchanged — left joystick,
right-side touch look, multi-touch, RUN / JUMP, and the contextual **E** button
— and every co-op interaction (sit, TV, lights, snacks) works from the on-screen
E button. Opening a panel (Movie Night, ARDA OS) locks movement; multi-touch on
each device only ever moves that device's own character.

## AI configuration & security

- The frontend never embeds a provider API key. By default ARDA AI runs a local,
  offline engine. To use a real model, run your **own backend proxy** and set
  `VITE_AI_PROXY_URL` in `.env` (copy from `.env.example`); the browser only ever
  calls that URL. Real `.env` files are git-ignored.

## The apartment

The studio is the **study** — home of the desk, PC/ARDA OS, memory objects and
the hidden lab. A door in its (previously empty) back wall opens into a full,
walkable apartment; you move between rooms physically, never by teleport, and
every wall collides:

- **Entrance hall** — shoe rack, coat hooks with a jacket, a console with a key
  dish + mirror, runner rug, doormat.
- **Living room** — 3-seat sofa, armchair, coffee table, a wall TV + unit,
  bookshelf, floor lamp, plants, framed art.
- **Kitchen** — matte cabinets, a stone counter run with sink + cooktop + hood,
  tall fridge, a small dining set; tile floor.
- **Bedroom** — a slept-in double bed, nightstands with warm lamps, a wardrobe
  with clothes (one door ajar), dresser + mirror, laundry basket.
- **Bathroom** (ensuite) — vanity + sink + mirror, toilet, a glass shower; tile
  and ceramic, cool light.
- **Storage** — deliberately messier: metal shelving, boxes, a suitcase, broom.
- **Balcony** — decking, glass railing, a bistro set and planters.

Each room has its own materials (cloth/wood, stone/metal/tile, ceramic/glass),
its own lighting (warm bedroom, neutral kitchen/bath, lamp-lit living), and
lived-in touches. Everything is procedural — no heavy assets bundled. Real-world
scale throughout; the camera stays at eye level.

### Windows, daylight & the world outside

Every main room has a real window onto a real exterior — never a flat coloured
rectangle:

- **Reusable `Window`** — painted frame + mullions, a sill, a metal handle,
  low-cost glass (reflection + roughness + light transmission — not invisible,
  not a mirror) and per-room dressing: the living room's big sheer panels, the
  bedroom's thick drapes with a valance, the kitchen's half-lowered roller
  blind, and the bathroom's **frosted privacy** glass. The window is punched
  into the wall mesh, but the wall keeps its full collider, so the glass is
  impassable — you can't walk through it.
- **Reusable `Exterior`** — a believable view beyond the glass: a gradient sky,
  a receding road/sidewalk, low-poly building silhouettes with aerial-perspective
  haze and warm lit windows, a few trees and a street lamp, all sized to the
  opening and seeded so each skyline is stable. The **balcony** opens onto a
  wider version of the same world — a real facade + skyline + surroundings.
- **Daylight that follows your clock** — one directional "sun" rakes the whole
  apartment (soft PCF shadows on HIGH), and each window spills a tinted fill
  light into its room. By **day** it's bright and neutral; toward **evening**
  the sun lowers and warms, facades catch the sunset; at **night** the sky goes
  deep blue with stars, distant building + street lamp lights glow (city
  ambiance, no cyberpunk neon), and the rooms lean on their own warm lamps.
- **Orientation is real** — living faces south, the bedroom west, the kitchen
  east, the bathroom north; each looks onto open exterior, never into the next
  room.

Windows live in the always-on shell (so there's never a void behind the glass),
while the daylight fill lights ride in the distance-culled room groups (so they
cost nothing until you're in the room). LOW drops the apartment sun and thins
the skyline; MEDIUM adds the directional daylight; HIGH adds its PCF shadows.

**Performance**: room shells are cheap always-on boxes; each room's furniture +
lights are **distance-culled** (invisible when you're far away), on top of
three's frustum culling. The LOW/MEDIUM/HIGH tiers and mobile auto-downgrade are
unchanged, and the cull radius tightens on LOW.

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
- **Camera immersion**: eye-level first-person with velocity-based movement
  inertia (weighty accel/decel, no floaty glide), a subtle speed-scaled head-bob
  and footstep sounds; the view settles when you stop.
- **Lived-in clutter**: a hoodie over the chair, a wastebasket with crumpled
  paper, desk books + notebook + pen, a charger brick with a coiled cable,
  slippers by the bed, a throw blanket and books left on the floor — the room
  reads used, not staged.
- **Contact grounding**: soft occlusion under every large piece of furniture, on
  top of the real PCF shadows.
- **Restrained post**: bloom only crosses the threshold on genuine light sources;
  soft vignette; ACES tone mapping.
- **Optional GLTF upgrades**: `GltfProp` (`src/components/furniture/`) lets you
  drop an open-license `.glb` into `public/models/` to replace any hero object,
  with the procedural mesh as the LOW-tier / missing-file fallback. Nothing heavy
  is bundled — see `public/models/README.md` for why and how.

### First-person presence & immersion

You're not a floating camera — you're a person in the room:

- **Body**: low-poly forearms + hands (ARDA's dark hoodie sleeves) ride with the
  view, lit by the real room lights. They breathe at idle, swing while walking,
  swing harder when running, and make a short reach when you interact — no
  weapon-style animation. A soft contact shadow follows you on the floor (you
  see it under you when you look down), scaled by quality tier.
- **Movement feel**: the existing inertia/head-bob gains a very subtle lateral
  sway (a body shifting weight), a small sprint FOV, and a smooth settle when
  you stop. Camera pitch is clamped to ~±80°.
- **Sit**: walk up to the desk chair for **E · Sit** — the view eases down to a
  seated height and movement locks; **E · Stand up** returns you. (The bed keeps
  its Rest panel.)
- **Footsteps** now respond to the floor — wood, carpet (rugs), tile
  (kitchen/bath) and the balcony deck each sound different, with per-step
  variation and a louder/brisker cadence when running.
- **Audio ambience**: a barely-there environmental bed (distant air/city) tracks
  the time of day — livelier by day, quieter at night — and a light per-room
  reverb makes the tiled kitchen/bath ring a touch while the bedroom stays soft.
  All synthesized, no audio files shipped.
- **Mirror**: the bedroom mirror shows a real reflection of the room on HIGH,
  and a simple polished plane on MEDIUM/LOW to keep mobile fast.

The hands hide while a panel or cinematic owns the view, everything reads from a
tiny ref-based motion channel (no per-frame React state), and it all still obeys
the LOW/MEDIUM/HIGH tiers and mobile auto-downgrade.

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
