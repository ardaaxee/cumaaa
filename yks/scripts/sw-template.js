/* İyi ki • YKS — service worker (derleme sırasında üretilir) */
const VERSION = '__VERSION__';
const SHELL_CACHE = `iyiki-yks-shell-${VERSION}`;
const RUNTIME_CACHE = `iyiki-yks-runtime-${VERSION}`;
const CONTENT_CACHE = `iyiki-yks-content-${VERSION}`;
/** Olmazsa olmaz kabuk: index + ana JS + ana CSS. Biri inmezse kurulum başarısız sayılır. */
const REQUIRED = __REQUIRED__;
/** İsteğe bağlı kabuk dosyaları (simgeler, manifest…). İnmeyen olursa kurulum yine tamamlanır. */
const OPTIONAL = __OPTIONAL__;
/** Soru ve konu anlatımı paketleri: kurulumda İNDİRİLMEZ, ilk açıldıklarında önbelleğe alınır. */
const CONTENT = new Set(__CONTENT__);

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(REQUIRED);
      await Promise.all(OPTIONAL.map((url) => cache.add(url).catch(() => undefined)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, RUNTIME_CACHE, CONTENT_CACHE]);
      const keys = await caches.keys();
      // Değişmemiş soru paketleri (aynı dosya adı) yeni sürüme taşınır: çevrimdışı açılan konular kaybolmaz.
      const content = await caches.open(CONTENT_CACHE);
      for (const key of keys) {
        if (!key.startsWith('iyiki-yks-content-') || key === CONTENT_CACHE) continue;
        const old = await caches.open(key);
        for (const req of await old.keys()) {
          if (CONTENT.has(new URL(req.url).pathname.split('/').pop())) {
            const res = await old.match(req);
            if (res) await content.put(req, res);
          }
        }
      }
      // Yalnız Cache Storage temizlenir; localStorage/IndexedDB'deki kullanıcı verisine dokunulmaz.
      await Promise.all(keys.filter((k) => k.startsWith('iyiki-yks-') && !keep.has(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

function cacheFor(url) {
  return CONTENT.has(url.pathname.split('/').pop()) ? CONTENT_CACHE : RUNTIME_CACHE;
}

function putIfOk(cacheName, request, response) {
  if (response && response.ok && response.type === 'basic') {
    const copy = response.clone();
    caches.open(cacheName).then((cache) => cache.put(request, copy)).catch(() => undefined);
  }
  return response;
}

// Sayfa ve sabit adlı dosyalar: önce ağ (yeni sürüm gecikmeden gelsin), ağ yoksa önbellek.
function networkFirst(request, fallbackUrl) {
  return fetch(request)
    .then((response) => putIfOk(SHELL_CACHE, fallbackUrl || request, response))
    .catch(() =>
      caches.match(fallbackUrl || request, { ignoreSearch: true }).then((hit) => hit || Response.error()),
    );
}

// İçerik özetiyle adlandırılmış /assets/ dosyaları değişmez: önce önbellek, yoksa ağ.
function cacheFirst(request, url) {
  return caches.match(request).then((hit) => hit || fetch(request).then((response) => putIfOk(cacheFor(url), request, response)));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }
  if (url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirst(request, url));
    return;
  }
  event.respondWith(networkFirst(request));
});

// Bildirime dokununca uygulama açılır (açıksa öne gelir); panda bildirimi panda sayfasına götürür.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const hash = event.notification.tag === 'panda-ihtiyac' ? '#/pandam' : '#/';
  const url = new URL(`./${hash}`, self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate?.(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
