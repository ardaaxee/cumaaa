export const ROOM_ORDER = ['living', 'kitchen', 'bedroom', 'bathroom', 'study', 'garden', 'balcony'] as const;
export type HouseRoom = (typeof ROOM_ORDER)[number];
export interface PandaLifeSnapshot {
  cleanliness: number;
  energy: number;
  happiness: number;
  room: HouseRoom;
  lastSeen: number;
  voiceOn: boolean;
}

export const PANDA_LIFE_KEY = 'iyiki-panda-life-v1';
export const clampLife = (value: number) => Math.max(0, Math.min(100, value));
const finite = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;

/** Keep existing saves while rejecting invalid numbers and future timestamps. */
export function restorePandaLife(raw: unknown, now = Date.now()): PandaLifeSnapshot {
  const saved = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const lastSeen = Math.max(0, Math.min(now, finite(saved.lastSeen, now)));
  const elapsed = Math.min(72, (now - lastSeen) / 3_600_000);
  return {
    cleanliness: clampLife(clampLife(finite(saved.cleanliness, 82)) - elapsed * 0.75),
    energy: clampLife(clampLife(finite(saved.energy, 76)) - elapsed * 1.15),
    happiness: clampLife(clampLife(finite(saved.happiness, 84)) - elapsed * 0.45),
    room: ROOM_ORDER.includes(saved.room as HouseRoom) ? saved.room as HouseRoom : 'living',
    lastSeen,
    voiceOn: typeof saved.voiceOn === 'boolean' ? saved.voiceOn : true,
  };
}

export function loadPandaLife(): PandaLifeSnapshot {
  try { return restorePandaLife(JSON.parse(localStorage.getItem(PANDA_LIFE_KEY) ?? 'null')); }
  catch { return restorePandaLife(null); }
}
