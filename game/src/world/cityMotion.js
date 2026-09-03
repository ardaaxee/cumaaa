import * as THREE from 'three';
import { createRandom, range } from '../core/random.js';
import { createGlow } from './textures.js';

/**
 * Movement in the parts of Aster City the player cannot reach.
 *
 * Distant road traffic, a light-rail line running along the Northline viaduct,
 * and slow aircraft beacons over the Crown District. All of it is far away and
 * all of it is cheap: instanced quads and additive sprites on fixed paths, no
 * physics, no AI, and nothing the player will ever drive.
 *
 * Its only job is that the city is never still.
 */

const ROAD_LIGHTS = 26;
const TRANSIT_CARS = 6;

/** The elevated line the trains run on, in world space. */
const TRANSIT_LINE = { z: -104, y: 13.5, fromX: -190, toX: 40, speed: 21 };

/** Two distant roads, one crossing the view, one running away from it. */
const ROADS = [
  { z: -78, y: 1.2, fromX: -150, toX: 150, speed: 15, warm: true },
  { z: -128, y: 1.2, fromX: 150, toX: -150, speed: 12, warm: false },
];

export function createCityMotion(scene) {
  const random = createRandom(0x7a11c1);
  const disposables = [];
  const track = (object) => {
    disposables.push(object);
    return object;
  };

  const group = new THREE.Group();
  group.name = 'cityMotion';
  scene.add(group);

  const glow = track(createGlow(64));

  // --- Distant road traffic ----------------------------------------------
  // Headlight and tail-light pairs sliding along fixed lines.
  const lightGeometry = track(new THREE.PlaneGeometry(2.6, 0.7));
  const warmMaterial = track(
    new THREE.SpriteMaterial({
      map: glow,
      color: 0xffd0a0,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  const coolMaterial = track(
    new THREE.SpriteMaterial({
      map: glow,
      color: 0xd0dcff,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );

  const roadLights = [];
  for (let i = 0; i < ROAD_LIGHTS; i += 1) {
    const road = ROADS[i % ROADS.length];
    const sprite = new THREE.Sprite(road.warm ? warmMaterial : coolMaterial);
    const scale = range(random, 2.4, 4.6);
    sprite.scale.set(scale, scale * 0.42, 1);
    sprite.position.set(
      range(random, Math.min(road.fromX, road.toX), Math.max(road.fromX, road.toX)),
      road.y + range(random, -0.3, 0.5),
      road.z + range(random, -3, 3),
    );
    group.add(sprite);
    roadLights.push({ sprite, road, speed: road.speed * range(random, 0.8, 1.3) });
  }

  // --- Light rail ---------------------------------------------------------
  const carMaterial = track(
    new THREE.MeshStandardMaterial({
      color: 0x2b3644,
      roughness: 0.4,
      metalness: 0.5,
      emissive: 0x1d3350,
      emissiveIntensity: 1.4,
    }),
  );
  const carGeometry = track(new THREE.BoxGeometry(11, 3.1, 3.0));
  const transit = new THREE.Group();
  for (let i = 0; i < TRANSIT_CARS; i += 1) {
    const car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.set(i * 11.6, TRANSIT_LINE.y, TRANSIT_LINE.z);
    transit.add(car);
  }
  group.add(transit);
  // Parked off the end of the line until a run is scheduled.
  transit.position.x = TRANSIT_LINE.fromX - 90;

  // The viaduct it runs on, so the train is not floating.
  const viaduct = new THREE.Mesh(
    track(new THREE.BoxGeometry(240, 1.6, 5.0)),
    track(new THREE.MeshStandardMaterial({ color: 0x1b222c, roughness: 0.85, metalness: 0.1 })),
  );
  viaduct.position.set(-70, TRANSIT_LINE.y - 2.4, TRANSIT_LINE.z);
  group.add(viaduct);
  for (let i = 0; i < 9; i += 1) {
    const pier = new THREE.Mesh(
      track(new THREE.BoxGeometry(2.4, TRANSIT_LINE.y - 2.4, 2.4)),
      track(new THREE.MeshStandardMaterial({ color: 0x161c25, roughness: 0.9, metalness: 0.05 })),
    );
    pier.position.set(-180 + i * 28, (TRANSIT_LINE.y - 2.4) / 2, TRANSIT_LINE.z);
    group.add(pier);
  }

  // --- Slow beacons over the Crown District -------------------------------
  const beacons = [];
  for (let i = 0; i < 3; i += 1) {
    const sprite = new THREE.Sprite(
      track(
        new THREE.SpriteMaterial({
          map: glow,
          color: 0xffb9a0,
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          toneMapped: false,
          fog: false,
        }),
      ),
    );
    sprite.scale.set(3.2, 3.2, 1);
    sprite.position.set(range(random, -120, 60), range(random, 62, 96), range(random, -230, -150));
    group.add(sprite);
    beacons.push({ sprite, speed: range(random, 1.6, 3.4), blink: range(random, 0, 6.28) });
  }

  let transitRunning = false;
  let transitProgress = 0;

  return {
    group,

    /** Sends a train down the line; used by the transit-arrival world event. */
    scheduleTransit() {
      if (transitRunning) return false;
      transitRunning = true;
      transitProgress = 0;
      return true;
    },

    get isTransitRunning() {
      return transitRunning;
    },

    /** Dimmed as the air thickens, so distant lights fade into the weather. */
    setVisibility(value) {
      warmMaterial.opacity = 0.5 * value;
      coolMaterial.opacity = 0.38 * value;
      carMaterial.emissiveIntensity = 0.4 + 1.4 * value;
    },

    update(dt) {
      if (!(dt > 0)) return;

      for (const light of roadLights) {
        const road = light.road;
        const forward = Math.sign(road.toX - road.fromX);
        light.sprite.position.x += forward * light.speed * dt;
        // Wrap round the far end of the road rather than respawning.
        const min = Math.min(road.fromX, road.toX);
        const max = Math.max(road.fromX, road.toX);
        if (light.sprite.position.x > max) light.sprite.position.x = min;
        if (light.sprite.position.x < min) light.sprite.position.x = max;
      }

      if (transitRunning) {
        transitProgress += dt * TRANSIT_LINE.speed;
        transit.position.x = TRANSIT_LINE.fromX + transitProgress;
        if (transit.position.x > TRANSIT_LINE.toX + 80) {
          transitRunning = false;
          transit.position.x = TRANSIT_LINE.fromX - 90;
        }
      }

      for (const beacon of beacons) {
        beacon.blink += dt * beacon.speed;
        beacon.sprite.material.opacity = 0.18 + Math.abs(Math.sin(beacon.blink)) * 0.32;
      }
    },

    dispose() {
      scene.remove(group);
      for (const item of disposables) item.dispose?.();
    },
  };
}
