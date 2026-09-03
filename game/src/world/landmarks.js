import { DISTRICT } from './districts.js';

/**
 * Aster City's landmarks.
 *
 * Pure data. Positions are fixed rather than generated, because these are what
 * the player navigates by: if the Crown Spire moved between sessions the city
 * would stop being legible. `skyline.js` builds the meshes from this catalog.
 *
 * `kind` selects the silhouette the builder draws. Every landmark is original to
 * CUMA WORLD.
 */

export const LANDMARK_KIND = {
  SPIRE: 'spire',
  CLOCK_TOWER: 'clockTower',
  TRANSIT_HALL: 'transitHall',
  SLAB_TOWER: 'slabTower',
  ARCH: 'arch',
};

export const LANDMARKS = [
  {
    id: 'crownSpire',
    name: 'CROWN SPIRE',
    district: DISTRICT.CROWN_DISTRICT,
    kind: LANDMARK_KIND.SPIRE,
    // The city's primary bearing: visible from everywhere in Meridian Market.
    position: { x: -26, y: 0, z: -158 },
    height: 99,
    focus: { x: -26, y: 78, z: -158 },
    primary: true,
    // Warm beacon; the only strongly lit thing on the skyline.
    lightColor: 0xffc98a,
  },
  {
    id: 'meridianClockTower',
    name: 'MERIDIAN CLOCK TOWER',
    district: DISTRICT.MERIDIAN_MARKET,
    kind: LANDMARK_KIND.CLOCK_TOWER,
    // Inside the playable district, at the far end of the market street.
    position: { x: 21, y: 0, z: -52 },
    height: 34,
    focus: { x: 21, y: 28, z: -52 },
    primary: false,
    lightColor: 0xffd6a0,
  },
  {
    id: 'glassTransitHall',
    name: 'GLASS TRANSIT HALL',
    district: DISTRICT.NORTHLINE,
    kind: LANDMARK_KIND.TRANSIT_HALL,
    position: { x: -74, y: 0, z: -96 },
    height: 26,
    focus: { x: -74, y: 20, z: -96 },
    primary: false,
    lightColor: 0xbcd8ff,
  },
  {
    id: 'northlineTower',
    name: 'NORTHLINE TOWER',
    district: DISTRICT.NORTHLINE,
    kind: LANDMARK_KIND.SLAB_TOWER,
    position: { x: -112, y: 0, z: -132 },
    height: 76,
    focus: { x: -112, y: 60, z: -132 },
    primary: false,
    lightColor: 0xa8c4e8,
  },
  {
    id: 'oldAsterArch',
    name: 'OLD ASTER ARCH',
    district: DISTRICT.OLD_ASTER,
    kind: LANDMARK_KIND.ARCH,
    position: { x: -104, y: 0, z: 26 },
    height: 30,
    focus: { x: -104, y: 24, z: 26 },
    primary: false,
    lightColor: 0xffbe84,
  },
];

export const LANDMARK_IDS = LANDMARKS.map((landmark) => landmark.id);

export const landmarkById = (id) => LANDMARKS.find((landmark) => landmark.id === id) ?? null;

/** Landmarks belonging to a district. */
export const landmarksInDistrict = (districtId) =>
  LANDMARKS.filter((landmark) => landmark.district === districtId);

/** The city's primary bearing — the Crown Spire. */
export const primaryLandmark = () => LANDMARKS.find((landmark) => landmark.primary);
