/**
 * Canlı odada yedek görüntü yolu: iki cihaz arasında doğrudan (WebRTC) bağlantı kurulamazsa
 * (ör. iki farklı mobil operatörün katı NAT'ı), paylaşan taraf ekranını saniyede ~1 JPEG kare olarak
 * aynı şifreli Supabase kanalından gönderir. Kare, oda anahtarıyla AES-GCM ile şifrelenir (AAD = "frame");
 * Android uygulaması aynı biçimi kullanır.
 */
export const RELAY_EVENT = 'frame';
/** Doğrudan bağlantı bu süre içinde kurulamazsa yedek yol açılır. */
export const RELAY_AFTER_MS = 8_000;
/** Kare gönderme aralığı (bant genişliği ve Supabase kotası için 1 kare/sn). */
export const RELAY_INTERVAL_MS = 1_000;
/** Ekran değişmese de bu sürede bir kare yeniden gönderilir (yeni katılan da görüntüyü alsın). */
export const RELAY_KEEPALIVE_MS = 5_000;
/** Bu süredir kare gelmezse yedek görüntü gizlenir. */
export const RELAY_STALE_MS = 4_000;
/** Supabase yayın mesajı sınırı 256 KB; base64 ve şifreleme payıyla güvenli üst sınır. */
export const RELAY_MAX_BYTES = 140_000;
/** Yeni kare için en fazla bu kadar beklenir. */
const GRAB_TIMEOUT_MS = 700;
/** Paket ömrü (canlı odadaki diğer paketlerle aynı). */
const PACKET_MAX_AGE_MS = 10 * 60 * 1000;

export type RelayPacket = { v: 2; from: string; iv: string; data: string; at: number };

/** Kaliteyi kademeli düşürerek kareyi sınırın altına indiren denemeler. */
export const RELAY_STEPS: readonly { maxSide: number; quality: number }[] = [
  { maxSide: 1280, quality: 0.62 },
  { maxSide: 1024, quality: 0.5 },
  { maxSide: 800, quality: 0.42 },
  { maxSide: 640, quality: 0.34 },
];

const encoder = new TextEncoder();

export function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized + '='.repeat((4 - (normalized.length % 4)) % 4));
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export async function encryptFrame(key: CryptoKey, from: string, jpeg: Uint8Array, now = Date.now()): Promise<RelayPacket> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: encoder.encode(RELAY_EVENT) },
    key,
    jpeg as BufferSource,
  );
  return { v: 2, from, iv: toBase64Url(iv), data: toBase64Url(new Uint8Array(cipher)), at: now };
}

export async function decryptFrame(key: CryptoKey | null, packet: unknown, now = Date.now()): Promise<Uint8Array | null> {
  const p = packet as Partial<RelayPacket> | null;
  if (!key || !p || p.v !== 2 || typeof p.iv !== 'string' || typeof p.data !== 'string') return null;
  if (Math.abs(now - Number(p.at || 0)) > PACKET_MAX_AGE_MS) return null;
  try {
    const clear = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64Url(p.iv) as BufferSource, additionalData: encoder.encode(RELAY_EVENT) },
      key,
      fromBase64Url(p.data) as BufferSource,
    );
    return new Uint8Array(clear);
  } catch {
    return null;
  }
}

/** Ekran değişmediyse aynı kareyi tekrar göndermemek için ucuz parmak izi (FNV-1a, örneklemeli). */
export function frameFingerprint(bytes: Uint8Array): string {
  let h = 0x811c9dc5;
  const step = Math.max(1, Math.floor(bytes.length / 4096));
  for (let i = 0; i < bytes.length; i += step) {
    h ^= bytes[i];
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `${bytes.length}:${h.toString(16)}`;
}

/** Gönderilecek kare boyutu (en-boy oranı korunur, uzun kenar maxSide'ı geçmez). */
export function fitSize(width: number, height: number, maxSide: number): { width: number; height: number } {
  const longest = Math.max(width, height, 1);
  const scale = Math.min(1, maxSide / longest);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

type FrameSource = { source: CanvasImageSource; width: number; height: number; close?: () => void };

/** Arka plan sekmesinde de çalışsın diye önce ImageCapture (Chrome), yoksa oynatılan video öğesi kullanılır. */
async function grabSource(track: MediaStreamTrack, video: HTMLVideoElement | null): Promise<FrameSource | null> {
  const IC = (globalThis as { ImageCapture?: new (t: MediaStreamTrack) => { grabFrame(): Promise<ImageBitmap> } }).ImageCapture;
  if (IC && track.readyState === 'live') {
    // Ekran değişmezken yeni kare gelmeyebilir; grabFrame o zaman bekler. Süre dolarsa video öğesindeki son kare kullanılır.
    const pending = new IC(track).grabFrame();
    const bitmap = await Promise.race([
      pending.catch(() => null),
      new Promise<null>((ok) => setTimeout(() => ok(null), GRAB_TIMEOUT_MS)),
    ]);
    if (bitmap) return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    void pending.then((late) => late.close(), () => undefined);
  }
  if (video && video.readyState >= 2 && video.videoWidth > 0) {
    return { source: video, width: video.videoWidth, height: video.videoHeight };
  }
  return null;
}

function canvasJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return resolve(null);
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)), () => resolve(null));
      },
      'image/jpeg',
      quality,
    );
  });
}

/** Paylaşılan ekrandan sınırın altında bir JPEG kare üretir; üretemezse null. */
export async function captureRelayFrame(track: MediaStreamTrack, video: HTMLVideoElement | null): Promise<Uint8Array | null> {
  const frame = await grabSource(track, video);
  if (!frame) return null;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    for (const step of RELAY_STEPS) {
      const size = fitSize(frame.width, frame.height, step.maxSide);
      canvas.width = size.width;
      canvas.height = size.height;
      ctx.drawImage(frame.source, 0, 0, size.width, size.height);
      const jpeg = await canvasJpeg(canvas, step.quality);
      if (jpeg && jpeg.length <= RELAY_MAX_BYTES) return jpeg;
    }
    return null;
  } finally {
    frame.close?.();
  }
}
