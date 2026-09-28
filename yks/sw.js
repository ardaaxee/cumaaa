/* İyi ki • YKS — service worker (derleme sırasında üretilir) */
const CACHE = 'iyiki-yks-497dce0cfd35';
const PRECACHE = ["./","./index.html","./assets/index-Bygoe40p.js","./assets/AssistantCharacter-BT0Y6x8n.js","./assets/Charts-oazSYG9_.js","./assets/FocusPage-6YfNSnJ1.js","./assets/HomePage-5XJVi98-.js","./assets/Icon-CsLhTxlq.js","./assets/InlineQuiz-DRRBU0cW.js","./assets/MocksPage-BtxxwtWh.js","./assets/MorePage-BR64pHhN.js","./assets/NotFoundPage-BUzphdl2.js","./assets/NotebookRouter-BfQRgwPf.js","./assets/OnboardingPage-BQfgoJ9f.js","./assets/OsymPage-noPK4UlH.js","./assets/PlanPage-DEv3ndXx.js","./assets/PomodoroCard-BaB4xRGO.js","./assets/ProgressPage-DV9qIYQ3.js","./assets/QuestionView-CiRehOOB.js","./assets/ResourcesPage-CbKhbX4h.js","./assets/ReviewsPage-Dk3NX1-Y.js","./assets/SettingsPage-dkdhQwUO.js","./assets/SubjectPage-T-oKuzLa.js","./assets/SubjectsPage-C6hZTdFy.js","./assets/TeacherPage-DDzH3Y7t.js","./assets/TestResultPage-BLmqQt7r.js","./assets/TestRunnerPage-FpatOQaW.js","./assets/TestSetupPage-Cl3MthRd.js","./assets/TopicPage-BBr9VhKl.js","./assets/WrongsPage-CreOqDHU.js","./assets/analysis-DHqyiKPO.js","./assets/ayt-biyoloji-1-DAOM1u2c.js","./assets/ayt-biyoloji-1-DRjdejHJ.js","./assets/ayt-biyoloji-2-2wZ923Yq.js","./assets/ayt-biyoloji-2-OUzAFoeE.js","./assets/ayt-biyoloji-3-BFOz3ADV.js","./assets/ayt-biyoloji-3-D73ymuNt.js","./assets/ayt-fizik-1-CNFU0aft.js","./assets/ayt-fizik-1-DdiTB10i.js","./assets/ayt-fizik-2-B3tAD1rX.js","./assets/ayt-fizik-2-C0L16QTj.js","./assets/ayt-fizik-3-BOJdwjho.js","./assets/ayt-fizik-3-_bPbfRbT.js","./assets/ayt-fizik-ek-Cap_ZWl4.js","./assets/ayt-geometri-DUJ7EYhA.js","./assets/ayt-geometri-DxHBMUSU.js","./assets/ayt-kimya-1-BZgBI3nn.js","./assets/ayt-kimya-1-C9vSmmIY.js","./assets/ayt-kimya-2-CUoyoxHy.js","./assets/ayt-kimya-2-Dzfvnk4d.js","./assets/ayt-matematik-1-B-YOJAmr.js","./assets/ayt-matematik-1-C0mXXoIX.js","./assets/ayt-matematik-1b-VQWLNwqS.js","./assets/ayt-matematik-2-XKcxfDKx.js","./assets/ayt-matematik-2-nkqG5kY5.js","./assets/ayt-matematik-3-SHnaSmg8.js","./assets/ayt-matematik-3-TD8XBkAW.js","./assets/content-6ePutgzg.js","./assets/lookup-9PSRZ6kb.js","./assets/mock-lXxeoIQT.js","./assets/officialResources-BuxIxjcB.js","./assets/recommendations-D8TOsgHZ.js","./assets/stats-Dsvi_3KY.js","./assets/testLauncher-BIEMqZki.js","./assets/tyt-biyoloji-A7cJdxgi.js","./assets/tyt-biyoloji-B8W32KjE.js","./assets/tyt-biyoloji-ek-U_et8uM4.js","./assets/tyt-cografya-CGIKep2O.js","./assets/tyt-cografya-COpkP2QN.js","./assets/tyt-din-CNfWeYPG.js","./assets/tyt-din-DBMC-NOi.js","./assets/tyt-felsefe-C3rVRn_Z.js","./assets/tyt-felsefe-CLTYQ0VM.js","./assets/tyt-felsefe-ek-BfQCn076.js","./assets/tyt-fizik-BpgJ82UF.js","./assets/tyt-fizik-CvNFjayY.js","./assets/tyt-geometri-CKFyu-YI.js","./assets/tyt-geometri-DtWZnS2i.js","./assets/tyt-geometri-ek-fqH3ih3a.js","./assets/tyt-kimya-DJoYN93C.js","./assets/tyt-kimya-Yomk-AYy.js","./assets/tyt-matematik-1-DiIx0cH-.js","./assets/tyt-matematik-1-gkXSnHbR.js","./assets/tyt-matematik-2-BfsnQNst.js","./assets/tyt-matematik-2-Bx8ONu9d.js","./assets/tyt-tarih-BaTjHs5E.js","./assets/tyt-tarih-ek-C-xMBI2t.js","./assets/tyt-tarih-gjAWlzM0.js","./assets/tyt-turkce-DAal0Zcv.js","./assets/tyt-turkce-oiSrtaZp.js","./assets/useIsDark-DCu9WpNT.js","./assets/index-DjY73O5f.css","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

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
