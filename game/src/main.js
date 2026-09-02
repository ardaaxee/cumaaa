import * as THREE from 'three';
import './style.css';

import { createLoop } from './core/loop.js';
import { createRenderContext } from './core/renderer.js';
import { COMBAT } from './core/settings.js';

import { createIntent } from './input/intent.js';
import { createKeyboardSource } from './input/keyboard.js';
import { createTouchSource } from './input/touch.js';
import { createGamepadSource } from './input/gamepad.js';

import { createCharacter } from './character/character.js';
import { createCameraRig } from './camera/cameraRig.js';
import { createDirector } from './camera/director.js';
import { MODE } from './camera/cameraModes.js';
import { bossRevealSequence, introSequence } from './camera/sequences.js';

import { createEnvironment } from './world/environment.js';
import { createAsterCity } from './world/asterCity.js';
import { createSkyline } from './world/skyline.js';
import { createRain } from './world/rain.js';
import { createCrowd } from './world/crowd.js';
import { createHeroMomentTrigger } from './world/heroMoment.js';

import { createBoss } from './combat/boss.js';
import { createHud } from './ui/hud.js';

/**
 * CUMA WORLD — Aster City vertical slice.
 *
 * Boot order: render context, world, character, camera, input, then the single
 * update loop. Nothing else in the project calls requestAnimationFrame.
 */
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
  const boss = createBoss(scene);

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

  const hud = createHud();
  const intent = createIntent();
  const sources = [
    createKeyboardSource(intent),
    createTouchSource(intent),
    createGamepadSource(intent),
  ];

  const loop = createLoop();

  // --- Session state -----------------------------------------------------
  const session = {
    hitStop: 0,
    parryWindow: 0,
    shake: 0,
    bossEngaged: false,
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

  // --- Gameplay actions --------------------------------------------------
  function performAttack() {
    if (!boss.state.started || boss.state.hp <= 0) return;
    const dx = character.state.position.x - boss.group.position.x;
    const dz = character.state.position.z - boss.group.position.z;
    if (Math.hypot(dx, dz) > COMBAT.ATTACK_RANGE) {
      hud.say('TARGET OUT OF RANGE');
      return;
    }
    const change = boss.damage(COMBAT.ATTACK_DAMAGE);
    hud.setBossHp(boss.state.hp);
    session.hitStop = COMBAT.HIT_STOP;
    session.shake = COMBAT.HIT_SHAKE;

    if (change?.phase === 2) {
      hud.setBossPhase(2);
      hud.say('PHASE II · PRESSURE');
    } else if (change?.phase === 3) {
      hud.setBossPhase(3);
      hud.say('PHASE III · REVELATION');
    }
    if (boss.state.hp <= 0) {
      hud.showBoss(false);
      hud.setObjective('Encounter complete');
      cameraRig.setMode(MODE.SHOULDER_RIGHT, 1.4);
      hud.setCameraMode('SHOULDER R');
    }
  }

  function startBossEncounter() {
    boss.start();
    session.bossEngaged = false;
    hud.setObjective('Observe the Glass Warden');
    hud.setCameraMode('BOSS FRAME');
    director.play(bossRevealSequence([boss.group.position.x, 2.4, boss.group.position.z]), {
      retainControl: true,
      onComplete: () => {
        session.bossEngaged = true;
        hud.showBoss(true);
        hud.setBossHp(boss.state.hp);
        hud.setObjective('Read its timing · Parry or dodge');
      },
    });
  }

  // --- The single update loop -------------------------------------------
  loop.add((dt) => {
    // Hit-stop scales gameplay time only; the camera, rain and input keep real
    // time so the freeze reads as impact rather than as a stutter.
    let gameplayDt = dt;
    if (session.hitStop > 0) {
      session.hitStop -= dt;
      gameplayDt = dt * 0.08;
    }

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
      if (intent.consume('action')) performAttack();
      if (intent.consume('parry')) {
        session.parryWindow = COMBAT.PARRY_WINDOW;
        hud.say('PARRY WINDOW');
      }
      if (intent.consume('focus')) hud.say('FIELD FOCUS · KNOWN INTEL ONLY');
    } else {
      intent.clearActions();
    }
    session.parryWindow = Math.max(0, session.parryWindow - dt);

    // Locked onto the Warden, Cuma keeps facing the camera, so circling reads as
    // a real strafe and backing off reads as a backpedal.
    const strafeMode = session.bossEngaged && boss.state.hp > 0;
    character.update(intent, cameraRig.yaw, gameplayDt, controlEnabled, strafeMode);

    if (!boss.state.started && character.state.position.z < COMBAT.BOSS_TRIGGER_Z) {
      startBossEncounter();
    }
    boss.update(gameplayDt, character.state.position, session.bossEngaged);

    heroMoment.update(dt, character.state.position);
    director.update(dt);
    cameraRig.update(intent, dt);

    if (session.shake > 0) {
      session.shake = Math.max(0, session.shake - dt * 1.8);
      context.camera.position.x += (Math.random() - 0.5) * session.shake;
      context.camera.position.y += (Math.random() - 0.5) * session.shake * 0.5;
    }

    rain.update(dt, character.state.position.x, character.state.position.z);
    crowd.update(dt, character.state.position.x, character.state.position.z);

    context.render(scene);
  });

  // Development-only inspection hooks, used by the browser smoke test. Vite
  // strips this block from production builds.
  if (import.meta.env.DEV) {
    let speedPeak = 0;
    loop.add(() => {
      speedPeak = Math.max(speedPeak, character.state.speed);
    });
    window.__cumaProbe = () => {
      const dx = context.camera.position.x - character.state.position.x;
      const dz = context.camera.position.z - character.state.position.z;
      // How far the camera sits off the character's screen centre line.
      const forwardX = Math.sin(cameraRig.yaw);
      const forwardZ = Math.cos(cameraRig.yaw);
      const lateral = Math.abs(dx * forwardZ - dz * forwardX);
      return {
        x: character.state.position.x,
        z: character.state.position.z,
        speed: character.state.speed,
        speedPeak,
        gait: character.state.gait,
        strideDistance: character.state.strideDistance,
        facing: character.state.facing,
        camDist: Math.hypot(dx, dz),
        shoulderOffset: lateral,
        cameraMode: cameraRig.params.shoulder,
        directorPlaying: director.isPlaying,
        heroFired: heroMoment.hasFired,
        aspect: context.camera.aspect,
        bossStarted: boss.state.started,
        bossVisible: boss.group.visible,
        bossHp: boss.state.hp,
      };
    };
    window.__cumaTeleport = (x, z) => {
      character.state.position.x = x;
      character.state.position.z = z;
    };
    window.__cumaAttack = () => performAttack();
  }

  loop.start();

  return function dispose() {
    loop.stop();
    window.removeEventListener('keydown', onCameraKey);
    releaseShoulderButton();
    for (const source of sources) source.dispose();
    hud.dispose();
    character.dispose();
    boss.dispose();
    crowd.dispose();
    rain.dispose();
    skyline.dispose();
    city.dispose();
    environment.dispose();
    context.dispose();
  };
}

boot();
