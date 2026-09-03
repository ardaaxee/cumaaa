import { DISTRICT } from './districts.js';
import { WEATHER } from './weatherSystem.js';

/**
 * Things that happen in Aster City on their own.
 *
 * Pure data. Each event states where it can occur, what weather it wants, how
 * near the player has to be, and how long before it may repeat. The director
 * evaluates these; nothing here runs code.
 *
 * These are small: a crowd gathers, a train arrives, the rain steps up. The
 * point is that the district keeps living whether or not the player is doing
 * anything.
 */

export const WORLD_EVENT = {
  MARKET_GATHERING: 'marketGathering',
  TRANSIT_ARRIVAL: 'transitArrival',
  STREET_PERFORMER: 'streetPerformer',
  RAIN_SURGE: 'rainSurge',
  DISTANT_ANNOUNCEMENT: 'distantAnnouncement',
  LOCAL_DISPUTE: 'localDispute',
  VISTA_DISCOVERY: 'vistaDiscovery',
  WARDEN_AFTERMATH: 'wardenAftermath',
};

/**
 * anchor      where in the world the event plays out
 * radius      how close the player must be for it to be worth running
 * weather     states it is allowed in; empty means any
 * cooldown    seconds before this event may fire again
 * duration    how long it runs
 * weight      relative likelihood among eligible events
 * once        fires at most once per session
 * requires    a named world condition the director must be told is true
 */
export const WORLD_EVENTS = {
  [WORLD_EVENT.MARKET_GATHERING]: {
    id: WORLD_EVENT.MARKET_GATHERING,
    label: 'A crowd gathers at the stalls',
    district: DISTRICT.MERIDIAN_MARKET,
    anchor: { x: -7.2, z: 2 },
    radius: 34,
    weather: [],
    cooldown: 75,
    duration: 16,
    weight: 1.0,
  },

  [WORLD_EVENT.TRANSIT_ARRIVAL]: {
    id: WORLD_EVENT.TRANSIT_ARRIVAL,
    label: 'A train pulls into the transit hall',
    district: DISTRICT.MERIDIAN_MARKET,
    anchor: { x: 6.4, z: -24 },
    radius: 46,
    weather: [],
    cooldown: 52,
    duration: 12,
    weight: 1.4,
  },

  [WORLD_EVENT.STREET_PERFORMER]: {
    id: WORLD_EVENT.STREET_PERFORMER,
    label: 'A performer draws a ring of onlookers',
    district: DISTRICT.MERIDIAN_MARKET,
    anchor: { x: 0, z: -4 },
    radius: 28,
    // Nobody busks in a downpour.
    weather: [WEATHER.CLEAR_DAY, WEATHER.CLOUDY, WEATHER.LIGHT_RAIN, WEATHER.FOG],
    cooldown: 95,
    duration: 20,
    weight: 0.9,
  },

  [WORLD_EVENT.RAIN_SURGE]: {
    id: WORLD_EVENT.RAIN_SURGE,
    label: 'The rain steps up',
    district: DISTRICT.MERIDIAN_MARKET,
    anchor: { x: 0, z: 0 },
    radius: 999,
    weather: [WEATHER.LIGHT_RAIN, WEATHER.NIGHT_RAIN],
    cooldown: 110,
    duration: 10,
    weight: 0.7,
  },

  [WORLD_EVENT.DISTANT_ANNOUNCEMENT]: {
    id: WORLD_EVENT.DISTANT_ANNOUNCEMENT,
    label: 'An announcement echoes from Northline',
    district: DISTRICT.MERIDIAN_MARKET,
    anchor: { x: -30, z: -40 },
    radius: 999,
    weather: [],
    cooldown: 88,
    duration: 7,
    weight: 1.1,
  },

  [WORLD_EVENT.LOCAL_DISPUTE]: {
    id: WORLD_EVENT.LOCAL_DISPUTE,
    label: 'Two traders argue over a pitch',
    district: DISTRICT.MERIDIAN_MARKET,
    anchor: { x: 7.2, z: -6 },
    radius: 26,
    weather: [],
    cooldown: 120,
    duration: 14,
    weight: 0.6,
  },

  [WORLD_EVENT.VISTA_DISCOVERY]: {
    id: WORLD_EVENT.VISTA_DISCOVERY,
    label: 'The Crown Spire clears the rooftops',
    district: DISTRICT.MERIDIAN_MARKET,
    anchor: { x: 0, z: -30 },
    radius: 18,
    // Only worth showing when the air is clear enough to see it.
    weather: [WEATHER.CLEAR_DAY, WEATHER.CLOUDY, WEATHER.LIGHT_RAIN, WEATHER.NIGHT_RAIN],
    cooldown: 999,
    duration: 12,
    weight: 2.5,
    once: true,
  },

  [WORLD_EVENT.WARDEN_AFTERMATH]: {
    id: WORLD_EVENT.WARDEN_AFTERMATH,
    label: 'The district takes stock after the Warden',
    district: DISTRICT.MERIDIAN_MARKET,
    anchor: { x: 0, z: -50 },
    radius: 70,
    weather: [],
    cooldown: 999,
    duration: 22,
    weight: 4.0,
    once: true,
    requires: 'wardenDefeated',
  },
};

export const WORLD_EVENT_IDS = Object.keys(WORLD_EVENTS);
