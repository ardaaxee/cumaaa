# CUMA ROOM — public story game

## Product direction

Replace the private couple-home premise with a public exploration game with a
fictional cast. Keep the existing lightweight house and optional two-player
co-op as the prototype. Steam, Play Store and PlayStation are long-term release
targets, not supported or published platforms in this build.

## Implemented foundation

- Atlas Varen: restoration specialist; Mira Soren: sound archivist.
- Characters have their own IDs, names, roles and descriptions. These are
  fictional biographies, not implemented character abilities or quests.
- Character choice is saved on the device and does not depend on the player's
  display name or on being host/guest. Both players may choose the same character.
- The profile menu exposes the choice. Selection is locked during a shared
  session or reconnect to avoid peers seeing conflicting appearances.
- New guest/account fallbacks use Player. Existing player-chosen account names
  and personal saves are not erased. Legacy appearance IDs normalize on input.
- No extra 3D assets, lights, per-frame state updates, or network tick rate changes.

Deploy the updated client and server together. Old servers do not understand the
new Atlas/Mira IDs and would fall back to their old default appearance. The new
server accepts old IDs, but this is not full mixed-version compatibility.

## Next playable milestone: The Unsent Recording

Proposed opening: the player arrives at an apartment being restored. A recording
on the living-room TV ends with a sound from the balcony. Investigating the
balcony reveals a maintenance note pointing to a missing market delivery.

Build one 10-minute chapter before expanding the world:

1. Arrive, learn movement/interact, find the recording.
2. Play the clue through the existing TV interaction.
3. Inspect a balcony object and unlock the next objective.
4. Save chapter progress; resume without duplicating rewards or clues.

Use explicit objective states and stable clue IDs. Keep personal progress
separate from shared TV/door state. Decide the shared completion rule before
implementing co-op chapter progress. Do not repurpose the existing project/task
store into quests or overwrite users' notes.

## Delivery order

| Stage | Scope | Exit check |
| --- | --- | --- |
| Character foundation | Fictional cast and independent selection | Two clients retain their selected character after rejoin |
| Playable chapter | Opening, objectives, recording clue, balcony, save/resume | Complete from fresh save; reload resumes correctly |
| Public-session readiness | Real auth/Google integration, server identity validation, session abuse limits | Unauthorized identity claims rejected; reconnect preserves intended session |
| Connected interactions | Film synchronization, market delivery, bathroom interactions tied to chapter | Shared actions agree on both clients; private progress remains separate |
| Production readiness | Performance budget, controller/accessibility, settings, recovery and persistence | Target-device sessions meet agreed performance and stability checks |
| Platform releases | Platform-specific builds, developer access and store requirements | Verify each platform separately; no release claim before approval/build validation |

## Baseline observations and limits

- Source baseline: `043d2ca`, `claude/cuma-room-3d-space-ggl9fg`.
- Existing server accepts create/join requests with a supplied display name and
  no account token validation in those handlers. Public auth integration needs
  its own security milestone; local/demo auth is not production authentication.
- Existing co-op capacity is two players. Public availability does not imply an
  MMO or increased room capacity.
- Dependency installation reports a Three.js/postprocessing peer-version
  mismatch. The build passes, but HIGH/ULTRA visual effects need runtime checks
  before public release. This change does not upgrade rendering dependencies.
- Current production main bundle: about 1.596 MB, 451.53 kB gzip; this is a
  measured size, not a before/after performance comparison.
- Tests completed: client production build, server typecheck, catalogue and
  legacy/invalid ID cases, live two-WebSocket join/rejoin character checks.
- Not validated: real phone FPS, controller support, rendered visual review,
  full gameplay, public deployment, native builds, console compatibility.

## Quick acceptance checks

1. Fresh guest login defaults to Player, never a personal character name.
2. Select Mira in Characters; reload and verify the selection remains.
3. Change the account display name to a name beginning with Z; the selected
   character must not change.
4. Join from two clients as Atlas and Mira; verify each remote appearance.
5. Disconnect/rejoin; selection and shared state remain consistent. Character
   selection remains disabled until leaving the session.
6. On Redmi 10 5G-class hardware, compare the same route at LOW/AUTO before and
   after. Target sustained 30 FPS; record frame times and reconnect results.

Automated checks: `npm run test:characters`, `npm run build`,
`npm run typecheck:server`.
