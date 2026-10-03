/* İyi ki • YKS — service worker (derleme sırasında üretilir) */
const VERSION = 'd9cb4908acb2';
const SHELL_CACHE = `iyiki-yks-shell-${VERSION}`;
const RUNTIME_CACHE = `iyiki-yks-runtime-${VERSION}`;
const CONTENT_CACHE = `iyiki-yks-content-${VERSION}`;
/** Olmazsa olmaz kabuk: index + ana JS + ana CSS. Biri inmezse kurulum başarısız sayılır. */
const REQUIRED = ["./index.html","./assets/index-Owe0TGys.js","./assets/actions-8Yu-5_Oo.js","./assets/index-BTQCpilx.css"];
/** İsteğe bağlı kabuk dosyaları (simgeler, manifest…). İnmeyen olursa kurulum yine tamamlanır. */
const OPTIONAL = ["./","./theme-init.js","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png","./assets/PetPage-DRGYvz_3.css"];
/** Soru ve konu anlatımı paketleri: kurulumda İNDİRİLMEZ, ilk açıldıklarında önbelleğe alınır. */
const CONTENT = new Set(["ayt-biyoloji-1-DAOM1u2c.js","ayt-biyoloji-1-DRjdejHJ.js","ayt-biyoloji-2-2wZ923Yq.js","ayt-biyoloji-2-OUzAFoeE.js","ayt-biyoloji-3-C-nk6it7.js","ayt-biyoloji-3-D73ymuNt.js","ayt-biyoloji-ek-D-gUA9yc.js","ayt-biyoloji-ek4-BdRKHMWD.js","ayt-fizik-1-CNFU0aft.js","ayt-fizik-1-DdiTB10i.js","ayt-fizik-2-BU5ypgmH.js","ayt-fizik-2-C0L16QTj.js","ayt-fizik-3-B2sVhgKh.js","ayt-fizik-3-_bPbfRbT.js","ayt-fizik-ek-Cap_ZWl4.js","ayt-fizik-ek3-DCeoHvW4.js","ayt-fizik-ek4-9nhldys4.js","ayt-fizik-ek6-CeAZEXj7.js","ayt-geometri-DUJ7EYhA.js","ayt-geometri-DxHBMUSU.js","ayt-geometri-ek-DYnHGMWj.js","ayt-geometri-ek3-DsQ6IcWH.js","ayt-kimya-1-BZgBI3nn.js","ayt-kimya-1-C9vSmmIY.js","ayt-kimya-2-CUoyoxHy.js","ayt-kimya-2-ukCD2TVT.js","ayt-kimya-ek-F-VuSwNq.js","ayt-kimya-ek3-CAACcm0i.js","ayt-kimya-ek6-DrVUSGGE.js","ayt-matematik-1-B-YOJAmr.js","ayt-matematik-1-C0mXXoIX.js","ayt-matematik-1b-VQWLNwqS.js","ayt-matematik-2-XKcxfDKx.js","ayt-matematik-2-nkqG5kY5.js","ayt-matematik-3-SHnaSmg8.js","ayt-matematik-3-TD8XBkAW.js","ayt-matematik-ek-BVa56jU1.js","ayt-matematik-ek3-4XDOjC_P.js","ayt-matematik-ek4-BFBGZSiz.js","ayt-matematik-ek7-f0s4Gg2Z.js","tyt-biyoloji-A7cJdxgi.js","tyt-biyoloji-B8W32KjE.js","tyt-biyoloji-ek-U_et8uM4.js","tyt-biyoloji-ek3-BAU2R-O6.js","tyt-cografya-CGIKep2O.js","tyt-cografya-COpkP2QN.js","tyt-cografya-ek-u40yRQiD.js","tyt-cografya-ek3-HFGVOmQf.js","tyt-din-BLZN5rp3.js","tyt-din-CNfWeYPG.js","tyt-din-ek-D5ZChKCt.js","tyt-din-ek4-D8POvi_R.js","tyt-felsefe-3AJmOagM.js","tyt-felsefe-CLTYQ0VM.js","tyt-felsefe-ek-BfQCn076.js","tyt-felsefe-ek4-DqjI4MFw.js","tyt-fizik-CvNFjayY.js","tyt-fizik-ek-Co7-gA8M.js","tyt-fizik-ek3-BIU5g6Xn.js","tyt-fizik-ek4-BsomiPbc.js","tyt-fizik-ek6-Rfszrx-r.js","tyt-fizik-j9JLs8BE.js","tyt-geometri-CKFyu-YI.js","tyt-geometri-DtWZnS2i.js","tyt-geometri-ek-fqH3ih3a.js","tyt-geometri-ek3-XlonEgkw.js","tyt-kimya-DJoYN93C.js","tyt-kimya-Yomk-AYy.js","tyt-kimya-ek-CDKQAW2_.js","tyt-kimya-ek3-De1m9Ehj.js","tyt-kimya-ek4-ClFBIgMw.js","tyt-kimya-ek6-DfrN2bDR.js","tyt-matematik-1-DiIx0cH-.js","tyt-matematik-1-gkXSnHbR.js","tyt-matematik-2-B8yaSydn.js","tyt-matematik-2-BfsnQNst.js","tyt-matematik-ek-B6ciMFJq.js","tyt-matematik-ek3-CF3j_8DV.js","tyt-matematik-ek4-BjQ9qCwT.js","tyt-matematik-ek7-BVlKr5ph.js","tyt-tarih-BaTjHs5E.js","tyt-tarih-ek-C-xMBI2t.js","tyt-tarih-ek2-Cg3hsLIY.js","tyt-tarih-ek3-CiapcSTg.js","tyt-tarih-ek4-CEuVRhKD.js","tyt-tarih-gjAWlzM0.js","tyt-turkce-DAal0Zcv.js","tyt-turkce-ek-C8PPd6yw.js","tyt-turkce-ek3-DsCEG_kC.js","tyt-turkce-ek4-Dshepod_.js","tyt-turkce-ek7-CN6L7pOL.js","tyt-turkce-oiSrtaZp.js"]);

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
