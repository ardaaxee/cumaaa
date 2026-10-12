import { describe, expect, it } from 'vitest';
import {
  RELAY_MAX_BYTES,
  RELAY_STEPS,
  decryptFrame,
  encryptFrame,
  fitSize,
  frameFingerprint,
  fromBase64Url,
  toBase64Url,
} from '../src/utils/liveRelay';

async function roomKey(room: string) {
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey('raw', enc.encode(room), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('yks-live-e2ee-v2'), iterations: 1000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

const jpeg = Uint8Array.from({ length: 50_000 }, (_, i) => (i * 31 + 7) & 0xff);

describe('liveRelay', () => {
  it('round-trips base64url without padding, including large buffers', () => {
    const encoded = toBase64Url(jpeg);
    expect(encoded).not.toMatch(/[+/=]/);
    expect(fromBase64Url(encoded)).toEqual(jpeg);
  });

  it('decrypts a frame encrypted with the same room key', async () => {
    const key = await roomKey('ABCDEFGHJKLMNPQRSTUV2345');
    const packet = await encryptFrame(key, 'peer-a', jpeg);
    expect(packet).toMatchObject({ v: 2, from: 'peer-a' });
    expect(await decryptFrame(key, packet)).toEqual(jpeg);
  });

  it('rejects frames from another room, tampered data or expired packets', async () => {
    const key = await roomKey('ABCDEFGHJKLMNPQRSTUV2345');
    const other = await roomKey('ZZZZZZZZZZZZZZZZZZZZZZZZ');
    const packet = await encryptFrame(key, 'peer-a', jpeg);
    expect(await decryptFrame(other, packet)).toBeNull();
    expect(await decryptFrame(key, { ...packet, data: packet.data.slice(0, -4) + 'AAAA' })).toBeNull();
    expect(await decryptFrame(key, packet, packet.at + 11 * 60 * 1000)).toBeNull();
    expect(await decryptFrame(null, packet)).toBeNull();
    expect(await decryptFrame(key, { nope: true })).toBeNull();
  });

  it('keeps the encrypted packet under the realtime message limit', async () => {
    const key = await roomKey('ABCDEFGHJKLMNPQRSTUV2345');
    const packet = await encryptFrame(key, 'peer-a', new Uint8Array(RELAY_MAX_BYTES));
    expect(JSON.stringify(packet).length).toBeLessThan(250_000);
  });

  it('fingerprints identical frames equally and changed frames differently', () => {
    const changed = jpeg.slice();
    changed[0] ^= 0xff;
    expect(frameFingerprint(jpeg)).toBe(frameFingerprint(jpeg.slice()));
    expect(frameFingerprint(changed)).not.toBe(frameFingerprint(jpeg));
  });

  it('fits frames inside the max side while keeping aspect ratio', () => {
    expect(fitSize(2560, 1440, 1280)).toEqual({ width: 1280, height: 720 });
    expect(fitSize(1080, 2400, 1280)).toEqual({ width: 576, height: 1280 });
    expect(fitSize(640, 360, 1280)).toEqual({ width: 640, height: 360 });
    expect(RELAY_STEPS.every((s, i) => i === 0 || s.maxSide < RELAY_STEPS[i - 1].maxSide)).toBe(true);
  });
});
