/* İyi ki • YKS — service worker (derleme sırasında üretilir) */
const CACHE = 'iyiki-yks-2a16d8722c8e';
const PRECACHE = ["./","./index.html","./assets/index-D9t19pZd.js","./assets/AssistantCharacter-D1-xIIBy.js","./assets/BadgesPage-UFo4ek-I.js","./assets/CardsPage--g4qLUoT.js","./assets/Charts-R9OiV00h.js","./assets/FocusPage-BviNHH-8.js","./assets/FormulasPage-DPHOvulm.js","./assets/HomePage-BzhQlL34.js","./assets/Icon-VWyYSkNj.js","./assets/InlineQuiz-DrScHTuR.js","./assets/MocksPage-BwOI5BFw.js","./assets/MorePage-Hy3FauTn.js","./assets/NotFoundPage-Bhstp-Sg.js","./assets/NotebookRouter-B-ExxTcp.js","./assets/OnboardingPage-CAvXelY0.js","./assets/OsymPage-B8RelCsI.js","./assets/PartnerPage-ClSCNobJ.js","./assets/PlanPage-DK3Wmwdo.js","./assets/PomodoroCard-D-VlI9kl.js","./assets/ProgressPage-D3NQSYXe.js","./assets/QuestionView-BGLi_r9B.js","./assets/ResourcesPage-pSAN58Zs.js","./assets/ReviewsPage-BCUGXrUX.js","./assets/SettingsPage-B1pXa3HU.js","./assets/SubjectPage-D8EhVQKQ.js","./assets/SubjectsPage-B6etejSQ.js","./assets/TeacherPage-CXSDNLMB.js","./assets/TestResultPage-BHsO2fwz.js","./assets/TestRunnerPage-Cggwm9zV.js","./assets/TestSetupPage-CabHLte9.js","./assets/TopicPage-zIhGGlHL.js","./assets/WrongsPage-BctTS86q.js","./assets/analysis-BA9_lno5.js","./assets/ayt-biyoloji-1-DAOM1u2c.js","./assets/ayt-biyoloji-1-DRjdejHJ.js","./assets/ayt-biyoloji-2-2wZ923Yq.js","./assets/ayt-biyoloji-2-OUzAFoeE.js","./assets/ayt-biyoloji-3-BFOz3ADV.js","./assets/ayt-biyoloji-3-D73ymuNt.js","./assets/ayt-biyoloji-ek-D-gUA9yc.js","./assets/ayt-fizik-1-CNFU0aft.js","./assets/ayt-fizik-1-DdiTB10i.js","./assets/ayt-fizik-2-B3tAD1rX.js","./assets/ayt-fizik-2-C0L16QTj.js","./assets/ayt-fizik-3-BOJdwjho.js","./assets/ayt-fizik-3-_bPbfRbT.js","./assets/ayt-fizik-ek-Cap_ZWl4.js","./assets/ayt-geometri-DUJ7EYhA.js","./assets/ayt-geometri-DxHBMUSU.js","./assets/ayt-geometri-ek-DYnHGMWj.js","./assets/ayt-kimya-1-BZgBI3nn.js","./assets/ayt-kimya-1-C9vSmmIY.js","./assets/ayt-kimya-2-CUoyoxHy.js","./assets/ayt-kimya-2-Dzfvnk4d.js","./assets/ayt-kimya-ek-F-VuSwNq.js","./assets/ayt-matematik-1-B-YOJAmr.js","./assets/ayt-matematik-1-C0mXXoIX.js","./assets/ayt-matematik-1b-VQWLNwqS.js","./assets/ayt-matematik-2-XKcxfDKx.js","./assets/ayt-matematik-2-nkqG5kY5.js","./assets/ayt-matematik-3-SHnaSmg8.js","./assets/ayt-matematik-3-TD8XBkAW.js","./assets/ayt-matematik-ek-BVa56jU1.js","./assets/content-BwDVLChR.js","./assets/localAssistant-DyBJmt5f.js","./assets/lookup-CSbFiBW1.js","./assets/mock-R6uERCs0.js","./assets/net-CfoizUGz.js","./assets/officialResources-BuxIxjcB.js","./assets/photoStore-C-kNM_SK.js","./assets/recommendations-DCJJIGQK.js","./assets/srs-DbN21bnV.js","./assets/testLauncher-OSLYCwiJ.js","./assets/tyt-biyoloji-A7cJdxgi.js","./assets/tyt-biyoloji-B8W32KjE.js","./assets/tyt-biyoloji-ek-U_et8uM4.js","./assets/tyt-cografya-CGIKep2O.js","./assets/tyt-cografya-COpkP2QN.js","./assets/tyt-cografya-ek-u40yRQiD.js","./assets/tyt-din-CNfWeYPG.js","./assets/tyt-din-DBMC-NOi.js","./assets/tyt-din-ek-D5ZChKCt.js","./assets/tyt-felsefe-C3rVRn_Z.js","./assets/tyt-felsefe-CLTYQ0VM.js","./assets/tyt-felsefe-ek-BfQCn076.js","./assets/tyt-fizik-BpgJ82UF.js","./assets/tyt-fizik-CvNFjayY.js","./assets/tyt-fizik-ek-Co7-gA8M.js","./assets/tyt-geometri-CKFyu-YI.js","./assets/tyt-geometri-DtWZnS2i.js","./assets/tyt-geometri-ek-fqH3ih3a.js","./assets/tyt-kimya-DJoYN93C.js","./assets/tyt-kimya-Yomk-AYy.js","./assets/tyt-kimya-ek-CDKQAW2_.js","./assets/tyt-matematik-1-DiIx0cH-.js","./assets/tyt-matematik-1-gkXSnHbR.js","./assets/tyt-matematik-2-BfsnQNst.js","./assets/tyt-matematik-2-Bx8ONu9d.js","./assets/tyt-matematik-ek-B6ciMFJq.js","./assets/tyt-tarih-BaTjHs5E.js","./assets/tyt-tarih-ek-C-xMBI2t.js","./assets/tyt-tarih-ek2-Cg3hsLIY.js","./assets/tyt-tarih-gjAWlzM0.js","./assets/tyt-turkce-DAal0Zcv.js","./assets/tyt-turkce-ek-C8PPd6yw.js","./assets/tyt-turkce-oiSrtaZp.js","./assets/useIsDark-DoDyViTX.js","./assets/useVoice-w-05LjTV.js","./assets/index-z9lDxAch.css","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

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
