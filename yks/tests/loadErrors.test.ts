import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContentLoadError, classifyLoadError, loadErrorText, loadWithPolicy, withTimeout } from '../src/utils/loadErrors';

const chunkErr = () => new TypeError('Failed to fetch dynamically imported module: https://x.test/yks/assets/tyt-fizik-abc123.js');

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('içerik yükleme hataları', () => {
  it('çevrimdışıyken "offline" sayılır', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    expect((await classifyLoadError(chunkErr())).kind).toBe('offline');
  });

  it('paket sunucuda yoksa (404) "missing" sayılır', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 404 })));
    expect((await classifyLoadError(chunkErr())).kind).toBe('missing');
  });

  it('sunucuya ulaşılamıyorsa "network" sayılır; parça hatası olmayan hata "module"', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('net'); }));
    expect((await classifyLoadError(chunkErr())).kind).toBe('network');
    expect((await classifyLoadError(new SyntaxError('Unexpected token'))).kind).toBe('module');
  });

  it('zaman aşımı ayrı türdür ve her türün açıklaması vardır', async () => {
    await expect(withTimeout(new Promise(() => undefined), 20)).rejects.toMatchObject({ kind: 'timeout' });
    for (const k of ['offline', 'network', 'timeout', 'stale', 'missing', 'module'] as const) expect(loadErrorText(k).length).toBeGreaterThan(5);
  });

  it('geçici ağ hatasında bir kez yeniden dener, eksik pakette denemez', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('net'); }));
    let calls = 0;
    const flaky = () => (++calls === 1 ? Promise.reject(chunkErr()) : Promise.resolve('ok'));
    await expect(loadWithPolicy(flaky, 1)).resolves.toBe('ok');
    expect(calls).toBe(2);

    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 404 })));
    calls = 0;
    const missing = () => {
      calls += 1;
      return Promise.reject(chunkErr());
    };
    await expect(loadWithPolicy(missing, 1)).rejects.toBeInstanceOf(ContentLoadError);
    expect(calls).toBe(1);
  });
});
