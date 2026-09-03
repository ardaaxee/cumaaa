import * as THREE from 'three';
import './style.css';

import { createLoop } from './core/loop.js';
import { createRenderContext } from './core/renderer.js';

import { createIntent } from './input/intent.js';
import { createKeyboardSource } from './input/keyboard.js';
import { createTouchSource } from './input/touch.js';
import { createGamepadSource } from './input/gamepad.js';

import { createCharacter } from './character/character.js';
import { createCameraRig } from './camera/cameraRig.js';
import { createDirector } from './camera/director.js';
import { MODE } from './camera/cameraModes.js';
import {
  bossRevealSequence,
  introSequence,
  perfectParrySequence,
  phaseTransitionSequence,
} from './camera/sequences.js';

import { createEnvironment } from './world/environment.js';
import { createAsterCity } from './world/asterCity.js';
import { createSkyline } from './world/skyline.js';
import { createRain } from './world/rain.js';
import { createCrowd } from './world/crowd.js';
import { createNpcSystem } from './world/npcSystem.js';
import { createCityMotion } from './world/cityMotion.js';
import { createWetSurfaceSystem } from './world/wetSurfaceSystem.js';
import { createWorldDirector } from './world/worldDirector.js';
import { createHeroMomentTrigger } from './world/heroMoment.js';
import { createAfterRainMoment } from './world/afterRainMoment.js';
import { DISTRICTS } from './world/districts.js';

import { createCombatSystem } from './combat/combatSystem.js';
import { createBossPresenter } from './combat/bossPresenter.js';
import { ATTACK, COMBAT_RULES } from './combat/attackData.js';
import { OUTCOME } from './combat/hitResolution.js';
import { applyHitStop } from './combat/timeDilation.js';
import { createImpactFx, FX } from './fx/impactFx.js';
import { createAudioManager } from './audio/audioManager.js';
import { createHud } from './ui/hud.js';

/**
 * CUMA WORLD — Aster City vertical slice.
 *
 * Boot order: render context, world, character, camera, combat, input, then the
 * single update loop. Nothing else in the project calls requestAnimationFrame.
 */

const BOSS_TRIGGER_Z = -38;
const BOSS_START = { x: 0, z: -54 };

/** Impact response, by significance. A poke must not shake the city. */
const IMPACT = {
  [OUTCOME.HIT]: { hitStop: 0.05, shake: 0.16, fov: 1.5 },
  [OUTCOME.PARRIED]: { hitStop: 0.06, shake: 0.1, fov: 1.0 },
  [OUTCOME.PERFECT_PARRIED]: { hitStop: 0.13, shake: 0.26, fov: 4.5 },
  PLAYER_ATTACK: { hitStop: 0.035, shake: 0.1, fov: 0.8 },
  COUNTER: { hitStop: 0.07, shake: 0.2, fov: 2.4 },
  POSTURE_BREAK: { hitStop: 0.16, shake: 0.34, fov: 6.0 },
};

function boot() {
  const canvas = document.querySelector('#game');
  const context = createRenderContext(canvas);
  const scene = new THREE.Scene();

  // Built before the world so every material picks it up as it is created.
  const environment = createEnvironment(context.renderer, scene);
  const city = createAsterCity(scene);
  const skyline = createSkyline(scene);
  const rain = createRain(scene);
  const crowd = createCrowd(scene);
  const npcs = createNpcSystem(scene);
  const cityMotion = createCityMotion(scene);
  const wetSurfaces = createWetSurfaceSystem(scene, {
    roadMaterials: city.roadMaterials,
    reflectionMesh: city.reflectionMesh,
  });
  const impactFx = createImpactFx(scene);
  const audio = createAudioManager();

  // Spawned facing north, up the market toward the crossroads.
  const character = createCharacter(scene, {
    startX: 0,
    startZ: 30,
    startFacing: Math.PI,
    bounds: city.bounds,
  });
  const cameraRig = createCameraRig(context.camera, character);
  cameraRig.registerColliders(city.colliders);

  const director = createDirector(cameraRig, character);

  const combat = createCombatSystem({ x: BOSS_START.x, z: BOSS_START.z, seed: 0x63756d61 });
  const bossPresenter = createBossPresenter(scene, BOSS_START);

  const hud = createHud();
  const intent = createIntent();
  const sources = [
    createKeyboardSource(intent),
    createTouchSource(intent),
    createGamepadSource(intent),
  ];

  const loop = createLoop();

  // The living world: weather, crowd mood, events, discovery and ambience.
  const world = createWorldDirector({
    scene,
    city,
    skyline,
    rain,
    crowd,
    npcs,
    cityMotion,
    wetSurfaces,
    audio,
    hud,
  });
  // The map only ever lists what has actually been found.
  const refreshMap = () =>
    hud.setDiscoveredRegions(world.discoveredRegions.map((id) => DISTRICTS[id]));
  refreshMap();
  hud.onToggleMap = (open) => {
    if (open) refreshMap();
  };

  const afterRain = createAfterRainMoment(director, world, {
    onStart: () => {
      hud.setObjective('Meridian Market · after the rain');
      hud.setCameraMode('CINEMATIC');
    },
    onEnd: () => {
      hud.setObjective('Head north through Meridian Market');
      hud.setCameraMode('SHOULDER R');
    },
  });

  // --- Session state -----------------------------------------------------
  const session = {
    /** Presentation-only time freeze; combat itself runs on its own clock. */
    hitStop: 0,
    shake: 0,
    fovPunch: 0,
    bossStarted: false,
    bossEngaged: false,
    heroParryPlayed: false,
  };

  hud.onToggleCapture = (enabled) => context.setCaptureMode(enabled);

  const heroMoment = createHeroMomentTrigger(director, skyline.spireFocus, {
    onStart: () => {
      hud.setObjective('Aster City · Crown Spire');
      hud.setCameraMode('CINEMATIC');
    },
    onEnd: () => {
      hud.setObjective('Head north through Meridian Market');
      hud.setCameraMode('SHOULDER R');
    },
  });

  // Opening shot. The player already has control while it plays.
  hud.setObjective('Meridian Market · rain');
  hud.setCameraMode('CINEMATIC');
  director.play(introSequence(city.marketCentre), {
    retainControl: true,
    onComplete: () => {
      hud.setCameraMode('SHOULDER R');
      hud.setObjective('Head north through Meridian Market');
    },
  });

  // --- Camera mode cycling ----------------------------------------------
  const CYCLE = [MODE.SHOULDER_RIGHT, MODE.SHOULDER_LEFT, MODE.WIDE, MODE.LOW_TRACK, MODE.SCENIC];
  const CYCLE_LABELS = ['SHOULDER R', 'SHOULDER L', 'WIDE', 'LOW TRACK', 'SCENIC'];
  let cycleIndex = 0;

  const cycleCamera = () => {
    if (director.isPlaying) return;
    cycleIndex = (cycleIndex + 1) % CYCLE.length;
    cameraRig.setMode(CYCLE[cycleIndex], 0.9);
    hud.setCameraMode(CYCLE_LABELS[cycleIndex]);
  };

  const onCameraKey = (event) => {
    if (event.code === 'KeyV') cycleCamera();
  };
  window.addEventListener('keydown', onCameraKey);

  const shoulderButton = document.querySelector('#shoulder');
  shoulderButton?.addEventListener('click', cycleCamera);
  const releaseShoulderButton = () =>
    shoulderButton?.removeEventListener('click', cycleCamera);

  // --- Impact presentation ----------------------------------------------
  function applyImpact(profile) {
    session.hitStop = Math.max(session.hitStop, profile.hitStop);
    session.shake = Math.max(session.shake, profile.shake);
    session.fovPunch = Math.max(session.fovPunch, profile.fov);
  }

  const bossPoint = { x: 0, y: 1.9, z: 0 };
  const bossAt = (y = 1.9) => {
    bossPoint.x = combat.bossState.x;
    bossPoint.y = y;
    bossPoint.z = combat.bossState.z;
    return bossPoint;
  };

  /**
   * Everything the combat core reports, turned into sound, light and camera.
   * The gameplay result was already decided; this layer only presents it.
   */
  combat.on((event) => {
    switch (event.type) {
      case 'anticipation':
        audio.play(event.attackId === ATTACK.HEAVY_IMPACT ? 'heavyMove' : 'anticipation');
        break;

      case 'attackActive':
        if (event.attackId === ATTACK.HEAVY_IMPACT) {
          impactFx.play(FX.GROUND_SLAM, bossAt(0.3), combat.bossState.facing);
          audio.play('impact');
          applyImpact({ hitStop: 0.04, shake: 0.24, fov: 2.0 });
        }
        break;

      case 'outcome':
        presentOutcome(event);
        break;

      case 'playerHit':
        hud.flashDamage();
        hud.setPlayerHealth(event.health);
        if (event.health <= 0) {
          // No death screen in this slice: the Warden backs off and the fight
          // resets rather than ending the session.
          hud.say('OVERWHELMED · RECOVERING');
          hud.setPlayerHealth(COMBAT_RULES.PLAYER_MAX_HEALTH);
          combat.player.health = COMBAT_RULES.PLAYER_MAX_HEALTH;
        }
        break;

      case 'playerAttackLanded':
        audio.play('playerHit');
        impactFx.play(FX.HIT, bossAt(2.2), character.state.facing);
        applyImpact(event.counter ? IMPACT.COUNTER : IMPACT.PLAYER_ATTACK);
        hud.setBossHp(event.hp);
        hud.setBossPosture(combat.bossState.posture);
        if (event.counter) hud.say('COUNTER');
        break;

      case 'attackWhiffed':
        if (event.reason === 'range') hud.say('TARGET OUT OF RANGE');
        break;

      case 'postureBreak':
        audio.play('postureBreak');
        impactFx.play(FX.POSTURE_BREAK, bossAt(2.4), combat.bossState.facing);
        bossPresenter.punch(1.0);
        applyImpact(IMPACT.POSTURE_BREAK);
        hud.say('POSTURE BROKEN · STRIKE');
        hud.setBossPosture(0);
        break;

      case 'phase':
        audio.play('phase');
        impactFx.play(FX.PHASE, bossAt(2.6), combat.bossState.facing);
        bossPresenter.punch(0.8);
        hud.setBossPhase(event.phase);
        hud.say(event.phase === 2 ? 'PHASE II · PRESSURE' : 'PHASE III · REVELATION');
        // A short contextual move, never a cutscene.
        if (!director.isPlaying) {
          director.play(phaseTransitionSequence([combat.bossState.x, 2.4, combat.bossState.z]), {
            retainControl: true,
          });
        }
        break;

      case 'defeated':
        world.clearThreat();
        world.setWardenDefeated(true);
        hud.showBoss(false);
        hud.setObjective('Encounter complete');
        cameraRig.setMode(MODE.SHOULDER_RIGHT, 1.4);
        hud.setCameraMode('SHOULDER R');
        bossPresenter.punch(1.0);
        applyImpact(IMPACT.POSTURE_BREAK);
        break;

      default:
        break;
    }
  });

  function presentOutcome(event) {
    const at = bossAt(1.9);
    switch (event.outcome) {
      case OUTCOME.PERFECT_PARRIED:
        audio.play('perfectParry');
        impactFx.play(FX.PERFECT_PARRY, at, character.state.facing);
        applyImpact(IMPACT[OUTCOME.PERFECT_PARRIED]);
        hud.say('PERFECT PARRY');
        hud.setBossPosture(combat.bossState.posture);
        playHeroParry();
        break;
      case OUTCOME.PARRIED:
        audio.play('parry');
        impactFx.play(FX.PARRY, at, character.state.facing);
        applyImpact(IMPACT[OUTCOME.PARRIED]);
        hud.say('PARRY');
        hud.setBossPosture(combat.bossState.posture);
        break;
      case OUTCOME.DODGED:
        audio.play('dodge');
        hud.say('DODGED');
        break;
      case OUTCOME.HIT:
        audio.play('impact');
        impactFx.play(FX.HIT, {
          x: character.state.position.x,
          y: 1.4,
          z: character.state.position.z,
        }, combat.bossState.facing);
        applyImpact(IMPACT[OUTCOME.HIT]);
        break;
      default:
        break;
    }
  }

  /** The M02 hero moment: the first clean parry gets a camera. */
  function playHeroParry() {
    if (session.heroParryPlayed || director.isPlaying) return;
    session.heroParryPlayed = true;
    hud.setCameraMode('CINEMATIC');
    director.play(perfectParrySequence([combat.bossState.x, 2.3, combat.bossState.z]), {
      retainControl: true,
      onComplete: () => hud.setCameraMode('BOSS FRAME'),
    });
  }

  // Cached so the HUD is only written when a bar has visibly moved.
  const shownBars = { hp: -1, posture: -1, health: -1 };

  function refreshBossBars() {
    const boss = combat.bossState;
    if (Math.abs(boss.hp - shownBars.hp) > 0.4) {
      shownBars.hp = boss.hp;
      hud.setBossHp(boss.hp);
    }
    if (Math.abs(boss.posture - shownBars.posture) > 0.4) {
      shownBars.posture = boss.posture;
      hud.setBossPosture(boss.posture);
    }
    if (Math.abs(combat.player.health - shownBars.health) > 0.4) {
      shownBars.health = combat.player.health;
      hud.setPlayerHealth(combat.player.health);
    }
  }

  function startBossEncounter() {
    session.bossStarted = true;
    bossPresenter.setVisible(true);
    hud.setObjective('Observe the Glass Warden');
    hud.setCameraMode('BOSS FRAME');
    hud.showNameCard();
    audio.play('phase');

    director.play(bossRevealSequence([BOSS_START.x, 2.4, BOSS_START.z]), {
      retainControl: true,
      onComplete: () => {
        session.bossEngaged = true;
        combat.engage();
        hud.showBoss(true);
        hud.setBossHp(combat.bossState.hp);
        hud.setBossPosture(combat.bossState.posture);
        hud.setPlayerHealth(combat.player.health);
        hud.setObjective('Read its timing · Parry or dodge');
      },
    });
  }

  // --- The single update loop -------------------------------------------
  loop.add((dt) => {
    // Hit-stop dilates gameplay time. The character and the combat core must
    // both see the *same* dilated time, or a freeze would advance the Warden's
    // attack while slowing the player's dodge window.
    //
    // The frozen portion of the frame is measured exactly rather than scaling
    // the whole frame, so the total time a hit-stop consumes does not depend on
    // how many frames it happens to span.
    const gameplayDt = applyHitStop(session, dt);

    intent.beginFrame();
    for (const source of sources) source.update(dt);

    if (hud.isMapOpen) {
      // The map pauses movement but not the world, so reopening never jars.
      intent.moveX = 0;
      intent.moveY = 0;
      intent.moveMagnitude = 0;
      intent.lookYaw = 0;
      intent.lookPitch = 0;
      intent.clearActions();
    }

    const controlEnabled = director.allowsControl && !hud.isMapOpen;

    if (controlEnabled) {
      if (intent.consume('action')) combat.requestAttack();
      if (intent.consume('parry')) combat.requestParry();
      if (intent.consume('focus')) hud.say('FIELD FOCUS · KNOWN INTEL ONLY');
    } else {
      intent.clearActions();
    }

    // Locked onto the Warden, Cuma keeps facing the camera, so circling reads as
    // a real strafe and backing off reads as a backpedal.
    const strafeMode = session.bossEngaged && combat.bossState.hp > 0;
    character.update(intent, cameraRig.yaw, gameplayDt, controlEnabled, strafeMode);

    if (!session.bossStarted && character.state.position.z < BOSS_TRIGGER_Z) {
      startBossEncounter();
    }

    // Combat runs on the same gameplay clock as the character, at a fixed
    // internal step: identical outcomes at 30 fps, at 60 fps and on an uneven
    // frame sequence.
    combat.update(gameplayDt, character.state);
    bossPresenter.update(dt, combat.bossState);

    // The district reacts to the Warden while it is actually dangerous.
    if (session.bossEngaged && combat.bossState.hp > 0) {
      world.reportThreat(combat.bossState.x, combat.bossState.z, 1);
    }

    // The world runs on real time: rain does not slow down for a hit-stop.
    world.update(dt, character.state, cameraRig.yaw);
    afterRain.update(dt, character.state);
    heroMoment.update(dt, character.state.position);
    director.update(dt);
    cameraRig.update(intent, dt);

    if (session.shake > 0) {
      session.shake = Math.max(0, session.shake - dt * 1.8);
      context.camera.position.x += (Math.random() - 0.5) * session.shake;
      context.camera.position.y += (Math.random() - 0.5) * session.shake * 0.5;
    }
    if (session.fovPunch > 0) {
      // A brief widening on impact, decayed fast so it reads as a jolt.
      session.fovPunch = Math.max(0, session.fovPunch - dt * 14);
      context.camera.fov += session.fovPunch;
      context.camera.updateProjectionMatrix();
    }

    // Posture regenerates continuously, so the bars are refreshed here rather
    // than only on events — but only when the value has actually moved, to keep
    // it off the per-frame DOM write path.
    if (session.bossEngaged) refreshBossBars();

    // The crowd, NPCs, city motion and wet surfaces are stepped by the world
    // director, which owns their update order and their distance budgets.
    impactFx.update(dt);
    rain.update(dt, character.state.position.x, character.state.position.z);

    context.render(scene);
  });

  // Development-only inspection hooks, used by the browser smoke test. Vite
  // strips this block from production builds.
  if (import.meta.env.DEV) {
    let speedPeak = 0;
    let postureMin = COMBAT_RULES.POSTURE_MAX;
    let threatPeak = 0;
    let staggerCount = 0;
    let wasStaggered = false;
    const recentOutcomes = [];
    const statesSeen = [];
    const eventStarts = [];
    world.on((type, event) => {
      if (type !== 'eventStart') return;
      eventStarts.push(event.id);
      while (eventStarts.length > 12) eventStarts.shift();
    });
    // Cumulative tallies: the rolling list above can drop entries between two
    // polls, so a test cannot count from it reliably.
    const outcomeCounts = Object.create(null);

    combat.on((event) => {
      if (event.type === 'outcome') {
        outcomeCounts[event.outcome] = (outcomeCounts[event.outcome] ?? 0) + 1;
        recentOutcomes.push(event.outcome);
        while (recentOutcomes.length > 12) recentOutcomes.shift();
      }
      if (event.type === 'state') {
        if (statesSeen[statesSeen.length - 1] !== event.state) statesSeen.push(event.state);
        while (statesSeen.length > 40) statesSeen.shift();
      }
    });

    loop.add(() => {
      speedPeak = Math.max(speedPeak, character.state.speed);
      threatPeak = Math.max(threatPeak, world.threat.intensity);
      if (session.bossEngaged) {
        postureMin = Math.min(postureMin, combat.bossState.posture);
        const staggered = combat.isStaggered;
        if (staggered && !wasStaggered) staggerCount += 1;
        wasStaggered = staggered;
      }
    });
    // Projects Cuma's chest into normalised device coordinates, so a test can
    // assert he is actually in frame rather than the shot being eyeballed.
    const probePoint = new THREE.Vector3();
    const playerOnScreen = () => {
      probePoint.set(
        character.state.position.x,
        character.state.position.y + 1.2,
        character.state.position.z,
      );
      probePoint.project(context.camera);
      return (
        probePoint.z < 1 &&
        Math.abs(probePoint.x) < 1 &&
        Math.abs(probePoint.y) < 1
      );
    };

    window.__cumaProbe = () => {
      const dx = context.camera.position.x - character.state.position.x;
      const dz = context.camera.position.z - character.state.position.z;
      const boss = combat.bossState;
      return {
        x: character.state.position.x,
        z: character.state.position.z,
        speed: character.state.speed,
        speedPeak,
        gait: character.state.gait,
        strideDistance: character.state.strideDistance,
        facing: character.state.facing,
        camDist: Math.hypot(dx, dz),
        cameraMode: cameraRig.params.shoulder,
        directorPlaying: director.isPlaying,
        heroFired: heroMoment.hasFired,
        heroParryPlayed: session.heroParryPlayed,
        aspect: context.camera.aspect,
        bossStarted: session.bossStarted,
        bossEngaged: session.bossEngaged,
        bossVisible: bossPresenter.group.visible,
        bossHp: boss.hp,
        bossPosture: boss.posture,
        bossPhase: boss.phase,
        bossState: boss.state,
        bossAttack: boss.attackId,
        bossTimer: boss.timer,
        bossDuration: boss.duration,
        bossX: boss.x,
        bossZ: boss.z,
        playerHealth: combat.player.health,
        recentOutcomes: recentOutcomes.slice(),
        outcomeCounts: { ...outcomeCounts },
        weatherState: world.weatherState,
        weatherNext: world.weather.next,
        weatherTransitioning: world.weather.isTransitioning,
        rainDensity: world.currentWeather.rainDensity,
        wetness: world.currentWeather.wetness,
        fogDensity: world.currentWeather.fogDensity,
        discoveredRegions: world.discoveredRegions.slice(),
        threatIntensity: world.threat.intensity,
        threatPeak,
        activeEvent: world.events.active?.id ?? null,
        eventStarts: eventStarts.slice(),
        afterRainPlayed: afterRain.hasFired,
        playerOnScreen: playerOnScreen(),
        mapRegionCount: document.querySelectorAll('#mapRegions li').length,
        statesSeen: statesSeen.slice(),
        postureMin,
        staggerCount,
      };
    };
    window.__cumaTeleport = (x, z) => {
      character.state.position.x = x;
      character.state.position.z = z;
    };
    window.__cumaAttack = () => combat.requestAttack();
    window.__cumaParry = () => combat.requestParry();
    window.__cumaWeather = (state) => world.requestWeather(state);
    window.__cumaSetWeather = (state) => world.weather.setImmediate(state);
    window.__cumaEvent = (id) => world.events.trigger(id, { flags: { wardenDefeated: true } });
  }

  loop.start();

  return function dispose() {
    loop.stop();
    window.removeEventListener('keydown', onCameraKey);
    releaseShoulderButton();
    for (const source of sources) source.dispose();
    hud.dispose();
    audio.dispose();
    character.dispose();
    bossPresenter.dispose();
    impactFx.dispose();
    world.dispose();
    wetSurfaces.dispose();
    cityMotion.dispose();
    npcs.dispose();
    crowd.dispose();
    rain.dispose();
    skyline.dispose();
    city.dispose();
    environment.dispose();
    context.dispose();
  };
}

boot();
