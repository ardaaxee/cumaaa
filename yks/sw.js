/* İyi ki • YKS — service worker (derleme sırasında üretilir) */
const CACHE = 'iyiki-yks-0e53b44b80e0';
const PRECACHE = ["./","./index.html","./assets/index-V0CloeV2.js","./assets/Charts-DVVJ0SuZ.js","./assets/FocusPage-D1UyuDX6.js","./assets/HomePage-DmXtQHmj.js","./assets/Icon-CErZY_-8.js","./assets/MocksPage-CXhJJUve.js","./assets/MorePage-DqQEM_iS.js","./assets/NotFoundPage-CEB3o0Hm.js","./assets/NotebookRouter-BGMaaoHJ.js","./assets/OnboardingPage-BPL-1MqB.js","./assets/OsymPage-B-nenvsZ.js","./assets/PlanPage-BQgZhLgy.js","./assets/PomodoroCard-BP7fqc85.js","./assets/ProgressPage-Tc6oQ-hA.js","./assets/QuestionView-DBw6lbqR.js","./assets/ResourcesPage-DRQtRw9t.js","./assets/ReviewsPage-xOJJY98P.js","./assets/SettingsPage-5AoOhtxJ.js","./assets/SubjectPage-JmBWAg1p.js","./assets/SubjectsPage-BEy2kirK.js","./assets/TeacherAvatar-BuzbZQpi.js","./assets/TeacherPage-BNFFdlE-.js","./assets/TestResultPage-BLhSNHfk.js","./assets/TestRunnerPage-B5mJ9iO2.js","./assets/TestSetupPage-Bo98yRVz.js","./assets/TopicPage-CRdA72lY.js","./assets/WrongsPage-BGtnNOt3.js","./assets/analysis-DI3aXpTn.js","./assets/ayt-biyoloji-1-DAOM1u2c.js","./assets/ayt-biyoloji-1-DRjdejHJ.js","./assets/ayt-biyoloji-2-2wZ923Yq.js","./assets/ayt-biyoloji-2-OUzAFoeE.js","./assets/ayt-biyoloji-3-BFOz3ADV.js","./assets/ayt-biyoloji-3-D73ymuNt.js","./assets/ayt-fizik-1-CNFU0aft.js","./assets/ayt-fizik-1-DdiTB10i.js","./assets/ayt-fizik-2-B3tAD1rX.js","./assets/ayt-fizik-2-C0L16QTj.js","./assets/ayt-fizik-3-BOJdwjho.js","./assets/ayt-fizik-3-_bPbfRbT.js","./assets/ayt-geometri-DUJ7EYhA.js","./assets/ayt-geometri-DxHBMUSU.js","./assets/ayt-kimya-1-BZgBI3nn.js","./assets/ayt-kimya-1-C9vSmmIY.js","./assets/ayt-kimya-2-CUoyoxHy.js","./assets/ayt-kimya-2-Dzfvnk4d.js","./assets/ayt-matematik-1-B-YOJAmr.js","./assets/ayt-matematik-1-C0mXXoIX.js","./assets/ayt-matematik-1b-VQWLNwqS.js","./assets/ayt-matematik-2-XKcxfDKx.js","./assets/ayt-matematik-2-nkqG5kY5.js","./assets/ayt-matematik-3-SHnaSmg8.js","./assets/ayt-matematik-3-TD8XBkAW.js","./assets/content-Bj9ZTVlF.js","./assets/lookup-nueora1f.js","./assets/mock-BI6QaYMQ.js","./assets/officialResources-BuxIxjcB.js","./assets/stats-BH53fWrZ.js","./assets/testLauncher-E4xSX7PQ.js","./assets/tyt-biyoloji-A7cJdxgi.js","./assets/tyt-biyoloji-B8W32KjE.js","./assets/tyt-cografya-CGIKep2O.js","./assets/tyt-cografya-COpkP2QN.js","./assets/tyt-din-CNfWeYPG.js","./assets/tyt-din-DBMC-NOi.js","./assets/tyt-felsefe-C3rVRn_Z.js","./assets/tyt-felsefe-CLTYQ0VM.js","./assets/tyt-fizik-BpgJ82UF.js","./assets/tyt-fizik-CvNFjayY.js","./assets/tyt-geometri-CKFyu-YI.js","./assets/tyt-geometri-DtWZnS2i.js","./assets/tyt-kimya-DJoYN93C.js","./assets/tyt-kimya-Yomk-AYy.js","./assets/tyt-matematik-1-DiIx0cH-.js","./assets/tyt-matematik-1-gkXSnHbR.js","./assets/tyt-matematik-2-BfsnQNst.js","./assets/tyt-matematik-2-Bx8ONu9d.js","./assets/tyt-tarih-BaTjHs5E.js","./assets/tyt-tarih-gjAWlzM0.js","./assets/tyt-turkce-DAal0Zcv.js","./assets/tyt-turkce-oiSrtaZp.js","./assets/useIsDark-C_q8Fk8g.js","./assets/index-CuaaB3M1.css","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('iyiki-yks-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html', { ignoreSearch: true })),
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
