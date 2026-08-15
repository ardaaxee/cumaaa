/* Offline support. Static assets are cached; HTML and API stay network-first
 * so content is never served stale when the device is online. */

const VERSION = "whoisarda-v2";
const ASSETS = [
  "/",
  "/static/style.css",
  "/static/app.js",
  "/static/js/core.js",
  "/static/js/ui.js",
  "/static/js/vfs.js",
  "/static/js/lab.js",
  "/static/js/tools.js",
  "/static/js/panels.js",
  "/static/js/playground.js",
  "/static/js/palette.js",
  "/static/favicon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // Never cache contact submissions or admin reads.
  if (url.pathname.startsWith("/api/contact")
      || url.pathname.startsWith("/api/messages")) return;

  const isDocument = request.mode === "navigate";
  const isApi = url.pathname.startsWith("/api/");

  if (isDocument || isApi) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match("/")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
      return response;
    }))
  );
});
