import { describe, expect, it } from 'vitest';
import {
  ANDROID_APK_URL,
  ANDROID_APP_PACKAGE,
  HANDOFF_TTL_MS,
  androidLiveIntentUrl,
  clearHandoff,
  isAndroidDevice,
  isInsideApp,
  readHandoff,
  saveHandoff,
} from '../src/utils/liveAndroid';

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, String(v)),
  };
}

const ROOM = 'ABCDEFGHJKLMNPQRSTUV2345';

describe('liveAndroid', () => {
  it('detects Android user agents', () => {
    expect(isAndroidDevice('Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/129 Mobile')).toBe(true);
    expect(isAndroidDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe(false);
  });

  it('builds an intent that opens the in-app live screen and falls back to the APK', () => {
    const share = androidLiveIntentUrl(ROOM, true);
    expect(share).toBe(
      `intent://join?room=${ROOM}&share=1#Intent;scheme=ykslive;package=${ANDROID_APP_PACKAGE};S.browser_fallback_url=${encodeURIComponent(ANDROID_APK_URL)};end`,
    );
    expect(androidLiveIntentUrl(ROOM, false)).not.toContain('share=1');
    expect(ANDROID_APK_URL).not.toContain('/yks/');
  });

  it('remembers that the page runs inside the app for the whole session', () => {
    const session = memoryStorage();
    expect(isInsideApp('https://example.com/', session)).toBe(false);
    expect(isInsideApp(`android-app://${ANDROID_APP_PACKAGE}/`, session)).toBe(true);
    expect(isInsideApp('', session)).toBe(true);
  });

  it('keeps a handoff only for the same room and only for a while', () => {
    const local = memoryStorage();
    saveHandoff(ROOM, local, 1_000);
    expect(readHandoff(ROOM, local, 2_000)).toEqual({ room: ROOM, at: 1_000 });
    expect(readHandoff('ZZZZZZZZZZZZZZZZZZZZZZZZ', local, 2_000)).toBeNull();
    expect(readHandoff(ROOM, local, 1_000 + HANDOFF_TTL_MS + 1)).toBeNull();
    clearHandoff(local);
    expect(readHandoff(ROOM, local, 2_000)).toBeNull();
  });

  it('survives broken or missing storage', () => {
    const local = memoryStorage();
    local.setItem('iyikiYks.liveHandoff.v1', '{broken');
    expect(readHandoff(ROOM, local)).toBeNull();
    expect(readHandoff(ROOM, null)).toBeNull();
    expect(() => saveHandoff(ROOM, null)).not.toThrow();
  });
});
