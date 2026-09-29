/* İyi ki • YKS — service worker (derleme sırasında üretilir) */
const VERSION = '__VERSION__';
const SHELL_CACHE = `iyiki-yks-shell-${VERSION}`;
const CONTENT_CACHE = `iyiki-yks-content-${VERSION}`;
const CRITICAL = __CRITICAL__;
const PRECACHE = __PRECACHE__;

async function cacheOptional(cache, urls) {
  await Promise.allSettled(
    urls.map(async (url) => {
      try {
        await cache.add(url);
      } catch {
        // İkon gibi opsiyonel bir dosya tüm SW kurulumunu düşürmesin.
      }
    }),
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(async (cache) => {
        await cache.addAll(CRITICAL);
        const optional = PRECACHE.filter((url) => !CRITICAL.includes(url));
        await cacheOptional(cache, optional);
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith('iyiki-yks-') &&
                key !== SHELL_CACHE &&
                key !== CONTENT_CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok && (response.type === 'basic' || response.type === 'cors')) {
      const copy = response.clone();
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(fallbackUrl || request, copy);
    }
    return response;
  } catch {
    return caches.match(fallbackUrl || request, { ignoreSearch: true });
  }
}

async function cacheFirstRuntime(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && (response.type === 'basic' || response.type === 'cors')) {
    const copy = response.clone();
    const cache = await caches.open(CONTENT_CACHE);
    await cache.put(request, copy);
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;

  // HTML daima ağ öncelikli: yeni deploy eski index ile karışmasın.
  if (request.mode === 'navigate' || /\/index\.html$/.test(url.pathname)) {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  // Sabit adlı sürüm/manifest dosyaları da ağ öncelikli.
  if (
    /\/manifest\.webmanifest$/.test(url.pathname) ||
    /\/theme-init\.js$/.test(url.pathname) ||
    /\/sw\.js$/.test(url.pathname)
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Vite'ın hashli assets dosyaları değişmez. Soru ve ders içerikleri ilk
  // kullanıldığında indirilip runtime cache'e girer; install sırasında topluca çekilmez.
  if (url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirstRuntime(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

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
